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
