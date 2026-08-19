import { ArrowUpRight } from "lucide-react";
import Card from "../common/Card.jsx";

export default function DashboardCard({
  label,
  value,
  accent = "bg-primary-100 text-primary-700",
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
        <ArrowUpRight size={16} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <div className="mt-4 h-1 w-12 rounded-full bg-slate-100 transition-all group-hover:w-20 group-hover:bg-primary-200" />
    </Card>
  );
}
