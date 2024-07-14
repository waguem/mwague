import { getMyOfficeAgents } from "@/lib/actions";
import DepositForms from "../../components/DepositForms";

export default async function FormPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const agentAccounts = await getMyOfficeAgents();

  // when the form is submitted, the revalidatePath is used to revalidate the data
  // transactions are revalidate
  const revalidatePath = `/dashboard/activity/${params.slug}/transactions`;
  return (
    <DepositForms
      agentWithAccounts={agentAccounts.find((agent) => agent.initials === params.slug)}
      revalidatePath={revalidatePath}
    />
  );
}
