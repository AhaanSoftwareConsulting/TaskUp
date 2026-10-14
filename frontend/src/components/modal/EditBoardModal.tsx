import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "@phosphor-icons/react";
import UserSearchInput from "../dashboard/UserSearchInput";
import { useAppDispatch, useAppSelector } from "../redux/app/hook";
import { addMember, editBoard, removeMember } from "../redux/features/Board/boardSlice";
import { getAvatarColor } from "../utils/avatarColor";
import { slugify } from "../hooks/slugify";
import { useToast } from "../hooks/useToast";

const MAX_DESC = 500;

interface Props {
  boardId: string;
  onClose: () => void;
}

export const EditBoardModal = ({ boardId, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showToast = useToast();

  const user = useAppSelector((s) => s.login.user);
  // Read the board from Redux (not a copied snapshot) so the member list
  // updates the moment someone is added or removed.
  const board = useAppSelector((s) => s.board.boards.find((b) => b.id === boardId));

  const [name, setName] = useState(board?.name ?? "");
  const [description, setDescription] = useState(board?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  const canManageMembers = user?.role === "manager" || user?.role === "ceo";

  if (!board) return null;

  const errorText = (err: unknown, fallback: string) => (typeof err === "string" ? err : fallback);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const updated = await dispatch(
        editBoard({ boardId, name: name.trim(), description: description.trim() })
      ).unwrap();
      showToast("Board updated");

      // The URL contains the board name, so follow a rename if we're on that board's page.
      if (updated.name !== board.name && pathname.endsWith(`/${slugify(board.name)}`)) {
        navigate(`/${user?.role}/dashboard/${slugify(updated.name)}`, { replace: true });
      }
      onClose();
    } catch (err) {
      showToast(errorText(err, "Failed to update board"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (memberId: string) => {
    try {
      await dispatch(addMember({ boardId, memberId })).unwrap();
      showToast("Member added");
    } catch (err) {
      showToast(errorText(err, "Failed to add member"), "error");
    }
  };

  const handleRemove = async (memberId: string) => {
    setBusyMemberId(memberId);
    try {
      await dispatch(removeMember({ boardId, memberId })).unwrap();
      showToast("Member removed");
    } catch (err) {
      showToast(errorText(err, "Failed to remove member"), "error");
    } finally {
      setBusyMemberId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-7">
        <button onClick={onClose} className="absolute right-4 top-4 bg-black text-white rounded-full p-1">
          <X size={16} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Board</h2>

        {/* NAME */}
        <label className="block text-xs font-semibold text-gray-500 mb-1">Board name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* DESCRIPTION */}
        <div className="flex justify-between items-end mb-1">
          <label className="text-xs font-semibold text-gray-500">Description</label>
          <span className="text-[10px] text-gray-400">{description.length}/{MAX_DESC}</span>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
          rows={3}
          placeholder="What is this project about?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none mb-6 focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* MEMBERS */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Members ({board.members.length})
            </h3>
            <span className="text-[10px] text-gray-400">Changes here apply immediately</span>
          </div>

          <div className="space-y-2 mb-4">
            {board.members.map((m) => {
              const isOwner = m.id === board.owner?.id;
              return (
                <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getAvatarColor(m.full_name || "?") }}
                    >
                      {(m.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{m.full_name || "Unknown"}</p>
                      <p className="text-[11px] text-gray-400 truncate">{m.email}</p>
                    </div>
                  </div>

                  {isOwner ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      Owner
                    </span>
                  ) : canManageMembers ? (
                    <button
                      onClick={() => handleRemove(m.id)}
                      disabled={busyMemberId === m.id}
                      className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2 py-1 rounded-md disabled:opacity-50"
                    >
                      {busyMemberId === m.id ? "Removing..." : "Remove"}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {canManageMembers && (
            <UserSearchInput
              onUserSelect={(u) => handleAdd(u.id)}
              excludeUserIds={board.members.map((m) => m.id)}
            />
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-7">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200">
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};