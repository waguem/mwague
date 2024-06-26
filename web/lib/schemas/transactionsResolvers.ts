import { z } from "zod";
import { zfd } from "zod-form-data";
import { DepositRequest, InternalRequest, TransactionRequest } from "../client";
import { revalidatePath } from "next/cache";
// Step 1: Define the registry
// Assuming you have Zod schemas defined somewhere

const zNumber = z.preprocess(
  (value) => {
    // Attempt to convert string to number if it's a string that represents a number
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      // Check if the parsed value is a valid number and not NaN
      if (!isNaN(parsed)) {
        return parsed; // Return the parsed number for further validation
      }
    }
    // Return the original value if it's not a string representing a number
    return value;
  },
  z.union([
    z
      .number({
        message: "must be a number",
      })
      .positive({
        message: "must be a positive number",
      }),
    z.literal("").refine(() => false, {
      message: "This field is required",
    }),
  ])
);

export const Internal = zfd.formData({
  sender: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
  receiver: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
  amount: zfd.text(zNumber),
  rate: zfd.text(zNumber),
  message: zfd.text(z.string().max(255)),
});

// const Deposit = zfd.formData({
//   receiver: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
//   amount: zfd.text(z.number().positive()),
//   rate: zfd.text(z.number().positive()),
//   message: zfd.text(z.string().max(255)),
// });

export type Data = InternalRequest | DepositRequest;
export interface FormResolver {
  resolver: z.ZodSchema<any>;
  run: (
    // eslint-disable-next-line no-unused-vars
    data: FormData
  ) =>
    | TransactionRequest
    | { status: "error"; error: string; errors?: { path: string; message: string }[]; message?: string }
    | any;
  // eslint-disable-next-line no-unused-vars
  revalidatePath?: (data: FormData) => void;
}
// A registry mapping types to their Zod schemas

const InternalFormResolver: FormResolver = {
  resolver: Internal,
  revalidatePath: (data: FormData) => {
    const sender = data.get("sender") as string;
    const receiver = data.get("receiver") as string;
    revalidatePath(`/dashboard/activity/${sender}`);
    revalidatePath(`/dashboard/activity/${receiver}`);
  },
  run: (data: FormData) => {
    // Do any processing here
    const parsed = Internal.safeParse(data);
    if (!parsed.success) {
      return {
        error: "Invalid transaction data",
        status: "error",
      };
    }
    if (parsed.data.sender === parsed.data.receiver) {
      return {
        status: "error",
        message: "Invalid transaction data",
        errors: [
          {
            path: "receiver",
            message: "Sender and receiver cannot be the same",
          },
          {
            path: "sender",
            message: "Sender and receiver cannot be the same",
          },
        ],
      };
    }
    return {
      amount: {
        amount: +parsed.data.amount,
        rate: +parsed.data.rate,
      },
      charges: {
        amount: 0,
        rate: 0,
      },
      currency: data.get("currency") as string,
      data: {
        sender: parsed.data.sender,
        receiver: parsed.data.receiver,
        type: "INTERNAL",
      },
    };
  },
};
const resolverRegistry: Record<string, FormResolver> = {
  INTERNAL: InternalFormResolver,
};

// Step 2: Create the function
export function getResolver(type: string): FormResolver | undefined {
  return resolverRegistry[type];
}
