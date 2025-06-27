import { OfficeWalletResponse, WalletTradingResponse } from "@/lib/client";
import { getMoneyPrefix } from "@/lib/utils";
import { Badge, NumberFormatter } from "@mantine/core";
import { MRT_Row } from "mantine-react-table";

interface Props {
  wallet: OfficeWalletResponse;
  row: MRT_Row<WalletTradingResponse>;
}
export default function ValuationDisplay({ row }: Props) {
  let value = row.original.trading_cost;
  if (row.original.trading_type === "SELL") {
    value = row.original.trading_amount;
  }

  return (
    <Badge radius={"sm"} size="md" variant="dot" color="violet">
      <NumberFormatter value={value as number} thousandSeparator="," decimalScale={2} prefix={getMoneyPrefix("USD")} />
    </Badge>
  );
}
