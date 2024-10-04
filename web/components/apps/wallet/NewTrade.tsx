import { z } from "zod";
import { tradeWallet } from "@/lib/actions";
import { Currency, OfficeResponse } from "@/lib/client";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  Stack,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconGitPullRequest, IconMessage2, IconSend } from "@tabler/icons-react";
import { useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";
import { TradeWallet, WalletTradeRequest } from "@/lib/schemas";
import { BuyCurrency } from "./BuyCurrency";
import { ExchangeCurrency } from "./ExchanceCurrency";
import { SellCurrency } from "./SellCurrency";

interface FormInput {
  tradeType: "BUY" | "SELL" | "EXCHANGE";
  daily_rate: number;
  trading_rate: number;
  amount: number;
  payment_in_main: number;
  payment_in_base: number;
  exchange_with?: string;
  exchange_rate?: number;
  customer?: string;
  selling_currency?: string;
  message?: string;
}
interface Props {
  walletID: string;
  office: OfficeResponse;
  agents: {
    label: string;
    value: string;
  }[];
}

export function NewTrade({ walletID, office, agents }: Props) {
  const [opened, { close, open }] = useDisclosure(false);
  const [pending, startTransition] = useTransition();

  const wallet = office?.wallets?.find((wallet) => wallet.walletID === walletID)!;
  const currencies: any[] = office?.currencies as any[];
  const baseCurrency = currencies.find((currency: any) => currency.base);

  const form = useForm<FormInput>({
    initialValues: {
      tradeType: "BUY",
      daily_rate: baseCurrency?.defaultRate ?? 0,
      trading_rate: 0,
      payment_in_main: 0,
      payment_in_base: 0,
      amount: 0,
      exchange_with: "",
      exchange_rate: 0,
      customer: "",
      selling_currency: wallet?.trading_currency,
    },
  });

  const trade = async () => {
    try {
      let request: WalletTradeRequest;
      switch (form.values.tradeType) {
        case "BUY":
          request = {
            request_type: "BUY",
            provider: form.values.customer ?? "",
          };
          break;
        case "SELL":
          request = {
            request_type: "SELL",
            customer: form.values.customer ?? "",
            currency: (form.values.selling_currency ?? "") as Currency,
          };
          break;
        case "EXCHANGE":
          request = {
            request_type: "EXCHANGE",
            walletID: form.values.exchange_with ?? "",
            exchange_rate: Number(form.values.exchange_rate),
          };
          break;
      }

      const data: z.infer<typeof TradeWallet> = {
        trading_type: form.values.tradeType,
        amount: form.values.amount,
        walletID: walletID,
        daily_rate: form.values.daily_rate,
        trading_rate: form.values.trading_rate,
        request: request,
        message: form.values.message,
      };
      const response = await tradeWallet(data, `/dashboard/wallet/${walletID}`);

      decodeNotification("Trade Wallet", response);

      if (response.status === "success") {
        close();
      }
    } catch (e) {}
  };
  const getTradeResult = () => {
    if (form.values.tradeType !== "SELL") {
      return 0;
    }

    const walletRate = wallet.crypto_balance / wallet.trading_balance;
    const valueRate = wallet.value / wallet.crypto_balance;

    let selling = form.values?.exchange_rate ? form.values.amount / form.values.exchange_rate : 0;

    if (wallet.crypto_currency === wallet.crypto_currency) {
      // USDT selling
      const sellingCost = (form.values.amount * wallet.value) / wallet.crypto_balance;
      selling = form.values.amount * (form.values.trading_rate! / form.values.daily_rate);
      return selling - sellingCost;
    }
    // how much the amount that we are selling might worth when we buyed it.
    // basically we spent wallet.trading_balance to buy wallet.crypto_balance

    const amount_in_crypto = form.values.amount * walletRate;
    const sellingCost = amount_in_crypto * valueRate;
    return selling - sellingCost;
  };
  const getForm = () => {
    switch (form.values.tradeType) {
      case "BUY":
        return <BuyCurrency agents={agents} office={office} walletID={walletID} form={form} />;
      case "EXCHANGE":
        return <ExchangeCurrency agents={agents} office={office} walletID={walletID} form={form} />;
      case "SELL":
        return <SellCurrency agents={agents} office={office} walletID={walletID} form={form} />;
    }
  };
  return (
    <>
      <Button variant="gradient" size="compact-md" onClick={open}>
        <ActionIcon>
          <IconGitPullRequest size={18} />
        </ActionIcon>
        New Trade
      </Button>
      <Modal
        centered
        onClose={close}
        opened={opened}
        title={
          <Group>
            <IconGitPullRequest size={20} />
            Wallet Rate:
            <Badge size="lg" variant="dot" color="violet" radius={"md"}>
              1 {"$"} ={" "}
              <NumberFormatter
                value={wallet?.value ? wallet?.trading_balance / wallet?.value : 0}
                thousandSeparator
                decimalScale={6}
              />{" "}
              {wallet?.trading_currency}
            </Badge>
            <Badge size="lg" variant="dot" color="teal" radius={"md"}>
              1 {wallet?.crypto_currency} ={" "}
              <NumberFormatter
                value={wallet?.crypto_balance ? wallet?.value / wallet?.crypto_balance : 0}
                thousandSeparator
                decimalScale={6}
              />{" "}
              {"$"}
            </Badge>
            {form.values.tradeType === "SELL" && (
              <>
                Trade Result :
                <Badge size="lg" variant="dot" color="teal" radius={"md"}>
                  <NumberFormatter value={getTradeResult()} thousandSeparator decimalScale={2} />
                </Badge>
              </>
            )}
          </Group>
        }
        size="70%"
      >
        <LoadingOverlay
          visible={pending}
          loaderProps={{
            children: <Loader size={32} color="blue" />,
          }}
        />
        <form action={() => startTransition(() => trade())}>
          <Stack>
            {getForm()}
            <Group grow>
              <Textarea
                value={form.values.message}
                onChange={(e) => form.setFieldValue("message", e.currentTarget.value)}
                placeholder="Message"
                label={
                  <Group>
                    <IconMessage2 size={20} />
                    Message
                  </Group>
                }
              />
            </Group>
            <Divider label="Review" />
            <Button type="submit" color="blue">
              <IconSend size={18} className="mr-1" />
              {form.values.tradeType}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
