"use client";
import { TransactionState, WalletTradingResponse } from "@/lib/client";
import { Badge, Group, MantineColor, NumberFormatter, Tooltip } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { getStateBadge } from "@/lib/utils";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { isArray } from "lodash";
import { HoverMessage } from "./HoverMessage";
import { TradingDetail } from "./TradingDetail";

interface Props {
  tradings: WalletTradingResponse[];
}

export function TradingsTable({ tradings }: Props) {
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
                  prefix={"$"}
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
            <Badge>{formatDate(cell.getValue() as string, "dd MMM")}</Badge>
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
  const table = useMantineReactTable({
    columns,
    data: tradings,
    enableEditing: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => {
      return (
        <Group gap="xs">
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
