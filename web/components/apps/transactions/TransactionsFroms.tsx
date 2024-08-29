"use client";
import { Fragment, useState } from "react";
import IconRefresh from "@/components/icon/icon-refresh";
import IconCashBanknotes from "@/components/icon/icon-cash-banknotes";
import IconSend from "@/components/icon/icon-send";
import IconBox from "@/components/icon/icon-box";
import IconBolt from "@/components/icon/icon-bolt";
import { ActivityResponse, OfficeResponse, TransactionType } from "@/lib/client";
import InternalForms from "./InternalForms";
import ExternalForms from "./ExternalForms";
import DepositForms from "./DepositForms";
import SendingForms from "./SendingForms";
import StartActivityForm from "../activity/StartActivityForm";
import ForexForms from "./ForexForms";

interface Props {
  office: OfficeResponse;
  agentAccounts: any[];
  activity: ActivityResponse;
}

export default function TransactionsForms({ agentAccounts, activity, office }: Props) {
  const [form, setForm] = useState<TransactionType>("INTERNAL");
  const navItems: {
    name: string;
    form: TransactionType;
    icon: any;
  }[] = [
    {
      name: "Internals",
      form: "INTERNAL",
      icon: IconRefresh,
    },
    {
      name: "Externals",
      form: "EXTERNAL",
      icon: IconCashBanknotes,
    },
    {
      name: "Deposits",
      form: "DEPOSIT",
      icon: IconBox,
    },
    {
      name: "Sendings",
      form: "SENDING",
      icon: IconSend,
    },
    {
      name: "ForEx",
      form: "FOREX",
      icon: IconBolt,
    },
  ];

  const getContent = (form: TransactionType) => {
    if (!activity) return <StartActivityForm office={office} />;
    switch (form) {
      case "INTERNAL":
        return <InternalForms office={office} agentWithAccounts={agentAccounts} />;
      case "EXTERNAL":
        return <ExternalForms office={office} agentWithAccounts={agentAccounts} />;
      case "DEPOSIT":
        return <DepositForms office={office} agentWithAccounts={agentAccounts} />;
      case "SENDING":
        return <SendingForms agentWithAccounts={agentAccounts} />;
      case "FOREX":
        return <ForexForms office={office} agentWithAccounts={agentAccounts} />;
      default:
        null;
    }
  };
  return (
    <Fragment>
      <div
        className={`panel dark:gray-50 absolute z-10 hidden h-full w-[250px] max-w-full flex-none space-y-3 overflow-hidden p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md`}
      >
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <button
              key={index}
              type="button"
              className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                form === item.form ? "bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary" : ""
              }`}
              onClick={() => setForm(item.form)}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 shrink-0" />
                <div className="ltr:ml-3 rtl:mr-3">{item.name}</div>
              </div>
              <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                0
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="panel h-full flex-1 overflow-x-hidden p-0">{getContent(form)}</div>
    </Fragment>
  );
}
