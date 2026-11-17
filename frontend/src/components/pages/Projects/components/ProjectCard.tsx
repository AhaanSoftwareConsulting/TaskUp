import type { ProjectView } from "../../../hooks/useProjects";
import { formatDate, msToHours, orDash } from "../../../utils/projectFormat";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

export const ProjectCard = ({ project: p, onOpen }: { project: ProjectView; onOpen: () => void }) => {
  const names = p.resources.map((r) => r.name.split(" ")[0]);
  const resources = names.length === 0 ? "—" : names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2}` : "");

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-gray-400"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold leading-tight text-gray-900">{p.name}</h3>
        <StatusBadge status={p.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600">
        <span>Client: {orDash(p.clientName)}</span>
        <PriorityBadge priority={p.priority} />
      </div>

      <div className="mt-5 flex justify-between text-base">
        <span className="text-gray-600">Progress</span>
        <span className="font-bold text-gray-900">{p.progress}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4 text-sm text-gray-600">
        <span className="min-w-0">Assigned resource: {resources}</span>
        <span className="shrink-0">Due: {formatDate(p.deadline)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>Logged: {msToHours(p.loggedMs)}h</span>
        <span className="font-medium text-gray-900">View details →</span>
      </div>
    </article>
  );
};
