import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { fetchMyProfile } from "../../redux/features/Profile/profileSlice";
import { getFavoriteTasks, getTasks } from "../../redux/features/Task/taskSlice";
import { fetchBoard } from "../../redux/features/Board/boardSlice";
import { fetchColumn } from "../../redux/features/Column/columnSlice";
import { ProfileHero } from "./ProfileHero";
import { ProfileAbout } from "./ProfileAbout";
import { ProfileStats } from "./ProfileStats";
import { EditProfileModal } from "./EditProfileModal";

export const Profile = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.login.user?.id);
  const boards = useAppSelector((s) => s.board.boards);
  const columns = useAppSelector((s) => s.column.columns);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchMyProfile());
    dispatch(getTasks());
    dispatch(fetchBoard());
    dispatch(getFavoriteTasks());
  }, [dispatch, userId]);

  useEffect(() => {
    boards.forEach((b) => { if (b?.id && !columns[b.id]) dispatch(fetchColumn(b.id)); }); // "Completed" lookup needs columns
  }, [dispatch, boards, columns]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <ProfileHero onEdit={() => setEditing(true)} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProfileAbout onEdit={() => setEditing(true)} /></div>
        <ProfileStats />
      </div>
      {editing && <EditProfileModal onClose={() => setEditing(false)} />}
    </div>
  );
};