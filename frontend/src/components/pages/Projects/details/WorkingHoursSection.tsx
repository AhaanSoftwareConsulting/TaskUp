import type { ProjectView } from "../../../hooks/useProjects";
import { msToHours } from "../../../utils/projectFormat";
import { Section, Stat } from "./Section";

export const WorkingHoursSection = ({ project: p }: { project: ProjectView }) => {
  const logged = msToHours(p.loggedMs);
  const estimated = p.estimatedHours;
  const hasEstimate = estimated > 0;
  const overBy = hasEstimate && logged > estimated ? Math.round((logged - estimated) * 10) / 10 : 0;
  const remaining = Math.max(estimated - logged, 0);
  const usedPct = hasEstimate ? Math.round((logged / estimated) * 100) : 0;

  return (
    <Section title="Working hours">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Estimated hours" value={hasEstimate ? `${estimated}h` : "Not set"} />
        <Stat label="Total logged" value={`${logged}h`} color="text-emerald-600" />
        <Stat
          label={overBy ? "Over estimate" : "Remaining"}
          value={hasEstimate ? `${overBy || remaining}h` : "—"}
          color={overBy ? "text-red-500" : "text-orange-500"}
        />
      </div>

      {hasEstimate ? (
        <>
          <div className="mt-6 flex justify-between text-sm text-gray-500">
            <span>Estimate used</span>
            <span>{usedPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full ${overBy ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(usedPct, 100)}%` }} />
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-gray-500">No estimate yet. Add estimated hours with Edit project to see the remaining time.</p>
      )}
    </Section>
  );
};
