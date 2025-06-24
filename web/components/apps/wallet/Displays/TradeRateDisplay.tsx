import { WalletTradingResponse } from "@/lib/client";
import { Badge, NumberFormatter } from "@mantine/core";
import { MRT_Cell, MRT_Row } from "mantine-react-table";

export default function TradeRateDisplay({
  row,
}: {
  cell: MRT_Cell<WalletTradingResponse, unknown>;
  row: MRT_Row<WalletTradingResponse>;
}) {
  let value = row.original.trading_rate;
  if (row.original.trading_type === "EXCHANGE WITH SIMPLE WALLET") {
    value = row.original.selling_rate ?? row.original.trading_rate;
  }

  return (
    <Badge radius={"sm"} size="md" variant="dot" color="blue">
      <NumberFormatter value={value as number} thousandSeparator="," decimalScale={3} />
    </Badge>
  );
}
// This component displays the trading type and rate in a formatted manner.
