import zod from "zod";
import { zfd } from "zod-form-data";

export const FormSchema = zfd.formData({
  name: zfd.text(
    zod
      .string()
      .min(3, "Too Short!")
      .max(20, "Too Long!")
      .regex(/^[a-zA-Z\s]*$/, "Only Alphanumeric Characters are allowed!")
      .refine((value) => value.trim() !== "")
  ),
  initials: zfd.text(
    zod
      .string()
      .min(2, "Too Short!")
      .max(5, "Too Long!")
      .regex(/^[a-zA-Z\s]*$/, "Only Alphanumeric Characters are allowed!")
      .refine((value) => value.trim() !== "")
  ),
  // country as two fiels label and value
  country: zfd.text(zod.string()),
});

/**
 *  create a zfd schema for the update user form and add the following fields:
 * email: string;
  username: string;
  id: string;
  office_id: string;
  organization_id: string;
  roles: Array<string>;
 */
export const UpdateUserSchema = zfd.formData({
  email: zfd.text(
    zod
      .string()
      .email("Invalid Email")
      .refine((value) => value.trim() !== "")
  ),
  username: zfd.text(
    zod
      .string()
      .min(3, "Too Short!")
      .max(20, "Too Long!")
      .regex(/^[a-zA-Z\s]*$/, "Only Alphanumeric Characters are allowed!")
      .refine((value) => value.trim() !== "")
  ),
  id: zfd.text(zod.string()),
  office_id: zfd.text(zod.string()),
  organization_id: zfd.text(zod.string()),
  roles: zfd.repeatableOfType(zod.string()),
});
