"use client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { Fragment, useMemo, useState, useTransition } from "react";
import { NumberFormatter, Badge, ActionIcon, Box, Tooltip, Group, Avatar, NumberInput, Button } from "@mantine/core";
import { IconEyeCheck, IconEdit, IconCash, IconDownload } from "@tabler/icons-react";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { MantineReactTable, useMantineReactTable, MRT_TableOptions, type MRT_ColumnDef } from "mantine-react-table";
import {
  Currency,
  EmployeeResponse,
  ForEx,
  OfficeResponse,
  TransactionState,
  TransactionType,
  Note,
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
import { AllTransactions } from "@/lib/types";
import GroupedPayment from "./GroupedPayment";

interface Props {
  data: Array<AllTransactions>;
  office: OfficeResponse;
  employees: EmployeeResponse[];
}

const TransactionTable = ({ data, office, employees }: Props) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [editingRow, setEditingRow] = useState<AllTransactions | undefined>(undefined);
  const [revewing, setReviewing] = useState<number>(-1);
  const [paying, setPaying] = useState<number>(-1);
  const [opened, { open, close }] = useDisclosure(false);
  const [reviewOpened, { open: openReview, close: closeReview }] = useDisclosure(false);
  const [pending, startTransition] = useTransition();

  const getAvatarGroup = (users: string[]) => {
    return employees.filter((employee) => users.includes(employee.id));
  };

  const isPayable = (type: TransactionType) => {
    return ["EXTERNAL", "DEPOSIT", "FOREX", "SENDING"].includes(type);
  };

  const reduceAmountItems = (acc: number, row: any) => {
    // flat out the amount if it is a forex transaction
    if (row.original.type === "FOREX") {
      return acc + (row.original as ForEx).amount / (row.original as ForEx).selling_rate;
    }
    return acc + (row.original.amount as number);
  };
  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<AllTransactions>[]>(
    () => [
      {
        accessorKey: "code", //access nested data with dot notation
        header: "Code",
        enableEditing: false,
        Cell: ({ cell, row }) => (
          <Group>
            <Avatar.Group spacing="xs">
              {getAvatarGroup([row.original.created_by, row.original?.reviwed_by ?? ""]).map((user, index) => (
                <Tooltip key={index} label={user?.username}>
                  <Avatar key={index} src={user.avatar_url} />
                </Tooltip>
              ))}
            </Avatar.Group>
            {cell.getValue() as string}
          </Group>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 80,
        Cell: ({ cell }) => {
          const currencies = office?.currencies as any;
          let currency: Currency = currencies?.find((curr: any) => curr.main)?.name as unknown as Currency;
          let fCurrency: Currency = "USD";
          let forexAmount = 0;
          if (cell.row.original.type === "FOREX") {
            const tr: ForEx = cell.row.original as ForEx;
            currency = tr.currency;
            forexAmount = tr.tag === "BANKTT" ? tr.amount : tr.amount / tr.selling_rate;
          }
          return (
            <Group gap={"xs"}>
              {cell.row.original.type === "FOREX" && (
                <Badge variant="dot" color="gray" size="md">
                  <NumberFormatter
                    decimalScale={3}
                    prefix={`${getMoneyPrefix(fCurrency)}`}
                    thousandSeparator
                    value={forexAmount}
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
                amount: value as number,
              })
            }
          />
        ),
      },
      {
        header: "Type",
        accessorKey: "type",
        enableEditing: false,
        Cell: ({ row }) => (
          <Badge variant="outline" color={getBadgeType(row.original.type as TransactionType)}>
            {row.original.type as string}{" "}
          </Badge>
        ),
      },
      {
        accessorKey: "state", //normal accessorKey
        header: "State",
        size: 160,
        enableEditing: false,
        Cell: ({ cell }) => {
          const state: TransactionState = cell.getValue() as TransactionState;
          const badgeConfig = getStateBadge(state);
          return (
            <Badge size="md" {...badgeConfig}>
              {state}
            </Badge>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Description",
        enableEditing: false,
        Cell: ({ row }) => {
          const notes: Note[] = typeof row?.original.notes === "string" ? JSON.parse(row?.original.notes) : [];
          return <HoverMessages messages={notes} />;
        },
      },
      {
        accessorKey: "created_at",
        enableEditing: false,
        header: "Date",
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original?.created_at ?? "").getTime() >
            new Date(rowB.original?.created_at ?? "").getTime()
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

  const handleEditTransaction: MRT_TableOptions<AllTransactions>["onEditingRowSave"] = async ({ values, table }) => {
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
        ...editingRow,
        amount: editingRow?.amount,
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
    enableRowSelection: (row) => row.original.state === "PENDING" && row.original.type === "FOREX",
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    initialState: {
      density: "xs",
      sorting: [{ id: "created_at", desc: false }],
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
        {(row.getValue("state") === "REVIEW" || row.getValue("state") === "REJECTED") && (
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

        {isPayable(row.original.type) && (
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
        <GroupedPayment office={office} table={table} />
      </Group>
    ),
  });

  return (
    <Fragment>
      <TransactionReview
        row={data[revewing]}
        close={closeReview}
        opened={reviewOpened}
        office={office}
        getEmployee={getAvatarGroup}
      />
      <PayTransaction
        row={data[paying]}
        close={close}
        opened={opened}
        officeId={office.id}
        getAvatarGroup={getAvatarGroup}
      />
      <MantineReactTable table={table} />
    </Fragment>
  );
};

export default TransactionTable;

function validateTransaction(transaction: any) {
  return {
    amount: !(Number(transaction["amount"]) && +transaction["amount"] > 0) ? "Amount is Required" : "",
  };
}
