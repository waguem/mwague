import IconAirplay from "@/components/icon/icon-airplay";
import { OfficeResponse } from "@/lib/client";

export function OfficeSummary({ office }: { office: OfficeResponse }) {
  return (
    <div className="panel">
      <div className="mb-5">
        <h5 className="text-lg font-semibold dark:text-white-light">
          {office.name} @ {office.country}
        </h5>
      </div>
      <div className="space-y-4">
        <div className="rounded border border-[#ebedf2] dark:border-0 dark:bg-[#1b2e4b]">
          <div className="flex items-center justify-between p-4 py-2">
            <div className="grid h-9 w-9 place-content-center rounded-md bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
              <IconAirplay />
            </div>
            <div className="flex flex-auto items-start justify-between font-semibold ltr:ml-4 rtl:mr-4">
              <h6 className="text-[13px] text-white-dark dark:text-white-dark">
                Income
                <span className="block text-base text-[#515365] dark:text-white-light">$92,600</span>
              </h6>
              <p className="text-secondary ltr:ml-auto rtl:mr-auto">90%</p>
            </div>
          </div>
        </div>
        <div className="rounded border border-[#ebedf2] dark:border-0 dark:bg-[#1b2e4b]">
          <div className="flex items-center justify-between p-4 py-2">
            <div className="grid h-9 w-9 place-content-center rounded-md bg-info-light text-info dark:bg-info dark:text-info-light">
              <IconAirplay />
            </div>
            <div className="flex flex-auto items-start justify-between font-semibold ltr:ml-4 rtl:mr-4">
              <h6 className="text-[13px] text-white-dark dark:text-white-dark">
                Profit
                <span className="block text-base text-[#515365] dark:text-white-light">$37,515</span>
              </h6>
              <p className="text-info ltr:ml-auto rtl:mr-auto">65%</p>
            </div>
          </div>
        </div>
        <div className="rounded border border-[#ebedf2] dark:border-0 dark:bg-[#1b2e4b]">
          <div className="flex items-center justify-between p-4 py-2">
            <div className="grid h-9 w-9 place-content-center rounded-md bg-warning-light text-warning dark:bg-warning dark:text-warning-light">
              <IconAirplay />
            </div>
            <div className="flex flex-auto items-start justify-between font-semibold ltr:ml-4 rtl:mr-4">
              <h6 className="text-[13px] text-white-dark dark:text-white-dark">
                Expenses
                <span className="block text-base text-[#515365] dark:text-white-light">$55,085</span>
              </h6>
              <p className="text-warning ltr:ml-auto rtl:mr-auto">80%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
