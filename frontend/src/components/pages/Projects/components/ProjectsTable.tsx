import type { ProjectView } from "../../../hooks/useProjects";
import { getAvatarColor } from "../../../utils/avatarColor";
import { formatDate, msToHours, orDash } from "../../../utils/projectFormat";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

interface Props {
  projects: ProjectView[];
  canManage: boolean;
  onView: (p: ProjectView) => void;
  onEdit: (p: ProjectView) => void;
  onArchive: (p: ProjectView) => void;
}

const HEADERS = ["Project", "Manager", "Resources", "Start date", "Deadline", "Progress", "Logged hours", "Status", "Priority", "Actions"];

export const ProjectsTable = ({ projects, canManage, onView, onEdit, onArchive }: Props) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
    <table className="w-full min-w-[1100px] text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
          {HEADERS.map((h) => (
            <th key={h} className="px-4 py-3.5 font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {projects.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-4 py-4">
              <button onClick={() => onView(p)} className="text-left">
                <div className="font-semibold text-gray-900 hover:underline">{p.name}</div>
                <div className="text-xs text-gray-500">{orDash(p.clientName)}</div>
              </button>
            </td>
            <td className="px-4 py-4 text-gray-700">{orDash(p.managerName)}</td>
            <td className="px-4 py-4">
              <div className="flex items-center gap-2" title={p.resources.map((r) => r.name).join(", ")}>
                <div className="flex -space-x-2">
                  {p.resources.slice(0, 3).map((r) => (
                    <span
                      key={r.id}
                      className="grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                      style={{ backgroundColor: getAvatarColor(r.name) }}
                    >
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                  ))}
                </div>
                <span className="text-gray-700">{p.resources.length}</span>
              </div>
            </td>
            <td className="px-4 py-4 text-gray-600">{formatDate(p.startDate)}</td>
            <td className="px-4 py-4 text-gray-600">{formatDate(p.deadline)}</td>
            <td className="px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-800">{p.progress}%</span>
              </div>
            </td>
            <td className="px-4 py-4 text-gray-700">{msToHours(p.loggedMs)}h</td>
            <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
            <td className="px-4 py-4"><PriorityBadge priority={p.priority} /></td>
            <td className="px-4 py-4">
              <div className="flex gap-3 text-xs font-medium">
                <button onClick={() => onView(p)} className="text-gray-800 hover:underline">View</button>
                {canManage && (
                  <>
                    <button onClick={() => onEdit(p)} className="text-gray-800 hover:underline">Edit</button>
                    <button onClick={() => onArchive(p)} className="text-orange-600 hover:underline">Archive</button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
