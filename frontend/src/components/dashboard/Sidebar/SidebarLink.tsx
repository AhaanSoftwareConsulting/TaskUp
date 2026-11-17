import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { rowActive, rowBase, rowInactive, rowInner } from "./sidebarStyles";

interface Props {
  to: string;
  label: string;
  icon: ReactNode;
  collapsed: boolean;
  end?: boolean;
  badge?: number;
}

export const SidebarLink = ({ to, label, icon, collapsed, end, badge }: Props) => (
  <NavLink
    to={to}
    end={end}
    title={label}
    className={({ isActive }) => `${rowBase} ${isActive ? rowActive : rowInactive}`}
  >
    <div className={rowInner(collapsed)}>
      {icon}
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && badge !== undefined && (
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">{badge}</span>
      )}
    </div>
  </NavLink>
);
