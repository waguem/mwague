import ResultTable from "@/components/apps/report/ResultTable";
import { getMonthlyReport, getOfficeCached } from "@/lib/actions";

export default async function OfficeReportPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: {
    from: string;
    to: string;
  };
}) {
  const monthlyReport = await getMonthlyReport(searchParams?.from, searchParams?.to);
  const office = await getOfficeCached(params.slug);
  return <ResultTable data={monthlyReport.results} office={office} />;
}
