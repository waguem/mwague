import { z } from "zod";
import { zfd } from "zod-form-data";
import { DepositRequest, InternalRequest, TransactionRequest } from "../client";

// Step 1: Define the registry
// Assuming you have Zod schemas defined somewhere
export const zCurrency = z.enum(["USD", "EUR", "CFA", "GNF", "AED", "RMB"]);
export const zCryptoCurrency = z.enum(["BTC", "ETH", "USDT"]);
export const zNumber = z.preprocess(
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
    z.number({
      message: "must be a number",
    }),
    z.literal("").refine(() => false, {
      message: "This field is required",
    }),
  ])
);
export const zPNumber = z.preprocess(
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
  amount: zfd.text(zPNumber),
  rate: zfd.text(zPNumber),
  message: zfd.text(z.string().max(1024)),
});

const Deposit = zfd.formData({
  receiver: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
  amount: zfd.text(zPNumber),
  rate: zfd.text(zPNumber),
  message: zfd.text(z.string().max(255)),
});
const External = zfd.formData({
  sender: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
  amount: zfd.text(zPNumber),
  rate: zfd.text(zPNumber),
  message: zfd.text(z.string().max(1024)).optional(),
  payment_currency: zCurrency.optional(),
});
const Sending = zfd.formData({
  receiver_initials: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
  amount: zfd.text(zPNumber),
  rate: zfd.text(zPNumber),
  message: zfd.text(z.string().max(255)).optional(),
  payment_currency: zCurrency,
  payment_method: z.enum(["CASH", "BANK", "MOBILE", "OTHER"]),
});

const ForEx = zfd.formData({
  provider_account: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
  customer_account: zfd.text(z.string().max(20)).refine((value) => value.trim() !== ""),
  base_currency: zCurrency,
  currency: zCurrency,
  daily_rate: zfd.text(zPNumber),
  buying_rate: zfd.text(zPNumber),
  selling_rate: zfd.text(zPNumber),
  amount: zfd.text(zPNumber),
  message: zfd.text(z.string().max(1024)).optional(),
  tag: zfd.text(z.string()),
});

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
  run: (data: FormData) => {
    // Do any processing here
    const parsed = Internal.safeParse(data);
    const charges = zNumber.safeParse(data.get("charges") as string);
    if (!parsed.success || !charges.success) {
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
        amount: +charges.data,
        rate: +parsed.data.rate,
      },
      currency: data.get("currency") as string,
      message: parsed.data.message,
      data: {
        sender: parsed.data.sender,
        receiver: parsed.data.receiver,
        type: "INTERNAL",
      },
    };
  },
};

const DepositFormResolver: FormResolver = {
  resolver: Deposit,
  run: (data: FormData) => {
    const parsed = Deposit.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: "Invalid transaction data",
        errors: parsed.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      };
    }

    return {
      amount: {
        amount: +parsed.data.amount,
        rate: +parsed.data.rate,
      },
      currency: data.get("currency") as string,
      message: parsed.data.message,
      data: {
        receiver: parsed.data.receiver,
        type: "DEPOSIT",
      },
    };
  },
};

const SendingFormResolver: FormResolver = {
  resolver: Sending,
  run: (data: FormData) => {
    const parsed = Sending.safeParse(data);
    const charges = zNumber.safeParse(data.get("charges") as string);
    if (!parsed.success) {
      return {
        status: "error",
        error: "Invalid transaction data",
        errors: parsed.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      };
    }
    return {
      amount: {
        amount: +parsed.data.amount,
        rate: +parsed.data.rate,
      },
      currency: data.get("currency") as string,
      message: parsed.data.message,
      charges: {
        amount: charges.data ? +charges.data : 0,
        rate: +parsed.data.rate,
      },
      data: {
        type: "SENDING",
        receiver_initials: parsed.data.receiver_initials,
        payment_currency: parsed.data.payment_currency,
        payment_method: parsed.data.payment_method,
      },
    };
  },
};
const ExternalFormResolver: FormResolver = {
  resolver: External,
  run: (data: FormData) => {
    const parsed = External.safeParse(data);
    const charges = zNumber.safeParse(data.get("charges") as string);
    if (!parsed.success) {
      return {
        status: "error",
        error: "Invalid transaction data",
        errors: parsed.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      };
    }
    return {
      amount: {
        amount: +parsed.data.amount,
        rate: +parsed.data.rate,
      },
      currency: data.get("currency") as string,
      charges: {
        amount: charges.data ? +charges.data : 0,
        rate: +parsed.data.rate,
      },
      message: parsed.data.message,
      data: {
        sender: parsed.data.sender,
        type: "EXTERNAL",
        payment_currency: parsed.data.payment_currency,
        // customer: {
        //   name: parsed.data.customer_name,
        //   phone: parsed.data.customer_phone,
        // },
      },
    };
  },
};

// const ForexFromResolver: FormResolver = {
//   resolver: ForEx,
//   run: (data: FormData) => {
//     const parsed = ForEx.safeParse(data);
//     const charges = 0;
//     if (!parsed.success) {
//       return {
//         status: "error",
//         error: "Invalid transaction data",
//         errors: parsed.error.errors.map((error) => ({
//           path: error.path.join("."),
//           message: error.message,
//         })),
//       };
//     }
//     console.log("Parsed Forex ", parsed);

//     return {
//       amount: {
//         amount: +parsed.data.amount,
//         rate: +parsed.data.rate,
//       },
//       currency: data.get("currency") as string,
//       charges: {
//         amount: charges,
//         rate: +parsed.data.daily_rate,
//       },
//       data: {
//         type: "FOREX",
//         walletID: parsed.data.walletID,
//         is_buying: parsed.data.is_buying === "true",
//         daily_rate: +parsed.data.daily_rate,
//         account: parsed.data.account,
//         rate: +parsed.data.rate,
//         amount: +parsed.data.amount,
//       },
//     };
//   },
// };

const ForexFromResolver: FormResolver = {
  resolver: ForEx,
  run: (data: FormData) => {
    const parsed = ForEx.safeParse(data);
    const charges = 0;
    if (!parsed.success) {
      return {
        status: "error",
        error: "Invalid transaction data",
        errors: parsed.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      };
    }

    return {
      amount: {
        amount: +parsed.data.amount,
        rate: +parsed.data.daily_rate,
      },
      currency: data.get("currency") as string,
      charges: {
        amount: charges,
        rate: +parsed.data.daily_rate,
      },
      message: parsed.data.message,
      data: {
        type: "FOREX",
        provider_account: parsed.data.provider_account,
        customer_account: parsed.data.customer_account,
        currency: parsed.data.currency,
        base_currency: parsed.data.base_currency,
        daily_rate: +parsed.data.daily_rate,
        buying_rate: +parsed.data.buying_rate,
        selling_rate: +parsed.data.selling_rate,
        amount: +parsed.data.amount,
        tag: parsed.data.tag,
      },
    };
  },
};

const resolverRegistry: Record<string, FormResolver> = {
  INTERNAL: InternalFormResolver,
  DEPOSIT: DepositFormResolver,
  EXTERNAL: ExternalFormResolver,
  SENDING: SendingFormResolver,
  FOREX: ForexFromResolver,
};

// Step 2: Create the function
export function getResolver(type: string): FormResolver | undefined {
  return resolverRegistry[type];
}
