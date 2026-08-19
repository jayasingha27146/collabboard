import { Inbox } from "lucide-react";

export default function EmptyState({ title, description, actions = null }) {
  return (
    <div className="glass-card flex flex-col items-center px-5 py-10 text-center">
      <Inbox className="mb-3 text-slate-400" size={28} />
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
