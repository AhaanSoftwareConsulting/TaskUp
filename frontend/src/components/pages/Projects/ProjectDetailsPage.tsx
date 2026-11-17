import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, KanbanIcon } from "@phosphor-icons/react";
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
        {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-10 text-center">
        <p className="font-semibold text-gray-900">This project could not be found</p>
        <p className="mt-1 text-sm text-gray-500">It may have been archived or deleted.</p>
        <Link to={`${dashboardBase}/projects`} className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white">
          Back to all projects
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 bg-white p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`${dashboardBase}/projects`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
          <ArrowLeftIcon size={16} /> All projects
        </Link>
        <div className="flex gap-2">
          {isManager && (
            <button onClick={() => setEditing(true)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
              Edit project
            </button>
          )}
          <Link to={`${dashboardBase}/${project.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white">
            <KanbanIcon size={16} /> Open task board
          </Link>
        </div>
      </div>

      <ProjectOverviewSection project={project} />
      <ProgressOverviewSection project={project} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamResourcesSection project={project} />
        <WorkingHoursSection project={project} />
      </div>

      {editing && <EditProjectModal projectId={project.id} onClose={() => setEditing(false)} />}
    </div>
  );
};

export default ProjectDetailsPage;
