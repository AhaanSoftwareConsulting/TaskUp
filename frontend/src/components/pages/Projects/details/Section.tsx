import type { ReactNode } from "react";

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="mb-5 text-lg font-bold text-gray-900">{title}</h2>
    {children}
  </section>
);

export const Stat = ({ label, value, color = "text-gray-900" }: { label: string; value: ReactNode; color?: string }) => (
  <div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="mt-1 text-sm text-gray-500">{label}</div>
  </div>
);

export const InfoRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-gray-100 py-3 text-sm last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="text-right text-gray-900">{children}</span>
  </div>
);
