import TransactionsForms from "@/components/apps/transactions/TransactionsFroms";
import { getEmployeesCached, getMyOfficeAgents, getOfficeAccountsCached, getOfficeCached } from "@/lib/actions";
import { getMyOfficeTransactions } from "@/lib/actions/transactions";
import { getCurrentActivity } from "@/lib/actions/activity";
import TransactionTable from "@/components/apps/transactions/TransactionTable";

export const revalidate = 60; // revalidate every 60 seconds


function withTimeout(promise:Promise<any>, timeoutMs: number) : Promise<any> {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

const getData = async (slug: string, searchParams?: { from?: string; to?: string }) => {
  const transactionsPr = getMyOfficeTransactions(searchParams?.from, searchParams?.to);
  const agentAccountsPr = getMyOfficeAgents();
  const activityPr = getCurrentActivity();
  const officePr = getOfficeCached(slug);
  const employeesPr = getEmployeesCached(slug);
  const officeAccountsPr = getOfficeAccountsCached();
  const [transactions, agentAccounts, activity, office, employees, officeAccounts] = await withTimeout(Promise.all([
    transactionsPr,
    agentAccountsPr,
    activityPr,
    officePr,
    employeesPr,
    officeAccountsPr,
  ]), 5000); // 5 seconds timeout

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
