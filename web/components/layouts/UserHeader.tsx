import { Session } from "next-auth";

interface UserHeaderProps {
  session: Session;
}
export default function UserHeader({ session }: UserHeaderProps) {
  return (
    <div className="flex items-center px-4 py-4">
      <div className="truncate ltr:pl-4 rtl:pr-4">
        <h4 className="text-base">
          {session?.user?.name || "User"}
          <span className="rounded bg-success-light px-1 text-xs text-success ltr:ml-2 rtl:ml-2">Pro</span>
        </h4>
        <button
          type="button"
          className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white"
        >
          {session?.user?.email || ""}
        </button>
      </div>
    </div>
  );
}
