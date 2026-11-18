import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CaretLeftIcon,
  CaretRightIcon,
  HouseIcon,
  ListChecksIcon,
  SignOutIcon,
  UserCircleIcon,
  UserCirclePlusIcon,
  UsersIcon,
  SquaresFourIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { useAppDispatch, useAppSelector } from "../../redux/app/hook";

import {
  deleteBoard,
  fetchBoard,
} from "../../redux/features/Board/boardSlice";

import { logoutUser } from "../../redux/features/User/login/loginSlice";

import AddUserModal from "../../redux/features/User/AddUserModal";
import { DeleteModal } from "../../modal/DeleteModal";
import { EditProjectModal } from "../../modal/EditProjectModal";
import { CreateProjectModal } from "../projects/forms/CreateProjectModal";

import { SidebarLink } from "./SidebarLink";
import { SidebarProjects } from "./SidebarProjects";
import { rowBase, rowInactive, rowInner } from "./sidebarStyles";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar = ({
  collapsed,
  setCollapsed,
}: SidebarProps) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.login.user);

  const role = user?.role || "user";
  const isManager = role === "manager" || role === "ceo";

  const dashboardBase = `/${role}/dashboard`;

  useEffect(() => {
    dispatch(fetchBoard());
  }, [dispatch]);

  // Delete project
  const handleDelete = async (boardId: string) => {
    try {
      await dispatch(deleteBoard({ boardId })).unwrap();

      setProjectToDelete(null);

      navigate(dashboardBase, { replace: true });
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();

    navigate("/", { replace: true });
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-100 bg-white transition-all duration-300 ${
          collapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        {/* BRAND HEADER */}
        <div
          className={`flex h-[68px] shrink-0 items-center border-b border-gray-100 ${
            collapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#171B2E] text-white">
              <SquaresFourIcon size={20} weight="fill" />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#278CFA]" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-extrabold tracking-tight text-[#171B2E]">
                  Ahaan Software
                </h2>

                <div className="mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Workspace
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-5">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Main Menu
              </p>
            )}

            <SidebarLink
              to={dashboardBase}
              end
              label="Home"
              icon={<HouseIcon size={18} weight="duotone" />}
              collapsed={collapsed}
            />

            <SidebarLink
              to={`${dashboardBase}/profile`}
              label="Profile"
              icon={<UserCircleIcon size={18} weight="duotone" />}
              collapsed={collapsed}
            />

            <SidebarLink
              to={`${dashboardBase}/tasks?scope=${isManager ? "all" : "mine"}`}
              label={isManager ? "All Tasks" : "My Tasks"}
              icon={<ListChecksIcon size={18} weight="duotone" />}
              collapsed={collapsed}
            />
          </div>

          {/* Projects Section */}
          <div className="mt-7">
            {!collapsed && (
              <div className="mb-3 flex items-center justify-between px-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Workspace
                </p>

                <SparkleIcon
                  size={13}
                  weight="duotone"
                  className="text-[#278CFA]"
                />
              </div>
            )}

            <SidebarProjects
              collapsed={collapsed}
              projectsBase={`${dashboardBase}/projects`}
              canManage={isManager}
              onCreate={() => setShowCreateProject(true)}
              onEdit={setProjectToEdit}
              onDelete={setProjectToDelete}
            />
          </div>

          {/* Management Section */}
          {isManager && (
            <div className="mt-7 space-y-1">
              {!collapsed && (
                <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Management
                </p>
              )}

              <button
                onClick={() => setShowAddUser(true)}
                title="Create User"
                className={`group w-full ${rowBase} ${rowInactive} transition-all duration-200 hover:bg-blue-50 hover:text-[#278CFA]`}
              >
                <div className={rowInner(collapsed)}>
                  <UserCirclePlusIcon
                    size={18}
                    weight="duotone"
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />

                  {!collapsed && (
                    <span className="text-[12px] font-medium">
                      Create User
                    </span>
                  )}
                </div>
              </button>

              <SidebarLink
                to={`${dashboardBase}/teams`}
                label="Teams"
                icon={<UsersIcon size={18} weight="duotone" />}
                collapsed={collapsed}
              />
            </div>
          )}

          {/* Collapse Button */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={() => setCollapsed((p) => !p)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`group flex h-10 w-full items-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-[#171B2E] ${
                collapsed ? "justify-center" : "justify-center gap-2"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 transition-colors group-hover:bg-white">
                {collapsed ? (
                  <CaretRightIcon size={15} weight="bold" />
                ) : (
                  <CaretLeftIcon size={15} weight="bold" />
                )}
              </span>

              {!collapsed && (
                <span className="text-[10px] font-semibold">
                  Collapse Sidebar
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* BOTTOM SECTION */}
        <div className="shrink-0 border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            title="Logout"
            className={`group flex w-full items-center rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-500 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 transition-colors group-hover:bg-red-100">
              <SignOutIcon size={17} weight="bold" />
            </div>

            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span className="text-xs font-semibold">Logout</span>

                <span className="text-[9px] font-medium text-gray-300 transition-colors group-hover:text-red-400">
                  Sign out
                </span>
              </div>
            )}
          </button>

          {/* Workspace User */}
          {!collapsed && (
            <div className="mt-3 rounded-xl bg-gray-50/80 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171B2E] text-[10px] font-bold uppercase text-white">
                  U
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-gray-700">
                    Workspace User
                  </p>

                  <p className="mt-0.5 truncate text-[9px] capitalize text-gray-400">
                    {role}
                  </p>
                </div>

                <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MODALS */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
        />
      )}

      {projectToEdit && (
        <EditProjectModal
          projectId={projectToEdit.id}
          onClose={() => setProjectToEdit(null)}
        />
      )}

      {projectToDelete && (
        <DeleteModal
          item={projectToDelete}
          itemLabel="project"
          getName={(p: any) => p.name}
          getId={(p: any) => p.id}
          onCancel={() => setProjectToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};