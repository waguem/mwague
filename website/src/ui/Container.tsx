import clsx from "clsx";

export function Container({ className, ...props }: any) {
  return <div className={clsx("mx-auto max-w-7xl px-4", className)} {...props} />;
}
