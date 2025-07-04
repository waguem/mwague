import { OfficeResponse } from "@/lib/client";
import { OfficeCurrency } from "@/lib/types";
import { getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import { Group, NumberInput, Select, Stack } from "@mantine/core";
import { IconPercentage } from "@tabler/icons-react";

interface Props {
  form: any;
  office: OfficeResponse;
  walletID: string;
  agents: { value: string; label: string }[];
}

export default function WalletDeposit({ form, office, walletID, agents }: Props) {
  const wallet = office.wallets?.find((w) => w.walletID === walletID);
  const currencies: OfficeCurrency[] = office.currencies as unknown as OfficeCurrency[];
  const baseCurrency = currencies.find((c) => c.base);
  if (!wallet) {
    return null;
  }
  const isCryptoWallet = wallet!.wallet_type == "CRYPTO";

  return (
    <Stack>
      <Group grow>
        <Select
          searchable
          label="Provider"
          data={agents}
          required
          value={form.values.customer}
          onChange={(value) => form.setFieldValue("customer", value as string)}
        />
        <NumberInput
          label={"Daily Rate"}
          required
          leftSection={getMoneyIcon(baseCurrency!.name)}
          value={form.values.daily_rate}
          onChange={(value) => form.setFieldValue("daily_rate", Number(value))}
          thousandSeparator=","
          decimalScale={3}
          allowDecimal
          allowNegative={false}
        />
        <NumberInput
          label={"Deposit Rate " + (isCryptoWallet ? `${wallet!.trading_currency}` : "(%)")}
          required
          value={form.values.trading_rate}
          onChange={(value) => form.setFieldValue("trading_rate", Number(value))}
          thousandSeparator=","
          decimalScale={4}
          allowDecimal
          allowNegative={false}
          leftSection={isCryptoWallet ? getMoneyPrefix(wallet!.trading_currency) : <IconPercentage size={16} />}
        />
      </Group>
      <Group grow>
        <NumberInput
          label={"Wallet Deposit (" + (isCryptoWallet ? "USD" : wallet.trading_currency) + ")"}
          leftSection={getMoneyIcon(isCryptoWallet ? "USD" : wallet.trading_currency)}
          value={form.values.amount}
          thousandSeparator=","
          onChange={(value) => {
            const amount = Number(value);
            form.setValues((values: any) => ({
              ...values,
              amount,
              payment_in_main: amount * (1 + form.values.trading_rate / 100),
              payment_in_base: form.values.daily_rate * amount * (1 + form.values.trading_rate / 100),
            }));
          }}
          decimalScale={2}
          allowDecimal
          allowNegative={false}
        />
        <NumberInput
          label={"Provider Payment (" + baseCurrency!.name + ")"}
          leftSection={getMoneyIcon(baseCurrency!.name)}
          value={form.values.payment_in_base}
          thousandSeparator=","
          decimalScale={2}
          allowDecimal
          allowNegative={false}
        />
        <NumberInput
          label={"Provider Payment (" + wallet.trading_currency + ")"}
          leftSection={getMoneyIcon(baseCurrency!.name)}
          value={isCryptoWallet ? form.values.amount * form.values.trading_rate : form.values.payment_in_main}
          thousandSeparator=","
          decimalScale={2}
          allowDecimal
          allowNegative={false}
          onChange={(value) => {
            const amount = Number(value);
            const deposit_rate = amount / form.values.amount;
            form.setValues((values: any) => ({
              ...values,
              trading_rate: deposit_rate,
            }));
          }}
        />
      </Group>
    </Stack>
  );
}
