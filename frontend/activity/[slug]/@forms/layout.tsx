import TransactionFormHeader from "../components/TransactionFormHeader";
import IconBolt from "@/components/icon/icon-bolt";
import IconBox from "@/components/icon/icon-box";
import IconCashBanknotes from "@/components/icon/icon-cash-banknotes";

import IconRefresh from "@/components/icon/icon-refresh";
import IconSend from "@/components/icon/icon-send";

export default async function FormLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}) {
  const className = "mx-auto mb-1 h-5 w-5";
  const forms = [
    {
      name: "Internals",
      url: `/dashboard/activity/${params.slug}/internal`,
      icon: <IconRefresh className={className} />,
    },
    {
      name: "Deposits",
      url: `/dashboard/activity/${params.slug}/deposit`,
      icon: <IconBox className={className} />,
    },
    {
      name: "Externals",
      url: `/dashboard/activity/${params.slug}/external`,
      icon: <IconCashBanknotes className={className} />,
    },
    {
      name: "Sendings",
      url: `/dashboard/activity/${params.slug}/sending`,
      icon: <IconSend className={className} />,
    },
    {
      name: "ForEx",
      url: `/dashboard/activity/${params.slug}/forex`,
      icon: <IconBolt className={className} />,
    },
  ];
  return (
    <div>
      <TransactionFormHeader navItems={forms} />
      {children}
    </div>
  );
}
