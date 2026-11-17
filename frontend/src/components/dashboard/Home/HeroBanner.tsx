import { Link } from "react-router-dom";
import {
  ListChecksIcon,
  TimerIcon,
  UserCircleIcon,
  SparkleIcon,
  ArrowUpRightIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";

import type { HomeData } from "./useHomeData";

export const HeroBanner = ({ data }: { data: HomeData }) => {
  const {
    user,
    base,
    tasksLink,
    myOpen,
    myDueSoon,
    myOverdue,
    activeTimer,
  } = data;

  const h = new Date().getHours();

  const greet =
    h < 12
      ? "Good Morning"
      : h < 17
        ? "Good Afternoon"
        : "Good Evening";

  const first = user?.full_name?.split(" ")[0] ?? "there";

  const dateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="relative isolate overflow-hidden rounded-[28px] bg-[#10182D] px-6 py-7 text-white shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)] sm:px-8 sm:py-8 lg:px-9">

      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">

        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#101A35] to-[#25236A]" />

        {/* Animated Glow Orbs */}
        <div className="absolute -right-20 -top-32 h-80 w-80 animate-[float_9s_ease-in-out_infinite] rounded-full bg-indigo-500/30 blur-[90px]" />

        <div className="absolute -bottom-36 left-[30%] h-80 w-80 animate-[float_12s_ease-in-out_infinite] rounded-full bg-cyan-400/25 blur-[100px]" />

        <div className="absolute -bottom-32 right-[12%] h-64 w-64 animate-[float_10s_ease-in-out_infinite_reverse] rounded-full bg-violet-500/30 blur-[90px]" />

        {/* Moving Light Gradient */}
        <div className="absolute inset-0 animate-[gradientMove_12s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-400/[0.06] to-transparent" />

        {/* Floating Particles */}
        <span className="absolute left-[15%] top-[20%] h-1 w-1 animate-[particle_7s_ease-in-out_infinite] rounded-full bg-cyan-200/70 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />

        <span className="absolute left-[48%] top-[75%] h-1.5 w-1.5 animate-[particle_9s_ease-in-out_infinite] rounded-full bg-indigo-200/70 shadow-[0_0_12px_rgba(165,180,252,0.8)]" />

        <span className="absolute right-[20%] top-[25%] h-1 w-1 animate-[particle_8s_ease-in-out_infinite] rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />

        <span className="absolute right-[40%] bottom-[20%] h-1 w-1 animate-[particle_10s_ease-in-out_infinite] rounded-full bg-cyan-200/60 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />

      </div>

      {/* Decorative Circles */}
      <div className="pointer-events-none absolute -right-12 top-1/2 hidden h-[340px] w-[340px] -translate-y-1/2 rounded-full border border-white/[0.07] lg:block" />

      <div className="pointer-events-none absolute -right-1 top-1/2 hidden h-[260px] w-[260px] -translate-y-1/2 rounded-full border border-white/[0.07] lg:block" />

      <div className="pointer-events-none absolute right-[65px] top-1/2 hidden h-[180px] w-[180px] -translate-y-1/2 rounded-full border border-white/[0.07] lg:block" />

      {/* Decorative Sparkle */}
      <div className="absolute right-24 top-9 hidden text-white/20 lg:block">
        <SparkleIcon size={22} weight="fill" />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

        {/* Left Content */}
        <div className="max-w-2xl">

          {/* Date Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 backdrop-blur-md">

            <CalendarBlankIcon
              size={14}
              weight="fill"
              className="text-cyan-300"
            />

            <span className="text-[11px] font-medium tracking-wide text-white/70">
              {dateText}
            </span>

            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />

          </div>

          {/* Greeting */}
          <h1 className="text-[27px] font-bold leading-tight tracking-tight sm:text-[32px] lg:text-[36px]">

            {greet},{" "}

            <span className="bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
              {first}
            </span>

            {/* Animated Hand Wave */}
            <span className="ml-2 inline-block origin-[70%_70%] animate-[wave_2.5s_ease-in-out_infinite]">
              👋
            </span>

          </h1>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-slate-300">

            Here's your productivity overview.

            You have{" "}

            <span className="font-bold text-white">
              {myOpen.length}
            </span>{" "}

            open {myOpen.length === 1 ? "task" : "tasks"},{" "}

            <span className="font-bold text-cyan-300">
              {myDueSoon.length}
            </span>{" "}

            due this week

            {myOverdue.length > 0 && (
              <>
                {" "}and{" "}

                <span className="font-bold text-rose-300">
                  {myOverdue.length} overdue
                </span>
              </>
            )}

            .

          </p>

          {/* Active Timer */}
          {activeTimer && (
            <Link
              to={`${base}/tasks/${activeTimer.taskId}`}
              className="group mt-5 inline-flex max-w-full items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.10] px-3.5 py-2.5 backdrop-blur-md transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-400/[0.16]"
            >

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
                <TimerIcon size={17} weight="fill" />
              </span>

              <span className="min-w-0">

                <span className="block text-[9px] font-bold uppercase tracking-[1.5px] text-emerald-300/70">
                  Currently tracking
                </span>

                <span className="block truncate text-xs font-semibold text-emerald-100">
                  {activeTimer.taskTitle}
                </span>

              </span>

              <ArrowUpRightIcon
                size={15}
                className="ml-2 shrink-0 text-emerald-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />

            </Link>
          )}

        </div>

        {/* Right Actions */}
        <div className="relative flex shrink-0 flex-wrap items-center gap-3 md:flex-col md:items-end lg:flex-row">

          {/* Open Tasks Button */}
          <Link
            to={tasksLink}
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3 text-[13px] font-bold text-slate-900 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:shadow-xl"
          >

            <ListChecksIcon
              size={17}
              weight="bold"
              className="text-indigo-600"
            />

            Open tasks

            <ArrowUpRightIcon
              size={14}
              className="ml-1 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />

          </Link>

          {/* My Profile Button */}
          <Link
            to={`${base}/profile`}
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.08] px-5 py-3 text-[13px] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.15]"
          >

            <UserCircleIcon
              size={17}
              weight="bold"
              className="text-indigo-200"
            />

            My profile

          </Link>

        </div>

      </div>

      {/* Bottom Decorative Accent */}
      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />

    </section>
  );
};