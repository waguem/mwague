"use client";
import { IconCaretDown } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "../auth/signOut";
import { useDisclosure } from "@mantine/hooks";
import { Badge, Collapse } from "@mantine/core";
import { Fragment } from "react";

export interface NavRoute {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  href: string;
  permissions: string[];
  children?: NavRoute[];
}

export interface NavSection {
  section: string;
  routes: NavRoute[]
}

function NavGroup({ index, route, pathname }: { index: number; route: NavRoute; pathname: string }) {
  const [opened, { open, close }] = useDisclosure(true);

  return (
    <li key={index} className="menu nav-item">
      <Link href={route.href} className={`${pathname === route.href ? "active" : ""} nav-link group w-full`}>
        <div className="flex items-center">
          {route.icon}
          <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
            {route.label}
            {route.badge && (
              <Badge className="ml-2" size="xs" variant="outline" color="gray">
                {route.badge}
              </Badge>
            )}
          </span>
        </div>
        {route.children && (
          <div className={`${opened ? "-rotate-90 rtl:rotate-90" : ""}`}>
            <IconCaretDown onClick={() => (opened ? close() : open())} />
          </div>
        )}
      </Link>
      {route.children && (
        <Collapse in={opened}>
          <ul className="sub-menu">
            {route.children.map((child, index) => (
              <li key={index}>
                <Link href={child.href} className={`${pathname === route.href ? "active" : ""} nav-link`}>
                  <div className="flex items-center">
                    {child.icon}
                    <span className="ltr:pl-3 rtl:pr-3">
                      {child.label}
                      {child.badge && (
                        <Badge className="ml-2" size="xs" variant="outline" color="gray">
                          {child.badge}
                        </Badge>
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Collapse>
      )}
    </li>
  );
}

export function NavRoutes({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
      {sections.map((section, index) => (
        <Fragment key={index}>
          <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
            <span>{section.section}</span>
          </h2>
          {section.routes.map((route,j)=>(
            <NavGroup key={index} route={route} pathname={pathname} index={j} />
          ))}
        </Fragment>

      ))}
      <li className="menu nav-item">
        <SignOutButton />
      </li>
    </ul>
  );
}
