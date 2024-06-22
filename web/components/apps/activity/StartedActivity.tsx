import { ActivityResponse } from "@/lib/client";

interface Props {
  activity: ActivityResponse;
}
export default function StartedActivity({ activity }: Props) {
  return (
    <div>
      <div className="flex h-8 btn btn-outline-danger rounded-full">
        <span>Stop Activity</span>
      </div>
      <div className="table w-full border mt-3 rounded">
        <table>
          <tbody>
            <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90 p-0">
              <td>
                <span className="badge badge-outline-success dark:group-hover:bg-transparent">STARTED</span>
              </td>
              <td className="text-black dark:text-white">
                <div className="flex items-center">
                  <span className="whitespace-nowrap">{activity.started_at}</span>
                </div>
              </td>
            </tr>
            <tr className="group hover:text-black p-0">
              <td className="min-w-[150px] text-black dark:text-white">
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Start Fund </span>
                </div>
              </td>
              <td>
                <span>$ {activity.openning_fund}</span>
              </td>
            </tr>
            <tr className="group hover:text-black p-0">
              <td className="min-w-[150px] text-black dark:text-white">
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Closing Fund </span>
                </div>
              </td>
              <td>
                <span>$ {activity.closing_fund}</span>
              </td>
            </tr>
            <tr className="group hover:text-black p-0">
              <td className="min-w-[150px] text-black dark:text-white">
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Started By</span>
                </div>
              </td>
              <td>
                <span>activity</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div></div>
    </div>
  );
}
