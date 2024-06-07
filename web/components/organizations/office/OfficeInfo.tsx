import IconMapPin from "@/components/icon/icon-map-pin";
import IconWirehouse from "@/components/icon/icon-wirehouse";
import { OfficeResponse } from "@/lib/client";
import { getFlagEmoji } from "@/lib/utils";
import Image from "next/image";

interface OfficeInfoProps {
  office: OfficeResponse;
}
export default function OfficeInfo({ office }: OfficeInfoProps) {
  return (
    <div className="mb-5">
      <div className="flex flex-col items-center justify-center">
        <Image
          width={56}
          height={49}
          src="/assets/images/logo.svg"
          alt="img"
          className="mb-5 h-24 w-24 rounded-full  object-cover"
        />
        <p className="text-xl font-semibold text-primary">{office.name}</p>
      </div>
      <ul className="m-auto mt-5 flex max-w-[160px] flex-col space-y-4 font-semibold text-white-dark">
        <li className="flex items-center gap-2">
          <IconMapPin className="shrink-0" /> {office.initials} {getFlagEmoji(office.initials)}
        </li>
        <li className="flex items-center gap-2">
          <IconWirehouse className="shrink-0" /> Head Office
        </li>
      </ul>
    </div>
  );
}
