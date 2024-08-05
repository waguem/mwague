"use client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState, useTransition } from "react";
import { NumberFormatter, Badge, ActionIcon, Box, Tooltip, Group, Avatar } from "@mantine/core";
import { IconEyeCheck, IconEdit, IconCash } from "@tabler/icons-react";
import { formatDistanceToNowStrict } from "date-fns";
import { MantineReactTable, useMantineReactTable, MRT_TableOptions, type MRT_ColumnDef } from "mantine-react-table";
import {
  Currency,
  EmployeeResponse,
  ForeignEx,
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

interface Props {
  data: TransactionItem[];
  office: OfficeResponse;
  employees: EmployeeResponse[];
}

const MantineTable = ({ data, office, employees }: Props) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

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

  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<TransactionItem>[]>(
    () => [
      {
        accessorKey: "item.code", //access nested data with dot notation
        header: "Code",
        enableEditing: false,
        size: 100,
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
        accessorKey: "item.charges",
        header: "Charges",
        size: 100,
        enableEditing: true,
        Cell: ({ cell }) => (
          <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={cell.getValue() ?? (0 as any)} />
        ),
      },
      {
        accessorKey: "item.amount",
        header: "Amount",
        size: 200,
        Cell: ({ cell }) => {
          const currencies = office?.currencies as any;
          let currency: Currency = currencies?.find((curr: any) => curr.main)?.name as unknown as Currency;
          let payment_currency: Currency | undefined = undefined;
          if (cell.row.original.item.type === "FOREX") {
            const tr: ForeignEx = cell.row.original.item as ForeignEx;
            const wallet = office.wallets?.find((wallet) => wallet.walletID === tr.wallet_id);
            currency = wallet?.trading_currency!;
            payment_currency = wallet?.trading_currency;
          }
          return (
            <Group>
              {cell.row.original.item.type === "FOREX" && (
                <NumberFormatter
                  decimalScale={3}
                  prefix={`${getMoneyPrefix(payment_currency ?? "USD")}`}
                  thousandSeparator
                  value={(cell.row.original.item as ForeignEx).paid}
                />
              )}
              <NumberFormatter
                decimalScale={2}
                prefix={`${getMoneyPrefix(currency)}`}
                thousandSeparator
                value={cell.getValue() as string}
              />
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
      },
      {
        accessorKey: "item.state", //normal accessorKey
        header: "State",
        size: 50,
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
        accessorKey: "item.type",
        header: "Type",
        enableEditing: false,
        Cell: ({ cell, row }) => (
          <Badge variant="outline" color={getBadgeType(cell.getValue() as TransactionType)}>
            {cell.getValue() as string}{" "}
            {cell.getValue() === "FOREX"
              ? (row.original?.item as ForeignEx).is_buying
                ? "/ Buying"
                : "/ Selling"
              : ""}
          </Badge>
        ),
      },
      {
        accessorKey: "item.created_at",
        enableEditing: false,
        header: "Date",
        Cell: ({ cell }) => (
          <Group>
            <Badge color="gray" size="sm" style={{ marginLeft: 0 }}>
              {formatDistanceToNowStrict(new Date(cell.getValue() as string), {
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
    // to match the actual transaction object
    const newValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        return [key.replace("item.", ""), value];
      })
    );
    // update transaction
    const asyncUpdate = async (values: any) => {
      const response = await updateTransaction(office.id, {
        ...values,
      });
      decodeNotification("Update Transaction", response);
    };

    startTransition(() => asyncUpdate(newValues));

    table.setEditingRow(null); //exit editing mode
  };

  const table = useMantineReactTable({
    columns,
    enableEditing: true,
    positionActionsColumn: "last",
    paginationDisplayMode: "pages",
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    initialState: {
      density: "xs",
    },
    onEditingRowSave: handleEditTransaction,
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
        {(row.getValue("item.state") === "REVIEW" || row.getValue("item.state") === "REJECTED") && (
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

        {isPayable(row.getValue("item.type")) && (
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
    state: {
      isSaving: pending,
    },
    mantineTableProps: () => ({
      striped: true,
    }),
  });

  return (
    <>
      <TransactionReview row={data[revewing]} close={closeReview} opened={reviewOpened} office={office} />
      <PayTransaction
        row={data[paying]?.item}
        close={close}
        opened={opened}
        officeId={office.id}
        getAvatarGroup={getAvatarGroup}
      />
      <MantineReactTable table={table} />;
    </>
  );
};

export default MantineTable;

function validateTransaction(transaction: any) {
  console.log(transaction);
  return {
    amount: !(Number(transaction["item.amount"]) && +transaction["item.amount"] > 0) ? "Amount is Required" : "",
  };
}
