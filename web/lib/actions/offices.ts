"use server";
import { setApiToken } from "@/app/hooks/useApi";
import { OfficeResponse } from "../client";

export type GetOrgOfficeResponse = OfficeResponse[];

export async function getOrgOffices(): Promise<GetOrgOfficeResponse> {
  try {
    await setApiToken();
    return [
      {
        name: "John Doe",
        initials: "CHN",
        country: "CHINA",
      },
      {
        name: "John Doe",
        initials: "MLI",
        country: "MALI",
      },
    ];
  } catch (e) {
    console.error(e);
  }
  return [];
}
