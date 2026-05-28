import { Eye, Phone, MessageCircle, TrendingUp, Car, ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon?: "eye" | "phone" | "chat" | "trend" | "car" | "leads";
  trend?: { value: number; label: string };
  accent?: "blue" | "green" | "amber" | "emerald" | "slate" | "primary";
}

const iconMap = {
  eye: Eye,
  phone: Phone,
  chat: MessageCircle,
  trend: TrendingUp,
  car: Car,
  leads: ArrowUpRight,
};

const accentMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-green-50 text-green-600 border-green-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  primary: "bg-primary/5 text-primary border-primary/10",
};

const iconBgMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  slate: "bg-slate-100 text-slate-600",
  primary: "bg-primary/10 text-primary",
};

export function MetricCard({ label, value, helper, icon, trend, accent = "primary" }: MetricCardProps) {
  const Icon = icon ? iconMap[icon] : null;
  const iconBg = iconBgMap[accent];

  return (
    <div className="rounded-[1.5rem] border border-slate-200/60 bg-white p-7 shadow-sm card-lift flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-inner ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tight font-heading">{value}</p>
      <div className="mt-4 flex items-center justify-between mt-auto">
        <p className="text-xs font-semibold text-slate-400">{helper}</p>
        {trend && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
            trend.value >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend.value < 0 ? "rotate-180" : ""}`} />
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
