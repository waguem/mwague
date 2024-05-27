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
import { useSession } from "next-auth/react";

function App({ children }: PropsWithChildren) {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();
  const { initLocale } = getTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();
  useEffect(() => {
    dispatch(toggleTheme(localStorage.getItem("theme") || themeConfig.theme));
    dispatch(toggleMenu(localStorage.getItem("menu") || themeConfig.menu));
    dispatch(toggleLayout(localStorage.getItem("layout") || themeConfig.layout));
    dispatch(toggleRTL(localStorage.getItem("rtlClass") || themeConfig.rtlClass));
    dispatch(toggleAnimation(localStorage.getItem("animation") || themeConfig.animation));
    dispatch(toggleNavbar(localStorage.getItem("navbar") || themeConfig.navbar));
    dispatch(toggleSemidark(localStorage.getItem("semidark") || themeConfig.semidark));
    // locale
    initLocale(themeConfig.locale);
    if (session && session.data?.access_token) {
      localStorage.setItem("token", session.data.access_token);
    }
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
    session,
  ]);

  // if((!gSession || !gSession.user) && !pathname.includes("/login")){
  //   router.push("/login");
  // }
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
