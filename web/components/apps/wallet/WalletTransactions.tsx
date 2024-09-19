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
import { useMemo, useState } from "react";
import { NewTrade } from "./NewTrade";
import { formDateToMyLocal, getCryptoPrefix, getMoneyPrefix, getStateBadge } from "@/lib/utils";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { PayTrade } from "./PaymentTrade";
import { isArray } from "lodash";
import { HoverMessage } from "./HoverMessage";
import { TradingDetail } from "./TradingDetail";
import CommitTrade from "./CommitTrade";
import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";
import { exportTradingData } from "@/lib/pdf/generator";

interface Props {
  office: OfficeResponse;
  wallet: OfficeWalletResponse;
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
        // size: 150,
        Cell: ({ cell, row }) => {
          const [copied, setCopied] = useState(false);

          const handleCopyClick = () => {
            clipboard.copy(cell.getValue() as string);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 0.5 seconds
          };

          return (
            <Group>
              <Tooltip label="Copy code" position="left">
                <ActionIcon onClick={handleCopyClick} size={20} variant="outline">
                  {copied ? <IconCheck color="teal" size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
              <Badge variant="dot" color={getReviewBadgeColor(row.original.trading_type)} size="md">
                {cell.getValue() as string}
              </Badge>
              <Badge variant="dot" color={getReviewBadgeColor(row.original.trading_type)} size="md">
                {row.original.trading_type}
              </Badge>
            </Group>
          );
        },
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
            <Badge variant="dot">{formatDate(cell.getValue() as string, "dd MMM")}</Badge>
            <Badge variant="dot" color="gray" size="sm" style={{ marginLeft: 0 }}>
              {formatDistanceToNowStrict(formDateToMyLocal(cell.getValue() as string), {
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
  const table = useMantineReactTable({
    columns,
    data: tradings,
    enableEditing: true,
    positionActionsColumn: "last",
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Group>
          <NewTrade agents={agentAccountsOptions} office={office} walletID={wallet.walletID} />
          <Tooltip label="Export Data to pdf">
            <Button
              onClick={() =>
                exportTradingData(
                  wallet,
                  table.getPrePaginationRowModel().rows.map((row) => row.original)
                )
              }
              variant="gradient"
              size="xs"
              leftSection={<IconDownload size={16} />}
            >
              Export to PDF
            </Button>
          </Tooltip>
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
          {row.original.trading_type === "BUY" && (
            <Tooltip label="Pay">
              <PayTrade accounts={officeAccounts} trade={row.original as WalletTradingResponse} wallet={wallet} />
            </Tooltip>
          )}

          {row.original.trading_type === "SELL" && (
            <CommitTrade trade={row.original as WalletTradingResponse} wallet={wallet} />
          )}
          <Tooltip label="Show details">
            <TradingDetail trading={row.original as WalletTradingResponse} />
          </Tooltip>
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
  });
  return (
    <div>
      <MantineReactTable table={table} />
    </div>
  );
}
