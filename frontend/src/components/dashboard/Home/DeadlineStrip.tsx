import { Link } from "react-router-dom";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { Card } from "./Card";
import type { HomeData } from "./useHomeData";

export const DeadlineStrip = ({ data }: { data: HomeData }) => {
  const upcoming = data.week.flatMap((d) => d.tasks).slice(0, 3);
  return (
    <Card title="Next 7 days" icon={<CalendarBlankIcon size={14} weight="bold" />} to={data.tasksLink}>
      <div className="grid grid-cols-7 gap-1.5">
        {data.week.map((d, i) => {
          const n = d.tasks.length;
          return (
            <Link key={i} to={data.tasksLink} title={n ? d.tasks.map((t) => t.title).join("\n") : "Nothing due"}
              className={`flex flex-col items-center rounded-xl border py-2 transition hover:shadow-sm ${i === 0 ? "border-blue-200 bg-blue-50" : "border-gray-100"}`}>
              <span className="text-[10px] font-bold uppercase text-gray-400">{d.date.toLocaleDateString("en-GB", { weekday: "short" })}</span>
              <span className="text-sm font-bold text-gray-700">{d.date.getDate()}</span>
              <span className={`mt-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${n ? (n > 2 ? "bg-red-500 text-white" : "bg-amber-400 text-white") : "bg-gray-100 text-gray-300"}`}>{n}</span>
            </Link>
          );
        })}
      </div>
      {upcoming.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-gray-50 pt-3">
          {upcoming.map((t) => (
            <li key={t.id}><Link to={`${data.base}/tasks/${t.id}`} className="block truncate rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">{t.title}</Link></li>
          ))}
        </ul>
      )}
    </Card>
  );
};