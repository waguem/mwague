import { MantineColor } from "@mantine/core";
import { TransactionState, TransactionType } from "../client";
import {
  IconCurrency,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconCurrencyRenminbi,
  IconCurrencyLira,
  IconCurrencyDirham,
} from "@tabler/icons-react";

export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char: any) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

export const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GNF: "FG",
  CFA: "CFA",
  AED: "AED",
};

export function decodeToken(token: string) {
  return JSON.parse(Buffer.from(token!.split(".")[1], "base64").toString());
}

export const countryList = [
  { value: "Mali", label: "Mali", code: "ML" },
  { value: "China", label: "China", code: "CN" },
  { value: "Turkey", label: "Turkey", code: "TR" },
  { value: "USA", label: "United States", code: "US" },
  { value: "France", label: "France", code: "FR" },
  { value: "Ivory Cost", label: "Ivory Cost", code: "CI" },
  { value: "Guinea", label: "Guinea", code: "GN" },
  { value: "Burkina Faso", label: "Burkina Faso", code: "BF" },
  { value: "United Arab Emirates", label: "United Arab Emirates", code: "AE" },
  { value: "Mozambique", label: "Mozambique", code: "MZ" },
  { value: "Senegal", label: "Senegal", code: "SN" },
];

export const countryOptions = countryList.map((option) => ({
  value: option.value,
  label: `${getFlagEmoji(option.code)} ${option.label}`,
}));

export const agentTypeOptions = [
  { value: "AGENT", label: "Agent" },
  { value: "SUPPLIER", label: "Supplier" },
];

export const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "CFA", label: "CFA" },
  { value: "GNF", label: "GNF" },
  { value: "AED", label: "AED" },
];

/**
 * AGENT = "AGENT"
    SUPPLIER = "SUPPLIER"
    OFFICE = "OFFICE"
    FUND = "FUND"
 */
export const accountTypeOptions = [
  { value: "AGENT", label: "Agent" },
  { value: "SUPPLIER", label: "Supplier" },
  { value: "OFFICE", label: "Office" },
  { value: "FUND", label: "Fund" },
];

export const getBadgeType = (tr_type: TransactionType): MantineColor => {
  switch (tr_type) {
    case "EXTERNAL":
      return "blue";
    case "INTERNAL":
      return "cyan";
    case "DEPOSIT":
      return "orange";
    case "FOREX":
      return "teal";
    case "SENDING":
      return "grape";
    default:
      return "gray";
  }
};

export const getStateBadge = (state: TransactionState): MantineColor => {
  switch (state) {
    case "PENDING":
      return "lime";
    case "PAID":
      return "green";
    case "REVIEW":
      return "indigo";
    case "REJECTED":
      return "orange";
    case "CANCELLED":
      return "red";
    default:
      return "gray";
  }
};

export const MoneyIcons = {
  USD: IconCurrencyDollar,
  EUR: IconCurrencyEuro,
  CFA: IconCurrency,
  RMB: IconCurrencyRenminbi,
  LIRA: IconCurrencyLira,
  AED: IconCurrencyDirham,
};
