"use client";
import {
  AccountResponse,
  AgentReponseWithAccounts,
  OfficeResponse,
  OfficeWalletResponse,
  TransactionState,
  WalletTradingResponse,
} from "@/lib/client";
import { ActionIcon, Badge, Button, Group, MantineColor, Tooltip } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo, useState, useTransition } from "react";
import { NewTrade } from "./NewTrade";
import { getAccountOptions, getMoneyPrefix, getStateBadge } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { PayTrade } from "./PaymentTrade";
import { isArray } from "lodash";
import { TradingDetail } from "./TradingDetail";
import CommitTrade from "./CommitTrade";
import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";
import { exportTradingData } from "@/lib/pdf/generator";
import EditTrading from "./EditTrading";
import TradeRateDisplay from "./Displays/TradeRateDisplay";
import AmountDisplay from "./Displays/AmountDisplay";
import ValuationDisplay from "./Displays/ValuationDisplay";

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
        header: "Customer",
        accessorKey: "account",
        size: 80,
        Cell: ({ row }) => (
          <Badge radius={"md"} variant="dot" color={getReviewBadgeColor(row.original.trading_type)} size="md">
            {row.original.account}
          </Badge>
        ),
      },
      {
        header: "Rate",
        accessorKey: "trading_rate",
        size: 50,
        Cell: ({ cell, row }) => <TradeRateDisplay cell={cell} row={row} />,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        size: 100,
        Cell: ({ cell, row }) => {
          return <AmountDisplay cell={cell} row={row} />;
        },
      },
      {
        header: "State",
        accessorKey: "state",
        size: 80,
        Cell: ({ cell }) => {
          return (
            <Group>
              <Badge size="md" {...getStateBadge(cell.getValue() as TransactionState)}>
                {cell.getValue() as string}
              </Badge>
            </Group>
          );
        },
      },
      {
        header: "Valuation",
        accessorKey: "trading_cost",
        size: 100,
        Cell: ({ row }) => {
          const wallet = getWallet(row.original);
          return <ValuationDisplay wallet={wallet} row={row} />;
        },
      },
      {
        header: "Partner Paid",
        accessorKey: "partner_paid",
        size: 60,
        Cell: ({ row }) => {
          return (
            <Group>
              <Badge size="md" variant="dot" color={row.original.partner_paid ? "green" : "red"}>
                {row.original.partner_paid ? "Yes" : "No"}
              </Badge>
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
