import TransactionsForms from "@/components/apps/transactions/TransactionsFroms";
import { getEmployeesCached, getMyOfficeAgents, getOfficeAccountsCached, getOfficeCached } from "@/lib/actions";
import { getMyOfficeTransactions } from "@/lib/actions/transactions";
import MantineReactTable from "@/components/apps/transactions/MantineReactTable";
import { getCurrentActivity } from "@/lib/actions/activity";

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
export default async function Transactions({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug);
  return (
    <div className="grid grid-row-2 gap-4">
      <div>
        <TransactionsForms
          officeAccounts={data.officeAccounts}
          activity={data.activity}
          office={data.office}
          agentAccounts={data.agentAccounts}
        />
      </div>
      <div className="pt-5">
        <MantineReactTable office={data.office} data={data.transactions} employees={data.employees} />
      </div>
    </div>
  );
}
