"use server";
import { updateEmployeeApiV1OrgOfficeEmployeeEmployeeIdAssignPut as updateEmployeeApi } from "@/lib/client";
import { withToken } from "./withToken";
import { UpdateUserSchema } from "../schemas/actions";
import { State } from "./state";
import { revalidatePath } from "next/cache";

export const updateEmployee = async (prevState: State, data: FormData): Promise<State> => {
  return await withToken(async () => {
    const updatedFields = UpdateUserSchema.safeParse(data);
    if (!updatedFields.success) {
      return {
        status: "error",
        message: "Invalid form data",
        errors: updatedFields.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: `Client validation : ${issue.message}`,
        })),
      };
    }
    // update employee object with updated fields

    const response = await updateEmployeeApi({
      requestBody: updatedFields.data,
      employeeId: updatedFields.data.id,
    });
    // revalidate path to update the form
    revalidatePath(`/dashboard/office/${updatedFields.data.office_id}`);
    return { status: "success", message: `Employee ${response.username} Updated Successfully` };
  });
};
