import { OfficeResponse } from "@/lib/client";
import { getCryptoIcon, getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import { Stack, Group, Select, NumberInput, Divider,Text,NumberFormatter, Badge } from "@mantine/core";



interface Props {
  form: any;
  office: OfficeResponse;
  walletID: string;
  agents: { value: string; label: string }[];
}

export function SellCurrency({ form, office, walletID, agents }: Props) {
  const wallet = office?.wallets?.find((wallet) => wallet.walletID === walletID)!;
  const currencies: any[] = office?.currencies as any[];
  const mainCurrency = currencies.find((currency: any) => currency.main);
  const baseCurrency = currencies.find((currency: any) => currency.base);

  return (
    <>
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
            onChange={(value) => form.setFieldValue("tradeType", value as string)}
          />

          <Select
            placeholder="Selling Currency"
            label="Selling Currency"
            data={[
              { label: wallet?.crypto_currency, value: wallet?.crypto_currency },
              { label: wallet?.trading_currency, value: wallet?.trading_currency },
            ]}
            required
            value={form.values.selling_currency}
            onChange={(value) => form.setFieldValue("selling_currency", value as string)}
          />
        </Group>

        <Divider my="xs" label="Customer" />
        <Group grow>
          <Select
            label="Customer Account"
            data={agents}
            required
            value={form.values.customer}
            onChange={(value) => form.setFieldValue("customer", value as string)}
          />
          <NumberInput
            label="Selling Rate"
            required
            value={form.values.trading_rate}
            onChange={(value) => form.setFieldValue("trading_rate", Number(value))}
            thousandSeparator=","
            decimalScale={4}
            allowDecimal
            allowNegative={false}
            leftSection={getMoneyIcon(wallet?.trading_currency ?? "USD", 16)}
          />
        </Group>
        <Group grow>
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
              let payment_in_main = amount * (Number(form.values.trading_rate) / form.values.daily_rate);
              if (form.values.tradeType === "SELL" && Number(form.values.trading_rate) > 0) {
                if (form.values.selling_currency === wallet?.trading_currency) {
                  payment_in_main = amount / Number(form.values.trading_rate);
                }
              }
              form.setValues((values: any) => ({
                ...values,
                amount,
                payment_in_main: payment_in_main,
                payment_in_base: payment_in_main * form.values.daily_rate,
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
        </Group>
      </Stack>
    </>
  );
}
