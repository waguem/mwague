"use server";
import { setApiToken } from "@/app/hooks/useApi";
import {
  ApiError,
  createOfficeApiV1OrganizationOfficePost as createOffice,
  getOfficeApiV1OrganizationOfficeOfficeIdGet as getOfficeById,
  updateOfficeApiV1OrganizationOfficeOfficeIdPut,
  getOfficeEmployeesApiV1OfficeOfficeIdEmployeeGet as getEmployeesByOfficeId,
  createWalletApiV1OrganizationOfficeWalletPost as createWalletApi,
  Currency,
  CryptoCurrency,
  getMyOfficeApiV1OrganizationMyofficeGet as getMyOfficeApi,
  getOfficeHealthApiV1OrganizationHealthGet as getOfficeHealthApi,
  getMonthlyReportApiV1OfficeMonthlyReportGet as getMonthlyReportApi,
  getFundCommitsApiV1OrganizationMyofficeFundCommitsGet as getDailyFundCommitsApi,
  getProviderReportApiV1OfficeProvidersReportGet,
} from "@/lib/client";
import { AddOfficeSchema } from "@/lib/schemas/actions";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { State } from "./state";
import { cache } from "react";
import { withToken } from "./withToken";
import { zCryptoCurrency, zCurrency } from "../schemas/transactionsResolvers";
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
        request: {
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

export const getEmployeesCached = cache(async (officeId: string) => {
  return withToken(
    async () =>
      await getEmployeesByOfficeId({
        officeId,
      })
  );
});

export const updateOfficeInfo = async (officeId: string, data: Record<string, string | string[]>): Promise<State> => {
  return withToken(async () => {
    await updateOfficeApiV1OrganizationOfficeOfficeIdPut({
      officeId,
      requestBody: data,
    });

    return {
      status: "success",
      message: "Office Updated Successfully",
    };
  });
};

export const createWallet = async (
  initials: string,
  wallet_name: string,
  crypto_currency: CryptoCurrency,
  trading_currency: Currency
) => {
  return withToken(async () => {
    const isValid = zCryptoCurrency.safeParse(crypto_currency) && zCurrency.safeParse(trading_currency);
    if (!isValid) {
      return {
        status: "error",
        message: "Invalid Currency",
      };
    }

    const response = await createWalletApi({
      requestBody: {
        crypto_currency,
        trading_currency,
        initials,
        wallet_name,
      },
    });

    // revalidate path
    revalidatePath(`/dashboard/office/${response.office_id}`);
    return {
      status: "success",
      message: "Wallet Created Successfully",
    };
  });
};

export const getMyOffice = async () => {
  return withToken(async () => {
    return await getMyOfficeApi();
  });
};

export const getOfficeHealth = async () => {
  return withToken(async () => {
    return getOfficeHealthApi();
  });
};

export const getMonthlyReport = async (startDate?: string, endDate?: string) => {
  return withToken(async () => {
    return await getMonthlyReportApi({
      endDate,
      startDate,
    });
  });
};

export const getDailyFundCommits = async (startDate?: string, endDate?: string) => {
  return withToken(async () => {
    return await getDailyFundCommitsApi({
      startDate,
      endDate,
    });
  });
};

export const getProviderReport = async (name: string, startDate?: string, endDate?: string) => {
  return withToken(async () => {
    return await getProviderReportApiV1OfficeProvidersReportGet({
      start: startDate,
      end: endDate,
      name: name,
    });
  });
};
