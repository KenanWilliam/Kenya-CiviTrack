import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

export type ModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function Modal({ isOpen, title, onClose, children, actions }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modalOverlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="card modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            {title ? <h3 style={{ margin: 0 }}>{title}</h3> : null}
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
        {actions ? <div className="modalActions">{actions}</div> : null}
      </div>
    </div>,
    document.body
  );
}
