"use client";
import { getDefaultMRTOptions } from "@/components/mantine";
import { addAgent } from "@/lib/actions";
import { AgentReponseWithAccounts, AgentType } from "@/lib/client";
import { agentTypeOptions, countryOptions } from "@/lib/utils";
import { ActionIcon, Badge, Button, Group, NumberFormatter, Tooltip } from "@mantine/core";
import { IconArrowRight, IconDownload, IconUserPlus } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef, MRT_TableOptions, useMantineReactTable } from "mantine-react-table";
import { useMemo, useState, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";
import { isArray } from "lodash";
import CreateAccount from "../accounts/CreateAccount";

interface AgentTableProps {
  agents: AgentReponseWithAccounts[];
}
const options = getDefaultMRTOptions<AgentReponseWithAccounts>();

export default function AgentTableMant({ agents }: AgentTableProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const [isCreating, startTransition] = useTransition();
  //keep track of rows that have been edited
  const [editedAgents, setEditedAgents] = useState<Record<string, AgentReponseWithAccounts>>({});

  const handleNewAgent: MRT_TableOptions<AgentReponseWithAccounts>["onCreatingRowSave"] = async ({
    values,
    exitCreatingMode,
  }) => {
    const create = async (agent: AgentReponseWithAccounts) => {
      const response = await addAgent(null, agent as any);
      decodeNotification("New Agent", response);
    };

    startTransition(() => create(values));

    exitCreatingMode();
  };

  const columns = useMemo<MRT_ColumnDef<AgentReponseWithAccounts>[]>(
    () => [
      {
        accessorKey: "initials",
        header: "Initials",
        Cell: ({ cell, row }) => (
          <Group>
            <Tooltip label="Visit">
              <Button
                variant="outline"
                radius={"md"}
                color="cyan"
                size="xs"
                component="a"
                href={`/agent/${row.original.initials}`}
              >
                page
                <IconArrowRight size={16} />
              </Button>
            </Tooltip>
            {cell.getValue() as string}
          </Group>
        ),
        enableEditing: true,
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: "text",
          required: true,
          minLength: 2,
          maxLength: 4,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !/^[a-zA-Z]{2,4}$/.test(event.currentTarget.value) ? "Invalid Initials" : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedAgents({
              ...editedAgents,
              [row.id]: {
                ...row.original,
                initials: event.currentTarget.value,
              },
            });
          },
        }),
      },
      {
        accessorKey: "name",
        header: "Name",
        enableEditing: true,
        mantineEditTextInputProps: ({ cell }) => ({
          type: "text",
          required: true,
          minLength: 2,
          maxLength: 64,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !/^[a-zA-Z\s]{2,64}$/.test(event.currentTarget.value) ? "Invalid Name" : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        enableEditing: true,
        mantineEditTextInputProps: ({ cell }) => ({
          type: "tel",
          required: true,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !/^\d{10,14}$/.test(event.currentTarget.value) ? "Invalid Phone" : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "country",
        header: "Country",
        enableEditing: true,
        editVariant: "select",
        mantineEditSelectProps: ({ cell }) => ({
          data: countryOptions,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !countryOptions.map(({ value }) => value).includes(event.currentTarget.value)
              ? "Invalid Country"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "type",
        header: "Type",
        enableEditing: true,
        editVariant: "select",
        mantineEditSelectProps: ({}) => ({
          data: agentTypeOptions,
        }),
        Cell: ({ cell }) => {
          return (
            <Badge variant="dot" color={(cell.getValue() as AgentType) == "AGENT" ? "teal" : "indigo"} size="md">
              {cell.getValue() as string}
            </Badge>
          );
        },
      },
      {
        header: "Accounts",
        accessorKey: "accounts",
        enableEditing: false,
        sortingFn: (rowA, rowB) => {
          const balanceA = rowA.original.accounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;
          const balanceB = rowB.original.accounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;
          return balanceA > balanceB ? -1 : 1;
        },
        Cell: ({ row }) => {
          let balance = 0;
          if (isArray(row.original.accounts)) {
            balance = row.original.accounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;
          }

          return (
            <Badge variant="dot" color={balance >= 0 ? "cyan" : "red"} size="md">
              <NumberFormatter thousandSeparator decimalScale={2} prefix="$" value={balance} />
            </Badge>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useMantineReactTable({
    ...options,
    columns,
    enableRowActions: false,
    getRowId: (row) => row.initials,
    createDisplayMode: "row",
    editDisplayMode: "row",
    data: agents,
    onCreatingRowSave: handleNewAgent,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        size="xs"
        leftSection={<IconUserPlus size={18} />}
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Agent
      </Button>
    ),
    renderRowActions: ({ row }) => {
      return (
        <Group gap={"xs"} justify="center">
          {row.original.accounts?.length === 0 && (
            <Tooltip label="Create account">
              <CreateAccount owner_initials={row.original.initials} />
            </Tooltip>
          )}
          <Tooltip label="Download Report">
            <ActionIcon variant="outline" size={"md"} radius={"md"} color="gray">
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      );
    },
    initialState: {
      density: "xs",
      sorting: [
        {
          id: "accounts",
          desc: false,
        },
      ],
    },
    state: {
      isLoading: false,
      isSaving: false,
      showProgressBars: isCreating,
    },
  });
  return <MantineReactTable table={table} />;
}
