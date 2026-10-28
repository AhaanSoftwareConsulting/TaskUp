import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, ClockIcon, KanbanIcon, ListChecksIcon, StarIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useAppSelector } from "../../redux/app/hook";

const Stat = ({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string | number; tone: string }) => (
  <div className={`rounded-xl p-3 ${tone}`}>
    <div className="mb-1">{icon}</div>
    <p className="text-xl font-black">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-tight opacity-70">{label}</p>
  </div>
);

export const ProfileStats = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards);
  const tasks = useAppSelector((s) => s.task.task);
  const columns = useAppSelector((s) => s.column.columns);
  const favorites = useAppSelector((s) => s.task.favorites);

  const stats = useMemo(() => {
    const mine = tasks.filter((t) => t.assignedTo?.some((u) => u.id === user?.id));
    const done = (t: (typeof tasks)[number]) => !!t.closed_at || columns[t.board_id]?.find((c) => c.id === t.column_id)?.name === "Completed";
    const completed = mine.filter(done).length;
    const ms = tasks.reduce((s, t) => s + (t.timeManagement?.byUser?.find((e) => e.user?.id === user?.id)?.duration ?? 0), 0);
    return {
      projects: boards.filter((b) => b.members.some((m) => m.id === user?.id)).length,
      assigned: mine.length, completed, hours: (ms / 3600000).toFixed(1),
      pct: mine.length ? Math.round((completed / mine.length) * 100) : 0,
    };
  }, [boards, tasks, columns, user?.id]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-gray-400">My activity</h3>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<KanbanIcon size={16} />} label="Projects" value={stats.projects} tone="bg-blue-50 text-blue-600" />
          <Stat icon={<ListChecksIcon size={16} />} label="Assigned" value={stats.assigned} tone="bg-amber-50 text-amber-600" />
          <Stat icon={<CheckCircleIcon size={16} />} label="Completed" value={stats.completed} tone="bg-emerald-50 text-emerald-600" />
          <Stat icon={<ClockIcon size={16} />} label="Hours logged" value={`${stats.hours}h`} tone="bg-indigo-50 text-indigo-600" />
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="11" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="11" strokeLinecap="round"
                strokeDasharray={`${(stats.pct / 100) * 263.9} 263.9`} className="transition-all duration-700" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-800">{stats.pct}%</span>
          </div>
          <p className="text-xs text-gray-400">{stats.completed} of {stats.assigned} assigned tasks done</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400"><StarIcon size={14} weight="fill" className="text-yellow-400" /> Favorite tasks</h3>
        {favorites.length === 0 ? <p className="text-sm italic text-gray-400">Star a task to pin it here.</p> : (
          <ul className="space-y-1">
            {favorites.map((t) => (
              <li key={t.id}>
                <button onClick={() => navigate(`/${user?.role}/dashboard/tasks/${t.id}`)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-gray-50">
                  <span className="truncate text-sm font-medium text-gray-800">{t.title}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase text-gray-500">{t.priority}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};