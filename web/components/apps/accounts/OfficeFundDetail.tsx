"use client";
import { FundCommit, OfficeResponse } from "@/lib/client";
import { Badge, Box, NumberFormatter } from "@mantine/core";
import { formatDistanceToNowStrict } from "date-fns";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { isArray } from "lodash";
import DateRangePicker from "@/components/layouts/date-range-picker";
interface Props {
  office: OfficeResponse;
  commits: FundCommit[];
}

export const OfficeFundDetail = ({ commits }: Props) => {
  const memoizedCommits = useMemo(() => {
    if (!commits || !isArray(commits)) return [];
    return commits.sort((a, b) => new Date(b.date ?? "").getTime() - new Date(a.date ?? "").getTime());
  }, [commits]);

  const columns = useMemo<MRT_ColumnDef<FundCommit>[]>(
    () => [
      {
        header: "Date & Time",
        accessorKey: "date",
        Cell: ({ cell }) => (
          <Badge variant="dot" color="dark">
            {formatDistanceToNowStrict(new Date(cell.getValue() as string))}
          </Badge>
        ),
      },
      {
        header: "Balance",
        accessorKey: "v_from",
        Cell: ({ cell }) => (
          <Badge variant="dot" color="cyan">
            <NumberFormatter decimalScale={2} prefix={"$"} value={cell.getValue() as number} thousandSeparator />
          </Badge>
        ),
      },
      {
        header: "Amount",
        accessorKey: "variation",
        Cell: ({ cell }) => (
          <Badge variant="dot" color="cyan">
            <NumberFormatter decimalScale={2} prefix={"$"} value={cell.getValue() as number} thousandSeparator />
          </Badge>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
      },
    ],
    []
  );
  const table = useMantineReactTable({
    data: memoizedCommits,
    columns,
    renderTopToolbarCustomActions: () => (
      <Box>
        <DateRangePicker />
      </Box>
    ),
  });
  return <MantineReactTable table={table} />;
};
