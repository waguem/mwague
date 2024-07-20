// import { getOrgOfficesApiV1OrganizationOfficeGet as getOfficesApi, OfficeResponse } from "@/lib/client";
// import { cache } from "react";
// import { withToken } from "@/lib/actions/withToken";
// import Link from "next/link";
// import Image from "next/image";
import IconSearch from "@/components/icon/icon-search";
import AddOfficeForm from "@/components/apps/org/AddOfficeForm";

// const getOffices = cache(async () => {
//   return await withToken(async () => {
//     return await getOfficesApi();
//   });
// });

export default async function OrgOfficePage() {
  // const offices:OfficeResponse[] = await getOffices();
  return (
    <div className="panel ">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl">Offices</h2>
        <div className="flex-1">
          <AddOfficeForm />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name or Country"
            className="peer form-input py-2 ltr:pr-11 rtl:pl-11"
            value={"search"}
          />
          <button
            title="search"
            type="button"
            className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
          >
            <IconSearch className="mx-auto" />
          </button>
        </div>
      </div>
      {/* <div className="mt-0 overflow-hidden border-0 block w-full space-y-2 overflow-x-auto rounded-lg border-white-dark/20 p-4">
        {offices.map((item: OfficeResponse, index: number) => {
          return (
            <Link
              href={`/dashboard/office/${item.id}`}
              key={index}
              className="flex min-w-[625px] items-center justify-between rounded-xl h-10 bg-white p-3 font-semibold
                            text-gray-500 shadow-[0_0_4px_2px_rgb(31_45_61_/_10%)] transition-all duration-300 hover:scale-[1.01] hover:text-primary dark:bg-[#1b2e4b]"
            >
              <div className="user-profile">
                <Image
                  width={300}
                  height={450}
                  src={`/assets/images/profile-${Math.min(index + 1, 30)}.jpeg`}
                  alt="img"
                  className="h-8 w-8 rounded-md object-cover"
                />
              </div>
              <div className={`badge badge-outline-primary border-2 border-dashed`}>{item.initials}</div>
              <div>{item.name}</div>
              <div>{item.country}</div>
            </Link>
          );
        })}
      </div> */}
    </div>
  );
}
