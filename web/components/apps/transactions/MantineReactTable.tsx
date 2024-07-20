"use client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState } from "react";
import { NumberFormatter, Badge, ActionIcon, Box, Tooltip, Grid } from "@mantine/core";
import { IconEyeCheck, IconEdit, IconCash } from "@tabler/icons-react";
import { Text } from "@mantine/core";
import { format as formatDate, formatDistanceToNow } from "date-fns";
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { OfficeResponse, TransactionResponse, TransactionState, TransactionType } from "@/lib/client";
import TransactionReview from "./TransactionReview";
import { getBadgeType, getStateBadge } from "@/lib/utils";
import PayTransaction from "./PayTransaction";
import { useDisclosure } from "@mantine/hooks";

interface Props {
  data: TransactionResponse[];
  office: OfficeResponse;
}
const MantineTable = ({ data, office }: Props) => {
  const [revewing, setReviewing] = useState<number>(-1);
  const [paying, setPaying] = useState<number>(-1);
  const [opened, { open, close }] = useDisclosure(false);
  const [reviewOpened, { open: openReview, close: closeReview }] = useDisclosure(false);

  const isPayable = (type: TransactionType) => {
    return ["DEPOSIT", "EXTERNAL", "FOREX"].includes(type);
  };
  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<TransactionResponse>[]>(
    () => [
      {
        accessorKey: "code", //access nested data with dot notation
        header: "Code",
        enableEditing: false,
      },
      {
        accessorKey: "amount",
        header: "Amout",
        Cell: ({ cell }) => (
          <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={cell.getValue() as string} />
        ),
      },
      {
        accessorKey: "state", //normal accessorKey
        header: "State",
        enableEditing: false,
        Cell: ({ cell }) => {
          const state: TransactionState = cell.getValue() as TransactionState;
          return (
            <Badge size="md" color={getStateBadge(state)}>
              {state}
            </Badge>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        enableEditing: false,
        Cell: ({ cell }) => (
          <Badge variant="outline" color={getBadgeType(cell.getValue() as TransactionType)}>
            {cell.getValue() as string}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        enableEditing: false,
        header: "Date",
        Cell: ({ cell }) => (
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm">{formatDate(new Date(cell.getValue() as string), "yyyy-MM-dd")}</Text>
            </Grid.Col>
            <Grid.Col span={6} style={{ justifyItems: "left" }}>
              <Badge color="gray" size="sm" style={{ marginLeft: 0 }}>
                {formatDistanceToNow(new Date(cell.getValue() as string), { addSuffix: true })}
              </Badge>
            </Grid.Col>
          </Grid>
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    enableEditing: true,
    positionActionsColumn: "last",
    paginationDisplayMode: "pages",
    initialState: {
      density: "xs",
    },
    renderRowActions: ({ row }) => (
      <Box style={{ display: "flex", flexWrap: "nowrap", gap: "8px" }}>
        <Tooltip label="Review Transaction">
          <ActionIcon
            color="green"
            variant="outline"
            radius={"xl"}
            onClick={() => {
              setReviewing(row.index);
              openReview();
            }}
          >
            <IconEyeCheck size={20} />
          </ActionIcon>
        </Tooltip>
        {(row.getValue("state") === "REVIEW" || row.getValue("state") === "REJECTED") && (
          <Tooltip label="Edit Transaction">
            <ActionIcon
              color="red"
              variant="outline"
              radius={"xl"}
              onClick={() => {
                table.setEditingRow(row);
              }}
            >
              <IconEdit size={20} />
            </ActionIcon>
          </Tooltip>
        )}

        {isPayable(row.getValue("type")) && (
          <Tooltip label="Pay Transaction">
            <ActionIcon
              color="cyan"
              variant="outline"
              radius={"xl"}
              onClick={() => {
                setPaying(row.index);
                open();
              }}
            >
              <IconCash size={20} />
            </ActionIcon>
          </Tooltip>
        )}
      </Box>
    ),
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });

  return (
    <>
      <TransactionReview row={data[revewing]} close={closeReview} opened={reviewOpened} />
      <PayTransaction row={data[paying]} close={close} opened={opened} officeId={office.id} />
      <MantineReactTable table={table} />;
    </>
  );
};

export default MantineTable;
