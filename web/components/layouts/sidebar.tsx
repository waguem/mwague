"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toggleSidebar } from "@/store/themeConfigSlice";
import { IRootState } from "@/store";
import { useEffect } from "react";
import IconCaretsDown from "@/components/icon/icon-carets-down";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { NavRoutes, NavSection } from "./NavRoutes";

const CollapsibleLogo = ({ menu }: { menu: string }) => {
  return (
    <Link href="/" className="main-logo flex shrink-0 items-center">
      {menu !== "collapsible-vertical" && (
        <span className="hidden hover:block align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">
          W
        </span>
      )}
      <Image height={49} width={56} className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" />
      <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">
        {menu === "collapsible-vertical" ? "WA" : ""}GUE
      </span>
    </Link>
  );
};

const Sidebar = ({ sections }: { sections: NavSection[] }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
  const menu = useSelector((state: IRootState) => state.themeConfig.menu);
  useEffect(() => {
    const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
    if (selector) {
      selector.classList.add("active");
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any = ul.closest("li.menu").querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [pathname, themeConfig.sidebar, dispatch]);

  const setActiveRoute = () => {
    let allLinks = document.querySelectorAll(".sidebar ul a.active");
    for (let i = 0; i < allLinks.length; i++) {
      const element = allLinks[i];
      element?.classList.remove("active");
    }
    const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
    selector?.classList.add("active");
  };

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
        className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[220px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${
          semidark ? "text-white-dark" : ""
        }`}
      >
        <div className="h-full bg-white dark:bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <CollapsibleLogo menu={menu} />
            <button
              type="button"
              title="Collapse Sidebar"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>
          <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
            <NavRoutes sections={sections} />
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
