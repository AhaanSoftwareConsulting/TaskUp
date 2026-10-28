import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { getTasks } from "../../redux/features/Task/taskSlice";
import { Timer } from "../Home/Timer";
import { TaskTimePanel } from "../Task/TaskTimePanel";
import { dueInfo } from "../../utils/dateHelpers";

const TONE = { red: "bg-red-50 text-red-600", amber: "bg-amber-50 text-amber-700", gray: "bg-gray-100 text-gray-500" };
const PRIORITY: Record<string, string> = { Critical: "bg-red-100 text-red-600", High: "bg-orange-100 text-orange-600", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-gray-100 text-gray-500" };

export const MyTask = () => {
  const [params] = useSearchParams();
  const scope: "mine" | "all" = params.get("scope") === "all" ? "all" : "mine";
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((s) => s.task.task);
  const user = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards);
  const columns = useAppSelector((s) => s.column.columns);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(params.get("closed") === "1");

  useEffect(() => { dispatch(getTasks({ scope })); }, [dispatch, scope]);

  const visible = tasks.filter((t) => showClosed || !t.closed_at);
  const closedCount = tasks.length - tasks.filter((t) => !t.closed_at).length;

  return (
    <div className="flex h-full min-h-0">
      <div className="min-w-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-800">{scope === "all" ? "All Tasks" : "My Tasks"}</h1>
              <p className="text-gray-500">Welcome back, {user?.full_name}. Select a task for details.</p>
            </div>
            {closedCount > 0 && (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-500">
                <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> Show closed ({closedCount})
              </label>
            )}
          </header>

          <div className="grid gap-4">
            {visible.map((t) => {
              const est = t.timeManagement?.estimated_time || 0;
              const logged = t.timeManagement?.total_logged_time || 0;
              const pct = est > 0 ? Math.min((logged / (est * 3600000)) * 100, 100) : 0;
              const status = columns[t.board_id]?.find((c) => c.id === t.column_id)?.name;
              const due = dueInfo(t.due_date, !!t.closed_at || status === "Completed");
              return (
                <div
                  key={t.id} onClick={() => setSelectedId(t.id)}
                  className={`cursor-pointer rounded-2xl border bg-white p-5 transition-all hover:shadow-lg ${selectedId === t.id ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-100 hover:border-blue-200"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-bold text-gray-800">{t.title}</h3>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${PRIORITY[t.priority] ?? PRIORITY.Low}`}>{t.priority}</span>
                        {t.closed_at && <span className="inline-flex items-center gap-1 rounded bg-gray-800 px-2 py-0.5 text-[10px] font-black uppercase text-white"><LockSimpleIcon size={10} weight="bold" />Closed</span>}
                        {due && <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${TONE[due.tone]}`}>{due.label}</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-400">{boards.find((b) => b.id === t.board_id)?.name} • <span className="text-blue-500">{status}</span></p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Timer taskId={t.id} timeData={t.timeManagement} estimatedTime={est}
                        dueDate={t.due_date ? String(t.due_date) : undefined} disabled={!!t.closed_at} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-1.5 flex justify-between text-[10px] font-bold uppercase text-gray-400">
                      <span>{est ? `Team progress toward ${est}h` : "No estimate set"}</span>
                      <span className="text-gray-600">{est ? `${Math.round(pct)}%` : ""}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-1 text-[10px] text-gray-400">Team total: {(logged / 3600000).toFixed(1)}h{(t.timeManagement?.byUser?.length ?? 0) > 1 && ` across ${t.timeManagement!.byUser.length} members`}</p>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="flex items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20"><p className="font-medium text-gray-400">No tasks to show.</p></div>
            )}
          </div>
        </div>
      </div>
      <TaskTimePanel taskId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};