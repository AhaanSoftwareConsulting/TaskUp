import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/app/hook";
import { getTasks } from "../redux/features/Task/taskSlice";
import { fetchColumn } from "../redux/features/Column/columnSlice";
import { slugify } from "./slugify";

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Delayed";
export type Priority = "High" | "Medium" | "Low";

export interface Resource {
  id: string;
  name: string;
  role: string;
  loggedMs: number;
}

export interface ProjectView {
  id: string;
  slug: string;
  name: string;
  description: string;
  client: string;
  manager: string;
  startDate: string | null;
  deadline: string | null;
  priority: Priority;
  status: ProjectStatus;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  resources: Resource[];
  loggedMs: number;
  estimatedMs: number;
  raw: any;
}

const HOUR = 1000 * 60 * 60;

export const msToHours = (ms = 0) => Math.round((ms / HOUR) * 10) / 10;

const idOf = (x: any): string =>
  x && typeof x === "object" ? String(x.id ?? x._id ?? "") : String(x ?? "");

const nameOf = (x: any, fallback = "—"): string => {
  if (!x) return fallback;
  if (typeof x === "string") return x || fallback;
  return x.name || x.fullName || fallback;
};

const toDate = (v: any): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards) as any[];
  const tasks = (useAppSelector((s) => s.task.task) as any[]) || [];
  const taskLoading = useAppSelector((s) => s.task.loading);
  const columnsByBoard = (useAppSelector((s) => s.column.columns) as any) || {};

  const isManager = user?.role === "manager" || user?.role === "ceo";

  // Tasks: once per mount (same scope the sidebar's task link uses)
  useEffect(() => {
    dispatch(getTasks({ scope: isManager ? "all" : "mine" }));
  }, [dispatch, isManager]);

  // Columns: only for boards that haven't been loaded yet
  useEffect(() => {
    boards.forEach((b) => {
      const id = idOf(b);
      if (id && !columnsByBoard[id]) dispatch(fetchColumn(id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, boards]);

  const projects = useMemo<ProjectView[]>(() => {
    const now = new Date();

    const columnName = (task: any, boardId: string) => {
      if (task.column?.name) return task.column.name;
      const cols = columnsByBoard[boardId] || [];
      return cols.find((c: any) => idOf(c) === idOf(task.column))?.name || "";
    };

    const isDone = (task: any, boardId: string) => {
      const n = String(columnName(task, boardId)).trim().toLowerCase();
      return task.progress === 100 || n === "completed" || n === "done";
    };

    const estimatedOf = (t: any) => {
      const tm = t.timeManagement || {};
      if (tm.estimatedTime != null) return Number(tm.estimatedTime) || 0; // ms
      if (tm.estimatedHours != null) return (Number(tm.estimatedHours) || 0) * HOUR;
      if (t.estimatedHours != null) return (Number(t.estimatedHours) || 0) * HOUR;
      return 0;
    };

    return (boards || [])
      .filter((b) => !b.archived && b.status !== "Archived")
      .map((b) => {
        const boardId = idOf(b);
        const boardTasks = tasks.filter((t) => t?.board && idOf(t.board) === boardId);

        let completed = 0;
        let overdue = 0;
        let loggedMs = 0;
        let taskEstimatedMs = 0;
        const people: Record<string, Resource> = {};

        boardTasks.forEach((t) => {
          const done = isDone(t, boardId);
          if (done) completed += 1;

          const due = toDate(t.dueDate ?? t.deadline ?? t.endDate);
          if (!done && due && due < now) overdue += 1;

          const taskMs = Number(t.timeManagement?.totalLoggedTime || 0);
          loggedMs += taskMs;
          taskEstimatedMs += estimatedOf(t);

          const assignees: any[] = t.assignedTo || [];
          assignees.forEach((m) => {
            const mid = idOf(m);
            if (!mid) return;
            if (!people[mid]) {
              people[mid] = { id: mid, name: nameOf(m, "Unknown"), role: m.role || "", loggedMs: 0 };
            }
            // A task's time is split equally between its assignees so the
            // per-person totals add up to the project total.
            people[mid].loggedMs += taskMs / assignees.length;
          });
        });

        const total = boardTasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const deadline = b.deadline ?? b.dueDate ?? b.endDate ?? null;
        const due = toDate(deadline);
        if (due) due.setHours(23, 59, 59, 999);
        const rawStatus = String(b.status || "").toLowerCase();

        let status: ProjectStatus = "Active";
        if (total > 0 && progress === 100) status = "Completed";
        else if (rawStatus.includes("hold")) status = "On Hold";
        else if (rawStatus === "delayed" || (due && due < now)) status = "Delayed";

        const p = String(b.priority || "").toLowerCase();
        const priority: Priority = p === "high" ? "High" : p === "low" ? "Low" : "Medium";

        return {
          id: boardId,
          slug: slugify(b.name),
          name: b.name,
          description: b.description || "",
          client: nameOf(b.client ?? b.clientName),
          manager: nameOf(b.manager ?? b.projectManager ?? b.createdBy ?? b.owner),
          startDate: b.startDate ?? b.createdAt ?? null,
          deadline,
          priority,
          status,
          progress,
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: total - completed,
          overdueTasks: overdue,
          resources: Object.values(people),
          loggedMs,
          estimatedMs: b.estimatedHours != null ? Number(b.estimatedHours) * HOUR : taskEstimatedMs,
          raw: b,
        } as ProjectView;
      });
  }, [boards, tasks, columnsByBoard]);

  return {
    projects,
    user,
    isManager,
    loading: taskLoading === "pending" && tasks.length === 0,
  };
};

export const formatDate = (v: string | null) => {
  const d = toDate(v);
  return d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};

export const statusStyle: Record<ProjectStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-400",
  "On Hold": "bg-orange-500/15 text-orange-400",
  Completed: "bg-sky-500/15 text-sky-400",
  Delayed: "bg-red-500/15 text-red-400",
};

export const priorityStyle: Record<Priority, string> = {
  High: "bg-red-500/15 text-red-400",
  Medium: "bg-amber-500/15 text-amber-400",
  Low: "bg-zinc-500/20 text-zinc-300",
};