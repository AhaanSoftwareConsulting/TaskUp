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
} from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { deleteBoard, fetchBoard } from "../../redux/features/Board/boardSlice";
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

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
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

  const handleDelete = async (boardId: string) => {
    try {
      await dispatch(deleteBoard({ boardId })).unwrap();
      setProjectToDelete(null);
      navigate(dashboardBase, { replace: true });
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate("/", { replace: true });
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-14 items-center px-4">
          <div className={`text-xl font-bold text-black ${collapsed ? "mx-auto tracking-widest" : ""}`}>
            {collapsed ? "ASC" : "Ahaan Software"}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          <SidebarLink to={dashboardBase} end label="Home" icon={<HouseIcon size={18} />} collapsed={collapsed} />
          <SidebarLink to={`${dashboardBase}/profile`} label="Profile" icon={<UserCircleIcon size={18} />} collapsed={collapsed} />
          <SidebarLink
            to={`${dashboardBase}/tasks?scope=${isManager ? "all" : "mine"}`}
            label={isManager ? "All Tasks" : "My Tasks"}
            icon={<ListChecksIcon size={18} />}
            collapsed={collapsed}
          />

          <SidebarProjects
            collapsed={collapsed}
            projectsBase={`${dashboardBase}/projects`}
            canManage={isManager}
            onCreate={() => setShowCreateProject(true)}
            onEdit={setProjectToEdit}
            onDelete={setProjectToDelete}
          />

          {isManager && (
            <div className="space-y-1 pt-2">
              <button onClick={() => setShowAddUser(true)} title="Create User" className={`w-full ${rowBase} ${rowInactive}`}>
                <div className={rowInner(collapsed)}>
                  <UserCirclePlusIcon size={18} />
                  {!collapsed && "Create User"}
                </div>
              </button>
              <SidebarLink to={`${dashboardBase}/teams`} label="Teams" icon={<UsersIcon size={18} />} collapsed={collapsed} />
            </div>
          )}

          <button
            onClick={() => setCollapsed((p) => !p)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-11 w-full items-center justify-center"
          >
            {collapsed ? <CaretRightIcon /> : <CaretLeftIcon />}
          </button>
        </nav>

        <div className={`p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <button onClick={handleLogout} title="Logout" className="flex items-center gap-3 text-black transition hover:text-red-600">
            <SignOutIcon />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {showCreateProject && <CreateProjectModal onClose={() => setShowCreateProject(false)} />}
      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}
      {projectToEdit && <EditProjectModal projectId={projectToEdit.id} onClose={() => setProjectToEdit(null)} />}
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
