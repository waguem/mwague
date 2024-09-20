"use client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState, useTransition } from "react";
import { NumberFormatter, Badge, ActionIcon, Box, Tooltip, Group, Avatar, NumberInput, Button } from "@mantine/core";
import { IconEyeCheck, IconEdit, IconCash, IconDownload } from "@tabler/icons-react";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { MantineReactTable, useMantineReactTable, MRT_TableOptions, type MRT_ColumnDef } from "mantine-react-table";
import {
  Currency,
  EmployeeResponse,
  ForEx,
  OfficeResponse,
  TransactionItem,
  TransactionState,
  TransactionType,
} from "@/lib/client";
import TransactionReview from "./TransactionReview";
import { getBadgeType, getMoneyPrefix, getStateBadge } from "@/lib/utils";
import PayTransaction from "./PayTransaction";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { updateTransaction } from "@/lib/actions/transactions";
import { decodeNotification } from "../notifications/notifications";
import { HoverMessages } from "../wallet/HoverMessage";
import DateRangePicker from "@/components/layouts/date-range-picker";

interface Props {
  data: TransactionItem[];
  office: OfficeResponse;
  employees: EmployeeResponse[];
}

const MantineTable = ({ data, office, employees }: Props) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [editingRow, setEditingRow] = useState<TransactionItem | undefined>(undefined);
  const [revewing, setReviewing] = useState<number>(-1);
  const [paying, setPaying] = useState<number>(-1);
  const [opened, { open, close }] = useDisclosure(false);
  const [reviewOpened, { open: openReview, close: closeReview }] = useDisclosure(false);
  const [pending, startTransition] = useTransition();

  const getAvatarGroup = (users: string[]) => {
    return employees.filter((employee) => users.includes(employee.id));
  };

  const isPayable = (type: TransactionType) => {
    return ["EXTERNAL", "FOREX", "SENDING"].includes(type);
  };

  const reduceAmountItems = (acc: number, row: any) => {
    // flat out the amount if it is a forex transaction
    if (row.original.item.type === "FOREX") {
      return acc + (row.original.item as ForEx).amount / (row.original.item as ForEx).selling_rate;
    }
    return acc + (row.original.item.amount as number);
  };
  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<TransactionItem>[]>(
    () => [
      {
        accessorKey: "item.code", //access nested data with dot notation
        header: "Code",
        enableEditing: false,
        Cell: ({ cell, row }) => (
          <Group>
            <Avatar.Group spacing="xs">
              {getAvatarGroup([row.original.item.created_by, row.original.item?.reviwed_by ?? ""]).map(
                (user, index) => (
                  <Tooltip key={index} label={user?.username}>
                    <Avatar key={index} src={user.avatar_url} />
                  </Tooltip>
                )
              )}
            </Avatar.Group>
            {cell.getValue() as string}
          </Group>
        ),
      },
      {
        accessorKey: "item.amount",
        header: "Amount",
        size: 80,
        Cell: ({ cell }) => {
          const currencies = office?.currencies as any;
          let currency: Currency = currencies?.find((curr: any) => curr.main)?.name as unknown as Currency;
          let fCurrency: Currency = "USD";
          if (cell.row.original.item.type === "FOREX") {
            const tr: ForEx = cell.row.original.item as ForEx;
            currency = tr.currency;
          }
          return (
            <Group gap={"xs"}>
              {cell.row.original.item.type === "FOREX" && (
                <Badge variant="dot" color="gray" size="md">
                  <NumberFormatter
                    decimalScale={3}
                    prefix={`${getMoneyPrefix(fCurrency)}`}
                    thousandSeparator
                    value={(cell.row.original.item as ForEx).amount / (cell.row.original.item as ForEx).selling_rate}
                  />
                </Badge>
              )}
              <Badge variant="dot" color="cyan" size="md">
                <NumberFormatter
                  decimalScale={2}
                  prefix={`${getMoneyPrefix(currency)}`}
                  thousandSeparator
                  value={cell.getValue() as string}
                />
              </Badge>
            </Group>
          );
        },
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          error: validationErrors?.amount,
          onFocus: () => {
            setValidationErrors({
              ...validationErrors,
              amount: undefined,
            });
          },
        },
        Footer: () => (
          <Badge variant="outline" color="blue" size="lg">
            Total &#8658; {""}
            <NumberFormatter
              prefix="$"
              decimalScale={2}
              thousandSeparator
              value={table.getFilteredRowModel().rows.reduce(reduceAmountItems, 0)}
            />
          </Badge>
        ),
        Edit: ({ cell, row }) => (
          <NumberInput
            decimalScale={2}
            prefix="$"
            thousandSeparator
            value={cell.getValue() as number}
            onChange={(value) =>
              setEditingRow({
                ...row.original,
                item: {
                  ...row.original.item,
                  amount: value as number,
                },
              })
            }
          />
        ),
      },
      {
        accessorKey: "item.state", //normal accessorKey
        header: "State",
        size: 160,
        enableEditing: false,
        Cell: ({ cell, row }) => {
          const state: TransactionState = cell.getValue() as TransactionState;
          const badgeConfig = getStateBadge(state);
          return (
            <Group gap={"xs"}>
              <Badge variant="outline" color={getBadgeType(row.original.item.type as TransactionType)}>
                {row.original.item.type as string}{" "}
              </Badge>
              <Badge size="md" {...badgeConfig}>
                {state}
              </Badge>
            </Group>
          );
        },
      },
      {
        accessorKey: "item.notes",
        header: "Description",
        enableEditing: false,
        Cell: ({ row }) => <HoverMessages messages={row.original.notes as any} />,
      },
      {
        accessorKey: "item.created_at",
        enableEditing: false,
        header: "Date",
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.item?.created_at ?? "").getTime() >
            new Date(rowB.original.item?.created_at ?? "").getTime()
            ? -1
            : 1;
        },
        Cell: ({ cell }) => (
          <Group gap={"xs"}>
            <Badge variant="dot" color="gray" size="md">
              {formatDate(cell.getValue() as string, "MMM dd")}
            </Badge>
            <Badge variant="dot" color="pink" size="sm" style={{ marginLeft: 0 }}>
              {formatDistanceToNowStrict(new Date(cell.getValue() as string), { addSuffix: true })}
            </Badge>
          </Group>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleEditTransaction: MRT_TableOptions<TransactionItem>["onEditingRowSave"] = async ({ values, table }) => {
    const newValidationErrors = validateTransaction(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      Object.entries(newValidationErrors).forEach(([key, value]) => {
        notifications.show({
          title: `Error on Field ${key}`,
          message: `Field ${value}`,
          color: "red",
        });
      });
      setValidationErrors(newValidationErrors);
      return;
    }

    setValidationErrors({});
    // go through object values and  remove "item" string from the key

    // update transaction
    const asyncUpdate = async () => {
      const response = await updateTransaction(office.id, {
        ...editingRow?.item,
        amount: editingRow?.item.amount,
      });
      decodeNotification("Update Transaction", response);
    };

    startTransition(() => asyncUpdate());

    table.setEditingRow(null); //exit editing mode
  };
  const handleExportRows = (rows: any) => {
    console.log(rows);
  };
  const table = useMantineReactTable({
    columns,
    enableEditing: true,
    positionActionsColumn: "last",
    paginationDisplayMode: "pages",
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    initialState: {
      density: "xs",
      sorting: [{ id: "item.created_at", desc: false }],
    },
    onEditingRowSave: handleEditTransaction,
    renderRowActions: ({ row }) => (
      <Box style={{ display: "flex", flexWrap: "nowrap", gap: "8px" }}>
        <Tooltip label="Review Transaction">
          <ActionIcon
            color="green"
            variant="outline"
            radius={"md"}
            onClick={() => {
              setReviewing(row.index);
              openReview();
            }}
          >
            <IconEyeCheck size={18} />
          </ActionIcon>
        </Tooltip>
        {(row.getValue("item.state") === "REVIEW" || row.getValue("item.state") === "REJECTED") && (
          <Tooltip label="Edit Transaction">
            <ActionIcon
              color="red"
              variant="outline"
              radius={"md"}
              onClick={() => {
                table.setEditingRow(row);
              }}
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
        )}

        {isPayable(row.original.item.type) && (
          <Tooltip label="Pay Transaction">
            <ActionIcon
              color="cyan"
              variant="outline"
              radius={"md"}
              onClick={() => {
                setPaying(row.index);
                open();
              }}
            >
              <IconCash size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Box>
    ),
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    state: {
      isSaving: pending,
    },
    mantineTableProps: () => ({
      striped: true,
    }),
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

  return (
    <>
      <TransactionReview
        row={data[revewing]}
        close={closeReview}
        opened={reviewOpened}
        office={office}
        getEmployee={getAvatarGroup}
      />
      <PayTransaction
        row={data[paying]?.item}
        close={close}
        opened={opened}
        officeId={office.id}
        getAvatarGroup={getAvatarGroup}
      />
      <MantineReactTable table={table} />
    </>
  );
};

export default MantineTable;

function validateTransaction(transaction: any) {
  return {
    amount: !(Number(transaction["item.amount"]) && +transaction["item.amount"] > 0) ? "Amount is Required" : "",
  };
}
