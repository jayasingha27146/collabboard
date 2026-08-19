const badgeMap = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
  "To Do": "bg-slate-100 text-slate-700",
  Doing: "bg-sky-100 text-sky-700",
  Done: "bg-emerald-100 text-emerald-700",
};

export default function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeMap[children] || "bg-slate-100 text-slate-600"} ${className}`}
    >
      {children}
    </span>
  );
}
