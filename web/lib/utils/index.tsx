import { BadgeVariant, MantineColor, MantineGradient } from "@mantine/core";
import {
  AgentReponseWithAccounts,
  AgentType,
  CryptoCurrency,
  Currency,
  ResultType,
  TradingType,
  TransactionState,
  TransactionType,
  WalletType,
} from "../client";
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
  { value: "Angola", label: "Angola", code: "AO" },
  { value: "Congo", label: "Congo", code: "CG" },
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
  { value: "NA", label: "SIMPLE" },
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
    case "TRADING":
      return "indigo";
    default:
      return "gray";
  }
};

export const getBadgeTypeFromResult = (result_type: ResultType): MantineColor => {
  switch (result_type) {
    case "BENEFIT":
      return "green";
    case "EXPENSE":
      return "red";
    case "CHARGE":
      return "dark";
    case "LOSS":
      return "red";
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

export const getMoneyIcon = (currency: Currency | undefined, size: number = 16) => {
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

export const getCryptoIcon = (currency: CryptoCurrency, size: number = 16) => {
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

export const getMoneyPrefix = (currency: Currency | CryptoCurrency | string | undefined) => {
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
      return " aed ";
    case "GNF":
    case "USDT":
      return "₮";
    case "NA":
      return "";
  }
  return "";
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

export const getAccountOptions = (type: AgentType | null, agents: AgentReponseWithAccounts[]) => {
  return agents
    .filter((agent) => (type ? agent.accounts && agent.type === type : agent.accounts?.length))
    .map((agent) => {
      return agent.accounts!.map((account) => ({
        label: `[${account.type}]  ${account.initials} ${agent.name} ${account.currency} `,
        value: account.initials,
      }));
    })
    .flat();
};

export const tradeOptions: {
  value: TradingType;
  label: string;
  wallet: WalletType | "ALL";
}[] = [
  { value: "BUY", label: "Buy", wallet: "CRYPTO" },
  { value: "SELL", label: "Sell From CRYPTO Wallet", wallet: "CRYPTO" },
  { value: "SIMPLE SELL", label: "Sell From SIMPLE Wallet", wallet: "SIMPLE" },
  { value: "DEPOSIT", label: "Wallet Deposit", wallet: "SIMPLE" },
  { value: "EXCHANGE", label: "Exchange with Crypto Wallet", wallet: "CRYPTO" },
  { value: "EXCHANGE WITH SIMPLE WALLET", label: "Exchange with Simple Wallet", wallet: "CRYPTO" },
];

export const defaultTags = ["FOOD", "SALARY", "CHARGES", "BOSS EXPENSE", "BOSS BENEFIT"];

export const CANCELLATION_REASON = ["Duplicated", "Mistake", "Agent Cancelled"];

export const reviewTags = ["Invalid Infos", "Duplicated", "Cancelled", "Error", "Everything is fine"];

export const FOREX_TAGS = ["ALI PAY", "TT RMB", "BANKTT"];
