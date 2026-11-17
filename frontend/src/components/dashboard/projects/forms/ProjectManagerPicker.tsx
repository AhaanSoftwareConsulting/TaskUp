import { X } from "@phosphor-icons/react";
import UserSearchInput from "../../../dashboard/UserSearchInput";

export interface PickedUser {
  id: string;
  full_name: string;
}

interface Props {
  value: PickedUser | null;
  onChange: (user: PickedUser | null) => void;
}

export const ProjectManagerPicker = ({ value, onChange }: Props) => (
  <div className="space-y-2">
    <p className="text-sm font-bold text-black">Project manager</p>
    {value ? (
      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm">
        {value.full_name}
        <button type="button" onClick={() => onChange(null)} aria-label="Remove project manager" className="hover:text-red-600">
          <X size={12} />
        </button>
      </span>
    ) : (
      <UserSearchInput onUserSelect={(u: PickedUser) => onChange(u)} excludeUserIds={[]} />
    )}
    <p className="text-xs text-gray-500">Search to choose someone. If you leave this empty, you become the project manager.</p>
  </div>
);
