import { OfficeResponse } from "@/lib/client";
import { OfficeCurrency } from "@/lib/types";
import { getMoneyIcon } from "@/lib/utils";
import { Group, NumberInput, Select, Stack } from "@mantine/core";
import { IconPercentage } from "@tabler/icons-react";

interface Props {
  form: any;
  office: OfficeResponse;
  walletID: string;
  agents: { value: string; label: string }[];
}

export default function WalletDeposit({ form, office, walletID, agents }: Props) {
  const simpleWallet = office.wallets?.find((w) => w.walletID === walletID && w.wallet_type === "SIMPLE");
  const currencies: OfficeCurrency[] = office.currencies as unknown as OfficeCurrency[];

  const baseCurrency = currencies.find((c) => c.base);
  if (!simpleWallet) {
    return null;
  }

  return (
    <Stack>
      <Group grow>
        <Select
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
          decimalScale={4}
          allowDecimal
          allowNegative={false}
        />
        <NumberInput
          label="Deposit Rate (%)"
          required
          value={form.values.trading_rate}
          onChange={(value) => form.setFieldValue("trading_rate", Number(value))}
          thousandSeparator=","
          decimalScale={4}
          allowDecimal
          allowNegative={false}
          leftSection={<IconPercentage size={16} />}
        />
      </Group>
      <Group grow>
        <NumberInput
          label={"Wallet Deposit (" + simpleWallet.trading_currency + ")"}
          leftSection={getMoneyIcon(simpleWallet.trading_currency)}
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
          decimalScale={4}
          allowDecimal
          allowNegative={false}
        />
        <NumberInput
          label={"Provider Payment (" + simpleWallet.trading_currency + ")"}
          leftSection={getMoneyIcon(baseCurrency!.name)}
          value={form.values.payment_in_main}
          thousandSeparator=","
          decimalScale={4}
          allowDecimal
          allowNegative={false}
        />
      </Group>
    </Stack>
  );
}
