export function AnalyticsChart({ 
  data, 
  title, 
  valuePrefix = "", 
  color = "amber" 
}: { 
  data: { label: string, value: number }[];
  title: string;
  valuePrefix?: string;
  color?: "amber" | "blue" | "emerald";
}) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const colorMap = {
    amber: "from-amber-500 to-amber-700 shadow-amber-500/20",
    blue: "from-blue-500 to-blue-700 shadow-blue-500/20",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-500/20",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">{title}</h3>
      <div className="flex h-48 items-end gap-2 sm:gap-4">
        {data.map((item, i) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full">
              {/* Tooltip */}
              <div className="absolute -top-10 scale-0 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10 pointer-events-none">
                <div className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white shadow-xl border border-slate-700 whitespace-nowrap">
                  {item.label}: <span className="text-amber-400">{valuePrefix}{item.value.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Bar */}
              <div 
                className={`w-full max-w-[40px] rounded-t-md bg-gradient-to-t ${colorMap[color]} shadow-lg transition-all duration-1000 ease-out`}
                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
              />
              
              {/* Label */}
              <div className="mt-3 text-[10px] sm:text-xs text-slate-500 truncate max-w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
