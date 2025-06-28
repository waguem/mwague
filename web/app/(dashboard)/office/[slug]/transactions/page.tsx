import TransactionsForms from "@/components/apps/transactions/TransactionsFroms";
import { getEmployeesCached, getMyOfficeAgents, getOfficeAccountsCached, getOfficeCached } from "@/lib/actions";
import { getMyOfficeTransactions } from "@/lib/actions/transactions";
import { getCurrentActivity } from "@/lib/actions/activity";
import TransactionTable from "@/components/apps/transactions/TransactionTable";

const getData = async (slug: string, searchParams?: { from?: string; to?: string }) => {
  const transactionsPr = getMyOfficeTransactions(searchParams?.from, searchParams?.to);
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

export default async function Transactions({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: {
    from: string;
    to: string;
  };
}) {
  const data = await getData(params.slug, searchParams);
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
      {/* <div className="pt-5">
        <MantineReactTable office={data.office} data={data.transactions} employees={data.employees} />
      </div> */}
      <div className="pt-5">
        <TransactionTable office={data.office} data={data.transactions} employees={data.employees} />
      </div>
    </div>
  );
}
