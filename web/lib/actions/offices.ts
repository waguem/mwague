"use server";
import { setApiToken } from "@/app/hooks/useApi";
import {
  ApiError,
  createOfficeApiV1OrganizationOfficePost as createOffice,
  getOfficeApiV1OrganizationOfficeOfficeIdGet as getOfficeById,
  updateOfficeApiV1OrganizationOfficeOfficeIdPut,
} from "@/lib/client";
import { AddOfficeSchema } from "@/lib/schemas/actions";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { State } from "./state";
import { cache } from "react";
import { withToken } from "./withToken";
export async function addOffice(prevSate: State, data: FormData): Promise<State> {
  try {
    await setApiToken();
    const validationsFields = AddOfficeSchema.safeParse(data);

    if (!validationsFields.success) {
      return {
        status: "error",
        message: "Invalid form data",
        errors: validationsFields.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: `Client validation : ${issue.message}`,
        })),
      };
    }

    const response = await createOffice({
      requestBody: {
        create_office: {
          ...validationsFields.data,
          default_rates: [],
        },
      },
    });

    revalidatePath("/dashboard/organization");

    return { status: "success", message: `Office ${response.name} Added Successfully` };
  } catch (e) {
    if (e instanceof ZodError) {
      return {
        status: "error",
        message: "Invalid dorm data. hree ",
        errors: e.issues.map((issue) => ({
          path: issue.path.join("."),
          message: `Server validation : ${issue.message}`,
        })),
      };
    }

    if (e instanceof ApiError) {
      return {
        status: "error",
        message: e.message,
      };
    }
    return { status: "error", message: "Something went wrong!. Please try again" };
  }
}

export const getOfficeCached = cache(async (slug: string) => {
  return withToken(async () => {
    return await getOfficeById({ officeId: slug });
  });
});

export const updateOfficeInfo = async (officeId: string, data: Record<string, string | string[]>): Promise<State> => {
  return withToken(async () => {
    console.log("Updating office info", officeId, data);
    const response = await updateOfficeApiV1OrganizationOfficeOfficeIdPut({
      officeId,
      requestBody: data,
    });

    console.log("Response ", response);
    return {
      status: "success",
      message: "Office Updated Successfully",
    };
  });
};
