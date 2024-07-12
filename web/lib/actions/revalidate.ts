"use server";

import { revalidatePath } from "next/cache";

export const fetchRevalidatePath = async (path: string) => {
  // call api/revalidate/route.ts with the path to revalidate
  await fetch(`/api/revalidate?path=${path}`);
};

export const revalidateServerPath = async (path: string) => {
  revalidatePath(path);
};
