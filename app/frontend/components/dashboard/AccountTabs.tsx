import { ChevronDownIcon } from "@heroicons/react/16/solid";
import {
  ArchiveBoxIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { classNames } from "../../utils/classNames";

export type AccountTabId = "min-konto" | "selskap" | "brukere" | "adresser" | "ordrer";

const tabs = [
  { id: "min-konto", name: "Min konto", icon: UserIcon },
  { id: "selskap", name: "Selskap", icon: BuildingOfficeIcon },
  { id: "brukere", name: "Brukere", icon: UsersIcon },
  { id: "adresser", name: "Adresser", icon: HomeIcon },
  { id: "ordrer", name: "Ordrer", icon: ArchiveBoxIcon },
] as const;

type AccountTabsProps = {
  activeTab: AccountTabId;
  onTabChange: (tab: AccountTabId) => void;
};

export function AccountTabs({ activeTab, onTabChange }: AccountTabsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <select
          name="tab"
          value={activeTab}
          onChange={(event) => onTabChange(event.currentTarget.value as AccountTabId)}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-neutral-charcoal outline-1 -outline-offset-1 outline-neutral-medium-grey focus:outline-2 focus:-outline-offset-2 focus:outline-brand-secondary"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-neutral-silver"
        />
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-neutral-medium-grey">
          <div aria-label="Tabs" className="-mb-px flex flex-nowrap gap-8 px-4">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
                className={classNames(
                  activeTab === tab.id
                    ? "border-brand-secondary text-brand-secondary"
                    : "border-transparent text-neutral-silver hover:border-neutral-medium-grey hover:text-neutral-charcoal-light",
                  "group inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-1 py-4 text-small font-medium whitespace-nowrap",
                )}
              >
                <tab.icon
                  aria-hidden="true"
                  className={classNames(
                    activeTab === tab.id
                      ? "text-brand-secondary"
                      : "text-neutral-silver group-hover:text-neutral-charcoal-light",
                    "size-5 shrink-0",
                  )}
                />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
