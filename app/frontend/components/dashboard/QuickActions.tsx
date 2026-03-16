import { HomeIcon, ArrowPathRoundedSquareIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const topActions = [
  { label: "Bestill pa nytt", icon: ArrowPathRoundedSquareIcon },
  { label: "Adresser", icon: HomeIcon },
  { label: "Kontodetaljer", icon: UserCircleIcon },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 rounded-lg border border-neutral-medium-grey bg-white p-3 shadow-sm md:grid-cols-3">
      {topActions.map((action) => (
        <div
          className="flex items-center justify-center gap-2 rounded-md border border-neutral-medium-grey py-4 text-sm font-medium text-neutral-charcoal-light"
          key={action.label}
        >
          <action.icon className="h-5 w-5 text-neutral-silver" aria-hidden />
          <span>{action.label}</span>
        </div>
      ))}
    </div>
  );
}
