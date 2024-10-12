import { Currency, OfficeResponse } from "@/lib/client";
import { currencyOptions, getCryptoIcon, getMoneyIcon } from "@/lib/utils";
import { Select, NumberInput, Group, Divider } from "@mantine/core";

interface Props {
  form: any;
  office: OfficeResponse;
  walletID: string;
  agents: { value: string; label: string }[];
}

export function ExchangeCurrency({ form, office, walletID }: Props) {
  const wallet = office?.wallets?.find((wallet) => wallet.walletID === walletID)!;
  const currencies: any[] = office?.currencies as any[];
  const mainCurrency = currencies.find((currency: any) => currency.main);
  const baseCurrency = currencies.find((currency: any) => currency.base);
  const exchange_wallet = office?.wallets?.find((wallet) => wallet.walletID === form.values?.exchange_with);
  const walletOptions = office?.wallets
    ?.filter((wallet) => wallet.walletID !== walletID && wallet.wallet_type === "CRYPTO")
    .map((wallet) => ({
      value: wallet.walletID ?? "",
      label: wallet.wallet_name ?? "",
    }));

  return (
    <>
      <Group grow>
        <Select
          searchable
          label="Exchange Currency"
          required
          placeholder="Select a currency"
          data={currencyOptions}
          value={form.values.exchange_currency}
          onChange={(value) => form.setFieldValue("exchange_currency", value as Currency)}
        />
        <NumberInput
          label="Daily Rate"
          required
          value={form.values.daily_rate}
          onChange={(value) => form.setFieldValue("daily_rate", Number(value))}
        />
      </Group>
      <Divider my="xs" label="Exchange With" />
      <Group grow>
        <Select
          searchable
          label="to Wallet"
          data={walletOptions}
          required
          value={form.values.exchange_with}
          onChange={(value) => form.setFieldValue("exchange_with", value as string)}
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
