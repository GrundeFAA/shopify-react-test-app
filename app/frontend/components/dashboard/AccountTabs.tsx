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
  storefrontTabsBaseUrl: string;
};

export function AccountTabs({ activeTab, storefrontTabsBaseUrl }: AccountTabsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <form action={storefrontTabsBaseUrl} method="get" className="contents">
          <select
            name="tab"
            value={activeTab}
            onChange={(event) => event.currentTarget.form?.submit()}
            aria-label="Select a tab"
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </form>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
        />
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8 px-4">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={`${storefrontTabsBaseUrl}?tab=${tab.id}`}
                aria-current={activeTab === tab.id ? "page" : undefined}
                className={classNames(
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "group inline-flex cursor-pointer items-center border-b-2 px-1 py-4 text-sm font-medium",
                )}
              >
                <tab.icon
                  aria-hidden="true"
                  className={classNames(
                    activeTab === tab.id ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500",
                    "mr-2 -ml-0.5 size-5",
                  )}
                />
                <span>{tab.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
