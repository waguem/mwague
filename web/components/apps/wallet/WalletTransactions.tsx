"use client";
import {
  AccountResponse,
  OfficeResponse,
  OfficeWalletResponse,
  TransactionState,
  WalletTradingResponse,
} from "@/lib/client";
import { Badge, Group, MantineColor, NumberFormatter, Tooltip } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { NewTrade } from "./NewTrade";
import { getCryptoPrefix, getStateBadge } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { PayTrade } from "./PaymentTrade";

interface Props {
  office: OfficeResponse;
  wallet: OfficeWalletResponse;
  tradings: WalletTradingResponse[];
  officeAccounts: AccountResponse[];
}

export function WalletTransactions({ office, wallet, tradings, officeAccounts }: Props) {
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
        header: "Daily Rate ",
        accessorKey: "daily_rate",
        enableEditing: false,
        Cell: ({ cell }) => (
          <NumberFormatter value={cell.getValue() as number} thousandSeparator="," decimalScale={3} />
        ),
      },
      {
        header: "Trading Rate ",
        accessorKey: "trading_rate",
        Cell: ({ cell }) => (
          <NumberFormatter value={cell.getValue() as number} thousandSeparator="," decimalScale={3} />
        ),
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
    enableEditing: true,

    renderTopToolbarCustomActions: () => {
      return (
        <Group>
          <NewTrade office={office} walletID={wallet.walletID} />
          <Badge variant="dot" color="pink" size="lg">
            Pendings :{" "}
            <NumberFormatter
              thousandSeparator=","
              prefix={getCryptoPrefix(wallet.crypto_currency)}
              value={tradings.filter((t) => t.state === "PENDING").reduce((acc, t) => acc + t.amount, 0)}
            />
          </Badge>
          <Badge variant="dot" color="cyan" size="lg">
            PAID :{" "}
            <NumberFormatter
              thousandSeparator=","
              prefix={getCryptoPrefix(wallet.crypto_currency)}
              value={tradings.filter((t) => t.state === "PAID").reduce((acc, t) => acc + t.amount, 0)}
            />
          </Badge>
        </Group>
      );
    },
    renderRowActions: ({ row }) => {
      return (
        <Group gap="xs">
          <Tooltip label="Pay">
            <PayTrade accounts={officeAccounts} trade={row.original as WalletTradingResponse} wallet={wallet} />
          </Tooltip>
        </Group>
      );
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
