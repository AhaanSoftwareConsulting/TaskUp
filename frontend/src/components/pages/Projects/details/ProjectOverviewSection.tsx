import type { ProjectView } from "../../../hooks/useProjects";
import { formatDate, orDash } from "../../../utils/projectFormat";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { Section } from "./Section";

import {
  BuildingsIcon,
  UserCircleIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  CalendarBlankIcon,
  FlagIcon,
  UserGearIcon,
  ClockIcon,
  IdentificationCardIcon,
  SparkleIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";

const DetailRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="group flex items-center gap-3 border-b border-gray-100 py-3.5 last:border-0">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-600">
      <Icon size={17} weight="duotone" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <div className="mt-1 break-words text-[13px] font-semibold text-gray-800">
        {children}
      </div>
    </div>

    <ArrowUpRightIcon
      size={15}
      className="shrink-0 text-gray-200 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-400"
    />
  </div>
);

const DetailCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  accent,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent: string;
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_12px_30px_-18px_rgba(79,70,229,0.25)] sm:p-6">

    {/* Top accent */}
    <div className={`absolute left-0 top-0 h-1 w-full ${accent}`} />

    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-indigo-600">
        <Icon size={22} weight="duotone" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] text-gray-400">
          {subtitle}
        </p>
      </div>
    </div>

    <div>{children}</div>
  </div>
);

export const ProjectOverviewSection = ({
  project: p,
}: {
  project: ProjectView;
}) => (
  <Section title="Project overview">

    <div className="space-y-6">

      {/* Project Header */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50 via-white to-blue-50/70 p-5 sm:p-6">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="relative">

          {/* Top label */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 shadow-sm">
              <SparkleIcon
                size={14}
                weight="fill"
                className="text-indigo-500"
              />

              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-indigo-600">
                Project details
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={p.status} />
              <PriorityBadge priority={p.priority} />
            </div>

          </div>

          {/* Project Name */}
          <div className="flex items-start gap-4">

            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 sm:flex">
              <BuildingsIcon size={27} weight="duotone" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-[28px]">
                {p.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                {p.description ||
                  "No description added yet. Add one from Edit project."}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Information Cards */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Client Details */}
        <DetailCard
          title="Client information"
          subtitle="Contact and client details"
          icon={IdentificationCardIcon}
          accent="bg-gradient-to-r from-blue-500 to-cyan-400"
        >

          <DetailRow
            icon={BuildingsIcon}
            label="Client"
          >
            {orDash(p.clientName)}
          </DetailRow>

          <DetailRow
            icon={UserCircleIcon}
            label="Contact person"
          >
            {orDash(p.clientContactPerson)}
          </DetailRow>

          <DetailRow
            icon={EnvelopeSimpleIcon}
            label="Email address"
          >
            {orDash(p.clientEmail)}
          </DetailRow>

          <DetailRow
            icon={PhoneIcon}
            label="Phone number"
          >
            {orDash(p.clientPhone)}
          </DetailRow>

        </DetailCard>

        {/* Project Schedule */}
        <DetailCard
          title="Project schedule"
          subtitle="Timeline and project ownership"
          icon={CalendarBlankIcon}
          accent="bg-gradient-to-r from-violet-500 to-indigo-400"
        >

          <DetailRow
            icon={UserGearIcon}
            label="Project manager"
          >
            {orDash(p.managerName)}
          </DetailRow>

          <DetailRow
            icon={CalendarBlankIcon}
            label="Start date"
          >
            {formatDate(p.startDate)}
          </DetailRow>

          <DetailRow
            icon={ClockIcon}
            label="Expected deadline"
          >
            {formatDate(p.deadline)}
          </DetailRow>

          <DetailRow
            icon={FlagIcon}
            label="Priority"
          >
            {p.priority}
          </DetailRow>

          <DetailRow
            icon={SparkleIcon}
            label="Project status"
          >
            {p.status}
          </DetailRow>

        </DetailCard>

      </div>

    </div>

  </Section>
);