import type { ProjectView } from "../../../hooks/useProjects";
import { Section, Stat } from "./Section";

export const ProgressOverviewSection = ({ project: p }: { project: ProjectView }) => (
  <Section title="Progress overview">
    <div className="flex items-end justify-between">
      <span className="text-5xl font-bold text-gray-900">{p.progress}%</span>
      <span className="text-sm text-gray-500">overall completion</span>
    </div>
    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
    </div>
    <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
      <Stat label="Total tasks" value={p.totalTasks} />
      <Stat label="Completed tasks" value={p.completedTasks} color="text-emerald-600" />
      <Stat label="Pending tasks" value={p.pendingTasks} color="text-orange-500" />
      <Stat label="Overdue tasks" value={p.overdueTasks} color="text-red-500" />
    </div>
  </Section>
);
