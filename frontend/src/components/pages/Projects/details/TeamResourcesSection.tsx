import type { ProjectView } from "../../../hooks/useProjects";
import { getAvatarColor } from "../../../utils/avatarColor";
import { msToHours } from "../../../utils/projectFormat";
import { Section } from "./Section";

export const TeamResourcesSection = ({ project: p }: { project: ProjectView }) => {
  const max = Math.max(...p.resources.map((r) => r.loggedMs), 1);

  return (
    <Section title={`Team & resources (${p.resources.length})`}>
      {p.resources.length === 0 ? (
        <p className="text-sm text-gray-500">No one is assigned to tasks in this project yet.</p>
      ) : (
        <ul className="space-y-4">
          {[...p.resources].sort((a, b) => b.loggedMs - a.loggedMs).map((r) => (
            <li key={r.id}>
              <div className="flex items-center gap-3">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: getAvatarColor(r.name) }}
                >
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-gray-900">{r.name}</span>
                    <span className="font-mono text-gray-700">{msToHours(r.loggedMs)}h</span>
                  </div>
                  <div className="text-xs text-gray-500">{r.role || "No role set"}</div>
                </div>
              </div>
              <div className="ml-11 mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-indigo-500" style={{ width: `${(r.loggedMs / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};
