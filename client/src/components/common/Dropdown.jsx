import { useEffect, useRef, useState } from "react";

export default function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function onDocumentClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open && (
        <div
          className={`absolute top-full z-40 mt-2 min-w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-soft ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}
