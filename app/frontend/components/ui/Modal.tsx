import { useEffect, type ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  description?: string;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
};

function sizeClassName(size: ModalSize): string {
  if (size === "sm") return "max-w-lg";
  if (size === "lg") return "max-w-4xl";
  return "max-w-2xl";
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  description,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeOnEscape, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (!closeOnBackdrop) return;
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${sizeClassName(size)} rounded-lg border border-neutral-medium-grey bg-white shadow-xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-light-grey px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-neutral-charcoal">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-neutral-silver">{description}</p>
            ) : null}
          </div>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-tertiary-action"
              aria-label="Lukk dialog"
            >
              Lukk
            </button>
          ) : null}
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-4 py-4">{children}</div>

        {footer ? (
          <div className="border-t border-neutral-light-grey px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
