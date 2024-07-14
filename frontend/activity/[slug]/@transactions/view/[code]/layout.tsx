import TransactionHeader from "../../../components/TransactionFormHeader";
import IconArrowBackward from "@/components/icon/icon-arrow-backward";

export default async function TransactionDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    code: string;
    slug: string;
  };
}) {
  const className = "mx-auto mb-1 h-5 w-5";
  const navItems = [
    {
      name: "Back",
      url: `/dashboard/activity/${params.slug}/transactions`,
      icon: <IconArrowBackward className={className} />,
    },
  ];
  return (
    <div>
      <TransactionHeader navItems={navItems} />
      {children}
    </div>
  );
}
