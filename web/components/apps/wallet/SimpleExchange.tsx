import { Currency, OfficeResponse } from "@/lib/client";
import { currencyOptions, getCryptoIcon, getCryptoPrefix, getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import { Badge, Divider, Group, NumberFormatter, NumberInput, Select, Stack } from "@mantine/core";

interface Props {
  office: OfficeResponse;
  walletID: string;
  form: any;
}
export default function SimpleExchange({ form, walletID, office }: Props) {
  const options = office.wallets
    ?.filter((w) => w.wallet_type == "SIMPLE")
    .map((w) => ({
      label: w.wallet_name ?? "",
      value: w.walletID ?? "",
    }));
  const sourceWallet = office.wallets?.find((w) => w.walletID === walletID);
  const selectedWallet = office.wallets?.find(
    (w) => w.walletID !== walletID && w.walletID === form.values.exchange_with
  );
  console.log(form.values);

  return (
    <Stack>
      <Group grow>
        <Select
          label="Simple Wallet"
          required
          searchable
          placeholder="Select a Simple Wallet"
          value={form.values.exchange_with}
          onChange={(value) => form.setFieldValue("exchange_with", value as string)}
          data={options}
        />
        <Select
          label="Exchange Currency"
          required
          placeholder="Select a currency"
          data={currencyOptions}
          value={form.values.exchange_currency}
          onChange={(value) => form.setFieldValue("exchange_currency", value as Currency)}
        />
        <NumberInput
          label={"Daily Rate"}
          required
          value={form.values.daily_rate}
          onChange={(value) => form.setFieldValue("daily_rate", Number(value))}
          thousandSeparator=","
          decimalScale={4}
          allowDecimal
          allowNegative={false}
        />
      </Group>
      <Group grow>
        <NumberInput
          label={`Selling Rate (${sourceWallet?.crypto_currency} to ${sourceWallet?.trading_currency})`}
          required
          thousandSeparator
          decimalScale={6}
          allowDecimal
          allowNegative={false}
          value={form.values.selling_rate}
          leftSection={getMoneyIcon(sourceWallet?.trading_currency)}
          onChange={(value) => {
            const rate = Number(value);
            form.setValues((values: any) => ({
              ...values,
              selling_rate: rate,
            }));
          }}
        />
        <NumberInput
          label={`${sourceWallet?.crypto_currency} to ${form.values.exchange_currency} Rate`}
          required
          thousandSeparator
          decimalScale={6}
          allowDecimal
          allowNegative={false}
          value={form.values.exchange_rate}
          leftSection={getMoneyIcon(form.values.exchange_currency)}
          onChange={(value) => {
            const rate = Number(value);
            form.setValues((values: any) => ({
              ...values,
              exchange_rate: rate,
            }));
          }}
        />
        <NumberInput
          label={`${selectedWallet?.trading_currency} to ${form.values.exchange_currency} Rate`}
          required
          thousandSeparator
          decimalScale={6}
          allowDecimal
          allowNegative={false}
          value={form.values.trading_rate}
          leftSection={getMoneyIcon(form.values.exchange_currency)}
          onChange={(value) => {
            const rate = Number(value);
            form.setValues((values: any) => ({
              ...values,
              trading_rate: rate,
            }));
          }}
        />
      </Group>
      <Group grow>
        <NumberInput
          label={sourceWallet?.crypto_currency + " Amount"}
          leftSection={getCryptoIcon(sourceWallet?.crypto_currency ?? "USDT", 16)}
          value={form.values.amount}
          thousandSeparator=","
          decimalScale={2}
          allowDecimal
          allowNegative={false}
          onChange={(value) => {
            const amount = Number(value);
            form.setValues((values: any) => ({
              ...values,
              amount,
              payment_in_main: amount * values.exchange_rate,
              payment_in_base: amount * (values.exchange_rate / values.trading_rate),
            }));
          }}
        />
        <NumberInput
          label={form.values.exchange_currency + " Amount"}
          leftSection={getMoneyIcon(form.values.exchange_currency)}
          value={form.values.payment_in_main}
          thousandSeparator=","
          decimalScale={2}
          allowDecimal
          allowNegative={false}
          onChange={(value) => {
            const amount = Number(value);
            form.setValues((values: any) => ({
              ...values,
              amount: amount / values.exchange_rate,
              payment_in_main: amount,
              payment_in_base: amount / values.trading_rate,
            }));
          }}
        />
        <NumberInput
          label={selectedWallet?.trading_currency + " Amount"}
          leftSection={getMoneyIcon(selectedWallet?.trading_currency ?? "USD", 16)}
          value={form.values.payment_in_base}
          thousandSeparator=","
          decimalScale={2}
          allowDecimal
          allowNegative={false}
          onChange={(value) => {
            const amount = Number(value);
            form.setValues((values: any) => ({
              ...values,
              payment_in_base: amount,
              payment_in_main: amount * values.trading_rate,
              amount: (amount * values.trading_rate) / values.exchange_rate,
            }));
          }}
        />
      </Group>
      <Divider label="Review" />
      <Group grow>
        <Badge variant="dot" size="lg">
          Exchange{" "}
          <NumberFormatter
            value={form.values.amount}
            thousandSeparator
            decimalScale={3}
            prefix={getCryptoPrefix(sourceWallet?.crypto_currency ?? "USDT")}
          />{" "}
          /{" "}
          <NumberFormatter
            value={form.values.amount * (Number(sourceWallet?.value) / Number(sourceWallet?.crypto_balance))}
            thousandSeparator
            decimalScale={3}
            prefix={getMoneyPrefix("USD")}
          />
        </Badge>
        <Badge variant="dot" size="lg">
          Exchange Value{" "}
          <NumberFormatter
            value={form.values.amount}
            thousandSeparator
            decimalScale={3}
            prefix={getCryptoPrefix(sourceWallet?.crypto_currency ?? "USDT")}
          />{" "}
          /{" "}
          <NumberFormatter
            value={form.values.amount * (Number(form.values.selling_rate) / Number(form.values.daily_rate))}
            thousandSeparator
            decimalScale={3}
            prefix={getMoneyPrefix("USD")}
          />
        </Badge>
        <Badge variant="dot" size="lg">
          Benefit{" "}
          <NumberFormatter
            value={
              form.values.amount * (Number(form.values.selling_rate) / Number(form.values.daily_rate)) -
              form.values.amount * (Number(sourceWallet?.value) / Number(sourceWallet?.crypto_balance))
            }
            thousandSeparator
            decimalScale={3}
            prefix={getMoneyPrefix("USD")}
          />
        </Badge>
      </Group>
    </Stack>
  );
}
