"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
export default function PerfectScrollbarC({
  children,
  className,
  ...props
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <PerfectScrollbar {...props} options={{ suppressScrollX: true }} className={className}>
      {children}
    </PerfectScrollbar>
  );
}
