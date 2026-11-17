import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}

/** Overlay + scrollable white panel shared by the create and edit project forms. */
export const ProjectModalShell = ({ title, subtitle, onClose, children }: Props) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40" />
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative mb-6 text-center">
        <h2 className="text-2xl font-bold text-black">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-black hover:bg-gray-800"
        >
          <X size={16} className="text-white" />
        </button>
      </div>
      {children}
    </div>
  </div>
);
