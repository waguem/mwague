import { tradeWallet } from "@/lib/actions";
import { OfficeResponse, TradingType } from "@/lib/client";
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

interface FormInput {
  tradeType: "BUY" | "SELL" | "EXCHANGE";
  daily_rate: number;
  trading_rate: number;
  amount: number;
  payment_in_main: number;
  payment_in_base: number;
}
export function NewTrade({ walletID, office }: { walletID: string; office: OfficeResponse }) {
  const [opened, { close, open }] = useDisclosure(false);
  const [pending, startTransition] = useTransition();

  const wallet = office?.wallets?.find((wallet) => wallet.walletID === walletID)!;
  const currencies: any[] = office?.currencies as any[];
  const mainCurrency = currencies.find((currency: any) => currency.main);
  const baseCurrency = currencies.find((currency: any) => currency.base);

  const form = useForm({
    initialValues: {
      tradeType: "BUY",
      daily_rate: baseCurrency?.defaultRate ?? 0,
      trading_rate: 0,
      payment_in_main: 0,
      payment_in_base: 0,
      amount: 0,
    },
  });

  const trade = async () => {
    try {
      const response = await tradeWallet(
        {
          amount: form.values.amount,
          daily_rate: form.values.daily_rate,
          trading_rate: form.values.trading_rate,
          trading_type: form.values.tradeType as TradingType,
          walletID: walletID,
        },
        `/dashboard/wallet/${walletID}`
      );

      decodeNotification("Trade Wallet", response);

      if (response.status === "success") {
        close();
      }
    } catch (e) {}
  };
  return (
    <>
      <Button size="compact-md" onClick={open}>
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
                  { value: "Exchange", label: "Exchange" },
                ]}
                required
                value={form.values.tradeType}
                onChange={(value) => form.setFieldValue("tradeType", value as FormInput["tradeType"])}
              />
              <NumberInput
                label="Daily Rate"
                required
                value={form.values.daily_rate}
                onChange={(value) => form.setFieldValue("daily_rate", Number(value))}
              />
            </Group>
            <Group grow>
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
            </Group>
            <Divider my="xs" label="Payment" />
            <Group grow>
              <NumberInput
                label={mainCurrency?.name + " Amount"}
                leftSection={getMoneyIcon(mainCurrency?.name ?? "USD", 16)}
                value={form.values.payment_in_main}
                thousandSeparator=","
                decimalScale={4}
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
                    value={wallet.crypto_balance + form.values.amount}
                    decimalScale={4}
                  />
                </Text>
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
