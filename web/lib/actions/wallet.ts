"use server";
import { z } from "zod";
import {
  tradeWalletApiV1WalletPost,
  getWalletTradingsApiV1WalletWalletIdTradingsGet as getWalletTradingsApi,
  payTradeApiV1WalletTradeTradeIdPayPost,
  getAgentTradingsApiV1OfficeAgentInitialsTradingsGet as getAgentWalletTradingsApi,
  commitTraddApiV1WalletTradeWalletIdCommitPost as commitTradeApi,
  CommitTradeRequest,
} from "@/lib/client";
import { withToken } from "./withToken";
import { TradeWallet } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

type TradeWalletReq = z.infer<typeof TradeWallet>;

export const tradeWallet = async (tradingRequest: TradeWalletReq, path: string) => {
  return await withToken(async () => {
    // validate request
    const validated = TradeWallet.safeParse(tradingRequest);

    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid data",
        errors: validated.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: `${issue.message}`,
        })),
      };
    }
    // make request
    await tradeWalletApiV1WalletPost({
      requestBody: validated.data,
    });

    // revalidatePath
    revalidatePath(path);

    return {
      status: "success",
      message: "Trade Successful",
    };
  });
};

export const getWalletTradings = async (walletID: string) => {
  return await withToken(async () => {
    return await getWalletTradingsApi({
      walletId: walletID,
    });
  });
};

export const payTrade = async (walletID: string, tradeID: string) => {
  return withToken(async () => {
    await payTradeApiV1WalletTradeTradeIdPayPost({
      tradeId: tradeID,
    });
    revalidatePath(`/dashboard/wallet/${walletID}`);
    return {
      status: "success",
      message: "Trade Paid Successfully",
    };
  });
};

export const getAgentTradings = async (initials: string, startDate?: string, endDate?: string) => {
  return await withToken(async () => {
    return await getAgentWalletTradingsApi({
      initials: initials,
      startDate,
      endDate,
    });
  });
};

export const commitTrade = async (request: CommitTradeRequest) => {
  return withToken(async () => {
    await commitTradeApi({
      walletId: request.walletID,
      requestBody: request,
    });

    revalidatePath(`/dashboard/wallet/${request.walletID}`);

    return {
      status: "success",
      message: "Trade Committed Successfully",
    };
  });
};
