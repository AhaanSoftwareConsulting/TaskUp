import { useRef, useState } from "react";
import {
  CameraIcon,
  PencilSimpleIcon,
  EnvelopeSimpleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

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

    if (!OK.includes(file.type)) {
      return showToast("Use a JPG, PNG or WebP image", "error");
    }

    if (file.size > 2 * 1024 * 1024) {
      return showToast("Image must be 2 MB or smaller", "error");
    }

    setBusy(true);

    try {
      await dispatch(uploadAvatar(file)).unwrap();
      showToast("Photo updated");
    } catch (e) {
      showToast(typeof e === "string" ? e : "Upload failed", "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">

      {/* ================= BANNER ================= */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#171B2E] via-[#263B68] to-[#278CFA] sm:h-44">

        {/* Background Glow */}
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />

        <div className="absolute -right-16 -top-20 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl transition-transform duration-700 group-hover:scale-125" />

        <div className="absolute -bottom-32 left-[35%] h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        {/* Abstract Circle Design */}
        <div className="absolute -right-20 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />

        <div className="absolute -right-10 -top-32 h-[340px] w-[340px] rounded-full border border-white/10" />

        <div className="absolute right-8 -top-24 h-[250px] w-[250px] rounded-full border border-white/10" />

        {/* Glass Circle */}
        <div className="absolute right-[20%] top-[-70px] h-48 w-48 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-[2px]" />

        {/* Decorative Shapes */}
        <div className="absolute left-[12%] top-[25%] h-2 w-2 rounded-full bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.9)]" />

        <div className="absolute left-[30%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-cyan-200/80" />

        <div className="absolute right-[32%] top-[28%] h-2 w-2 rounded-full bg-white/50" />

        <div className="absolute right-[15%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-blue-100/80" />

        {/* Decorative Sparkles */}
        <SparkleIcon
          size={24}
          weight="fill"
          className="absolute right-[25%] top-[30%] text-white/20"
        />

        <SparkleIcon
          size={14}
          weight="fill"
          className="absolute left-[20%] bottom-[20%] text-cyan-100/40"
        />

        {/* Bottom Light */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#171B2E]/20 to-transparent" />

        {/* Subtle Shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      </div>

      {/* ================= PROFILE CONTENT ================= */}
      <div className="relative px-5 pb-6 sm:px-8">

        {/* Avatar & Actions */}
        <div className="-mt-14 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">

          {/* Avatar */}
          <div className="relative">

            {/* Avatar Outer Ring */}
            <div className="rounded-full bg-white p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)]">

              {img ? (
                <img
                  src={img}
                  alt="Profile"
                  className="h-28 w-28 rounded-full border border-slate-100 object-cover sm:h-32 sm:w-32"
                />
              ) : (
                <div
                  className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-100 text-4xl font-bold text-white sm:h-32 sm:w-32"
                  style={{
                    backgroundColor: getAvatarColor(
                      user?.full_name || "User"
                    ),
                  }}
                >
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

            </div>

            {/* Online Indicator */}
            <span className="absolute bottom-3 right-3 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500 shadow-sm" />

            {/* Change Photo Button */}
            <button
              onClick={() => input.current?.click()}
              disabled={busy}
              title="Change photo"
              className="absolute bottom-1 left-1 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#278CFA] text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <CameraIcon size={16} weight="bold" />
              )}
            </button>

            <input
              ref={input}
              type="file"
              hidden
              accept={OK.join(",")}
              onChange={(e) => pick(e.target.files?.[0])}
            />

          </div>

          {/* Edit Profile Button */}
          <button
            onClick={onEdit}
            className="mb-1 inline-flex items-center gap-2 rounded-xl bg-[#171B2E] px-5 py-3 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#278CFA] hover:shadow-lg hover:shadow-blue-500/20"
          >
            <PencilSimpleIcon size={16} weight="bold" />
            Edit Profile
          </button>

        </div>

        {/* ================= USER DETAILS ================= */}
        <div className="mt-5">

          {/* Name & Verification */}
          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-extrabold tracking-tight text-[#171B2E] sm:text-[28px]">
              {user?.full_name || "Workspace User"}
            </h1>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#278CFA]">
              <ShieldCheckIcon size={13} weight="fill" />
              Verified Account
            </span>

          </div>

          {/* Email & Role */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">

            {/* Email */}
            <div className="flex items-center gap-2.5">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#278CFA]">
                <EnvelopeSimpleIcon size={16} weight="duotone" />
              </div>

              <span className="text-xs font-medium text-slate-600">
                {user?.email}
              </span>

            </div>

            {/* Role */}
            <div className="flex items-center gap-2.5">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                <UserCircleIcon size={16} weight="duotone" />
              </div>

              <span className="text-xs font-medium capitalize text-slate-600">
                {user?.role || "Member"}
              </span>

            </div>

          </div>

        </div>

        {/* ================= BOTTOM ACCENT ================= */}
        <div className="mt-7 flex items-center gap-2.5 border-t border-slate-100 pt-5">

          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>

          <p className="text-[11px] font-medium text-slate-400">
            Your profile information is securely managed.
          </p>

        </div>

      </div>
    </div>
  );
};