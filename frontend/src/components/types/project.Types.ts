export type ProjectPriority = "High" | "Medium" | "Low";
/** Stored in the database */
export type StoredProjectStatus = "Active" | "On Hold" | "Completed";
/** Shown in the UI. "Delayed" is derived (deadline passed, not completed). */
export type ProjectStatus = StoredProjectStatus | "Delayed";

/** Values held by the create / edit form (all inputs are strings) */
export interface ProjectFormValues {
  name: string;
  description: string;
  clientName: string;
  clientContactPerson: string;
  clientEmail: string;
  clientPhone: string;
  startDate: string;
  deadline: string;
  priority: ProjectPriority;
  status: StoredProjectStatus;
  estimatedHours: string;
}

/** Body sent to POST /api/boards and PUT /api/boards/:id */
export interface ProjectPayload {
  name: string;
  description: string | null;
  clientName: string | null;
  clientContactPerson: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  projectManagerId?: string;
  startDate: string | null;
  deadline: string | null;
  priority: ProjectPriority;
  status: StoredProjectStatus;
  estimatedHours: number | null;
}

/*
 * Add these to your existing `Board` interface in board.Types.ts:
 *
 *   description?: string | null;
 *   clientName?: string | null;
 *   clientContactPerson?: string | null;
 *   clientEmail?: string | null;
 *   clientPhone?: string | null;
 *   projectManagerId?: string;
 *   projectManager?: { id: string; name?: string; full_name?: string; email?: string };
 *   startDate?: string | null;
 *   deadline?: string | null;
 *   priority?: ProjectPriority;
 *   status?: StoredProjectStatus;
 *   estimatedHours?: number | null;
 *   archived?: boolean;
 */
