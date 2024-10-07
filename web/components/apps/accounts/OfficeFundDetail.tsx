"use client";
import { AccountResponse, FundCommit, OfficeResponse } from "@/lib/client";
import { Badge, Button, Group, NumberFormatter } from "@mantine/core";
import { formatDistanceToNowStrict } from "date-fns";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { isArray } from "lodash";
import DateRangePicker from "@/components/layouts/date-range-picker";
import { IconArrowDown, IconArrowUp, IconDownload } from "@tabler/icons-react";
import { getMoneyPrefix } from "@/lib/utils";
import { generateFundReport } from "@/lib/pdf/generator";
interface Props {
  office: OfficeResponse;
  commits: FundCommit[];
  fund: AccountResponse;
}

export const OfficeFundDetail = ({ commits, fund }: Props) => {
  const memoizedCommits = useMemo(() => {
    if (!commits || !isArray(commits)) return [];
    return commits.sort((a, b) => new Date(b.date ?? "").getTime() - new Date(a.date ?? "").getTime());
  }, [commits]);

  const columns = useMemo<MRT_ColumnDef<FundCommit>[]>(
    () => [
      {
        header: "Date & Time",
        accessorKey: "date",
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.date ?? "").getTime() > new Date(rowB.original.date ?? "").getTime() ? -1 : 1;
        },
        Cell: ({ cell }) => (
          <Badge variant="dot" color="dark" size="lg" radius="sm">
            {formatDistanceToNowStrict(cell.getValue() as string, { addSuffix: true })}
          </Badge>
        ),
      },
      {
        header: "Fund In",
        accessorKey: "variation",
        id: "fund_in",
        Cell: ({ cell, row }) => (
          <>
            {!row.original.is_out ? (
              <Badge variant="dot" color="teal" size="xl">
                <NumberFormatter decimalScale={2} prefix={"$"} value={cell.getValue() as number} thousandSeparator />
              </Badge>
            ) : (
              <Badge variant="dot" color="red" size="xl">
                <IconArrowDown color="red" size={12} />
              </Badge>
            )}
          </>
        ),
        Footer: () => (
          <Badge variant="outline" color="blue" size="lg">
            Total &#8658; {""}
            <NumberFormatter
              prefix="$"
              decimalScale={2}
              thousandSeparator
              value={table
                .getFilteredRowModel()
                .rows.reduce((acc, row) => acc + (row?.original?.is_out ? 0 : (row.original.variation as number)), 0)}
            />
          </Badge>
        ),
      },
      {
        header: "Fund Out",
        accessorKey: "variation",
        id: "fund_out",
        Cell: ({ cell, row }) => (
          <>
            {row.original.is_out ? (
              <Badge variant="dot" color="red" size="xl">
                <NumberFormatter decimalScale={2} prefix={"$"} value={cell.getValue() as number} thousandSeparator />
              </Badge>
            ) : (
              <Badge variant="dot" color="teal" size="xl">
                <IconArrowUp color="teal" size={12} />
              </Badge>
            )}
          </>
        ),
        Footer: () => (
          <Badge variant="outline" color="blue" size="lg">
            Total &#8658; {""}
            <NumberFormatter
              prefix="$"
              decimalScale={2}
              thousandSeparator
              value={table
                .getFilteredRowModel()
                .rows.reduce((acc, row) => acc + (row?.original?.is_out ? (row.original.variation as number) : 0), 0)}
            />
          </Badge>
        ),
      },
      {
        header: "Balance",
        accessorKey: "v_from",
        Cell: ({ cell }) => (
          <Badge size="xl" variant="dot" color={Number(cell.getValue() as number) >= 0 ? "cyan" : "red"} radius={"sm"}>
            <NumberFormatter decimalScale={2} prefix={"$"} value={cell.getValue() as number} thousandSeparator />
          </Badge>
        ),
      },
      {
        header: "Account",
        accessorKey: "account",
      },
      {
        header: "Description",
        accessorKey: "description",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const table = useMantineReactTable({
    data: memoizedCommits,
    columns,
    renderTopToolbarCustomActions: ({ table }) => (
      <Group>
        <DateRangePicker />
        <Button
          radius={"md"}
          variant="outline"
          size="xs"
          onClick={() =>
            generateFundReport({
              commits: table.getPrePaginationRowModel().rows.map((row) => row.original),
              fund,
            })
          }
        >
          Export PDF
          <IconDownload size={20} className="ml-2" />
        </Button>
      </Group>
    ),
    renderBottomToolbarCustomActions: () => (
      <Group>
        Fund Balance :
        <Badge size="xl" radius={"md"} variant="dot" color="blue">
          <NumberFormatter
            decimalScale={2}
            thousandSeparator
            prefix={getMoneyPrefix(fund.currency)}
            value={fund.balance}
          />
        </Badge>
      </Group>
    ),
    initialState: {
      sorting: [
        {
          id: "date",
          desc: true,
        },
      ],
    },
  });
  return <MantineReactTable table={table} />;
};
