import AddAgentAccountForm from "@/components/apps/accounts/AddAccountForm";
import { OfficeFundDetail } from "@/components/apps/accounts/OfficeFundDetail";
import { getDailyFundCommits, getOfficeAccountsCached, getOfficeCached } from "@/lib/actions";
import { Box, Stack } from "@mantine/core";

export default async function OfficeAccountsPage({
  params,
  searchParams,
}: {
  params: {
    slug: string;
  };
  searchParams?: {
    from: string;
    to: string;
  };
}) {
  const officePromise = getOfficeCached(params.slug);
  const accountsPromise = getOfficeAccountsCached();
  const fundCommitsPromise = getDailyFundCommits(searchParams?.from, searchParams?.to);
  const [office, accounts, fundCommits] = await Promise.all([officePromise, accountsPromise, fundCommitsPromise]);
  const hasFund = accounts.some((account: any) => account.type === "FUND");
  const hasOffice = accounts.some((account: any) => account.type === "OFFICE");
  return (
    <div className="gap-2 p-2">
      <div className="m-2">
        {(!hasFund || !hasOffice) && (
          <AddAgentAccountForm initials={office.initials} type={hasFund ? "OFFICE" : "FUND"} />
        )}
      </div>

      <Box>
        <Stack gap="md">
          <OfficeFundDetail commits={fundCommits} office={office} />
        </Stack>
      </Box>
    </div>
  );
}
