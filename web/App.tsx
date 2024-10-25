"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";

import {
  toggleRTL,
  toggleTheme,
  toggleMenu,
  toggleLayout,
  toggleAnimation,
  toggleNavbar,
  toggleSemidark,
} from "@/store/themeConfigSlice";
import Loading from "@/components/layouts/loading";
import { getTranslation } from "@/i18n";
import logger from "./lib/logger";

function App({ children }: PropsWithChildren) {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();
  const { initLocale } = getTranslation();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    dispatch(toggleTheme(themeConfig.theme));
    dispatch(toggleMenu(themeConfig.menu));
    dispatch(toggleLayout(themeConfig.layout));
    dispatch(toggleRTL(themeConfig.rtlClass));
    dispatch(toggleAnimation(themeConfig.animation));
    dispatch(toggleNavbar(themeConfig.navbar));
    dispatch(toggleSemidark(themeConfig.semidark));
    // locale
    initLocale(themeConfig.locale);
    setIsLoading(false);
  }, [
    dispatch,
    initLocale,
    themeConfig.theme,
    themeConfig.menu,
    themeConfig.layout,
    themeConfig.rtlClass,
    themeConfig.animation,
    themeConfig.navbar,
    themeConfig.locale,
    themeConfig.semidark,
  ]);

  // if((!gSession || !gSession.user) && !pathname.includes("/login")){
  //   router.push("/login");
  // }
  logger.info(`App Initialized. Is loading ? ${isLoading} `);
  return (
    <div
      className={`${(themeConfig.sidebar && "toggle-sidebar") || ""} ${themeConfig.menu} ${themeConfig.layout} ${
        themeConfig.rtlClass
      } main-section relative font-nunito text-sm font-normal antialiased`}
    >
      {isLoading ? <Loading /> : children}
    </div>
  );
}

export default App;
