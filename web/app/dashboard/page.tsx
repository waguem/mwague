import { Metadata } from "next";
import React from "react";
import {getOrganizationsApiV1OrgOrganizationGet as getOrganizations} from "@/lib/client"
import { OpenAPI } from "@/lib/client";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "Admin",
};


const  Sales = async () => {
  const session = await getServerSession()
  console.log("Session ",session)
  OpenAPI.interceptors.request.use((req)=>{
    console.log("Base  Url ",)
    req.headers = {
      ...req.headers,
      "Authorization": `bearer ${session?.access_token}`
    }
    console.log("Request ",req)
    return req
  })
  const organizations: Awaited<ReturnType<typeof getOrganizations>> = await getOrganizations()
  console.log(organizations)
  return <div>starter page</div>;
};

export default Sales;
