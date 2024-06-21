import IconFile from "@/components/icon/icon-file";
import IconHome from "@/components/icon/icon-home";
import IconOpenBook from "@/components/icon/icon-open-book";
import IconRefresh from "@/components/icon/icon-refresh";
import InnerPageNavigation from "@/components/layouts/InnerPageNavigation";
import { withToken } from "@/lib/actions/withToken";
import { AgentResponse, getAgentApiV1OfficeAgentAgentInitialsGet as getAgentByInitials } from "@/lib/client";
import { redirect } from "next/navigation";

async function getAgent(initials: string): Promise<AgentResponse | null> {
  return withToken(async () => {
    try {
      const agent = await getAgentByInitials({
        agentInitials: initials,
      });
      return agent;
    } catch (e) {
      console.error(e);
    }
  });
}
export default async function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const agent: Awaited<ReturnType<typeof getAgent>> = await getAgent(params.slug);

  const getNavigationItems = (agent: any) => {
    return [
      {
        name: "Home",
        url: `/dashboard/agent/${agent.initials}`,
        icon: <IconHome className="h-5 w-5" />,
      },
      {
        name: "Transactions",
        url: "#",
        icon: <IconRefresh className="h-5 w-5" />,
      },
      {
        name: "Accounts",
        url: `/dashboard/agent/${agent.initials}/accounts`,
        icon: <IconOpenBook className="h-5 w-5" />,
      },
      {
        name: "Reports",
        url: "#",
        icon: <IconFile className="h-5 w-5" />,
      },
    ];
  };

  if (!agent) {
    redirect("/not-found");
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h5 className="text-lg font-semibold dark:text-white-light">Agent {agent.name}</h5>
      </div>
      <InnerPageNavigation navItems={getNavigationItems(agent)} />
      {children}
    </div>
  );
}
