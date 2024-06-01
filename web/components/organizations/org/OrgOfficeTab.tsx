import { getTranslation } from "@/i18n";
import { OfficeResponse } from "@/lib/client";

interface TabProps {
  offices: OfficeResponse[];
}
export async function OrgOfficeTab({ offices }: TabProps) {
  const { t } = getTranslation();
  if (!offices.length) {
    return null;
  }

  return (
    <div className="table-responsive mb-5">
      <table className="table-hover">
        <thead>
          <tr className="!bg-transparent dark:!bg-transparent">
            <th>{t("name")}</th>
            <th>{t("initials")}</th>
            <th>{t("country")}</th>
            <th className="text-center"></th>
          </tr>
        </thead>
        <tbody>
          {offices.map((data) => {
            return (
              <tr key={data.initials}>
                <td>
                  <div className="whitespace-nowrap">{data.name}</div>
                </td>
                <td>{data.initials}</td>
                <td>{data.country}</td>
                <td className="text-center">x</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
