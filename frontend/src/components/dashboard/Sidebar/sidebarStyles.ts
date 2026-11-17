export const rowBase = "flex items-center h-11 px-4 text-sm rounded-md transition-all";
export const rowActive = "bg-black text-white";
export const rowInactive = "text-black hover:bg-black hover:text-white";
export const rowInner = (collapsed: boolean) =>
  `flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`;
