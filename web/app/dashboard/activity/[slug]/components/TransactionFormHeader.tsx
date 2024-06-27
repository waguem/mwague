"use client";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import Link from "next/link";

import { Fragment } from "react";

interface Props {
  navItems: {
    name: string;
    url: string;
    icon: any;
  }[];
}
export default function TransactionHeader({ navItems }: Props) {
  return (
    <TabGroup>
      <div className="flex items-center justify-between text-xs mb-0 px-1">
        <TabList className="w-full mt-0 gap-5 space-x-0 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
          {navItems.map((form, index) => (
            <Tab key={index} as={Fragment}>
              {({ selected }) => (
                <Link
                  href={form.url}
                  title={form.name}
                  // className="group hover:text-primary"
                  className={`${selected ? "border-b !border-secondary text-secondary !outline-none" : ""}
                                                                    -mr-3 p-1 pt-0 items-center border-transparent  before:inline-block hover:border-b hover:!border-secondary hover:text-secondary`}
                >
                  {form.icon}
                  {form.name}
                </Link>
              )}
            </Tab>
          ))}
        </TabList>
      </div>
    </TabGroup>
  );
}
