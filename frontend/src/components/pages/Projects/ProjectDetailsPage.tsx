import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  KanbanIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { useProjects } from "../../hooks/useProjects";
import { EditProjectModal } from "../../modal/EditProjectModal";
import { ProjectOverviewSection } from "./details/ProjectOverviewSection";
import { ProgressOverviewSection } from "./details/ProgressOverviewSection";
import { TeamResourcesSection } from "./details/TeamResourcesSection";
import { WorkingHoursSection } from "./details/WorkingHoursSection";

export const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { projects, user, isManager, loading } = useProjects();
  const [editing, setEditing] = useState(false);

  const dashboardBase = `/${user?.role || "user"}/dashboard`;
  const project = projects.find((p) => p.id === projectId);

  if (loading && !project) {
    return (
      <div className="space-y-5 bg-white p-6 lg:p-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-10 text-center">
        <p className="font-semibold text-gray-900">
          This project could not be found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          It may have been archived or deleted.
        </p>
        <Link
          to={`${dashboardBase}/projects`}
          className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          Back to all projects
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 bg-white p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`${dashboardBase}/projects`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeftIcon size={16} /> All projects
        </Link>
        <div className="flex gap-2">
          {isManager && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Edit project
            </button>
          )}
<Link
  to={`${dashboardBase}/${project.slug}`}
  className="group relative isolate inline-flex items-center gap-2 overflow-hidden rounded-xl border border-transparent bg-black px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(56,189,248,0.25),0_8px_25px_rgba(0,0,0,0.3)] active:translate-y-0"
>
  {/* Animated Gradient Border */}
  <span
    className="pointer-events-none absolute inset-0 -z-20 rounded-xl"
    style={{
      background:
        "linear-gradient(90deg, #38BDF8, #8B5CF6, #38BDF8, #8B5CF6)",
      backgroundSize: "300% 100%",
      animation: "skyVioletBorder 2.5s ease-in-out infinite",
    }}
  />

  {/* Inner Black Background */}
  <span className="pointer-events-none absolute inset-[2px] -z-10 rounded-[10px] bg-black" />

  {/* Shine Effect */}
  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

  {/* Icon */}
  <KanbanIcon
    size={17}
    weight="bold"
    className="relative z-10 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
  />

  {/* Button Text */}
  <span className="relative z-10">
    Open task board
  </span>

  {/* Arrow */}
  <span className="relative z-10 ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/25">
    <ArrowRightIcon size={12} weight="bold" />
  </span>

  {/* Inline Animation */}
  <style>
    {`
      @keyframes skyVioletBorder {
        0% {
          background-position: 0% 50%;
          opacity: 0.55;
        }
        50% {
          background-position: 100% 50%;
          opacity: 1;
        }
        100% {
          background-position: 0% 50%;
          opacity: 0.55;
        }
      }
    `}
  </style>
</Link>
        </div>
      </div>

      <ProjectOverviewSection project={project} />
      <ProgressOverviewSection project={project} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamResourcesSection project={project} />
        <WorkingHoursSection project={project} />
      </div>

      {editing && (
        <EditProjectModal
          projectId={project.id}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;
