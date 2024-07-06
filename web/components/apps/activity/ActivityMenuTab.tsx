"use client";
import IconAirplay from "@/components/icon/icon-airplay";
import IconSearch from "@/components/icon/icon-search";
import PerfectScrollbar from "@/components/layouts/PerfectScroll";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import IconUsersGroup from "@/components/icon/icon-users-group";
import StartActivityForm from "./StartActivityForm";
import { ActivityResponse, AgentResponse, OfficeResponse } from "@/lib/client";
import StartedActivity from "./StartedActivity";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface Props {
  agents: AgentResponse[];
  office: OfficeResponse;
  activity: ActivityResponse;
}
export default function ActivityMenuTab({ agents, office, activity }: Props) {
  const pathname = usePathname();
  return (
    <div>
      <TabGroup>
        <div className="flex items-center justify-between text-xs mb-2">
          <TabList className="w-full mt-0 gap-2 space-x-0 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  type="button"
                  // className="group hover:text-primary"
                  className={`${selected ? "border-b !border-secondary text-secondary !outline-none" : ""}
                                                    -mr-3 p-2 pt-0 items-center border-transparent  before:inline-block hover:border-b hover:!border-secondary hover:text-secondary`}
                >
                  <IconUsersGroup className="mx-auto mb-1 h-5 w-5" />
                  Agents
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  type="button"
                  // className="group hover:text-primary"
                  className={`${selected ? "border-b !border-secondary text-secondary !outline-none" : ""}
                                                    -mr-3 p-2 pt-0  items-center border-transparent  before:inline-block hover:border-b hover:!border-secondary hover:text-secondary`}
                >
                  <IconAirplay className="mx-auto mb-1 h-5 w-5" />
                  Activity
                </button>
              )}
            </Tab>
          </TabList>
        </div>
        <TabPanels>
          <TabPanel>
            <div className="relative">
              <input type="text" className="peer form-input ltr:pr-9 rtl:pl-9" placeholder="Searching..." />
              <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-2 rtl:left-2">
                <IconSearch />
              </div>
            </div>
            <div className="h-px w-full m-2 border-b border-white-light dark:border-[#1b2e4b]"></div>
            <div className="!mt-1">
              <PerfectScrollbar className="chat-users relative h-full min-h-[100px] space-y-0.5 ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5 sm:h-[calc(100vh_-_357px)]">
                {agents.map((agent: any, index: number) => (
                  <Link
                    key={index}
                    href={`/dashboard/activity/${agent.initials}`}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-md p-1 hover:bg-gray-100 hover:text-primary dark:hover:bg-[#050b14] dark:hover:text-primary",
                      {
                        "border-l-4 border-primary mb-1 bg-gray-100 text-primary dark:bg-[#050b14] dark:text-primary":
                          pathname.startsWith(`/dashboard/activity/${agent.initials}`),
                      }
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="relative flex-shrink-0">
                          <Image
                            width={200}
                            height={200}
                            src={`/assets/images/profile-${Math.min(index + 1, 30)}.jpeg`}
                            className="h-12 w-12 rounded-full object-cover"
                            alt=""
                          />
                          <div>
                            <div className="absolute bottom-0 ltr:right-0 rtl:left-0">
                              <div className="h-4 w-4 rounded-full bg-success"></div>
                            </div>
                          </div>
                        </div>
                        <div className="mx-3 ltr:text-left rtl:text-right">
                          <p className="mb-1 font-semibold">{agent.name}</p>
                          <p className="max-w-[185px] truncate text-xs text-white-dark">{agent.initials}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </PerfectScrollbar>
            </div>
          </TabPanel>
          <TabPanel>
            {activity && activity.state === "OPEN" && <StartedActivity activity={activity} />}
            {!activity && <StartActivityForm office={office} />}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
