"use client";
import { getDefaultMRTOptions } from "@/components/mantine";
import { addAgent } from "@/lib/actions";
import { AgentResponse } from "@/lib/client";
import { agentTypeOptions, countryOptions } from "@/lib/utils";
import { ActionIcon, Avatar, Box, Button, Group, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconEye, IconUserPlus } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef, MRT_TableOptions, useMantineReactTable } from "mantine-react-table";
import { useMemo, useState, useTransition } from "react";

interface AgentTableProps {
  agents: AgentResponse[];
}
const options = getDefaultMRTOptions<AgentResponse>();

export default function AgentTableMant({ agents }: AgentTableProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const [isCreating, startTransition] = useTransition();
  //keep track of rows that have been edited
  const [editedAgents, setEditedAgents] = useState<Record<string, AgentResponse>>({});

  const handleNewAgent: MRT_TableOptions<AgentResponse>["onCreatingRowSave"] = async ({ values, exitCreatingMode }) => {
    const create = async (agent: AgentResponse) => {
      const response = await addAgent(null, agent as any);
      if (response?.status === "success") {
        // show notification
        notifications.show({
          message: response.message,
          color: "teal",
          withBorder: true,
          title: "Success",
          withCloseButton: true,
          autoClose: 2000,
        });
      } else if (response?.status === "error") {
        // show error for all found erros
        response.errors?.forEach((error: any) => {
          notifications.show({
            message: error.message,
            color: "red",
            title: "Error",
            withBorder: true,
            withCloseButton: true,
            autoClose: 5000,
          });
        });
      }
    };

    const newValidationErrors = validateAgent(values);
    if (Object.values(newValidationErrors).some((error) => !!error)) {
      console.log("Couldn't submit data with Error : ", newValidationErrors);
      setValidationErrors(newValidationErrors);
      return;
    }

    startTransition(() => create(values));

    exitCreatingMode();
  };

  const columns = useMemo<MRT_ColumnDef<AgentResponse>[]>(
    () => [
      {
        accessorKey: "initials",
        header: "Initials",
        Cell: ({ cell }) => (
          <Box>
            <Avatar key={cell.id} name={cell.getValue() as string} color="initials" />
          </Box>
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
        accessorKey: "email",
        header: "Email",
        enableEditing: true,
        mantineEditTextInputProps: ({ cell }) => ({
          type: "email",
          required: true,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !validateEmail(event.currentTarget.value) ? "Invalid Email" : undefined;
            console.log("Validation Email ", validationError);
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
            console.log(validationErrors);
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
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useMantineReactTable({
    ...options,
    columns,
    enableRowActions: false,
    getRowId: (row) => row.email,
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
        <Group justify="center">
          <Tooltip label="Edit">
            <ActionIcon color="cyan">
              <IconEdit size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Visit">
            <ActionIcon color="teal" component="a" href={`/dashboard/agent/${row.original.initials}`}>
              <IconEye size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      );
    },
    state: {
      isLoading: false,
      isSaving: false,
      showProgressBars: isCreating,
    },
  });
  return <MantineReactTable table={table} />;
}

const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

function validateAgent(agent: AgentResponse) {
  return {
    initials: !/^[a-zA-Z]{2,4}$/.test(agent.initials) ? "Invalid Initials" : undefined,
    name: !/^[a-zA-Z\s]{2,64}$/.test(agent.name) ? "Invalid Name" : undefined,
    email: !validateEmail(agent.email) ? "Invalid Email" : undefined,
    phone: !/^\d{10,14}$/.test(agent.phone) ? "Invalid Phone" : undefined,
    country: !countryOptions.map(({ value }) => value).includes(agent.country) ? "Invalid Country" : undefined,
  };
}
