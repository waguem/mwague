"use client";
import { OfficeResponse, OfficeResult, TransactionState } from "@/lib/client";
import { getBadgeType, getBadgeTypeFromResult, getStateBadge } from "@/lib/utils";
import { ActionIcon, Badge, Button, Group, NumberFormatter, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconDownload } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef, MRT_Row, useMantineReactTable } from "mantine-react-table";
import { Fragment, useMemo } from "react";
import DateRangePicker from "@/components/layouts/date-range-picker";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { generateOfficeResultsReport } from "@/lib/pdf/generator";

interface Props {
  data: OfficeResult[];
  office: OfficeResponse;
}
const ResultTable = ({ data }: Props) => {
  const memoizedData = useMemo(() => data, [data]);
  const clipboard = useClipboard({ timeout: 500 });
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
        Cell: ({ cell, row }) => (
          <Badge variant="dot" color={getBadgeTypeFromResult(row.original.result_type)}>
            <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={cell.getValue() as number} />
          </Badge>
        ),
        Footer: () => {
          return (
            <Badge variant="outline" color="blue" size="lg">
              Total &#8658; {""}
              <NumberFormatter
                prefix="$"
                decimalScale={2}
                thousandSeparator
                value={table
                  .getFilteredRowModel()
                  .rows.filter((row) => row.original.state === "PAID" && row.original.amount > 0)
                  .reduce((acc, row) => acc + (row.original.amount as number), 0)}
              />
            </Badge>
          );
        },
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
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.date).getTime() > new Date(rowB.original.date).getTime() ? 1 : -1;
        },
        Cell: ({ cell }) => (
          <Group>
            {formatDate(new Date(cell.getValue() as string), "MMM dd")}
            <Badge variant="dot" color="gray">
              {formatDistanceToNowStrict(cell.getValue() as string, { addSuffix: true })}
            </Badge>
          </Group>
        ),
      },
      {
        header: "Source",
        accessorKey: "result_source",
        Cell: ({ cell }) => (
          <Badge variant="outline" color={getBadgeType(cell.getValue() as any)}>
            {cell.getValue() as string}
          </Badge>
        ),
      },
      {
        header: "Tag",
        accessorKey: "tag",
        Cell: ({ cell }) => (
          <Fragment>
            {(cell.getValue() as string) && (
              <Badge variant="outline" color={"gray"}>
                {cell.getValue() as string}{" "}
              </Badge>
            )}
          </Fragment>
        ),
      },
      {
        header: "Code",
        accessorKey: "code",
        Cell: ({ cell }) => (
          <Group>
            <Badge variant="dot" color="cyan">
              {cell.getValue() as string}
            </Badge>
            <Tooltip label="Copy code" position="left">
              <ActionIcon size={20} variant="outline">
                <IconCopy
                  size={16}
                  onClick={() => {
                    clipboard.copy(cell.getValue() as string);
                  }}
                />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleExportRows = (rows: MRT_Row<OfficeResult>[]) => {
    generateOfficeResultsReport({
      result: rows.map((row) => row.original),
      office: "Office",
    });
  };

  const table = useMantineReactTable({
    columns,
    enableEditing: false,
    initialState: {
      density: "xs",
      sorting: [
        {
          id: "date",
          desc: true,
        },
      ],
    },
    paginationDisplayMode: "pages",
    data: memoizedData,
    renderTopToolbarCustomActions: ({ table }) => (
      <Group gap="xs">
        <DateRangePicker />
        <Button
          onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
          leftSection={<IconDownload size={16} />}
          size="xs"
          variant="outline"
          radius="md"
        >
          Export to PDF
        </Button>
      </Group>
    ),
  });

  return <MantineReactTable table={table} />;
};

export default ResultTable;
