import {
  getEmployeesCached,
  getMyOffice,
  getMyOfficeAgents,
  getOfficeAccountsCached,
  getOfficeCached,
} from "@/lib/actions";
import { getMyOfficeTransactions } from "@/lib/actions/transactions";
import { getCurrentActivity } from "@/lib/actions/activity";
import TransactionTable from "@/components/apps/transactions/TransactionTable";

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
  // const payables = items.filter((t:TransactionItem)=> t.item.state !== "REVIEW" && ["DEPOSIT","EXTERNAL","FOREX","SENDING"].includes(t.item.type));
  return (
    <div className="grid grid-row-2 gap-4">
      <div>
        <TransactionTable office={data.office} data={data.transactions} employees={data.employees} />
      </div>
    </div>
  );
}
