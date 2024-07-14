import { redirect } from "next/navigation";

export default async function FormPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  redirect(`/dashboard/activity/${params.slug}/internal`);
}
