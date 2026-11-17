import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../redux/app/hook";
import { createBoard } from "../../../redux/features/Board/boardSlice";
import UserSearchInput from "../../../dashboard/UserSearchInput";
import { useToast } from "../../../hooks/useToast";
import { X } from "@phosphor-icons/react";
import type { ProjectFormValues } from "../../../types/project.Types";
import { ProjectModalShell } from "./ProjectModalShell";
import { ProjectFormFields } from "./ProjectFormFields";
import { ProjectManagerPicker, type PickedUser } from "./ProjectManagerPicker";
import { toProjectPayload } from "./projectPayload";

const today = () => new Date().toISOString().slice(0, 10);

export const CreateProjectModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const { loading, error } = useAppSelector((s) => s.board);
  const isPending = loading === "pending";

  const [manager, setManager] = useState<PickedUser | null>(null);
  const [members, setMembers] = useState<PickedUser[]>([]);
  const [memberError, setMemberError] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ProjectFormValues>({
    defaultValues: {
      name: "", description: "", clientName: "", clientContactPerson: "", clientEmail: "", clientPhone: "",
      startDate: today(), deadline: "", priority: "Medium", status: "Active", estimatedHours: "",
    },
  });

  const addMember = (u: PickedUser) => {
    setMemberError(false);
    setMembers((p) => (p.some((m) => m.id === u.id) ? p : [...p, u]));
  };

  const onSubmit = async (values: ProjectFormValues) => {
    if (members.length === 0) {
      setMemberError(true);
      return;
    }
    const res = await dispatch(
      createBoard({ ...toProjectPayload(values), projectManagerId: manager?.id, members: members.map((m) => m.id) })
    );
    if (createBoard.fulfilled.match(res)) {
      showToast("Project created");
      onClose();
    }
  };

  return (
    <ProjectModalShell title="Create project" subtitle="Set up the project, its client and its team" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        <ProjectFormFields register={register} errors={errors} getValues={getValues} />

        <ProjectManagerPicker value={manager} onChange={setManager} />

        <div className="space-y-2">
          <p className="text-sm font-bold text-black">Team members</p>
          <UserSearchInput onUserSelect={addMember} excludeUserIds={members.map((m) => m.id)} />
          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMembers((p) => p.filter((x) => x.id !== m.id))}
                  className="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-1 text-xs hover:bg-black hover:text-white"
                >
                  {m.full_name} <X size={12} />
                </button>
              ))}
            </div>
          )}
          {memberError && <p className="text-xs text-red-600">Add at least one team member.</p>}
        </div>

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-full bg-black font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Creating..." : "Create project"}
        </button>
      </form>
    </ProjectModalShell>
  );
};
