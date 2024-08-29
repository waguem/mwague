"use client";
import { OfficeResponse, OfficeResult, TransactionState } from "@/lib/client";
import { getBadgeType, getBadgeTypeFromResult, getStateBadge } from "@/lib/utils";
import { Badge, NumberFormatter } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";

interface Props {
  data: OfficeResult[];
  office: OfficeResponse;
}
const ResultTable = ({ data }: Props) => {
  const memoizedData = useMemo(() => data, [data]);

  const columns = useMemo<MRT_ColumnDef<OfficeResult>[]>(
    () => [
      {
        header: "Result Type",
        accessorKey: "result_type",
        enableEditing: false,
        size: 100,
        Cell: ({ cell }) => (
          <Badge variant="outline" color={getBadgeTypeFromResult(cell.getValue() as any)}>
            {cell.getValue() as string}
          </Badge>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        Cell: ({ cell }) => (
          <NumberFormatter decimalScale={2} prefix="$" thousandSeparator="," value={cell.getValue() as number} />
        ),
      },
      {
        header: "State",
        accessorKey: "state",
        enableEditing: false,
        Cell: ({ cell }) => {
          const state = cell.getValue() as TransactionState;
          const badgeConfig = getStateBadge(state);
          return (
            <Badge size="md" {...badgeConfig}>
              {state}
            </Badge>
          );
        },
      },
      {
        header: "Date",
        accessorKey: "date",
        Cell: ({ cell }) => <div>{cell.getValue() as string}</div>,
      },
      {
        header: "Source",
        accessorKey: "result_source",
        Cell: ({ cell }) => (
          <Badge variant="outline" color={getBadgeType(cell.getValue() as any)}>
            {cell.getValue() as string}{" "}
          </Badge>
        ),
      },
      {
        header: "Code",
        accessorKey: "code",
        Cell: ({ cell }) => <div>{cell.getValue() as string}</div>,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    enableEditing: false,
    initialState: {
      density: "xs",
    },
    paginationDisplayMode: "pages",
    data: memoizedData,
  });

  return <MantineReactTable table={table} />;
};

export default ResultTable;
