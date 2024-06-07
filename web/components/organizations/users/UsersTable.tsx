"use client";
import IconPencil from "@/components/icon/icon-pencil";
import IconSettings from "@/components/icon/icon-settings";
import { getTranslation } from "@/i18n";
import { EmployeeResponse } from "@/lib/client";
import clsx from "clsx";
import React from "react";

interface Props {
  users: EmployeeResponse[];
}
const UsersTable = ({ users }: Props) => {
  const { t } = getTranslation();

  const getRoleBadge = (role: string) => {
    if (role.includes("software")) {
      return "bg-danger";
    }

    return "bg-dark";
  };
  const toFistUpperCase = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
  return (
    <div className="table-responsive mb-5">
      <table>
        <thead>
          <tr>
            <th>{t("full_name")}</th>
            <th>{t("Email")}</th>
            <th>{t("Roles")}</th>
            <th className="text-center">{t("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((data, index) => {
            return (
              <tr key={index}>
                <td>{toFistUpperCase(data.username)}</td>
                <td>
                  <div className="whitespace-nowrap">{data.email}</div>
                </td>
                <td>
                  {data.roles.map((role, index) => (
                    <span
                      key={index}
                      className={clsx({
                        "badge whitespace-nowrap m-1": true,
                        [getRoleBadge(role)]: true,
                      })}
                    >
                      {role
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join("")}
                    </span>
                  ))}
                </td>
                <td className="text-center">
                  <ul className="flex items-center justify-center gap-2">
                    <li>
                      <button type="button">
                        <IconSettings className="h-5 w-5 text-primary" />
                      </button>
                    </li>
                    <li>
                      <button type="button">
                        <IconPencil className="text-success" />
                      </button>
                    </li>
                  </ul>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
