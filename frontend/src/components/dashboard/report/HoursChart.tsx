import type { Bucket, Granularity } from "./hoursData";

const hours = (ms: number) => ms / 3600000;

export const HoursChart = ({ buckets, gran, onGran }: { buckets: Bucket[]; gran: Granularity; onGran: (g: Granularity) => void }) => {
  const maxH = Math.max(1, ...buckets.map((b) => hours(b.ms)));
  const step = maxH <= 8 ? 2 : maxH <= 16 ? 4 : maxH <= 40 ? 10 : maxH <= 100 ? 25 : 50;
  const yMax = Math.ceil(maxH / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);
  const minW = Math.max(buckets.length * 56, 280);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Daily Breakdown (Chart View)</h3>
        <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-semibold">
          {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
            <button key={g} onClick={() => onGran(g)} className={`rounded-md px-3 py-1.5 capitalize transition ${gran === g ? "bg-slate-800 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>{g}</button>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="mr-3 w-8 shrink-0 pt-6">
          <div className="relative h-[220px]">
            {ticks.map((v) => <span key={v} style={{ bottom: `${(v / yMax) * 100}%` }} className="absolute right-0 translate-y-1/2 text-[11px] text-gray-400">{v}h</span>)}
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="pt-6" style={{ minWidth: minW }}>
            <div className="relative h-[220px]">
              {ticks.map((v) => <div key={v} style={{ bottom: `${(v / yMax) * 100}%` }} className="absolute inset-x-0 border-t border-gray-100" />)}
              <div className="absolute inset-0 flex">
                {buckets.map((b) => (
                  <div key={b.key} className="flex h-full flex-1 flex-col items-center justify-end">
                    <div className="relative w-9 rounded-t-md bg-indigo-500 transition-all duration-500" style={{ height: b.ms ? `${(hours(b.ms) / yMax) * 100}%` : "2px", background: b.ms ? undefined : "#e5e7eb" }}>
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-gray-600">{hours(b.ms).toFixed(1)}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex">{buckets.map((b) => <span key={b.key} className="flex-1 text-center text-[11px] font-semibold text-gray-500">{b.label}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};