import ResultTable from "@/components/apps/report/ResultTable";
import { getMonthlyReport, getOfficeCached } from "@/lib/actions";

export default async function OfficeReportPage({ params }: { params: { slug: string } }) {
  const monthlyReport = await getMonthlyReport();
  const office = await getOfficeCached(params.slug);

  console.log(monthlyReport);

  return <ResultTable data={monthlyReport.results} office={office} />;
}
