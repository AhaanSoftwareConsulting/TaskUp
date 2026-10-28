import { Link } from "react-router-dom";
import { TargetIcon } from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { dueInfo } from "../../utils/dateHelpers";
import type { HomeData } from "./useHomeData";

const TONE = { red: "bg-red-50 text-red-600", amber: "bg-amber-50 text-amber-700", gray: "bg-gray-100 text-gray-500" };
const DOT: Record<string, string> = { Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-yellow-400", Low: "bg-gray-300" };

export const FocusList = ({ data }: { data: HomeData }) => {
  const boards = data.projects.map((p) => p.board);
  return (
    <Card title="My focus" icon={<TargetIcon size={14} weight="bold" />} to={data.tasksLink}>
      {data.myOpen.length === 0 ? <Empty text="Nothing assigned to you. Enjoy the calm." /> : (
        <ul className="divide-y divide-gray-50">
          {data.myOpen.slice(0, 6).map((t) => {
            const due = dueInfo(t.due_date);
            return (
              <li key={t.id}>
                <Link to={`${data.base}/tasks/${t.id}`} className="flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-gray-50">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[t.priority] ?? DOT.Low}`} title={t.priority} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{t.title}</p>
                    <p className="truncate text-xs text-gray-400">{boards.find((b) => b.id === t.board_id)?.name} · {data.statusOf(t) ?? "—"}</p>
                  </div>
                  {due && <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${TONE[due.tone]}`}>{due.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};