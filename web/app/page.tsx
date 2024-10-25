import authOptions from "@/auth.config";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Admin",
};

const Organization = async () => {
  const session = await getServerSession(authOptions);
  // redirec to the logged user office
  redirect(`/dashboard/office/${session?.user.officeId}`);
  // set session token to OpenAPI header
};

export default Organization;
