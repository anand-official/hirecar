import { Eye, Phone, MessageCircle, TrendingUp, Car, ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon?: "eye" | "phone" | "chat" | "trend" | "car" | "leads";
  trend?: { value: number; label: string };
  accent?: "blue" | "green" | "amber" | "emerald" | "slate";
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
};

const iconBgMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  slate: "bg-slate-100 text-slate-600",
};

export function MetricCard({ label, value, helper, icon, trend, accent = "slate" }: MetricCardProps) {
  const Icon = icon ? iconMap[icon] : null;
  const iconBg = iconBgMap[accent];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">{helper}</p>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            trend.value >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend.value < 0 ? "rotate-180" : ""}`} />
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
