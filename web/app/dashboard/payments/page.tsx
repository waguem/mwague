import {
  getEmployeesCached,
  getMyOffice,
  getMyOfficeAgents,
  getOfficeAccountsCached,
  getOfficeCached,
} from "@/lib/actions";
import { getMyOfficeTransactions } from "@/lib/actions/transactions";
import MantineReactTable from "@/components/apps/transactions/MantineReactTable";
import { getCurrentActivity } from "@/lib/actions/activity";
import { TransactionItem } from "@/lib/client";

const getData = async (slug: string) => {
  const transactionsPr = getMyOfficeTransactions();
  const agentAccountsPr = getMyOfficeAgents();
  const activityPr = getCurrentActivity();
  const officePr = getOfficeCached(slug);
  const employeesPr = getEmployeesCached(slug);
  const officeAccountsPr = getOfficeAccountsCached();
  const [transactions, agentAccounts, activity, office, employees, officeAccounts] = await Promise.all([
    transactionsPr,
    agentAccountsPr,
    activityPr,
    officePr,
    employeesPr,
    officeAccountsPr,
  ]);

  return { transactions, agentAccounts, activity, office, employees, officeAccounts };
};

export default async function Payments() {
  const myoffice = await getMyOffice();
  const data = await getData(myoffice.id);
  const items: TransactionItem[] = data.transactions as TransactionItem[];
  // const payables = items.filter((t:TransactionItem)=> t.item.state !== "REVIEW" && ["DEPOSIT","EXTERNAL","FOREX","SENDING"].includes(t.item.type));
  return (
    <div className="grid grid-row-2 gap-4">
      <div>
        <MantineReactTable office={data.office} data={items} employees={data.employees} />
      </div>
    </div>
  );
}
