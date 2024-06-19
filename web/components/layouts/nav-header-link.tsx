"use client";
import Link from "next/link";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
export interface NavItem {
  href?: string | null;
  text: string;
  icon?: React.ReactNode;
  tippy?: string;
}
interface NavLinkHeaderProps {
  items: NavItem[];
}
export default function NavLinkHeader({ items }: NavLinkHeaderProps) {
  return (
    <div className="mb-5">
      <ol className="flex flex-wrap items-center gap-y-4 font-semibold text-gray-500 dark:text-white-dark">
        {items.map((item, index) => {
          const element = item.href ? <Link href={item.href}>{item.icon && item.icon}</Link> : <span>{item.text}</span>;

          return (
            <li key={index} className="mr-2">
              <TippyWrapper tippy={item.tippy}>
                <button
                  title={item.text}
                  className="flex items-center justify-center rounded-md border border-gray-500/20 p-1.5 shadow hover:text-gray-500/70 dark:border-0 dark:bg-[#191e3a] dark:hover:text-white-dark/70"
                >
                  {element}
                </button>
              </TippyWrapper>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TippyWrapper({ children, tippy }: { children: any; tippy?: string }) {
  if (!tippy) {
    return <>{children}</>;
  }
  return (
    <Tippy content={tippy} placement="top">
      {children}
    </Tippy>
  );
}
