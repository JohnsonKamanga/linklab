import { Dialog as Primitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Primitive.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Primitive.Portal>
        <Primitive.Backdrop className="dialog-backdrop" />
        <Primitive.Popup className="dialog-popup">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Primitive.Title className="text-xl font-semibold tracking-tight">
                {title}
              </Primitive.Title>
              <Primitive.Description className="mt-2 text-sm text-muted-foreground">
                {description}
              </Primitive.Description>
            </div>
            <Primitive.Close className="icon-button" aria-label="Close dialog">
              <X size={18} />
            </Primitive.Close>
          </div>
          {children}
        </Primitive.Popup>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
