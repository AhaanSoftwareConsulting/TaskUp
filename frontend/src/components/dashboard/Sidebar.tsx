import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/app/hook";
import { useEffect, useState } from "react";
import { deleteBoard, fetchBoard } from "../redux/features/Board/boardSlice";
import {
  HouseIcon,
  UsersIcon,
  PlusIcon,
  ListChecksIcon,
  DotsThreeVerticalIcon,
  UserCirclePlusIcon,
  CaretRightIcon,
  CaretLeftIcon,
  SignOutIcon,
  KanbanIcon,
  UserCircleIcon,
  FolderSimpleIcon,
} from "@phosphor-icons/react";
import { logoutUser } from "../redux/features/User/login/loginSlice";
import { CreateBoardForm } from "../redux/features/Board/CreateBoardForm";
import AddUserModal from "../redux/features/User/AddUserModal";
import { DeleteModal } from "../modal/DeleteModal";
import { EditBoardModal } from "../modal/EditBoardModal";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const VISIBLE_PROJECTS = 3;

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [createBoard, setCreateBoard] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [boardToEdit, setBoardToEdit] = useState<any>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.login.user);
  const boards = useAppSelector((state) => state.board.boards);

  const role = user?.role || "user";
  const isManager = role === "manager" || role === "ceo";
  const dashboardBase = `/${role}/dashboard`;
  const projectsBase = `${dashboardBase}/projects`;

  const baseRow =
    "flex items-center h-11 px-4 text-sm rounded-md transition-all";
  const active = "bg-black text-white";
  const inactive = "text-black hover:bg-black hover:text-white";
  const rowInner = `flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`;

  useEffect(() => {
    dispatch(fetchBoard());
  }, [dispatch]);

  const visibleBoards = showAllProjects ? boards : boards.slice(0, VISIBLE_PROJECTS);
  const hiddenCount = Math.max(boards.length - VISIBLE_PROJECTS, 0);

  const handleDelete = async (boardId: string) => {
    try {
      await dispatch(deleteBoard({ boardId })).unwrap();
      setBoardToDelete(null);
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
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200
        ${collapsed ? "w-16" : "w-64"}
        transition-all duration-300 flex flex-col z-50`}
      >
        {/* LOGO */}
        <div className="h-14 flex items-center px-4">
          <div
            className={`text-black font-bold text-xl ${collapsed ? "mx-auto tracking-widest" : ""}`}
          >
            {collapsed ? "ASC" : "Ahaan Software"}
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
          <NavLink
            to={dashboardBase}
            end
            title="Home"
            className={({ isActive }) => `${baseRow} ${isActive ? active : inactive}`}
          >
            <div className={rowInner}>
              <HouseIcon size={18} />
              {!collapsed && "Home"}
            </div>
          </NavLink>

          <NavLink
            to={`${dashboardBase}/profile`}
            title="Profile"
            className={({ isActive }) => `${baseRow} ${isActive ? active : inactive}`}
          >
            <div className={rowInner}>
              <UserCircleIcon size={18} />
              {!collapsed && "Profile"}
            </div>
          </NavLink>

          <NavLink
            to={`${dashboardBase}/tasks?scope=${isManager ? "all" : "mine"}`}
            title={isManager ? "All Tasks" : "My Tasks"}
            className={({ isActive }) => `${baseRow} ${isActive ? active : inactive}`}
          >
            <div className={rowInner}>
              <ListChecksIcon size={18} />
              {!collapsed && (isManager ? "All Tasks" : "My Tasks")}
            </div>
          </NavLink>

          {/* ---------- PROJECTS ---------- */}
          <div className="pt-2">
            <NavLink
              to={projectsBase}
              end
              title="All Projects"
              className={({ isActive }) => `${baseRow} ${isActive ? active : inactive}`}
            >
              <div className={`${rowInner} ${collapsed ? "" : "flex-1"}`}>
                <FolderSimpleIcon size={18} />
                {!collapsed && (
                  <>
                    <span className="flex-1">Projects</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {boards.length}
                    </span>
                  </>
                )}
              </div>
            </NavLink>

            {/* Project list: only when expanded. When collapsed, the icon above
                goes to the full project list page, so no dropdown is needed. */}
            {!collapsed && (
              <div className="ml-6 mt-1 pl-3 border-l border-gray-200 space-y-1">
                {boards.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400">No projects yet</p>
                )}

                {visibleBoards.map((b: any) => {
                  const isMenuOpen = openMenuId === b.id;
                  return (
                    <div key={b.id} className="relative">
                      <NavLink
                        to={`${projectsBase}/${b.id}`}
                        title={b.name}
                        className={({ isActive }) =>
                          `h-9 px-3 text-xs rounded-md flex items-center justify-between gap-2 transition-colors ${
                            isActive
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`
                        }
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <KanbanIcon size={14} className="shrink-0" />
                          <span className="truncate">{b.name}</span>
                        </span>

                        {isManager && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : b.id);
                            }}
                            aria-label={`Options for ${b.name}`}
                            className="rounded-full hover:bg-white hover:text-black p-[2px] transition-colors"
                          >
                            <DotsThreeVerticalIcon size={18} weight="bold" />
                          </button>
                        )}
                      </NavLink>

                      {isMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-9 w-28 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoardToEdit(b);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoardToDelete(b);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {hiddenCount > 0 && (
                  <button
                    onClick={() => setShowAllProjects((p) => !p)}
                    className="w-full h-8 px-3 text-left text-xs font-medium text-gray-500 hover:text-black"
                  >
                    {showAllProjects ? "Show less" : `Show ${hiddenCount} more`}
                  </button>
                )}
              </div>
            )}

            {/* Create project: below the list, never beside the title */}
            <button
              onClick={() => setCreateBoard(true)}
              title="Create project"
              className={`mt-1 w-full ${baseRow} ${inactive} ${
                collapsed ? "" : "border border-dashed border-gray-300"
              }`}
            >
              <div className={rowInner}>
                <PlusIcon size={16} />
                {!collapsed && "Create project"}
              </div>
            </button>
          </div>

          {isManager && (
            <div className="pt-2 space-y-1">
              <button
                onClick={() => setShowAddUser(true)}
                title="Create User"
                className={`w-full ${baseRow} ${inactive}`}
              >
                <div className={rowInner}>
                  <UserCirclePlusIcon size={18} />
                  {!collapsed && "Create User"}
                </div>
              </button>

              <NavLink
                to={`${dashboardBase}/teams`}
                title="Teams"
                className={({ isActive }) => `${baseRow} ${isActive ? active : inactive}`}
              >
                <div className={rowInner}>
                  <UsersIcon size={18} />
                  {!collapsed && "Teams"}
                </div>
              </NavLink>
            </div>
          )}

          <button
            onClick={() => setCollapsed((p) => !p)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center h-11 w-full justify-center"
          >
            {collapsed ? <CaretRightIcon /> : <CaretLeftIcon />}
          </button>
        </nav>

        <div className={`p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-3 text-black hover:text-red-600 transition"
          >
            <SignOutIcon />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Modals work in both collapsed and expanded states */}
      {createBoard && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={() => setCreateBoard(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-[520px] max-w-[95vw] bg-white rounded-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateBoardForm onClose={() => setCreateBoard(false)} />
          </div>
        </div>
      )}

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}

      {boardToDelete && (
        <DeleteModal
          item={boardToDelete}
          itemLabel="board"
          getName={(b: any) => b.name}
          getId={(b: any) => b.id}
          onCancel={() => setBoardToDelete(null)}
          onConfirm={handleDelete}
        />
      )}

      {boardToEdit && (
        <EditBoardModal boardId={boardToEdit.id} onClose={() => setBoardToEdit(null)} />
      )}
    </>
  );
};