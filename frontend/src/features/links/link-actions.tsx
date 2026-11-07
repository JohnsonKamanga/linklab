import { useEffect, useState } from "react";
import { Copy, Check, QrCode, ChartNoAxesColumn, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useFeedback } from "@/lib/feedback-context";
import { useDeleteLink } from "./queries";
import { shortUrl, type LinkRecord } from "./repository";
import { QrCodeDialog } from "./qr-code-dialog";
export function CopyButton({
  link,
  label = false,
}: {
  link: LinkRecord;
  label?: boolean;
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
      notify("Short link copied to clipboard.");
    } catch {
      notify(
        "Could not copy. Select the short URL and copy it manually.",
        true,
      );
    }
  }
  return (
    <Button
      variant="ghost"
      size={label ? "default" : "icon"}
      aria-label={`Copy ${link.code}`}
      onClick={copy}
    >
      {copied ? <Check /> : <Copy />}
      {label && (copied ? "Copied" : "Copy link")}
    </Button>
  );
}
export function LinkActions({
  link,
  expanded = false,
}: {
  link: LinkRecord;
  expanded?: boolean;
}) {
  const [modal, setModal] = useState<"qr" | "delete" | null>(null);
  const remove = useDeleteLink();
  const notify = useFeedback();
  return (
    <>
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
      <QrCodeDialog
        link={link}
        open={modal === "qr"}
        onClose={() => setModal(null)}
      />
      <Dialog
        open={modal === "delete"}
        onClose={() => setModal(null)}
        title="Delete this link?"
        description="This short link will stop working in this browser. Its click history will also be permanently deleted."
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
                    "Could not delete the link. Check browser storage and try again.",
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
