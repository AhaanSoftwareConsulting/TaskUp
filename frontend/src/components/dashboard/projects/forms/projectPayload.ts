import type { ProjectFormValues, ProjectPayload } from "../../../types/project.Types";

const orNull = (v: string) => (v.trim() ? v.trim() : null);

/** Form strings -> API body. Empty inputs become null so they clear the stored value. */
export const toProjectPayload = (v: ProjectFormValues): ProjectPayload => ({
  name: v.name.trim(),
  description: orNull(v.description),
  clientName: orNull(v.clientName),
  clientContactPerson: orNull(v.clientContactPerson),
  clientEmail: orNull(v.clientEmail),
  clientPhone: orNull(v.clientPhone),
  startDate: orNull(v.startDate),
  deadline: orNull(v.deadline),
  priority: v.priority,
  status: v.status,
  estimatedHours: v.estimatedHours === "" ? null : Number(v.estimatedHours),
});
