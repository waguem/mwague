import { WalletTradingResponse } from "@/lib/client";
import { getMoneyPrefix } from "@/lib/utils";
import { Badge, NumberFormatter } from "@mantine/core";
import { MRT_Cell, MRT_Row } from "mantine-react-table";

export default function AmountDisplay({
  row,
}: {
  cell: MRT_Cell<WalletTradingResponse, unknown>;
  row: MRT_Row<WalletTradingResponse>;
}) {
  let value = row.original.amount;
  if (row.original.trading_type === "EXCHANGE") {
    value = row.original.amount * (row.original.exchange_rate ?? 1);
  }

  const get_currency = (trade: WalletTradingResponse) => {
    switch (trade.trading_type) {
      case "BUY":
      case "DEPOSIT":
        return trade.trading_currency;
      case "SELL":
        return trade.selling_currency;
      case "EXCHANGE":
      case "EXCHANGE WITH SIMPLE WALLET":
        return trade.exchange_currency;
    }
  };

  return (
    <Badge radius={"sm"} size="md" variant="dot" color="violet">
      <NumberFormatter
        value={value as number}
        thousandSeparator=","
        decimalScale={2}
        prefix={getMoneyPrefix(get_currency(row?.original))}
      />
    </Badge>
  );
}
// This component displays the trading type and rate in a formatted manner.
