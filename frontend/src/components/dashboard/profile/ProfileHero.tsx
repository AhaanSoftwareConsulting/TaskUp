import { useRef, useState } from "react";
import { CameraIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { uploadAvatar } from "../../redux/features/Profile/profileSlice";
import { useToast } from "../../hooks/useToast";
import { getAvatarColor } from "../../utils/avatarColor";
import { avatarUrl } from "../../utils/avatarUrl";

const OK = ["image/jpeg", "image/png", "image/webp"];

export const ProfileHero = ({ onEdit }: { onEdit: () => void }) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const user = useAppSelector((s) => s.login.user);
  const profile = useAppSelector((s) => s.profile.data);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const img = avatarUrl(profile?.profile_image, 256);

  const pick = async (file?: File) => {
    if (!file) return;
    if (!OK.includes(file.type)) return showToast("Use a JPG, PNG or WebP image", "error");
    if (file.size > 2 * 1024 * 1024) return showToast("Image must be 2 MB or smaller", "error");
    setBusy(true);
    try { await dispatch(uploadAvatar(file)).unwrap(); showToast("Photo updated"); }
    catch (e) { showToast(typeof e === "string" ? e : "Upload failed", "error"); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="h-36 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500" />
      <div className="px-7 pb-7">
        <div className="-mt-14 flex items-end justify-between gap-4">
          <div className="relative">
            {img ? (
              <img src={img} alt="" className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white text-4xl font-bold text-white shadow-md"
                style={{ backgroundColor: getAvatarColor(user?.full_name || "User") }}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => input.current?.click()} disabled={busy} title="Change photo"
              className="absolute bottom-1 right-1 rounded-full bg-white p-2 shadow ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60">
              {busy ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" /> : <CameraIcon size={16} weight="bold" />}
            </button>
            <input ref={input} type="file" hidden accept={OK.join(",")} onChange={(e) => pick(e.target.files?.[0])} />
          </div>
          <button onClick={onEdit} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
            <PencilSimpleIcon size={16} /> Edit profile
          </button>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{user?.full_name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-0.5 text-[11px] font-black uppercase tracking-wide text-indigo-600">{user?.role}</span>
        </div>
      </div>
    </div>
  );
};