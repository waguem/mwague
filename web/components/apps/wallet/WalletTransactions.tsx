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
import { formDateToMyLocal, getCryptoPrefix, getMoneyPrefix, getStateBadge } from "@/lib/utils";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { PayTrade } from "./PaymentTrade";
import { isArray } from "lodash";
import { HoverMessage } from "./HoverMessage";
import { TradingDetail } from "./TradingDetail";

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
        header: "Code",
        accessorKey: "code",
        size: 100,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        Cell: ({ cell, row }) => {
          return (
            <Group>
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
              <Badge variant="dot">
                <NumberFormatter
                  value={row.original.trading_rate}
                  thousandSeparator=","
                  decimalScale={3}
                  prefix={"$"}
                />{" "}
                /{" "}
                <NumberFormatter value={row.original.daily_rate} thousandSeparator="," decimalScale={3} prefix={"$"} />
              </Badge>
            </Group>
          );
        },
      },
      {
        header: "Type",
        accessorKey: "trading_type",
        size: 100,
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
        header: "State",
        accessorKey: "state",
        Cell: ({ cell, row }) => {
          const firstMessage = isArray(row.original.notes) ? (row.original.notes[0] as any) : "";
          const message = firstMessage.message;
          return (
            <Group>
              <Badge size="md" {...getStateBadge(cell.getValue() as TransactionState)}>
                {cell.getValue() as string}
              </Badge>
              {firstMessage && (
                <Tooltip label="Message">
                  <HoverMessage show message={message} />
                </Tooltip>
              )}
            </Group>
          );
        },
      },
      {
        header: "Date",
        accessorKey: "created_at",
        Cell: ({ cell }) => (
          <Group>
            <Badge>{formatDate(cell.getValue(), "dd MMM")}</Badge>
            <Badge variant="dot" color="gray" size="sm" style={{ marginLeft: 0 }}>
              {formatDistanceToNowStrict(formDateToMyLocal(cell.getValue() as string), {
                addSuffix: true,
                roundingMethod: "ceil",
              })}
            </Badge>
          </Group>
        ),
      },
      {
        header: "Balance",
        accessorKey: "wallet_crypto",
        size: 100,
        Cell: ({ cell }) => (
          <Badge variant="dot" size="md" radius={"md"}>
            <NumberFormatter
              value={cell.getValue() as number}
              thousandSeparator=","
              decimalScale={3}
              prefix={getCryptoPrefix(wallet.crypto_currency)}
            />
          </Badge>
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
    positionActionsColumn: "last",
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
      return (
        <Group gap="xs">
          <Tooltip label="Pay">
            <PayTrade accounts={officeAccounts} trade={row.original as WalletTradingResponse} wallet={wallet} />
          </Tooltip>
          {row.original.trading_type === "SELL" && (
            <Tooltip label="Show details">
              <TradingDetail trading={row.original as WalletTradingResponse} />
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
