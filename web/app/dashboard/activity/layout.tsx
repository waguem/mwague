import ActivityMenuTab from "@/components/apps/activity/ActivityMenuTab";
import Dropdown from "@/components/dropdown";
import IconHorizontalDots from "@/components/icon/icon-horizontal-dots";
import IconLogin from "@/components/icon/icon-login";
import IconSettings from "@/components/icon/icon-settings";
import { getMyAgents } from "@/lib/actions";
import { getCurrentActivity } from "@/lib/actions/activity";
import { me } from "@/lib/actions/employee";
import Image from "next/image";

export default async function ActivityLayout({ children }: { children: React.ReactNode }) {
  const mePromise = me();
  const agentsPromise = getMyAgents();
  const activityPromise = getCurrentActivity();
  const [agents, employee, activity] = await Promise.all([agentsPromise, mePromise, activityPromise]);
  return (
    <div className={`relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)] sm:min-h-0`}>
      {/* <div className={`panel absolute z-10 hidden h-full w-full max-w-xs flex-none space-y-4 overflow-hidden p-4 xl:relative xl:block ${isShowChatMenu ? '!block' : ''}`}> */}
      <div
        className={`panel absolute z-10 hidden h-full w-full max-w-xs flex-none space-y-4 overflow-hidden p-4 xl:relative xl:block`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-none">
              <Image
                width={400}
                height={400}
                src="/assets/images/profile-34.jpeg"
                className="h-12 w-12 rounded-full object-cover"
                alt=""
              />
            </div>
            <div className="mx-3">
              <p className="mb-1 font-semibold">{employee.username}</p>
              <p className="text-xs text-white-dark">{employee.email}</p>
            </div>
          </div>
          <div className="dropdown">
            <Dropdown
              offset={[0, 5]}
              placement={`bottom-end`}
              btnClassName="bg-[#f4f4f4] dark:bg-[#1b2e4b] hover:bg-primary-light w-8 h-8 rounded-full !flex justify-center items-center hover:text-primary"
              button={<IconHorizontalDots className="opacity-70" />}
            >
              <ul className="whitespace-nowrap">
                <li>
                  <button type="button">
                    <IconSettings className="h-4.5 w-4.5 shrink-0 ltr:mr-1 rtl:ml-1" />
                    Settings
                  </button>
                </li>
                <li>
                  <button type="button">
                    <IconLogin className="shrink-0 ltr:mr-1 rtl:ml-1" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>
        <ActivityMenuTab agents={agents} office={employee.office} activity={activity} />
      </div>
      <div className="panel flex-1 p-0">{children}</div>
    </div>
  );
}
