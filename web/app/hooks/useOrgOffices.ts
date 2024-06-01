import { getOrgOffices } from "@/lib/actions";

export async function useOrgOffices() {
  const resonse = await getOrgOffices();
  return {
    offices: resonse,
  };
}
