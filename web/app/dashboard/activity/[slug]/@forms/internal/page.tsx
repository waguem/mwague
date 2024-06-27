import { getMyOfficeAgents } from "@/lib/actions";
import InternalForms from "../../components/InternalForms";

export default async function FormPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const agentWithAccounts = await getMyOfficeAgents();
  const revalidatePath = `/dashboard/activity/${params.slug}/transactions`;
  return <InternalForms agentWithAccounts={agentWithAccounts} revalidatePath={revalidatePath} />;
}
