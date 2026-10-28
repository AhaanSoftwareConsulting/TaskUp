import { Link } from "react-router-dom";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { Avatar } from "../Task/CommentComposer";
import { formatShort } from "../../utils/dateHelpers";
import type { HomeData } from "./useHomeData";

export const ClosedTasks = ({ data }: { data: HomeData }) => {
  const boards = data.projects.map((p) => p.board);
  const rows = data.closed.slice(0, 6);
  const hours = (t: (typeof rows)[number]) => {
    const ms = data.isStaff
      ? t.timeManagement?.total_logged_time ?? 0
      : t.timeManagement?.byUser?.find((e) => e.user?.id === data.user?.id)?.duration ?? 0;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  return (
    <Card
      title={data.isStaff ? "Closed tasks" : "My closed tasks"}
      icon={<LockSimpleIcon size={14} weight="bold" />}
      to={`${data.tasksLink}&closed=1`}
      action={`View all (${data.closed.length})`}
    >
      {rows.length === 0 ? (
        <Empty text={data.isStaff ? "No tasks have been closed yet." : "None of your tasks have been closed yet."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                <th className="pb-3">Task</th><th className="pb-3">Project</th>
                <th className="pb-3">{data.isStaff ? "Assignees" : "Closed by"}</th>
                <th className="pb-3">{data.isStaff ? "Hours" : "My hours"}</th><th className="pb-3 text-right">Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/60">
                  <td className="max-w-[240px] py-3 pr-4">
                    <Link to={`${data.base}/tasks/${t.id}`} className="block truncate font-semibold text-gray-800 hover:text-blue-600">{t.title}</Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{boards.find((b) => b.id === t.board_id)?.name}</td>
                  <td className="py-3 pr-4">
                    {data.isStaff ? (
                      <div className="flex -space-x-2">
                        {t.assignedTo.slice(0, 4).map((u) => <div key={u.id} title={u.full_name} className="rounded-full border-2 border-white"><Avatar name={u.full_name} size={24} /></div>)}
                      </div>
                    ) : <span className="text-gray-600">{t.closed_by_user?.full_name ?? "—"}</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <Link to={`${data.base}/tasks/${t.id}/hours`} className="font-semibold text-gray-700 hover:text-blue-600">{hours(t)}</Link>
                  </td>
                  <td className="py-3 text-right text-gray-500">{formatShort(t.closed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};