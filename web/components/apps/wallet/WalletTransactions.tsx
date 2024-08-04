"use client";
import { OfficeResponse, OfficeWalletResponse, TransactionState, WalletTradingResponse } from "@/lib/client";
import { Badge, MantineColor, NumberFormatter } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { NewTrade } from "./NewTrade";
import { getCryptoPrefix, getStateBadge } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";

interface Props {
  office: OfficeResponse;
  wallet: OfficeWalletResponse;
  tradings: WalletTradingResponse[];
}

export function WalletTransactions({ office, wallet, tradings }: Props) {
  const getReviewBadgeColor = (type: string): MantineColor => {
    switch (type) {
      case "BUY":
        return "cyan";
      case "SELL":
        return "pink";
      case "EXCHANGE":
        return "blue";
      default:
        return "gray";
    }
  };

  const columns = useMemo<MRT_ColumnDef<WalletTradingResponse>[]>(
    () => [
      {
        header: "Type",
        accessorKey: "trading_type",
        Cell: ({ cell }) => (
          <Badge variant="outline" color={getReviewBadgeColor(cell.getValue() as string)} size="md">
            {cell.getValue() as string}
          </Badge>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        Cell: ({ cell }) => {
          return (
            <Badge size="md" variant="dot" color="violet">
              <NumberFormatter
                value={cell.getValue() as number}
                thousandSeparator=","
                decimalScale={3}
                prefix={getCryptoPrefix(wallet.crypto_currency)}
              />
            </Badge>
          );
        },
      },
      {
        header: "State",
        accessorKey: "state",
        Cell: ({ cell }) => {
          return (
            <Badge size="md" {...getStateBadge(cell.getValue() as TransactionState)}>
              {cell.getValue() as string}
            </Badge>
          );
        },
      },
      {
        header: "Daily Rate",
        accessorKey: "daily_rate",
        enableEditing: false,
      },
      {
        header: "Trading Rate",
        accessorKey: "trading_rate",
      },
      {
        header: "Date",
        accessorKey: "created_at",
        Cell: ({ cell }) => (
          <Badge variant="dot" color="gray" size="sm" style={{ marginLeft: 0 }}>
            {formatDistanceToNowStrict(new Date(cell.getValue() as string), {
              addSuffix: true,
              roundingMethod: "ceil",
            })}
          </Badge>
        ),
      },
      {
        header: "Balance",
        accessorKey: "initial_balance",
        Cell: ({ cell }) => (
          <NumberFormatter
            value={cell.getValue() as number}
            thousandSeparator=","
            decimalScale={3}
            prefix={getCryptoPrefix(wallet.crypto_currency)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const table = useMantineReactTable({
    columns,
    data: tradings,
    renderTopToolbarCustomActions: () => {
      return <NewTrade office={office} walletID={wallet.walletID} />;
    },
    initialState: {
      density: "xs",
      showColumnFilters: false,
    },
  });
  return (
    <div>
      <MantineReactTable table={table} />
    </div>
  );
}
