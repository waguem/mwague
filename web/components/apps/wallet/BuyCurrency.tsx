import { OfficeResponse } from "@/lib/client";
import { getCryptoIcon, getMoneyIcon } from "@/lib/utils";
import { Group, Select, NumberInput, Divider } from "@mantine/core";

interface Props {
  form: any;
  office: OfficeResponse;
  walletID: string;
  agents: { value: string; label: string }[];
}
type FormInput = {
  tradeType: "BUY" | "SELL" | "EXCHANGE";
};
export function BuyCurrency({ office, form, walletID, agents }: Props) {
  const wallet = office?.wallets?.find((wallet) => wallet.walletID === walletID)!;
  const currencies: any[] = office?.currencies as any[];
  const mainCurrency = currencies.find((currency: any) => currency.main);
  const baseCurrency = currencies.find((currency: any) => currency.base);
  const exchange_wallet = office?.wallets?.find((wallet) => wallet.walletID === form.values?.exchange_with);

  return (
    <>
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
        <Select
          placeholder="Provider"
          required
          label="Provider"
          data={agents}
          value={form.values.customer}
          onChange={(value) => form.setFieldValue("customer", value)}
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
            form.setValues((values: any) => ({
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
    </>
  );
}
