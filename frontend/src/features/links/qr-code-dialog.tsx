import { useQuery } from "@tanstack/react-query";
import { Download, LoaderCircle, RefreshCw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { createBrandedQr } from "./branded-qr";
import { displayUrl, shortUrl, type LinkRecord } from "./repository";

export function QrCodeDialog({
  link,
  open,
  onClose,
}: {
  link: LinkRecord;
  open: boolean;
  onClose: () => void;
}) {
  const url = shortUrl(link);
  const qr = useQuery({
    queryKey: ["branded-qr", url],
    queryFn: () => createBrandedQr(url),
    enabled: open,
    staleTime: Infinity,
    retry: false,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="A little code. A lot of possibility."
      description="Made to be shared. Scan your link or take it with you."
    >
      <div className="my-6 overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex min-h-72 items-center justify-center px-5 py-6">
          {qr.isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p
                role="alert"
                className="max-w-64 text-sm text-muted-foreground"
              >
                We couldn’t create your QR code. Check your connection and try
                again.
              </p>
              <Button
                variant="outline"
                disabled={qr.isFetching}
                onClick={() => qr.refetch()}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : qr.data ? (
            <img
              className="block aspect-square w-64 max-w-full rounded-xl"
              src={qr.data}
              width={256}
              height={256}
              alt={`QR code with the LinkLab logo for ${url}`}
            />
          ) : (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
            >
              <LoaderCircle className="size-4 animate-spin" />
              Preparing your QR code…
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-border px-4 py-3.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"
            aria-hidden="true"
          >
            <ScanLine className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{link.title}</p>
            <p className="mt-0.5 break-all text-xs text-muted-foreground">
              {displayUrl(link)}
            </p>
          </div>
        </div>
      </div>
      {qr.data && !qr.isError && (
        <a
          className="primary-link w-full"
          href={qr.data}
          download={`linklab-${link.code}.png`}
        >
          <Download size={16} />
          Download PNG
        </a>
      )}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          High-resolution PNG · Ready for print and digital
        </p>
      </div>
    </Dialog>
  );
}
