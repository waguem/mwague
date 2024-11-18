import zod from "zod";
import { zfd } from "zod-form-data";
import { zNumber, zPNumber } from "./transactionsResolvers";
import { TransactionType } from "../client";

export const AddOfficeSchema = zfd.formData({
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

/**
 * Add User Schema Input
 */

export const AddUserSchema = zfd.formData({
  username: zfd.text(
    zod
      .string()
      .min(3, "Too Short!")
      .max(20, "Too Long!")
      .regex(/^[a-zA-Z\s]*$/, "Only Alphanumeric Characters are allowed!")
      .refine((value) => value.trim() !== "")
  ),
  password: zfd.text(
    zod
      .string()
      .min(6, "Too Short!")
      .max(20, "Too Long!")
      .regex(/^[a-zA-Z0-9]*$/, "Only Alphanumeric Characters are allowed!")
      .refine((value) => value.trim() !== "")
  ),
  confirmPassword: zfd.text(
    zod
      .string()
      .min(6, "Too Short!")
      .max(20, "Too Long!")
      .regex(/^[a-zA-Z0-9]*$/, "Only Alphanumeric Characters are allowed!")
      .refine((value) => value.trim() !== "")
  ), // should be equal to password
  email: zfd.text(
    zod
      .string()
      .email("Invalid Email")
      .refine((value) => value.trim() !== "")
  ),
  roles: zfd.repeatableOfType(zod.string()),
  office_id: zfd.text(zod.string()),
});

/**
 * name:str
 * initials:str = Field(nullable=False, max_length=4, unique=True)
 * type : AgentType
 * country: str = Field(nullable=False, max_length=64)
 * phone: str = Field(nullable=False, max_length=16)
 * email: str = Field(nullable=False, max_length=128, unique=True)
 */

export const AddAgentSchema = zfd.formData({
  name: zfd.text(
    zod
      .string()
      .min(2, "Too Short!")
      .max(64, "Too Long!")
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
  // type is Agent TYpe AGENT or SUPPLIER
  type: zod.enum(["AGENT", "SUPPLIER"]),
  country: zfd.text(zod.string()),
  phone: zfd.text(zod.string()),
  // office_id is optional string
  office_id: zfd.text(zod.string().optional()),
});

export const AddAccountSchema = zfd.formData({
  initials: zfd.text(
    zod
      .string()
      .min(2, "Too Short!")
      .max(6, "Too Long!")
      .regex(/^[a-zA-Z\s]*$/, "Only Alphanumeric Characters are allowed!")
      .refine((value) => value.trim() !== "")
  ),
  type: zod.enum(["AGENT", "SUPPLIER", "OFFICE", "FUND"]),
  currency: zod.enum(["USD", "EUR", "CFA", "GNF", "AED", "RMB"]),
  owner_initials: zfd.text(zod.string()),
});
export const zTransactionType = zod.enum(["INTERNAL", "EXTERNAL", "DEPOSIT", "SENDING", "FOREX"]);
export const TransactionReviewResolver = zfd.formData({
  notes: zfd.text(
    zod
      .string()
      .max(255, "Too Long!")
      .refine((value) => value.trim() !== "")
      .optional()
  ),
  type: zTransactionType,
  action: zod.enum(["APPROVE", "REJECT", "CANCEL"]),
  code: zfd.text(zod.string()),
  amount: zfd.text(zPNumber).optional(),
  charges: zfd.text(zNumber).optional(),
});

/**
 * mainAmount:number
  convertedAmount:number
  rate:number
  customerName:string
  customerPhone?:string
  notes?:string
 */

export type PaymentRequest = {
  mainAmount: number;
  convertedAmount: number;
  rate: number;
  customerName: string;
  customerPhone?: string;
  notes?: string;
  type: TransactionType;
  code: string;
};

export const PaymentResolver = zfd.formData({
  code: zfd.text(zod.string().max(16, "Too Long!")),
  mainAmount: zfd.text(zPNumber),
  convertedAmount: zfd.text(zPNumber),
  rate: zfd.text(zPNumber),
  type: zTransactionType,
  customerName: zod.optional(zod.string()),
  customerPhone: zod.optional(zod.string()),
  notes: zfd.text(zod.string()).optional(),
});
