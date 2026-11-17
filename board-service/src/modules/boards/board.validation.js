const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Active', 'On Hold', 'Completed'];

const blank = (v) => v === undefined || v === null || v === '';
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Returns an array of error messages (empty = valid). */
function validateProjectInput(body) {
  const errors = [];
  const { name, clientEmail, startDate, deadline, priority, status, estimatedHours } = body;

  if (typeof name !== 'string' || !name.trim()) errors.push('Project name is required');
  if (!blank(clientEmail) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) errors.push('Client email is not valid');
  if (!blank(startDate) && !isDate(startDate)) errors.push('Start date must be in YYYY-MM-DD format');
  if (!blank(deadline) && !isDate(deadline)) errors.push('Deadline must be in YYYY-MM-DD format');
  if (isDate(startDate) && isDate(deadline) && deadline < startDate) errors.push('Deadline cannot be before the start date');
  if (!blank(priority) && !PRIORITIES.includes(priority)) errors.push('Priority must be High, Medium or Low');
  if (!blank(status) && !STATUSES.includes(status)) errors.push('Status must be Active, On Hold or Completed');
  if (!blank(estimatedHours) && !(Number.isInteger(Number(estimatedHours)) && Number(estimatedHours) >= 0)) {
    errors.push('Estimated hours must be a whole number of 0 or more');
  }
  return errors;
}

module.exports = { validateProjectInput, PRIORITIES, STATUSES };
