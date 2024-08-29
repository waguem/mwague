"use client";
import {
  AccountResponse,
  AgentReponseWithAccounts,
  OfficeResponse,
  OfficeWalletResponse,
  TransactionState,
  WalletTradingResponse,
} from "@/lib/client";
import { Badge, Group, MantineColor, NumberFormatter, Tooltip } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { NewTrade } from "./NewTrade";
import { getCryptoPrefix, getMoneyPrefix, getStateBadge } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { PayTrade } from "./PaymentTrade";
import { isArray } from "lodash";
import { HoverMessage } from "./HoverMessage";

interface Props {
  office: OfficeResponse;
  wallet: OfficeWalletResponse;
  tradings: WalletTradingResponse[];
  officeAccounts: AccountResponse[];
  agents: AgentReponseWithAccounts[];
}

export function WalletTransactions({ office, wallet, tradings, officeAccounts, agents }: Props) {
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

  const agentAccountsOptions = agents
    ?.filter((agent) => isArray(agent.accounts))
    .map((agent) => agent.accounts)
    .flat()
    .map((account) => ({
      label: account!.initials,
      value: account!.initials,
    }));

  const columns = useMemo<MRT_ColumnDef<WalletTradingResponse>[]>(
    () => [
      {
        header: "Type",
        accessorKey: "trading_type",
        Cell: ({ cell, row }) => (
          <>
            <Badge variant="outline" color={getReviewBadgeColor(cell.getValue() as string)} size="md">
              {cell.getValue() as string}
              {cell.getValue() === "EXCHANGE" ? (row?.original?.walletID === wallet?.walletID ? " Out" : " In") : ""}
            </Badge>
            {cell.getValue() === "EXCHANGE" && (
              <>
                {" "}
                <Badge variant="outline" color="gray" size="md">
                  {row.original?.walletID} &harr; {row.original?.exchange_walletID}
                </Badge>
              </>
            )}

            {cell.getValue() !== "EXCHANGE" && (
              <>
                {" "}
                &harr;{" "}
                <Badge variant="outline" color="gray" size="md">
                  {row.original?.account}
                </Badge>
              </>
            )}
          </>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        Cell: ({ cell, row }) => {
          return (
            <Badge size="md" variant="dot" color="violet">
              <NumberFormatter
                value={cell.getValue() as number}
                thousandSeparator=","
                decimalScale={3}
                prefix={
                  row.original.trading_type === "SELL"
                    ? getMoneyPrefix(wallet?.trading_currency)
                    : getCryptoPrefix(wallet.crypto_currency)
                }
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
        header: "Rates",
        accessorKey: "daily_rate",
        enableEditing: false,
        Cell: ({ cell, row }) => (
          <>
            <NumberFormatter value={cell.getValue() as number} thousandSeparator="," decimalScale={3} /> /{" "}
            <NumberFormatter value={row?.original?.trading_rate as number} thousandSeparator="," decimalScale={3} />
          </>
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
          <NewTrade agents={agentAccountsOptions} office={office} walletID={wallet.walletID} />
          <Badge size="lg" variant="gradient" gradient={{ from: "cyan", to: "pink", deg: 120 }}>
            {wallet.walletID}
          </Badge>
          <Badge variant="dot" color="gray" size="lg">
            Balance:{" "}
            <NumberFormatter
              thousandSeparator=","
              prefix={getCryptoPrefix(wallet.crypto_currency)}
              decimalScale={3}
              value={wallet.crypto_balance}
            />{" "}
            &harr;{" "}
            <NumberFormatter
              thousandSeparator=","
              prefix={getMoneyPrefix(wallet?.trading_currency)}
              decimalScale={3}
              value={wallet.trading_balance}
            />
          </Badge>
          <Badge variant="dot" color="teal" size="lg">
            Buying :{" "}
            <NumberFormatter
              thousandSeparator=","
              prefix={getCryptoPrefix(wallet.crypto_currency)}
              value={tradings.filter((t) => t.trading_type === "BUY").reduce((acc, t) => acc + t.amount, 0)}
            />
          </Badge>
          <Badge variant="dot" color="pink" size="lg">
            Selling :{" "}
            <NumberFormatter
              thousandSeparator=","
              prefix={getCryptoPrefix(wallet.crypto_currency)}
              value={tradings.filter((t) => t.trading_type === "SELL").reduce((acc, t) => acc + t.amount, 0)}
            />
          </Badge>
          <Badge variant="dot" color="cyan" size="lg">
            Exchange :{" "}
            <NumberFormatter
              thousandSeparator=","
              prefix={getCryptoPrefix(wallet.crypto_currency)}
              value={tradings.filter((t) => t.trading_type === "EXCHANGE").reduce((acc, t) => acc + t.amount, 0)}
            />
          </Badge>
        </Group>
      );
    },
    renderRowActions: ({ row }) => {
      const firstMessage = isArray(row.original.notes) ? (row.original.notes[0] as any) : "";
      const message = firstMessage.message;
      return (
        <Group gap="xs">
          <Tooltip label="Pay">
            <PayTrade accounts={officeAccounts} trade={row.original as WalletTradingResponse} wallet={wallet} />
          </Tooltip>
          {firstMessage && (
            <Tooltip label="Message">
              <HoverMessage message={message} />
            </Tooltip>
          )}
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
