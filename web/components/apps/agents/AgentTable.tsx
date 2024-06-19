import { getTranslation } from "@/i18n";

interface AgentTableProps {
  filteredItems: any;
}

export default function AgentTable({ filteredItems }: AgentTableProps) {
  const { t } = getTranslation();
  return (
    <div className="panel mt-5 overflow-hidden border-0 p-0">
      <div className="table-responsive">
        <table className="table-striped table-hover">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("email")}</th>
              <th>{t("country")}</th>
              <th>{t("phone")}</th>
              <th className="!text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item: any, index: string) => {
              return (
                <tr key={index}>
                  <td>
                    <div className="flex w-max items-center">
                      <div>{item.name}</div>
                    </div>
                  </td>
                  <td>{item.email}</td>
                  <td className="whitespace-nowrap">{item.country}</td>
                  <td className="whitespace-nowrap">{item.phone}</td>
                  <td>
                    <div className="flex items-center justify-center gap-4">
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => null}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => null}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
