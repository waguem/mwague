import { getMyOfficeAgents } from "@/lib/actions";
import ExternalForms from "../../components/ExternalForms";
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
    <ExternalForms
      agentWithAccounts={agentAccounts.find((agent) => agent.initials === params.slug)}
      revalidatePath={revalidatePath}
    />
  );
}
