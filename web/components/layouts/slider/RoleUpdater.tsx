"use client";
import { Controller } from "react-hook-form";
import ReactSelect from "react-select";

const sysRoles = ["office_admin", "org_admin", "soft_admin"];

interface Props {
  register: any;
  roles: string[];
  className?: string;
  control: any;
}

export const UserRoleSelector = (props: Props) => {
  const getLabel = (role: string) => {
    // remove _ and capitalize the first letter of each word
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  };
  const roleOptions = sysRoles.map((role) => {
    return { label: getLabel(role), value: role };
  });
  return (
    <Controller
      name="roles"
      control={props.control}
      rules={{ required: true }}
      render={({ field: { onChange, onBlur } }) => (
        <ReactSelect
          id="roles"
          options={roleOptions}
          className={props.className}
          defaultValue={roleOptions.filter((role) => props.roles.includes(role.value))}
          {...props.register("roles", { required: true })}
          isMulti
          onChange={(option: { label: string; value: string }[]) => {
            onChange(option.map((role: any) => role.value));
          }}
          onBlur={onBlur}
          isClearable
          placeholder="Select Role"
        />
      )}
    />
  );
};
