import type { ProjectView } from "../../../hooks/useProjects";
import { formatDate, orDash } from "../../../utils/projectFormat";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { InfoRow, Section } from "./Section";

export const ProjectOverviewSection = ({ project: p }: { project: ProjectView }) => (
  <Section title="Project overview">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
        <p className="mt-2 text-sm text-gray-600">{p.description || "No description added yet. Add one from Edit project."}</p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={p.status} />
        <PriorityBadge priority={p.priority} />
      </div>
    </div>

    <div className="mt-6 grid gap-x-10 md:grid-cols-2">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Client details</h3>
        <InfoRow label="Client">{orDash(p.clientName)}</InfoRow>
        <InfoRow label="Contact person">{orDash(p.clientContactPerson)}</InfoRow>
        <InfoRow label="Email">{orDash(p.clientEmail)}</InfoRow>
        <InfoRow label="Phone">{orDash(p.clientPhone)}</InfoRow>
      </div>
      <div className="mt-6 md:mt-0">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Schedule</h3>
        <InfoRow label="Project manager">{orDash(p.managerName)}</InfoRow>
        <InfoRow label="Start date">{formatDate(p.startDate)}</InfoRow>
        <InfoRow label="Expected deadline">{formatDate(p.deadline)}</InfoRow>
        <InfoRow label="Priority">{p.priority}</InfoRow>
        <InfoRow label="Status">{p.status}</InfoRow>
      </div>
    </div>
  </Section>
);
