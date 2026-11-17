import type { ReactNode } from "react";
import type { FieldErrors, UseFormGetValues, UseFormRegister } from "react-hook-form";
import type { ProjectFormValues } from "../../../types/project.Types";

interface Props {
  register: UseFormRegister<ProjectFormValues>;
  errors: FieldErrors<ProjectFormValues>;
  getValues: UseFormGetValues<ProjectFormValues>;
}

const input =
  "w-full h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black";

const Field = ({ label, error, children, className = "" }: { label: string; error?: string; children: ReactNode; className?: string }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {label}
    <div className="mt-1.5">{children}</div>
    {error && <p className="mt-1 text-xs font-normal text-red-600">{error}</p>}
  </label>
);

const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="space-y-4">
    <legend className="mb-1 text-sm font-bold text-black">{title}</legend>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

export const ProjectFormFields = ({ register, errors, getValues }: Props) => (
  <div className="space-y-7">
    <Group title="Project details">
      <Field label="Project name" error={errors.name?.message} className="sm:col-span-2">
        <input {...register("name", { required: "Project name is required" })} placeholder="e.g. Tanishq Restaurant" className={input} />
      </Field>
      <Field label="Description" className="sm:col-span-2">
        <textarea
          {...register("description")}
          maxLength={500}
          rows={3}
          placeholder="What is this project about? (optional)"
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />
      </Field>
    </Group>

    <Group title="Client details">
      <Field label="Client name">
        <input {...register("clientName")} placeholder="e.g. Tanishq" className={input} />
      </Field>
      <Field label="Contact person">
        <input {...register("clientContactPerson")} className={input} />
      </Field>
      <Field label="Client email" error={errors.clientEmail?.message}>
        <input
          type="email"
          {...register("clientEmail", { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })}
          className={input}
        />
      </Field>
      <Field label="Client phone">
        <input type="tel" {...register("clientPhone")} className={input} />
      </Field>
    </Group>

    <Group title="Schedule, priority and effort">
      <Field label="Start date">
        <input type="date" {...register("startDate")} className={input} />
      </Field>
      <Field label="Deadline" error={errors.deadline?.message}>
        <input
          type="date"
          {...register("deadline", {
            validate: (v) => !v || !getValues("startDate") || v >= getValues("startDate") || "Deadline cannot be before the start date",
          })}
          className={input}
        />
      </Field>
      <Field label="Priority">
        <select {...register("priority")} className={input}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </Field>
      <Field label="Status">
        <select {...register("status")} className={input}>
          <option>Active</option>
          <option>On Hold</option>
          <option>Completed</option>
        </select>
      </Field>
      <Field label="Estimated hours" error={errors.estimatedHours?.message}>
        <input
          type="number"
          min={0}
          step={1}
          {...register("estimatedHours", { min: { value: 0, message: "Must be 0 or more" } })}
          placeholder="e.g. 200"
          className={input}
        />
      </Field>
    </Group>
  </div>
);
