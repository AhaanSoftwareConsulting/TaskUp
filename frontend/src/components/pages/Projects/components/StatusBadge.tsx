import type { ProjectPriority, ProjectStatus } from "../../../types/project.Types";

const statusClass: Record<ProjectStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "On Hold": "bg-orange-50 text-orange-700 ring-orange-200",
  Completed: "bg-sky-50 text-sky-700 ring-sky-200",
  Delayed: "bg-red-50 text-red-700 ring-red-200",
};

const priorityClass: Record<ProjectPriority, string> = {
  High: "bg-red-50 text-red-700 ring-red-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Low: "bg-gray-100 text-gray-600 ring-gray-200",
};

const base = "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";

export const StatusBadge = ({ status }: { status: ProjectStatus }) => (
  <span className={`${base} ${statusClass[status]}`}>{status}</span>
);

export const PriorityBadge = ({ priority }: { priority: ProjectPriority }) => (
  <span className={`${base} ${priorityClass[priority]}`}>{priority}</span>
);
