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
      <div className="!grid grid-cols-1 sm:!hidden">
        <select
          name="tab"
          value={activeTab}
          onChange={(event) => onTabChange(event.currentTarget.value as AccountTabId)}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md !bg-white py-2 pr-8 pl-3 text-base !text-neutral-charcoal outline-1 -outline-offset-1 outline-neutral-medium-grey focus:outline-2 focus:-outline-offset-2 focus:outline-brand-secondary"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
        />
      </div>
      <div className="!hidden sm:!block">
        {/* Use inline style on the border wrapper — inline styles are not overridable by theme CSS */}
        <div style={{ borderBottom: "1px solid #d8d8d8" }}>
          {/* Inline style on the flex row guarantees display:flex regardless of any theme nav/ul rules */}
          <div
            role="tablist"
            aria-label="Tabs"
            style={{ display: "flex", flexWrap: "nowrap", marginBottom: "-1px", paddingLeft: "1rem", paddingRight: "1rem", gap: "2rem" }}
          >
            {tabs.map((tab) => (
              <button
                role="tab"
                type="button"
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-selected={activeTab === tab.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  borderBottom: activeTab === tab.id ? "2px solid #2d4d86" : "2px solid transparent",
                  color: activeTab === tab.id ? "#2d4d86" : "#828282",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  paddingLeft: "0.25rem",
                  paddingRight: "0.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  background: "transparent",
                  gap: "0.5rem",
                }}
              >
                <tab.icon
                  aria-hidden="true"
                  style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0 }}
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
