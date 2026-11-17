import type { ProjectView } from "../../hooks/useProjects";

export const emptyFilters = {
  status: "",
  manager: "",
  resource: "",
  priority: "",
  client: "",
  startFrom: "",
  startTo: "",
  deadlineFrom: "",
  deadlineTo: "",
};
export type Filters = typeof emptyFilters;

const inRange = (value: string | null, from: string, to: string) => {
  if (!from && !to) return true;
  if (!value) return false; // a project with no date can't match a date filter
  if (from && value < from) return false; // dates are YYYY-MM-DD so string compare is safe
  if (to && value > to) return false;
  return true;
};

export const applyFilters = (projects: ProjectView[], search: string, f: Filters) => {
  const q = search.trim().toLowerCase();
  return projects.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.manager && p.managerName !== f.manager) return false;
    if (f.client && p.clientName !== f.client) return false;
    if (f.priority && p.priority !== f.priority) return false;
    if (f.resource && !p.resources.some((r) => r.name === f.resource)) return false;
    if (!inRange(p.startDate, f.startFrom, f.startTo)) return false;
    if (!inRange(p.deadline, f.deadlineFrom, f.deadlineTo)) return false;
    return true;
  });
};

export const getFilterOptions = (projects: ProjectView[]) => {
  const uniq = (list: string[]) => [...new Set(list.filter(Boolean))].sort();
  return {
    managers: uniq(projects.map((p) => p.managerName)),
    clients: uniq(projects.map((p) => p.clientName)),
    resources: uniq(projects.flatMap((p) => p.resources.map((r) => r.name))),
  };
};
