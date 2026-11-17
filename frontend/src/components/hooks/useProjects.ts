import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/app/hook";
import { getTasks } from "../redux/features/Task/taskSlice";
import { fetchColumn } from "../redux/features/Column/columnSlice";
import { slugify } from "./slugify";
import type { ProjectPriority, ProjectStatus } from "../types/project.Types";

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
  clientName: string;
  clientContactPerson: string;
  clientEmail: string;
  clientPhone: string;
  managerId: string;
  managerName: string;
  startDate: string | null;
  deadline: string | null;
  priority: ProjectPriority;
  status: ProjectStatus;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  resources: Resource[];
  loggedMs: number;
  estimatedHours: number;
}

const idOf = (x: any): string =>
  x && typeof x === "object" ? String(x.id ?? x._id ?? "") : String(x ?? "");
const personName = (x: any): string => (x ? x.name || x.full_name || x.fullName || "" : "");
const toDate = (v: any): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// The tasks API can return snake_case or camelCase depending on the repository mapping,
// so every task field is read through these helpers.
const taskBoardId = (t: any) => idOf(t.board ?? t.boardId ?? t.board_id);
const taskColumn = (t: any) => t.column ?? t.columnId ?? t.column_id;
const taskAssignees = (t: any): any[] => t.assignedTo ?? t.assignees ?? [];
const taskDue = (t: any) => t.dueDate ?? t.due_date;
const taskLoggedMs = (t: any) =>
  Number(t.timeManagement?.totalLoggedTime ?? t.totalLoggedTime ?? t.total_logged_time ?? 0);
const taskEstimatedHours = (t: any) =>
  Number(t.timeManagement?.estimatedTime ?? t.estimatedTime ?? t.estimated_time ?? 0);

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards) as any[];
  const tasks = (useAppSelector((s) => s.task.task) as any[]) || [];
  const taskLoading = useAppSelector((s) => s.task.loading);
  const columnsByBoard = (useAppSelector((s) => s.column.columns) as any) || {};

  const isManager = user?.role === "manager" || user?.role === "ceo";

  useEffect(() => {
    dispatch(getTasks({ scope: isManager ? "all" : "mine" }));
  }, [dispatch, isManager]);

  useEffect(() => {
    boards.forEach((b) => {
      if (b?.id && !columnsByBoard[b.id]) dispatch(fetchColumn(b.id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, boards]);

  // TEMPORARY: remove once the project pages show tasks correctly.
  useEffect(() => {
    if (tasks.length) console.log("[useProjects] first task from API:", tasks[0]);
    else console.log("[useProjects] no tasks in redux yet, loading =", taskLoading);
  }, [tasks, taskLoading]);

  const projects = useMemo<ProjectView[]>(() => {
    const now = new Date();

    const columnName = (task: any, boardId: string) => {
      const col = taskColumn(task);
      if (col?.name) return col.name;
      const cols = columnsByBoard[boardId] || [];
      return cols.find((c: any) => idOf(c) === idOf(col))?.name || "";
    };
    const isDone = (task: any, boardId: string) =>
      task.progress === 100 || String(columnName(task, boardId)).trim().toLowerCase() === "completed";

    return boards
      .filter((b) => !b.archived)
      .map((b): ProjectView => {
        const boardId = idOf(b);
        const boardTasks = tasks.filter((t) => t && taskBoardId(t) === boardId);

        let completed = 0, overdue = 0, loggedMs = 0, taskEstimatedHoursSum = 0;
        const people: Record<string, Resource> = {};

        boardTasks.forEach((t) => {
          const done = isDone(t, boardId);
          if (done) completed += 1;
          const due = toDate(taskDue(t));
          if (!done && due && due < now) overdue += 1;

          const taskMs = taskLoggedMs(t);
          loggedMs += taskMs;
          taskEstimatedHoursSum += taskEstimatedHours(t);

          const assignees = taskAssignees(t);
          assignees.forEach((m) => {
            const mid = idOf(m);
            if (!mid) return;
            people[mid] ||= { id: mid, name: personName(m) || "Unknown", role: m.role || "", loggedMs: 0 };
            // Time is split equally between a task's assignees so per-person totals add up.
            people[mid].loggedMs += taskMs / assignees.length;
          });
        });

        const total = boardTasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const dueEnd = toDate(b.deadline);
        if (dueEnd) dueEnd.setHours(23, 59, 59, 999);

        let status: ProjectStatus = "Active";
        if (b.status === "Completed" || (total > 0 && progress === 100)) status = "Completed";
        else if (b.status === "On Hold") status = "On Hold";
        else if (dueEnd && dueEnd < now) status = "Delayed";

        return {
          id: boardId,
          slug: slugify(b.name),
          name: b.name,
          description: b.description || "",
          clientName: b.clientName || "",
          clientContactPerson: b.clientContactPerson || "",
          clientEmail: b.clientEmail || "",
          clientPhone: b.clientPhone || "",
          managerId: idOf(b.projectManager) || b.projectManagerId || "",
          managerName: personName(b.projectManager),
          startDate: b.startDate ?? null,
          deadline: b.deadline ?? null,
          priority: b.priority || "Medium",
          status,
          progress,
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: total - completed,
          overdueTasks: overdue,
          resources: Object.values(people),
          loggedMs,
          estimatedHours: b.estimatedHours != null ? Number(b.estimatedHours) : taskEstimatedHoursSum,
        };
      });
  }, [boards, tasks, columnsByBoard]);

  return { projects, user, isManager, loading: taskLoading === "pending" && tasks.length === 0 };
};