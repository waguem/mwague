"use client";
import { IconCaretDown } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "../auth/signOut";
import { useDisclosure } from "@mantine/hooks";
import { Badge, Collapse } from "@mantine/core";

export interface NavRoute {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  href: string;
  permissions: string[];
  children?: NavRoute[];
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
            { route.badge &&
            <Badge className="ml-2" size="xs" variant="outline" color="gray">
              {route.badge}
            </Badge>}
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
                      { child.badge &&
                      <Badge className="ml-2" size="xs" variant="outline" color="gray">
                        {child.badge}
                      </Badge>}
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

export function NavRoutes({ routes }: { routes: NavRoute[] }) {
  const pathname = usePathname();

  return (
    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
      {routes.map((route, index) => (
        <NavGroup key={index} route={route} pathname={pathname} index={index} />
      ))}
      <li className="menu nav-item">
        <SignOutButton />
      </li>
    </ul>
  );
}
