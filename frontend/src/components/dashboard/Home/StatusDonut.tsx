import { ChartPieSliceIcon } from "@phosphor-icons/react";
import { Card } from "./Card";
import { PRIORITIES, STATUSES, type HomeData } from "./useHomeData";

const COLORS: Record<string, string> = { Todo: "#3B82F6", "In Progress": "#F59E0B", Delay: "#EF4444", Completed: "#10B981" };
const PRIORITY_COLORS: Record<string, string> = { Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-yellow-400", Low: "bg-gray-300" };

export const StatusDonut = ({ data }: { data: HomeData }) => {
  const total = STATUSES.reduce((s, k) => s + data.statusCounts[k], 0);
  const R = 42, C = 2 * Math.PI * R;
  let acc = 0;
  const maxP = Math.max(1, ...PRIORITIES.map((p) => data.priorityCounts[p]));

  return (
    <Card title="Workload" icon={<ChartPieSliceIcon size={14} weight="bold" />} to={data.tasksLink}>
      <div className="flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#F1F5F9" strokeWidth="11" />
            {total > 0 && STATUSES.map((s) => {
              const len = (data.statusCounts[s] / total) * C;
              const el = <circle key={s} cx="50" cy="50" r={R} fill="none" stroke={COLORS[s]} strokeWidth="11"
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} className="transition-all duration-700" />;
              acc += len;
              return len > 0 ? el : null;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-gray-800">{total}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Tasks</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2">
          {STATUSES.map((s) => (
            <li key={s} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[s] }} />{s}</span>
              <b className="text-gray-800">{data.statusCounts[s]}</b>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 space-y-2 border-t border-gray-50 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Open by priority</p>
        {PRIORITIES.map((p) => (
          <div key={p} className="flex items-center gap-3 text-xs">
            <span className="w-14 text-gray-500">{p}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${PRIORITY_COLORS[p]}`} style={{ width: `${(data.priorityCounts[p] / maxP) * 100}%` }} /></div>
            <b className="w-5 text-right text-gray-700">{data.priorityCounts[p]}</b>
          </div>
        ))}
      </div>
    </Card>
  );
};