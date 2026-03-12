import { HomeIcon, ArrowPathRoundedSquareIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const topActions = [
  { label: "Reorder", icon: ArrowPathRoundedSquareIcon },
  { label: "Address", icon: HomeIcon },
  { label: "Account Details", icon: UserCircleIcon },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3">
      {topActions.map((action) => (
        <div
          className="flex items-center justify-center gap-2 rounded-md border border-slate-200 py-4 text-sm font-medium text-slate-700"
          key={action.label}
        >
          <action.icon className="h-5 w-5 text-slate-500" aria-hidden />
          <span>{action.label}</span>
        </div>
      ))}
    </div>
  );
}
