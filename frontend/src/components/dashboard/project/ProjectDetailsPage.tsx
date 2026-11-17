import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, KanbanIcon } from "@phosphor-icons/react";
import {
  useProjects,
  msToHours,
  formatDate,
  statusStyle,
  priorityStyle,
} from "../../hooks/useProjects";
import { getAvatarColor } from "../../utils/avatarColor";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl bg-black p-6 text-white">
    <h2 className="mb-5 text-lg font-bold">{title}</h2>
    {children}
  </section>
);

const Stat = ({ label, value, color = "text-white" }: { label: string; value: React.ReactNode; color?: string }) => (
  <div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="mt-1 text-sm text-zinc-400">{label}</div>
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-white/5 py-3 text-sm last:border-0">
    <span className="text-zinc-400">{label}</span>
    <span className="text-right text-zinc-100">{children}</span>
  </div>
);

export const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { projects, user, loading } = useProjects();

  const dashboardBase = `/${user?.role || "user"}/dashboard`;
  const project = projects.find((p) => p.id === projectId);

  if (loading && !project) {
    return (
      <div className="p-6 lg:p-10 space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-zinc-900 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-10 text-center">
        <p className="font-semibold text-gray-800">This project could not be found</p>
        <p className="mt-1 text-sm text-gray-500">It may have been archived or deleted.</p>
        <Link to={`${dashboardBase}/projects`} className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white">
          Back to all projects
        </Link>
      </div>
    );
  }

  const logged = msToHours(project.loggedMs);
  const estimated = msToHours(project.estimatedMs);
  const hasEstimate = project.estimatedMs > 0;
  const remaining = Math.max(estimated - logged, 0);
  const overBy = hasEstimate && logged > estimated ? Math.round((logged - estimated) * 10) / 10 : 0;
  const usedPct = hasEstimate ? Math.min(Math.round((logged / estimated) * 100), 100) : 0;
  const maxResourceMs = Math.max(...project.resources.map((r) => r.loggedMs), 1);

  return (
    <div className="w-full space-y-6 p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`${dashboardBase}/projects`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeftIcon size={16} /> All projects
        </Link>
        <Link
          to={`${dashboardBase}/${project.slug}`}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          <KanbanIcon size={16} /> Open task board
        </Link>
      </div>

      {/* Project overview */}
      <Section title="Project overview">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="mt-2 text-sm text-zinc-300">
              {project.description || "No description added yet. Add one from Edit project."}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyle[project.status]}`}>
              {project.status}
            </span>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${priorityStyle[project.priority]}`}>
              {project.priority} priority
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-x-10 md:grid-cols-2">
          <div>
            <Row label="Client">{project.client}</Row>
            <Row label="Project manager">{project.manager}</Row>
          </div>
          <div>
            <Row label="Start date">{formatDate(project.startDate)}</Row>
            <Row label="Expected deadline">{formatDate(project.deadline)}</Row>
          </div>
        </div>
      </Section>

      {/* Progress overview */}
      <Section title="Progress overview">
        <div className="flex items-end justify-between">
          <span className="text-5xl font-bold">{project.progress}%</span>
          <span className="text-sm text-zinc-400">overall completion</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${project.progress}%` }} />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Total tasks" value={project.totalTasks} />
          <Stat label="Completed" value={project.completedTasks} color="text-emerald-500" />
          <Stat label="Pending" value={project.pendingTasks} color="text-orange-500" />
          <Stat label="Overdue" value={project.overdueTasks} color="text-red-400" />
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team & resources */}
        <Section title={`Team & resources (${project.resources.length})`}>
          {project.resources.length === 0 ? (
            <p className="text-sm text-zinc-400">No one is assigned to tasks in this project yet.</p>
          ) : (
            <ul className="space-y-4">
              {[...project.resources]
                .sort((a, b) => b.loggedMs - a.loggedMs)
                .map((r) => (
                  <li key={r.id}>
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: getAvatarColor(r.name) }}
                      >
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="truncate font-semibold">{r.name}</span>
                          <span className="font-mono text-zinc-300">{msToHours(r.loggedMs)}h</span>
                        </div>
                        <div className="text-xs text-zinc-500">{r.role || "No role set"}</div>
                      </div>
                    </div>
                    <div className="ml-11 mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-indigo-400"
                        style={{ width: `${(r.loggedMs / maxResourceMs) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Section>

        {/* Working hours */}
        <Section title="Working hours">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Estimated" value={hasEstimate ? `${estimated}h` : "Not set"} />
            <Stat label="Logged" value={`${logged}h`} color="text-emerald-500" />
            <Stat
              label={overBy ? "Over estimate" : "Remaining"}
              value={hasEstimate ? `${overBy || remaining}h` : "—"}
              color={overBy ? "text-red-400" : "text-orange-500"}
            />
          </div>
          {hasEstimate && (
            <>
              <div className="mt-6 flex justify-between text-sm text-zinc-400">
                <span>Estimate used</span>
                <span>{Math.round((logged / estimated) * 100)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${overBy ? "bg-red-400" : "bg-emerald-500"}`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </>
          )}
          {!hasEstimate && (
            <p className="mt-6 text-sm text-zinc-400">
              No estimate found. Add estimated hours on the project or its tasks to see the remaining time.
            </p>
          )}
        </Section>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;