import { z } from "zod";
import { tradeWallet } from "@/lib/actions";
import { Currency, OfficeResponse } from "@/lib/client";
import { getCryptoIcon, getCryptoPrefix, getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconGitPullRequest, IconSend } from "@tabler/icons-react";
import { useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";
import { TradeWallet, WalletTradeRequest } from "@/lib/schemas";

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
  const mainCurrency = currencies.find((currency: any) => currency.main);
  const baseCurrency = currencies.find((currency: any) => currency.base);
  const walletOptions = office?.wallets
    ?.filter((wallet) => wallet.walletID !== walletID)
    .map((wallet) => ({
      value: wallet.walletID,
      label: wallet.walletID,
    }));

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

  const exchange_wallet = office?.wallets?.find((wallet) => wallet.walletID === form.values?.exchange_with);
  const trade = async () => {
    try {
      let request: WalletTradeRequest;
      switch (form.values.tradeType) {
        case "BUY":
          request = {
            request_type: "BUY",
            provider: "Office",
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
        trading_rate:
          Number(form.values.trading_rate) > 0 ? form.values.trading_rate : Number(form.values.exchange_rate),
        request: request,
      };

      const response = await tradeWallet(data, `/dashboard/wallet/${walletID}`);

      decodeNotification("Trade Wallet", response);

      if (response.status === "success") {
        close();
      }
    } catch (e) {}
  };
  return (
    <>
      <Button variant="gradient" size="compact-md" onClick={open}>
        <ActionIcon>
          <IconGitPullRequest size={18} />
        </ActionIcon>
        New Trade
      </Button>
      <Modal centered onClose={close} opened={opened} title={wallet?.crypto_currency + " Trading"} size="lg">
        <LoadingOverlay
          visible={pending}
          loaderProps={{
            children: <Loader size={32} color="blue" />,
          }}
        />
        <form action={() => startTransition(() => trade())}>
          <Stack>
            <Group grow>
              <Select
                placeholder="Select Trade Type"
                label="Trade Type"
                data={[
                  { value: "BUY", label: "Buy" },
                  { value: "SELL", label: "Sell" },
                  { value: "EXCHANGE", label: "Exchange" },
                ]}
                required
                value={form.values.tradeType}
                onChange={(value) => form.setFieldValue("tradeType", value as FormInput["tradeType"])}
              />
              {form.values.tradeType === "SELL" && (
                <Select
                  placeholder="Selling Currency"
                  label="Selling Currency"
                  data={[
                    { label: wallet?.crypto_currency, value: wallet?.crypto_currency },
                    { label: wallet?.trading_currency, value: wallet?.trading_currency },
                  ]}
                  required
                  value={form.values.selling_currency}
                  onChange={(value) => form.setFieldValue("selling_currency", value as FormInput["selling_currency"])}
                />
              )}
              {form.values.tradeType !== "SELL" && (
                <NumberInput
                  label="Daily Rate"
                  required
                  value={form.values.daily_rate}
                  onChange={(value) => form.setFieldValue("daily_rate", Number(value))}
                />
              )}
            </Group>
            {form.values.tradeType === "EXCHANGE" && (
              <>
                <Divider my="xs" label="Exchange With" />
                <Group grow>
                  <Select
                    label="to Wallet"
                    data={walletOptions}
                    required
                    value={form.values.exchange_with}
                    onChange={(value) => form.setFieldValue("exchange_with", value as FormInput["exchange_with"])}
                  />
                  <NumberInput
                    label="Exchange Rate"
                    required
                    value={form.values.exchange_rate}
                    onChange={(value) => form.setFieldValue("exchange_rate", Number(value))}
                    thousandSeparator=","
                    decimalScale={4}
                    allowDecimal
                    allowNegative={false}
                    leftSection={getMoneyIcon(exchange_wallet?.trading_currency ?? "USD", 16)}
                  />
                </Group>
              </>
            )}

            {form.values.tradeType === "SELL" && (
              <>
                <Divider my="xs" label="Customer" />
                <Group grow>
                  <Select
                    label="Customer Account"
                    data={agents}
                    required
                    value={form.values.customer}
                    onChange={(value) => form.setFieldValue("customer", value as FormInput["customer"])}
                  />
                  <NumberInput
                    label="Selling Rate"
                    required
                    value={form.values.exchange_rate}
                    onChange={(value) => form.setFieldValue("exchange_rate", Number(value))}
                    thousandSeparator=","
                    decimalScale={4}
                    allowDecimal
                    allowNegative={false}
                    leftSection={getMoneyIcon(exchange_wallet?.trading_currency ?? "USD", 16)}
                  />
                </Group>
              </>
            )}
            <Group grow>
              {form.values.tradeType !== "SELL" && (
                <NumberInput
                  label={wallet?.crypto_currency + " to " + baseCurrency?.name + " Rate"}
                  required
                  leftSection={getMoneyIcon(baseCurrency?.name ?? "USD", 16)}
                  value={form.values.trading_rate}
                  onChange={(value) => form.setFieldValue("trading_rate", Number(value))}
                  thousandSeparator=","
                  decimalScale={4}
                  allowDecimal
                  allowNegative={false}
                />
              )}

              {form.values.tradeType === "SELL" && (
                <NumberInput
                  label={"Daily Rate"}
                  required
                  leftSection={getMoneyIcon(baseCurrency?.name ?? "USD", 16)}
                  value={form.values.daily_rate}
                  onChange={(value) => form.setFieldValue("daily_rate", Number(value))}
                  thousandSeparator=","
                  decimalScale={4}
                  allowDecimal
                  allowNegative={false}
                />
              )}
              {form.values.tradeType !== "SELL" && (
                <NumberInput
                  label={wallet?.crypto_currency + " Amount"}
                  required
                  leftSection={getCryptoIcon(wallet?.crypto_currency ?? "BTC", 16)}
                  value={form.values.amount}
                  thousandSeparator=","
                  decimalScale={4}
                  allowDecimal
                  onChange={(value) => {
                    const amount = Number(value);
                    form.setValues((values) => ({
                      ...values,
                      amount,
                      payment_in_main: amount * (form.values.trading_rate / form.values.daily_rate),
                      payment_in_base: amount * form.values.trading_rate,
                    }));
                  }}
                  allowNegative={false}
                />
              )}
              {form.values.tradeType === "SELL" && (
                <NumberInput
                  label={form.values.selling_currency + " Amount"}
                  required
                  leftSection={
                    form.values?.selling_currency === wallet?.crypto_currency
                      ? getCryptoIcon(wallet?.crypto_currency ?? "BTC", 16)
                      : getMoneyIcon(wallet?.trading_currency ?? "USD", 16)
                  }
                  value={form.values.amount}
                  thousandSeparator=","
                  decimalScale={4}
                  allowDecimal
                  onChange={(value) => {
                    const amount = Number(value);
                    let payment_in_main = amount * (Number(form.values.exchange_rate) / form.values.daily_rate);
                    if (form.values.tradeType === "SELL" && Number(form.values.exchange_rate) > 0) {
                      if (form.values.selling_currency === wallet?.trading_currency) {
                        payment_in_main = amount / Number(form.values.exchange_rate);
                      }
                    }
                    form.setValues((values) => ({
                      ...values,
                      amount,
                      payment_in_main: payment_in_main,
                      payment_in_base: payment_in_main * form.values.daily_rate,
                    }));
                  }}
                  allowNegative={false}
                />
              )}
            </Group>

            <Divider my="xs" label="Payment" />
            <Group grow>
              <NumberInput
                label={mainCurrency?.name + " Amount"}
                leftSection={getMoneyIcon(mainCurrency?.name ?? "USD", 16)}
                value={form.values.payment_in_main}
                thousandSeparator=","
                decimalScale={2}
                allowDecimal
                allowNegative={false}
              />
              <NumberInput
                label={baseCurrency?.name + " Amount"}
                leftSection={getMoneyIcon(baseCurrency?.name ?? "USD", 16)}
                value={form.values.payment_in_base}
                thousandSeparator=","
                decimalScale={4}
                allowDecimal
                allowNegative={false}
              />
              {form.values.tradeType === "EXCHANGE" && form.values.exchange_rate && (
                <NumberInput
                  label={exchange_wallet?.trading_currency + " Amount"}
                  leftSection={getMoneyIcon(baseCurrency?.name ?? "USD", 16)}
                  value={form.values.amount * form.values.exchange_rate}
                  thousandSeparator=","
                  decimalScale={4}
                  allowDecimal
                  allowNegative={false}
                />
              )}
            </Group>
            <Divider my="xs" label="Summary" />
            <Group grow>
              <Card withBorder shadow="xs" padding="xs" radius="sm">
                <Text mt="sm" c="dimmed" size="sm">
                  Your wallet has currently{" "}
                  <Text span inherit c="var(--mantine-color-anchor)">
                    <NumberFormatter
                      thousandSeparator={","}
                      prefix={getCryptoPrefix(wallet?.crypto_currency ?? "BTC")}
                      value={wallet.crypto_balance}
                      decimalScale={4}
                    />
                  </Text>
                  {". "}
                  Your new balance will be{" "}
                  <NumberFormatter
                    thousandSeparator={","}
                    prefix={getCryptoPrefix(wallet?.crypto_currency ?? "BTC")}
                    value={
                      form.values.tradeType === "BUY"
                        ? wallet.crypto_balance + form.values.amount
                        : wallet.crypto_balance - form.values.amount
                    }
                    decimalScale={4}
                  />
                </Text>
                {form.values.tradeType === "BUY" && (
                  <Text mt="sm" c="dimmed" size="sm">
                    Trading Payment{" "}
                    <Text span inherit c="var(--mantine-color-anchor)">
                      <NumberFormatter
                        thousandSeparator={","}
                        prefix={getMoneyPrefix(mainCurrency?.name ?? "BTC")}
                        value={form.values.payment_in_main}
                        decimalScale={4}
                      />{" "}
                      /{" "}
                      <NumberFormatter
                        thousandSeparator={","}
                        prefix={getMoneyPrefix(baseCurrency?.name ?? "BTC")}
                        value={form.values.payment_in_base}
                        decimalScale={4}
                      />
                    </Text>
                    {". "}
                  </Text>
                )}
                {form.values.tradeType === "EXCHANGE" && (
                  <Text mt="sm" c="dimmed" size="sm">
                    {form.values.exchange_with} In{" "}
                    <Text span inherit c="var(--mantine-color-anchor)">
                      <NumberFormatter
                        thousandSeparator={","}
                        prefix={getCryptoPrefix(
                          office?.wallets?.find((wallet) => wallet.walletID === form.values.exchange_with)
                            ?.crypto_currency ?? "BTC"
                        )}
                        value={form.values.payment_in_main}
                        decimalScale={4}
                      />{" "}
                      /{" "}
                      <NumberFormatter
                        thousandSeparator={","}
                        prefix={getMoneyPrefix(baseCurrency?.name ?? "BTC")}
                        value={form.values.payment_in_base}
                        decimalScale={4}
                      />
                    </Text>
                    {". "}
                  </Text>
                )}
              </Card>
            </Group>
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
