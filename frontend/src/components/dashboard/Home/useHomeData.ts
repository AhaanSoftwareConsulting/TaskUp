import { useMemo } from "react";
import { useAppSelector } from "../../redux/app/hook";
import { startOfToday } from "../../utils/dateHelpers";
import type { Attachment, Task } from "../../types/board.Types";
import type { User } from "../../types/user.Types";

export const STATUSES = ["Todo", "In Progress", "Delay", "Completed"] as const;
export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

export function useHomeData() {
  const user = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards);
  const tasks = useAppSelector((s) => s.task.task);
  const columns = useAppSelector((s) => s.column.columns);
  const activeTimer = useAppSelector((s) => s.timer.active);

  return useMemo(() => {
    const role = user?.role;
    const isStaff = role === "manager" || role === "ceo";
    const base = `/${role}/dashboard`;
    const tasksLink = `${base}/tasks?scope=${isStaff ? "all" : "mine"}`;

    const statusOf = (t: Task) => columns[t.board_id]?.find((c) => c.id === t.column_id)?.name ?? null;
    const isDone = (t: Task) => !!t.closed_at || statusOf(t) === "Completed";
    const dueMs = (t: Task) => (t.due_date ? new Date(t.due_date).getTime() : null);
    const isMine = (t: Task) => t.assignedTo?.some((u) => u.id === user?.id);

    const today = startOfToday().getTime();
    const DAY = 86400000;

    const open = tasks.filter((t) => !isDone(t));
    const mine = tasks.filter(isMine);
    const myOpen = mine.filter((t) => !isDone(t)).sort((a, b) => (dueMs(a) ?? Infinity) - (dueMs(b) ?? Infinity));
    const myOverdue = myOpen.filter((t) => (dueMs(t) ?? Infinity) < today);
    const myDueSoon = myOpen.filter((t) => { const d = dueMs(t); return d !== null && d >= today && d < today + 7 * DAY; });
    const myHoursMs = mine.reduce((s, t) => s + (t.timeManagement?.byUser?.find((e) => e.user?.id === user?.id)?.duration ?? 0), 0);
    const closedAll = tasks.filter((t) => !!t.closed_at)
  .sort((a, b) => +new Date(b.closed_at!) - +new Date(a.closed_at!));
const closed = isStaff ? closedAll : closedAll.filter(isMine);
    const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<string, number>;
    tasks.forEach((t) => { if (t.closed_at) return; const s = statusOf(t); if (s && s in statusCounts) statusCounts[s]++; });
    const priorityCounts = Object.fromEntries(PRIORITIES.map((p) => [p, 0])) as Record<string, number>;
    open.forEach((t) => { if (t.priority in priorityCounts) priorityCounts[t.priority]++; });

    const projects = boards.map((b) => {
      const bt = tasks.filter((t) => t.board_id === b.id);
      const done = bt.filter(isDone).length;
      return {
        board: b, total: bt.length, done,
        pct: bt.length ? Math.round((done / bt.length) * 100) : 0,
        overdue: bt.filter((t) => !isDone(t) && (dueMs(t) ?? Infinity) < today).length,
      };
    });

    const week = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today + i * DAY);
      const list = open.filter((t) => { const d = dueMs(t); return d !== null && new Date(d).setHours(0, 0, 0, 0) === date.getTime(); });
      return { date, tasks: list };
    });

    const activity = tasks
      .flatMap((t) => (t.activityLog ?? []).map((a) => ({ key: `${t.id}-${a.id}`, task: t, user: a.user as User | null, action: a.action, at: a.created_at })))
      .sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);

    const files = tasks
      .flatMap((t) => [
        ...(t.attachments ?? []).map((f) => ({ key: f.id, file: f as Attachment, task: t, at: f.createdAt ?? t.created_at as unknown as string })),
        ...(t.comments ?? []).flatMap((c) => c.attachments.map((f) => ({ key: f.id, file: f as Attachment, task: t, at: c.created_at }))),
      ])
      .sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);

    const load = new Map<string, { user: User; open: number; hoursMs: number }>();
    tasks.forEach((t) => {
      if (!isDone(t)) t.assignedTo?.forEach((u) => {
        const cur = load.get(u.id) ?? { user: u, open: 0, hoursMs: 0 };
        cur.open++; load.set(u.id, cur);
      });
      t.timeManagement?.byUser?.forEach((e) => {
        if (!e.user?.id) return;
        const cur = load.get(e.user.id) ?? { user: e.user, open: 0, hoursMs: 0 };
        cur.hoursMs += e.duration; load.set(e.user.id, cur);
      });
    });
    const workload = [...load.values()].sort((a, b) => b.open - a.open || b.hoursMs - a.hoursMs).slice(0, 5);

    return {
      user, role, isStaff, base, tasksLink, activeTimer, statusOf, isDone,
      myOpen, myOverdue, myDueSoon, myHoursMs, statusCounts, priorityCounts, projects, week,
      activity, files, workload, favorites: tasks.filter((t) => t.is_favorited).slice(0, 5),
      totals: { all: tasks.length, open: open.length, done: tasks.length - open.length }, closed
    };
  }, [user, boards, tasks, columns, activeTimer]);
}
export type HomeData = ReturnType<typeof useHomeData>;