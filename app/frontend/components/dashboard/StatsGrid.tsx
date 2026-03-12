import { ClipboardDocumentListIcon, DocumentTextIcon, HeartIcon } from "@heroicons/react/24/outline";

const statCards = [
  { label: "Aktive ordre", value: "4", icon: ClipboardDocumentListIcon },
  { label: "Apne tilbud", value: "2", icon: DocumentTextIcon },
  { label: "Onskeliste", value: "2", icon: HeartIcon },
];

export function StatsGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {statCards.map((card) => (
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={card.label}>
          <p className="mb-2">
            <card.icon className="h-5 w-5 text-slate-500" aria-hidden />
          </p>
          <p className="text-2xl font-bold text-slate-800">{card.value}</p>
          <p className="text-sm text-slate-600">{card.label}</p>
        </article>
      ))}
    </div>
  );
}
