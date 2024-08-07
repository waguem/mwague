import { BadgeVariant, MantineColor, MantineGradient } from "@mantine/core";
import { CryptoCurrency, Currency, TransactionState, TransactionType } from "../client";
import {
  IconCurrency,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconCurrencyDirham,
  IconCurrencyCent,
  IconCurrencyBitcoin,
  IconCurrencyEthereum,
  IconBrandTether,
  IconCurrencyYen,
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
  { value: "RMB", label: "RMB" },
];

export const cryptoCurrencyOptions = [
  { value: "BITCOIN", label: "BTC" },
  { value: "ETHERIUM", label: "ETH" },
  { value: "USDT", label: "USDT" },
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

type BadgeProps = {
  color?: MantineColor;
  variant: BadgeVariant;
  gradient?: MantineGradient;
};
export const getStateBadge = (state: TransactionState): BadgeProps => {
  switch (state) {
    case "PENDING":
      return {
        variant: "gradient",
        gradient: {
          from: "red",
          to: "blue",
          deg: 60,
        },
      };
    case "PAID":
      return {
        variant: "gradient",
        gradient: {
          from: "cyan",
          to: "teal",
          deg: 120,
        },
      };
    case "REVIEW":
      return {
        variant: "gradient",
        gradient: {
          from: "cyan",
          to: "orange",
          deg: 110,
        },
      };
    case "REJECTED":
      return {
        color: "orange",
        variant: "filled",
      };
    case "CANCELLED":
      return {
        color: "red",
        variant: "filled",
      };
    default:
      return {
        color: "gray",
        variant: "gradient",
        gradient: {
          from: "teal",
          to: "cyan",
          deg: 110,
        },
      };
  }
};

export const getMoneyIcon = (currency: Currency, size: number) => {
  switch (currency) {
    case "USD":
      return <IconCurrencyDollar size={size} />;
    case "EUR":
      return <IconCurrencyEuro size={size} />;
    case "CFA":
      return <IconCurrency size={size} />;
    case "RMB":
      return <IconCurrencyYen size={size} />;
    case "AED":
      return <IconCurrencyDirham size={size} />;
    case "GNF":
      return <IconCurrencyCent size={size} />;
  }
  return <IconCurrency size={size} />;
};

export const getCryptoIcon = (currency: CryptoCurrency, size: number) => {
  switch (currency) {
    case "BTC":
      return <IconCurrencyBitcoin size={size} />;
    case "ETH":
      return <IconCurrencyEthereum size={size} />;
    case "USDT":
      return <IconBrandTether size={size} />;
  }
  return <IconCurrency size={size} />;
};

export const getMoneyPrefix = (currency: Currency | undefined) => {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "CFA":
      return "CFA";
    case "RMB":
      return "¥";
    case "AED":
      return "Dhs";
    case "GNF":
      return "FG";
  }
  return "$";
};

export const getCryptoPrefix = (currency: CryptoCurrency) => {
  switch (currency) {
    case "BTC":
      return "₿";
    case "ETH":
      return "Ξ";
    case "USDT":
      return "₮";
  }
  return "";
};
