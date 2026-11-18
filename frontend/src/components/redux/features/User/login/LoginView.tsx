import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import {
  ShieldCheckIcon,
  SparkleIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";

import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { loginUsers } from "./loginSlice";
import { slugify } from "../../../../hooks/slugify";
import { useToast } from "../../../../hooks/useToast";
import { PasswordInput } from "../../../../modal/PasswordInput";

interface LoginForm {
  email: string;
  password: string;
}

export const LoginView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const showToast = useToast();

  const { loading, error, user } = useAppSelector(
    (state) => state.login
  );

  const { register, handleSubmit } = useForm<LoginForm>();

  const submitLogin = (data: LoginForm) => {
    dispatch(loginUsers(data));
  };

  const role = user?.role ? slugify(user.role) : "";

  useEffect(() => {
    if (role) {
      navigate(`/${role}/dashboard`, { replace: true });
      showToast("Login Successful");
    }
  }, [role, navigate, showToast]);

  return (
    <div className="relative mx-auto w-full max-w-[480px]">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-36 w-36 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-purple-100/40 blur-3xl" />

      {/* Main Login Card */}
      <div className="relative overflow-hidden rounded-[26px] bg-white/95 px-7 py-7 sm:px-9 sm:py-8">

        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-[22px] border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-purple-50">

            <div className="absolute inset-1.5 rounded-2xl border border-white" />

            <img
              src="/Logo.png"
              alt="Project Management Logo"
              className="relative h-[78px] w-[78px] object-contain"
            />

            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#278CFA] text-white">
              <SparkleIcon size={13} weight="fill" />
            </span>

          </div>
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#278CFA]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#278CFA]">
              Workspace Access
            </span>
          </div>

          <h2 className="text-[26px] font-extrabold tracking-tight text-[#171B2E] sm:text-[28px]">
            Welcome To TaskUp!
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Sign in to continue managing your projects and team.
          </p>

        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(submitLogin)}
          className="space-y-4"
        >

          {/* Email */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#34394D]">
              Email address
            </label>

            <input
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              {...register("email", { required: true })}
              className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50/60 px-5 text-sm text-[#171B2E] outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-[#278CFA] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#34394D]">
              Password
            </label>

            <PasswordInput
              placeholder="Enter your password"
              name="password"
              register={register}
            />
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[#6554E8] transition-colors hover:text-[#278CFA]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading === "pending"}
            className="group relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#171B2E] text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#252B46] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />

            <span className="relative">
              {loading === "pending" ? "Signing in..." : "Sign In"}
            </span>
          </button>

        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />

          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Secure Access
          </span>

          <div className="h-px flex-1 bg-gray-100" />
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-gray-400">

          <ShieldCheckIcon
            size={16}
            weight="duotone"
            className="text-[#278CFA]"
          />

          <span className="text-[11px] font-medium">
            <LockKeyIcon size={11} className="mr-1 inline" />
            Your workspace is protected
          </span>

        </div>

      </div>

      {/* Bottom Text */}
      <p className="mt-4 text-center text-[11px] font-medium text-gray-400">
        © {new Date().getFullYear()} Ahaan Software. All rights reserved.
      </p>

    </div>
  );
};