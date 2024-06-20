"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
export type NavigationItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
};
export default function InnerPageNavigation({ navItems }: { navItems: NavigationItem[] }) {
  const pathname = usePathname();
  return (
    <div>
      <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
        {navItems.map((item, index) => (
          <li key={index} className="inline-block mr-3">
            <Link
              href={item.url}
              className={clsx("flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary", {
                "!border-primary text-primary": pathname === item.url,
              })}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
