import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-xl",
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <div
        className={`glass-card w-full ${maxWidth} animate-[fadeIn_.18s_ease-out]`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <Button variant="ghost" className="p-2" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="border-t border-slate-100 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
