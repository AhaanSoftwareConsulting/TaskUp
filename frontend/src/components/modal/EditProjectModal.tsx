import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../redux/app/hook";
import { editBoard } from "../redux/features/Board/boardSlice";
import { useToast } from "../hooks/useToast";
import type { ProjectFormValues } from "../types/project.Types";
import { ProjectModalShell } from "../dashboard/projects/forms/ProjectModalShell";
import { ProjectFormFields } from "../dashboard/projects/forms/ProjectFormFields";
import { ProjectManagerPicker, type PickedUser } from "../dashboard/projects/forms/ProjectManagerPicker";
import { toProjectPayload } from "../dashboard/projects/forms/projectPayload";

interface Props {
  projectId: string;
  onClose: () => void;
}

export const EditProjectModal = ({ projectId, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const { boards, loading, error } = useAppSelector((s) => s.board);
  const project = boards.find((b: any) => b.id === projectId) as any;
  const isPending = loading === "pending";

  const pm = project?.projectManager;
  const [manager, setManager] = useState<PickedUser | null>(
    pm?.id ? { id: pm.id, full_name: pm.name || pm.full_name || "Current manager" } : null
  );

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ProjectFormValues>({
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      clientName: project?.clientName ?? "",
      clientContactPerson: project?.clientContactPerson ?? "",
      clientEmail: project?.clientEmail ?? "",
      clientPhone: project?.clientPhone ?? "",
      startDate: project?.startDate ?? "",
      deadline: project?.deadline ?? "",
      priority: project?.priority ?? "Medium",
      status: project?.status ?? "Active",
      estimatedHours: project?.estimatedHours != null ? String(project.estimatedHours) : "",
    },
  });

  if (!project) return null;

  const onSubmit = async (values: ProjectFormValues) => {
    const res = await dispatch(
      editBoard({ boardId: projectId, data: { ...toProjectPayload(values), projectManagerId: manager?.id } })
    );
    if (editBoard.fulfilled.match(res)) {
      showToast("Project updated");
      onClose();
    }
  };

  return (
    <ProjectModalShell title="Edit project" subtitle={project.name} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        <ProjectFormFields register={register} errors={errors} getValues={getValues} />
        <ProjectManagerPicker value={manager} onChange={setManager} />

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="h-12 flex-1 rounded-full border border-gray-300 font-semibold text-gray-800 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="h-12 flex-1 rounded-full bg-black font-semibold text-white hover:bg-gray-900 disabled:opacity-70">
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </ProjectModalShell>
  );
};
