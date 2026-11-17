import { useState } from "react";
import { NavLink } from "react-router-dom";
import { DotsThreeVerticalIcon, FolderSimpleIcon, KanbanIcon, PlusIcon } from "@phosphor-icons/react";
import { useAppSelector } from "../../redux/app/hook";
import { SidebarLink } from "./SidebarLink";
import { rowBase, rowInactive, rowInner } from "./sidebarStyles";

const VISIBLE_PROJECTS = 3;

interface Props {
  collapsed: boolean;
  projectsBase: string;
  canManage: boolean;
  onCreate: () => void;
  onEdit: (project: any) => void;
  onDelete: (project: any) => void;
}

export const SidebarProjects = ({ collapsed, projectsBase, canManage, onCreate, onEdit, onDelete }: Props) => {
  const projects = useAppSelector((s) => s.board.boards) as any[];
  const [showAll, setShowAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const visible = showAll ? projects : projects.slice(0, VISIBLE_PROJECTS);
  const hiddenCount = Math.max(projects.length - VISIBLE_PROJECTS, 0);

  return (
    <div className="pt-2">
      {/* When collapsed this icon opens the full list page, so no dropdown is needed. */}
      <SidebarLink
        to={projectsBase}
        end
        label="Projects"
        icon={<FolderSimpleIcon size={18} />}
        collapsed={collapsed}
        badge={projects.length}
      />

      {!collapsed && (
        <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {projects.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No projects yet</p>}

          {visible.map((p) => (
            <div key={p.id} className="relative">
              <NavLink
                to={`${projectsBase}/${p.id}`}
                title={p.name}
                className={({ isActive }) =>
                  `flex h-9 items-center justify-between gap-2 rounded-md px-3 text-xs transition-colors ${
                    isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="flex min-w-0 items-center gap-2">
                  <KanbanIcon size={14} className="shrink-0" />
                  <span className="truncate">{p.name}</span>
                </span>
                {canManage && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === p.id ? null : p.id);
                    }}
                    aria-label={`Options for ${p.name}`}
                    className="rounded-full p-[2px] hover:bg-white hover:text-black"
                  >
                    <DotsThreeVerticalIcon size={18} weight="bold" />
                  </button>
                )}
              </NavLink>

              {openMenuId === p.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                  <div className="absolute right-0 top-9 z-20 w-28 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                    <button
                      onClick={() => { onEdit(p); setOpenMenuId(null); }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { onDelete(p); setOpenMenuId(null); }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="h-8 w-full px-3 text-left text-xs font-medium text-gray-500 hover:text-black"
            >
              {showAll ? "Show less" : `Show ${hiddenCount} more`}
            </button>
          )}
        </div>
      )}

      {canManage && (
        <button
          onClick={onCreate}
          title="Create project"
          className={`mt-1 w-full ${rowBase} ${rowInactive} ${collapsed ? "" : "border border-dashed border-gray-300"}`}
        >
          <div className={rowInner(collapsed)}>
            <PlusIcon size={16} />
            {!collapsed && "Create project"}
          </div>
        </button>
      )}
    </div>
  );
};
