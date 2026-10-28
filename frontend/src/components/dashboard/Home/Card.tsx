import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@phosphor-icons/react";

export const Card = ({ title, icon, to, action = "View all", className = "", children }: {
  title: string; icon?: ReactNode; to?: string; action?: string; className?: string; children: ReactNode;
}) => (
  <section className={`flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
    <header className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">{icon}{title}</h3>
      {to && <Link to={to} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">{action}<ArrowRightIcon size={12} /></Link>}
    </header>
    {children}
  </section>
);

export const Empty = ({ text }: { text: string }) => <p className="py-6 text-center text-sm italic text-gray-400">{text}</p>;