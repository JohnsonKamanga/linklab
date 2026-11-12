import { useEffect, useState } from "react";
import {
  Copy,
  Check,
  QrCode,
  ChartNoAxesColumn,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useFeedback } from "@/lib/feedback-context";
import { useDeleteLink } from "./queries";
import { shortUrl, type LinkRecord } from "./repository";
import { QrCodeDialog } from "./qr-code-dialog";
import { ActionMenu } from "@/components/ui/action-menu";
export function CopyButton({
  link,
  label = false,
  quiet = false,
}: {
  link: LinkRecord;
  label?: boolean;
  quiet?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const notify = useFeedback();
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(shortUrl(link));
      setCopied(true);
      if (!quiet) notify("Short link copied to clipboard.");
    } catch {
      notify(
        "Could not copy. Select the short URL and copy it manually.",
        true,
      );
    }
  }
  return (
    <Button
      className={quiet ? "quiet-copy-button" : undefined}
      variant="ghost"
      size={label ? "default" : "icon"}
      aria-label={`Copy ${link.code}`}
      onClick={copy}
    >
      {copied ? <Check /> : <Copy />}
      {label && (
        <span aria-live="polite">
          {copied ? "Copied" : quiet ? "Copy" : "Copy link"}
        </span>
      )}
    </Button>
  );
}
export function LinkActions({
  link,
  expanded = false,
  compact = false,
}: {
  link: LinkRecord;
  expanded?: boolean;
  compact?: boolean;
}) {
  const [modal, setModal] = useState<"qr" | "delete" | null>(null);
  const remove = useDeleteLink();
  const notify = useFeedback();
  return (
    <>
      {compact ? (
        <div className="compact-link-actions">
          <CopyButton link={link} label quiet />
          <ActionMenu
            label={`More actions for ${link.code}`}
            className="compact-menu-button"
            items={[
              {
                label: "View analytics",
                icon: <ChartNoAxesColumn />,
                to: `/links/${link.id}`,
              },
              {
                label: "Show QR code",
                icon: <QrCode />,
                onSelect: () => setModal("qr"),
              },
              {
                label: "Open destination",
                icon: <ExternalLink />,
                href: link.url,
              },
              {
                label: "Delete link",
                icon: <Trash2 />,
                destructive: true,
                onSelect: () => setModal("delete"),
              },
            ]}
          />
        </div>
      ) : (
        <div className="link-actions">
          <CopyButton link={link} label={expanded} />
          <Button
            variant="ghost"
            size={expanded ? "default" : "icon"}
            aria-label={`QR code for ${link.code}`}
            onClick={() => setModal("qr")}
          >
            <QrCode />
            {expanded && "QR code"}
          </Button>
          <Link
            className="icon-button"
            aria-label={`Analytics for ${link.title}`}
            to={`/links/${link.id}`}
          >
            <ChartNoAxesColumn size={17} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="delete-button"
            aria-label={`Delete ${link.title}`}
            onClick={() => setModal("delete")}
          >
            <Trash2 />
          </Button>
        </div>
      )}
      <QrCodeDialog
        link={link}
        open={modal === "qr"}
        onClose={() => setModal(null)}
      />
      <Dialog
        open={modal === "delete"}
        onClose={() => setModal(null)}
        title="Delete this link?"
        description="This short link will stop working. Its click history will also be permanently deleted."
      >
        <div className="my-6 rounded-lg bg-muted p-4">
          <strong>{link.title}</strong>
          <p className="mt-1 text-sm text-muted-foreground">/{link.code}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModal(null)}>
            Keep link
          </Button>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(link.id, {
                onSuccess: () => {
                  setModal(null);
                  notify("Link deleted.");
                },
                onError: () =>
                  notify(
                    "Could not delete the link. Check the backend connection and try again.",
                    true,
                  ),
              })
            }
          >
            {remove.isPending ? "Deleting…" : "Delete link"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
