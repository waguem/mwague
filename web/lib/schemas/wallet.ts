import { z } from "zod";
import { zCryptoCurrency, zCurrency, zNumber } from "./transactionsResolvers";
import { $TradingType } from "../client";

const zPNumber = z.number({ message: "must be a number" }).positive({ message: "must be a positive number" });

const ExchangeRequest = z.object({
  request_type: z.literal("EXCHANGE"),
  // Define the fields for ExchangeRequest
  exchange_rate: zPNumber,
  walletID: z.string(),
});

const ExchangeWithSimpleWalletRequest = z.object({
  request_type: z.literal("EXCHANGE WITH SIMPLE WALLET"),
  walletID: z.string(),
  exchange_rate: zPNumber,
  selling_rate: zPNumber,
});

export const BuyRequest = z.object({
  request_type: z.literal("BUY"),
  provider: z.string(),
});

export const SellRequest = z.object({
  request_type: z.literal("SELL"),
  customer: z.string(),
  currency: z.union([zCryptoCurrency, zCurrency]),
});

export const DepositRequest = z.object({
  request_type: z.literal("DEPOSIT"),
  provider: z.string(),
});
// Create a Zod schema for the union of ExchangeRequest, BuyRequest, and SellRequest
const WalletTradeRequestSchema = z.discriminatedUnion("request_type", [
  ExchangeRequest,
  BuyRequest,
  SellRequest,
  DepositRequest,
  ExchangeWithSimpleWalletRequest,
]);

export type WalletTradeRequest = z.infer<typeof WalletTradeRequestSchema>;

export const TradeWallet = z.object({
  trading_type: z.enum($TradingType.enum),
  amount: zPNumber,
  walletID: z.string(),
  daily_rate: zPNumber,
  trading_rate: zNumber,
  trading_currency: z.optional(z.string()),
  selling_currency: z.optional(z.string()),
  exchange_currency: z.optional(z.string()),
  request: WalletTradeRequestSchema,
  message: z.string().optional(),
});
