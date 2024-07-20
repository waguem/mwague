"use client";
import { getDefaultMRTOptions } from "@/components/mantine";
import { EmployeeResponse } from "@/lib/client";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo, useState, useTransition } from "react";
import { Button, MultiSelect } from "@mantine/core";
import { updateOfficeEmployees } from "@/lib/actions/employee";
import { notifications } from "@mantine/notifications";
import { IconChecklist } from "@tabler/icons-react";

interface Props {
  employees: EmployeeResponse[];
}

const options = getDefaultMRTOptions<EmployeeResponse>();
const EmployeesTable = ({ employees }: Props) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const [pending, startTransition] = useTransition();
  //keep track of rows that have been edited
  const [editedrows, setEditedRows] = useState<Record<string, EmployeeResponse>>({});

  const handleSaveEmployees = async () => {
    if (Object.values(validationErrors).some((error) => !!error)) return;
    //save edited users
    const data: any = {
      editedRows: Object.values(editedrows),
    };
    const response = await updateOfficeEmployees(null, data);
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
    console.log("reseting rows");
    setEditedRows({});
  };

  const rolesOptions = useMemo(
    () => [
      { label: "Office Admin", value: "office_admin" },
      { label: "Organization Admin", value: "org_admin" },
      { label: "Software Admin", value: "soft_admin" },
    ],
    []
  );

  const getdefaultRoleOptions = (email: string) => {
    const user = editedrows[email] || employees.find((e) => e.email === email);
    const roles = user?.roles || [];
    return rolesOptions.filter((r) => roles.includes(r.value)).map((r) => r.value);
  };

  const columns = useMemo<MRT_ColumnDef<EmployeeResponse>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Username",
        enableEditing: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: "email",
          required: true,
          error: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateEmail(event.currentTarget.value) ? "Invalid Email" : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedRows({
              ...editedrows,
              [row.id]: {
                ...row.original,
                email: event.currentTarget.value,
              },
            });
          },
        }),
      },
      {
        accessorKey: "roles",
        header: "Roles",
        Edit: ({ row }) => (
          <MultiSelect
            placeholder="Pick value"
            onChange={(value) => {
              const user = editedrows[row.getValue("email") as string] || row.original;
              setEditedRows({
                ...editedrows,
                [row.getValue("email") as string]: {
                  ...user,
                  roles: value,
                },
              });
            }}
            defaultValue={getdefaultRoleOptions(row.getValue("email") as string)}
            data={rolesOptions}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editedrows, rolesOptions]
  );

  const table = useMantineReactTable({
    columns,
    data: employees,
    ...options,
    enableRowActions: false,
    getRowId: (row) => row.email,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "table", // ('modal', 'row', 'cell', and 'custom' are also available)
    renderBottomToolbarCustomActions: () => (
      <Button
        color="blue"
        onClick={() => startTransition(() => handleSaveEmployees())}
        disabled={Object.keys(editedrows).length === 0 || Object.values(validationErrors).some((error) => !!error)}
        loading={pending}
      >
        <IconChecklist size={18} style={{ marginRight: 5 }} />
        Save
      </Button>
    ),
  });

  return <MantineReactTable table={table} />;
};

const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

export default EmployeesTable;
