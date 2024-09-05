"use client";
import { OfficeResponse, OfficeResult, TransactionState } from "@/lib/client";
import { formDateToMyLocal, getBadgeType, getBadgeTypeFromResult, getStateBadge } from "@/lib/utils";
import { ActionIcon, Badge, Button, Group, NumberFormatter, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconDownload } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef, MRT_Row, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DateRangePicker from "@/components/layouts/date-range-picker";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

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
        Cell: ({ cell }) => (
          <Badge variant="dot" color="cyan">
            <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={cell.getValue() as number} />
          </Badge>
        ),
        Footer: () => (
          <Badge variant="outline" color="blue" size="lg">
            Total &#8658; {""}
            <NumberFormatter
              prefix="$"
              decimalScale={2}
              thousandSeparator
              value={table.getFilteredRowModel().rows.reduce((acc, row) => acc + (row.original.amount as number), 0)}
            />
          </Badge>
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
        Cell: ({ cell }) => (
          <Group>
            {formatDate(new Date(cell.getValue() as string), "MMM dd")}
            <Badge variant="dot" color="gray">
              {formatDistanceToNowStrict(formDateToMyLocal(cell.getValue() as string), { addSuffix: true })}
            </Badge>
          </Group>
        ),
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
    console.log(rows);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Office Results", 10, 10);
    doc.setFontSize(12);
    const tableData = rows.map((row) => Object.values(row.original));
    const tableHeaders = columns.map((c) => c.header);
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 40,
    });

    doc.save("result_table.pdf");
  };

  const table = useMantineReactTable({
    columns,
    enableEditing: false,
    initialState: {
      density: "xs",
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
