"use client";
import { Badge, Box } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import DownloadProviderReport from "./DownloadProviderReport";

interface ProviderReport {
  name: string;
  type: string;
  month: string;
}
interface Props {
  providers: any;
}

export default function ProvidersReportTable({ providers }: Props) {
  const columns = useMemo<MRT_ColumnDef<ProviderReport>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        size: 100,
        Cell: ({ cell }) => (
          <Badge variant="outline" size="xl" color="blue" radius={"md"}>
            {cell.getValue() as string}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const table = useMantineReactTable({
    columns,
    data: providers,
    enableEditing: true,
    positionActionsColumn: "last",
    paginationDisplayMode: "pages",
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
      showProgressBars: false,
    },
    renderRowActions: ({ row }) => (
      <Box style={{ display: "flex", flexWrap: "nowrap", gap: "8px" }}>
        <DownloadProviderReport name={row.original.name} />
      </Box>
    ),
  });
  return <MantineReactTable table={table} />;
}
