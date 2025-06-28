"use server";
import {
  updateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPut as updateEmployeeApi,
  createEmployeeApiV1OfficeEmployeePost as createEmployeeApi,
  getEmployeeApiV1OfficeEmployeeMeGet as getMeApiV1MeGet,
  updateOfficeEmployeesApiV1OfficeEmployeePut as updateOfficeEmployeesApi,
  EmployeeResponse,
} from "@/lib/client";
import { withToken } from "./withToken";
import { AddUserSchema, UpdateUserSchema } from "../schemas/actions";
import { State } from "./state";
import { revalidatePath } from "next/cache";
import { cache } from "react";

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
    revalidatePath(`/office/${updatedFields.data.office_id}`);
    return { status: "success", message: `Employee ${response.username} Updated Successfully` };
  });
};

export const addEmployee = async (prevState: State, data: FormData): Promise<State> => {
  return await withToken(async () => {
    const userInput = AddUserSchema.safeParse(data);
    if (!userInput.success) {
      return {
        status: "error",
        message: "Invalid data",
        errors: userInput.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: `${issue.message}`,
        })),
      };
    }

    // check that password and confirmPassowr match
    if (userInput.data.password !== userInput.data.confirmPassword) {
      return {
        status: "error",
        message: "Invalid data",
        errors: [
          {
            path: "confirmPassword",
            message: "Passwords do not match",
          },
        ],
      };
    }

    // update employee object with updated fields
    const response = await createEmployeeApi({
      requestBody: {
        email: userInput.data.email,
        username: userInput.data.username,
        password: userInput.data.password,
        office_id: userInput.data.office_id,
        roles: userInput.data.roles,
      },
    });

    // revalidate path to update the form
    revalidatePath(`/office/${userInput.data.office_id}`);
    return { status: "success", message: `Employee ${response.username} Updated Successfully` };
  });
};

export const me = cache(async () => {
  return withToken(async () => {
    return await getMeApiV1MeGet();
  });
});

interface UpdateEmployeesForm extends FormData {
  editedRows: Array<EmployeeResponse>;
}
export const updateOfficeEmployees = async (prevState: State, data: UpdateEmployeesForm): Promise<State> => {
  return await withToken(async () => {
    //save edited users
    await updateOfficeEmployeesApi({
      requestBody: {
        employees: data.editedRows,
      },
    });
    const officeId = data.editedRows[0].office_id;
    revalidatePath(`/office/${officeId}`);
    return {
      status: "success",
      message: "Employees Updated Successfully",
    };
  });
};
