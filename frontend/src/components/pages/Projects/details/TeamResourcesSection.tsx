import type { ProjectView } from "../../../hooks/useProjects";
import { getAvatarColor } from "../../../utils/avatarColor";
import { msToHours } from "../../../utils/projectFormat";
import { Section } from "./Section";

import {
  UsersThreeIcon,
  ClockIcon,
  BriefcaseIcon,
  TrendUpIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";

export const TeamResourcesSection = ({
  project: p,
}: {
  project: ProjectView;
}) => {
  const max = Math.max(...p.resources.map((r) => r.loggedMs), 1);

  return (
    <Section title={`Team & resources (${p.resources.length})`}>

      <div className="space-y-5">

        {p.resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <UsersThreeIcon size={24} weight="duotone" />
            </div>

            <p className="mt-3 text-sm font-semibold text-gray-700">
              No team members yet
            </p>

            <p className="mt-1 text-xs text-gray-400">
              No one is assigned to tasks in this project yet.
            </p>
          </div>
        ) : (
          <>
            {/* Team Summary */}
            <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/70 px-4 py-3">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <UsersThreeIcon size={19} weight="duotone" />
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Project team
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Assigned team members
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-extrabold text-indigo-600">
                  {p.resources.length}
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  Members
                </p>
              </div>
            </div>

            {/* Resource List */}
            <ul className="space-y-3">
              {[...p.resources]
                .sort((a, b) => b.loggedMs - a.loggedMs)
                .map((r, index) => {
                  const percentage = (r.loggedMs / max) * 100;

                  return (
                    <li
                      key={r.id}
                      className="group rounded-2xl border border-gray-100 bg-white p-3.5 transition-all duration-300 hover:border-indigo-100 hover:bg-indigo-50/20 hover:shadow-[0_8px_24px_-16px_rgba(79,70,229,0.3)] sm:p-4"
                    >

                      {/* Member Information */}
                      <div className="flex items-center gap-3">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                            style={{
                              backgroundColor: getAvatarColor(r.name),
                            }}
                          >
                            {r.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Active indicator */}
                          <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                        </div>

                        {/* Name and Role */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-gray-800 transition-colors group-hover:text-indigo-600">
                            {r.name}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5">
                            <BriefcaseIcon
                              size={11}
                              className="text-gray-400"
                            />

                            <span className="text-[10px] font-medium capitalize text-gray-500">
                              {r.role || "No role set"}
                            </span>
                          </div>
                        </div>

                        {/* Logged Hours */}
                        <div className="shrink-0 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <ClockIcon
                              size={13}
                              className="text-indigo-400"
                            />

                            <span className="font-mono text-sm font-bold text-gray-800">
                              {msToHours(r.loggedMs)}h
                            </span>
                          </div>

                          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-gray-400">
                            Logged time
                          </p>
                        </div>

                        {/* Rank Indicator */}
                        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[10px] font-bold text-gray-400 sm:flex">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                      </div>

                      {/* Progress Bar */}
                      <div className="ml-[52px] mt-3">

                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                            Time contribution
                          </span>

                          <span className="text-[10px] font-bold text-indigo-500">
                            {Math.round(percentage)}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out group-hover:brightness-110"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                      </div>

                    </li>
                  );
                })}
            </ul>

            {/* Bottom Summary */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
              <TrendUpIcon
                size={15}
                weight="duotone"
                className="text-emerald-500"
              />

              <p className="text-[10px] font-medium text-gray-500">
                Team members are sorted by their logged working hours.
              </p>

              <ArrowUpRightIcon
                size={13}
                className="ml-auto text-gray-300"
              />
            </div>
          </>
        )}

      </div>
    </Section>
  );
};