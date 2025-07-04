"use client";
import { enablePartnerBalanceTracking } from "@/lib/actions/wallet";
import { OfficeWalletResponse } from "@/lib/client";
import { Badge, Group, NumberFormatter, Switch, Title } from "@mantine/core";
import { Fragment, useState } from "react";
import { decodeNotification } from "../notifications/notifications";
import { getMoneyPrefix } from "@/lib/utils";

export default function WalletPartnerBalance({ wallet }: { wallet: OfficeWalletResponse }) {
  if (!wallet.balance_tracking_enabled) {
    return <DisabledWalletPartnerBalance wallet={wallet} />;
  }
  return (
    <Group>
      <Title order={4}>Partner Balance</Title>
      <Badge radius={"md"} size="xl" variant="dot" color="blue">
        <NumberFormatter
          value={wallet.partner_balance}
          thousandSeparator
          decimalScale={4}
          prefix={getMoneyPrefix(wallet.trading_currency)}
        />
      </Badge>
    </Group>
  );
}

function DisabledWalletPartnerBalance({ wallet }: { wallet: OfficeWalletResponse }) {
  const [checked, setChecked] = useState(wallet.balance_tracking_enabled);
  const enableTracking = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.currentTarget.checked);
    const response = await enablePartnerBalanceTracking(wallet.walletID, event.currentTarget.checked);
    decodeNotification("Tracking", response);
  };
  return (
    <Fragment>
      <Group>
        <Title order={4}>Partner Balance</Title>
        <Title order={5}>Disabled</Title>
      </Group>
      <Group>
        <Switch
          defaultChecked={wallet.balance_tracking_enabled}
          checked={checked}
          onLabel="ON"
          size="md"
          offLabel="OFF"
          label="Enable Partner Balance Tracking"
          onChange={enableTracking}
        />
      </Group>
    </Fragment>
  );
}
