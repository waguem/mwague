import { Currency } from "../client";

export type OfficeCurrency = {
  name: Currency;
  main: boolean;
  base: boolean;
  defaultRate: number;
};
