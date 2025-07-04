"use server";
import { z } from "zod";
import {
  tradeWalletApiV1WalletPost,
  getWalletTradingsApiV1WalletWalletIdTradingsGet as getWalletTradingsApi,
  payTradeApiV1WalletTradeTradeIdPayPost,
  getAgentTradingsApiV1OfficeAgentInitialsTradingsGet as getAgentWalletTradingsApi,
  commitTradeApiV1WalletTradeTradeCodeCommitPost as commitTradeApi,
  CommitTradeRequest,
  TradeReviewReq,
  reviewTradeApiV1TradeReviewPost,
  PaymentRequest,
  rollbackApiV1TradeRollbackPost,
  CancelTransaction,
  WalletTradingResponse,
  updateTradeApiV1TradeUpdatePatch,
  partnerPaidApiV1TradeTradeCodePartnerPaidPost,
  setBalanceTrackingEnabledApiV1WalletWalletIdBalanceTrackingEnabledPost as setBalanceTrackingEnabledApi,
  groupedCommitApiV1WalletTradeGroupedCommitPost,
} from "@/lib/client";
import { withToken } from "./withToken";
import { TradeWallet } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { isNumber } from "lodash";

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
      requestBody: {
        ...validated.data,
        trading_rate: isNumber(validated?.data?.trading_rate) ? +validated?.data?.trading_rate! : 0,
      },
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

export const payTrade = async (walletID: string, trade_code: string, request: PaymentRequest) => {
  return withToken(async () => {
    await payTradeApiV1WalletTradeTradeIdPayPost({
      tradeCode: trade_code,
      requestBody: request,
    });
    revalidatePath(`/wallet/${walletID}`);
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

export const commitTrade = async (code: string, request: CommitTradeRequest) => {
  return withToken(async () => {
    await commitTradeApi({
      tradeCode: code,
      requestBody: request,
    });

    revalidatePath(`/wallet/${request.walletID}`);

    return {
      status: "success",
      message: "Trade Committed Successfully",
    };
  });
};

export const groupedCommit = async (group: CommitTradeRequest[]) => {
  return withToken(async () => {
    const trades = await groupedCommitApiV1WalletTradeGroupedCommitPost({
      requestBody: group,
    });

    revalidatePath(`/wallet/${trades[0].walletID}`);

    return trades.map((trade) => {
      return {
        status: "success",
        message: `${trade.code} has been committed`,
      };
    });
  });
};

export const reviewTrade = async (review: TradeReviewReq) => {
  return withToken(async () => {
    const trade = await reviewTradeApiV1TradeReviewPost({
      requestBody: review,
    });

    revalidatePath(`/wallet/${review.walletID}`);

    return {
      status: "success",
      message: `${trade.code} has been reviewed`,
    };
  });
};

export const rollbackTrade = async (cancellation: CancelTransaction) => {
  return withToken(async () => {
    const trade = await rollbackApiV1TradeRollbackPost({
      requestBody: cancellation,
    });

    revalidatePath(`/wallet/${trade.walletID}`);

    return {
      status: "success",
      message: `${trade.code} has been reviewed`,
    };
  });
};

export const updateTrade = async (request: WalletTradingResponse) => {
  return withToken(async () => {
    const trade = await updateTradeApiV1TradeUpdatePatch({
      requestBody: request,
    });

    revalidatePath(`/wallet/${trade.walletID}`);

    return {
      status: "success",
      message: `${trade.code} has been updated`,
    };
  });
};

export const updatePartnerPaid = async (trade_code: string) => {
  return withToken(async () => {
    const trade = await partnerPaidApiV1TradeTradeCodePartnerPaidPost({
      tradeCode: trade_code,
    });

    revalidatePath(`/wallet/${trade.walletID}`);

    return {
      status: "success",
      message: `${trade.code} has been updated`,
    };
  });
};

export const enablePartnerBalanceTracking = async (walletID: string, enabled: boolean) => {
  return withToken(async () => {
    const wallet = await setBalanceTrackingEnabledApi({
      walletId: walletID,
      enabled: enabled,
    });
    revalidatePath(`/wallet/${walletID}`);
    return {
      status: "success",
      message: `Partner Balance Tracking has been enabled for ${wallet.wallet_name}`,
    };
  });
};
