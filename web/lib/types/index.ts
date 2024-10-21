import { Currency, Deposit, External, ForEx, Internal, Sending } from "../client";

export type OfficeCurrency = {
  name: Currency;
  main: boolean;
  base: boolean;
  defaultRate: number;
};

export type AllTransactions = Internal | Deposit | Sending | External | ForEx;
