import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

export type DrawerProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Drawer({ isOpen, title, onClose, children }: DrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="drawerOverlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="drawerPanel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>{title}</strong>
          <Button variant="ghost" onClick={onClose} aria-label="Close menu">
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
