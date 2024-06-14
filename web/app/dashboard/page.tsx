import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin",
};

const Organization = async () => {
  // set session token to OpenAPI header
  redirect("/dashboard/organization");
};

export default Organization;
