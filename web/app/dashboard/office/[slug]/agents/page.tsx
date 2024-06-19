import AgentListPagination from "@/components/apps/agents/AgentListPagination";
import { cache, Fragment } from "react";
import { getOfficeAgents } from "@/lib/actions";

const getAgents = cache(async (officeId: string) => {
  let response: Awaited<ReturnType<typeof getOfficeAgents>> = [];
  try {
    return await getOfficeAgents(officeId);
  } catch (e) {
    console.error(e);
  }
  return response;
});

export default async function AgentPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const agents = await getAgents(params.slug);

  return (
    <Fragment>
      <AgentListPagination agents={agents} />
    </Fragment>
  );
}

export const revalidate = 60 * 60 * 3;
