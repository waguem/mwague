import authOptions from "@/auth.config";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import logger from "@/lib/logger";
export const metadata: Metadata = {
  title: "Admin",
};

const Organization = async () => {
  logger.info("Loading Dahboard page...");
  const session = await getServerSession(authOptions);
  // redirec to the logged user office
  if (!session?.user?.officeId) {
    redirect("/auth/login");
  }

  redirect(`/office/${session?.user.officeId}/transactions`);
  // set session token to OpenAPI header
};

export default Organization;
