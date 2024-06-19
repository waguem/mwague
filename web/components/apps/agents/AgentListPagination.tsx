"use client";
import AddAgent from "@/components/apps/agents/AddAgent";
import AgentTable from "@/components/apps/agents/AgentTable";
import IconLayoutGrid from "@/components/icon/icon-layout-grid";
import IconListCheck from "@/components/icon/icon-list-check";
import IconSearch from "@/components/icon/icon-search";
import { getTranslation } from "@/i18n";
import { useCallback, useEffect, useState } from "react";
import AgentListGrid from "./AgentListGrid";
import { AgentResponse } from "@/lib/client";

interface PaginationProps {
  agents: AgentResponse[];
}
export default function AgentListPagination({ agents }: PaginationProps) {
  const [value, setValue] = useState<any>("list");
  const [search, setSearch] = useState<string>("");

  const { t } = getTranslation();
  const [filteredItems, setFilteredItems] = useState(agents);
  const searchAgent = useCallback(() => {
    setFilteredItems(() => {
      return agents.filter((item: AgentResponse) => {
        return item.name.toLowerCase().includes(search.toLowerCase());
      });
    });
  }, [search, agents]);

  useEffect(() => {
    searchAgent();
  }, [search, searchAgent]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl">{t("agents")}</h2>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <div className="flex gap-3">
            <AddAgent />
            <div>
              <button
                type="button"
                title="list view"
                className={`btn btn-outline-primary p-2 ${value === "list" && "bg-primary text-white"}`}
                onClick={() => setValue("list")}
              >
                <IconListCheck />
              </button>
            </div>
            <div>
              <button
                type="button"
                title="grid view"
                className={`btn btn-outline-primary p-2 ${value === "grid" && "bg-primary text-white"}`}
                onClick={() => setValue("grid")}
              >
                <IconLayoutGrid />
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Name or Country"
              className="peer form-input py-2 ltr:pr-11 rtl:pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              title="search"
              type="button"
              className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
            >
              <IconSearch className="mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {value === "list" && <AgentTable filteredItems={filteredItems} />}
      {value === "grid" && <AgentListGrid filteredItems={filteredItems} />}
    </div>
  );
}
