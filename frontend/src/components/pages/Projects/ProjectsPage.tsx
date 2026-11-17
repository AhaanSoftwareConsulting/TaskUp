import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects, type ProjectView } from "../../hooks/useProjects";
import { useAppDispatch } from "../../redux/app/hook";
import { archiveBoard } from "../../redux/features/Board/boardSlice";
import { useToast } from "../../hooks/useToast";
import { CreateProjectModal } from "../../dashboard/projects/forms/CreateProjectModal";
import { EditProjectModal } from "../../modal/EditProjectModal";
import { ProjectsHeader } from "./components/ProjectsHeader";
import { ProjectFilters } from "./components/ProjectFilters";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectsTable } from "./components/ProjectsTable";
import { applyFilters, emptyFilters, getFilterOptions, type Filters } from "./projectFilters";

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const { projects, user, isManager, loading } = useProjects();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const base = `/${user?.role || "user"}/dashboard/projects`;
  const open = (p: ProjectView) => navigate(`${base}/${p.id}`);

  const counts = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "Active").length,
      hold: projects.filter((p) => p.status === "On Hold").length,
      delayed: projects.filter((p) => p.status === "Delayed").length,
    }),
    [projects]
  );
  const options = useMemo(() => getFilterOptions(projects), [projects]);
  const visible = useMemo(() => applyFilters(projects, search, filters), [projects, search, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const setFilter = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));
  const clearAll = () => { setFilters(emptyFilters); setSearch(""); };

  const archive = async (p: ProjectView) => {
    if (!window.confirm(`Archive "${p.name}"? It will be removed from the project list.`)) return;
    const res = await dispatch(archiveBoard({ boardId: p.id }));
    if (archiveBoard.fulfilled.match(res)) showToast("Project archived");
  };

  return (
    <div className="w-full space-y-6 bg-white p-6 lg:p-10">
      <ProjectsHeader
        counts={counts}
        statusFilter={filters.status}
        onStatusClick={(s) => setFilter("status", filters.status === s ? "" : s)}
        search={search}
        onSearch={setSearch}
        view={view}
        onView={setView}
        filterCount={activeFilterCount}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((o) => !o)}
        onCreate={isManager ? () => setShowCreate(true) : undefined}
      />

      {filtersOpen && (
        <ProjectFilters filters={filters} onChange={setFilter} onClear={clearAll} activeCount={activeFilterCount} options={options} />
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="font-semibold text-gray-900">{projects.length === 0 ? "No projects yet" : "No projects match your search"}</p>
          <p className="mt-1 text-sm text-gray-500">
            {projects.length === 0 ? "Create your first project to get started." : "Remove a filter or search for another name."}
          </p>
          {projects.length > 0 && (
            <button onClick={clearAll} className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white">Clear filters</button>
          )}
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => <ProjectCard key={p.id} project={p} onOpen={() => open(p)} />)}
        </div>
      ) : (
        <ProjectsTable projects={visible} canManage={isManager} onView={open} onEdit={(p) => setEditId(p.id)} onArchive={archive} />
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
      {editId && <EditProjectModal projectId={editId} onClose={() => setEditId(null)} />}
    </div>
  );
};

export default ProjectsPage;
