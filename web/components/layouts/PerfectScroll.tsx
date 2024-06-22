"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
export default function PerfectScrollbarC({ children }: { children: React.ReactNode }) {
  return (
    <PerfectScrollbar className="chat-users relative h-full min-h-[100px] space-y-0.5 ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5 sm:h-[calc(100vh_-_357px)]">
      {children}
    </PerfectScrollbar>
  );
}
