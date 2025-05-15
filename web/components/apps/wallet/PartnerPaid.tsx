import { updatePartnerPaid } from "@/lib/actions/wallet";
import { WalletTradingResponse } from "@/lib/client";
import { Button, Group, Loader, Switch } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";

interface PartnerPaidProps {
  trading: WalletTradingResponse;
}

export default function PartnerPaid({ trading }: PartnerPaidProps) {
  const [checked, setChecked] = useState(trading.partner_paid ?? false);
  const [pending, startTransition] = useTransition();

  const handleSave = async () => {
    try {
      const response = await updatePartnerPaid(trading.code ?? "");
      decodeNotification("Update Partner Paid", response);
    } catch (e) {}
  };
  if (trading.trading_type !== "SELL") {
    return "N/A";
  }
  return (
    <Group grow>
      <Switch checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} />
      <Button
        size="compact-xs"
        variant="gradient"
        gradient={{ from: "green", to: "teal" }}
        disabled={trading.partner_paid == checked && trading.partner_paid != null}
        onClick={() => {
          startTransition(() => {
            handleSave();
          });
        }}
      >
        {pending ? <Loader color="blue" size={16} className="mr-2" /> : <IconCheck size={16} className="mr-2" />}
        Save
      </Button>
    </Group>
  );
}
