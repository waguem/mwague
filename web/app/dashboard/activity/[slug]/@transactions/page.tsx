import { redirect } from "next/navigation";

export default async function TransactionsPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  redirect(`/dashboard/activity/${params.slug}/transactions`);
}
