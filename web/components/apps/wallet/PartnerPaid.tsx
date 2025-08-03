import { updatePartnerPaid } from "@/lib/actions/wallet";
import { WalletTradingResponse } from "@/lib/client";
import { Badge, Group, Switch } from "@mantine/core";
import { useState } from "react";
import { decodeNotification } from "../notifications/notifications";

interface PartnerPaidProps {
  trading: WalletTradingResponse;
}

export default function PartnerPaid({ trading }: PartnerPaidProps) {
  const [checked, setChecked] = useState(trading.partner_paid ?? false);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.currentTarget.checked);
    if (event.currentTarget.checked) {
      try {
        const response = await updatePartnerPaid(trading.code ?? "");
        decodeNotification("Update Partner Paid", response);
      } catch (e) {}
    }
  };
  if (!["SELL", "SIMPLE SELL"].includes(trading.trading_type)) {
    return "N/A";
  }
  if (trading.partner_paid) {
    return (
      <Badge size="lg" variant="dot">
        YES
      </Badge>
    );
  }
  return (
    <Group grow>
      <Switch size="xl" checked={checked} onChange={onChange} onLabel="PAID" offLabel="UNPAID" />
    </Group>
  );
}
