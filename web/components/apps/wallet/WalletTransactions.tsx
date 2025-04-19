"use client";
import {
  AccountResponse,
  AgentReponseWithAccounts,
  OfficeResponse,
  OfficeWalletResponse,
  TransactionState,
  WalletTradingResponse,
} from "@/lib/client";
import { ActionIcon, Badge, Button, Group, MantineColor, NumberFormatter, Tooltip } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo, useState, useTransition } from "react";
import { NewTrade } from "./NewTrade";
import { getAccountOptions, getMoneyPrefix, getStateBadge } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { PayTrade } from "./PaymentTrade";
import { isArray } from "lodash";
import { HoverMessage } from "./HoverMessage";
import { TradingDetail } from "./TradingDetail";
import CommitTrade from "./CommitTrade";
import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";
import { exportTradingData } from "@/lib/pdf/generator";
import EditTrading from "./EditTrading";

interface Props {
  office: OfficeResponse;
  wallet?: OfficeWalletResponse | undefined;
  tradings: WalletTradingResponse[];
  officeAccounts: AccountResponse[];
  agents: AgentReponseWithAccounts[];
}

export function WalletTransactions({ office, wallet, tradings, officeAccounts, agents }: Props) {
  const clipboard = useClipboard({ timeout: 500 });
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
  const [pending, startTransition] = useTransition();
  const agentAccountsOptions = getAccountOptions(null, agents);

  const getWallet = (trading: WalletTradingResponse) => {
    return office.wallets?.find((w) => w.walletID == trading.walletID)!;
  };
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
  const columns = useMemo<MRT_ColumnDef<WalletTradingResponse>[]>(
    () => [
      {
        header: "Code",
        accessorKey: "code",
        size: 100,
        Cell: ({ cell, row }) => {
          const [copied, setCopied] = useState(false);
          const wallet = office.wallets?.find((w) => w.walletID == row.original.walletID)!;
          const handleCopyClick = () => {
            const message = isArray(row.original.notes) ? row.original.notes[0].message : "";
            const msg = `${wallet.wallet_name}\n${(+row.original.amount.toFixed(2)).toLocaleString()}${getMoneyPrefix(
              wallet.trading_currency
            )}\n${(+row.original.trading_amount.toFixed(2)).toLocaleString()}$\nCODE : ${
              row.original.code
            }\n${message}`;
            clipboard.copy(msg);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 0.5 seconds
          };

          return (
            <Group>
              <Tooltip label="Copy Transaction" position="left">
                <ActionIcon onClick={handleCopyClick} size={20} variant="outline">
                  {copied ? <IconCheck color="teal" size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
              <Badge radius={"sm"} variant="dot" color={getReviewBadgeColor(row.original.trading_type)} size="md">
                {cell.getValue() as string}
              </Badge>
            </Group>
          );
        },
      },
      {
        header: "Type",
        accessorKey: "trading_type",
        size: 100,
        Cell: ({ row }) => (
          <Badge radius={"sm"} variant="dot" color={getReviewBadgeColor(row.original.trading_type)} size="md">
            {row.original.trading_type}
          </Badge>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        size: 100,
        Cell: ({ cell, row }) => {
          return (
            <Badge radius={"sm"} size="md" variant="dot" color="violet">
              <NumberFormatter
                value={cell.getValue() as number}
                thousandSeparator=","
                decimalScale={2}
                prefix={getMoneyPrefix(get_currency(row?.original))}
              />
            </Badge>
          );
        },
      },
      {
        header: "Crypto",
        accessorKey: "trading_crypto",
        size: 100,
        Cell: ({ cell, row }) => {
          const wallet = getWallet(row.original);
          return (
            <Badge size="md" radius={"sm"} variant="dot" color="violet">
              <NumberFormatter
                value={cell.getValue() as number}
                thousandSeparator=","
                decimalScale={2}
                prefix={getMoneyPrefix(
                  wallet.wallet_type == "CRYPTO" ? wallet.crypto_currency : wallet.trading_currency
                )}
              />
            </Badge>
          );
        },
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
        size: 100,
        Cell: ({ cell }) => (
          <Group>
            {/* <Badge variant="dot">{formatDate(cell.getValue() as string, "dd MMM")}</Badge> */}
            <Badge variant="dot" color="gray" size="sm" style={{ marginLeft: 0 }}>
              {formatDistanceToNowStrict(cell.getValue() as string, {
                addSuffix: true,
                roundingMethod: "ceil",
              })}
            </Badge>
          </Group>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const walletOptions = office?.wallets?.map((wallet) => ({
    value: wallet.walletID ?? "",
    label: wallet.wallet_name ?? "",
  }));

  const table = useMantineReactTable({
    columns,
    data: tradings,
    enableEditing: true,
    positionActionsColumn: "last",
    renderTopToolbarCustomActions: ({ table }) => {
      if (!wallet) {
        return null;
      }
      return (
        <Group>
          <NewTrade agents={agentAccountsOptions} office={office} walletID={wallet.walletID} />
          <Tooltip label="Export Data to pdf">
            <Button
              onClick={() =>
                startTransition(() =>
                  exportTradingData(
                    wallet,
                    table.getPrePaginationRowModel().rows.map((row) => row.original)
                  )
                )
              }
              variant="gradient"
              size="xs"
              leftSection={<IconDownload size={16} />}
            >
              Export to PDF
            </Button>
          </Tooltip>
        </Group>
      );
    },
    renderRowActions: ({ row }) => {
      const wallet = getWallet(row.original);
      return (
        <Group gap="xs">
          <Tooltip label="Show details">
            <TradingDetail trading={row.original as WalletTradingResponse} wallet={wallet} />
          </Tooltip>
          {["BUY", "DEPOSIT"].includes(row.original.trading_type) && (
            <Group grow>
              <Tooltip label="Pay">
                <PayTrade
                  office={office}
                  accounts={officeAccounts}
                  trade={row.original as WalletTradingResponse}
                  wallet={wallet}
                />
              </Tooltip>
            </Group>
          )}
          {["SELL"].includes(row.original.trading_type) && (
            <CommitTrade trade={row.original as WalletTradingResponse} wallet={wallet} />
          )}
          <EditTrading walletOptions={walletOptions!} accountOptions={agentAccountsOptions} trading={row.original} />
        </Group>
      );
    },
    initialState: {
      density: "xs",
      showColumnFilters: false,
      sorting: [
        {
          id: "created_at",
          desc: true,
        },
      ],
    },
    state: {
      showProgressBars: pending,
    },
  });
  return (
    <div>
      <MantineReactTable table={table} />
    </div>
  );
}
