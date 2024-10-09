"use client";
import { useState } from "react";
import IconRefresh from "@/components/icon/icon-refresh";
import IconCashBanknotes from "@/components/icon/icon-cash-banknotes";
import IconSend from "@/components/icon/icon-send";
import IconBox from "@/components/icon/icon-box";
import IconBolt from "@/components/icon/icon-bolt";
import { AccountResponse, ActivityResponse, OfficeResponse, TransactionType } from "@/lib/client";
import InternalForms from "./InternalForms";
import ExternalForms from "./ExternalForms";
import DepositForms from "./DepositForms";
import SendingForms from "./SendingForms";
import StartActivityForm from "../activity/StartActivityForm";
import ForexForms from "./ForexForms";
import { Badge, Card, Flex, Grid, GridCol, NumberFormatter } from "@mantine/core";
import BankTT from "./BankTT";
import { getMoneyPrefix } from "@/lib/utils";
import { OfficeCurrency } from "@/lib/types";

interface Props {
  officeAccounts: AccountResponse[];
  office: OfficeResponse;
  agentAccounts: any[];
  activity: ActivityResponse;
}

export default function TransactionsForms({ agentAccounts, activity, office, officeAccounts }: Props) {
  const [form, setForm] = useState<TransactionType | "BANKTT">("INTERNAL");
  const navItems: {
    name: string;
    form: TransactionType | "BANKTT";
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
      name: "Foreign Exchange",
      form: "FOREX",
      icon: IconBolt,
    },
    {
      name: "Bank TT",
      form: "BANKTT",
      icon: IconCashBanknotes,
    },
  ];

  const getContent = (form: TransactionType | "BANKTT") => {
    if (!activity) return <StartActivityForm office={office} />;
    switch (form) {
      case "INTERNAL":
        return <InternalForms officeAccounts={officeAccounts} office={office} agentWithAccounts={agentAccounts} />;
      case "EXTERNAL":
        return <ExternalForms officeAccounts={officeAccounts} office={office} agentWithAccounts={agentAccounts} />;
      case "DEPOSIT":
        return <DepositForms officeAccounts={officeAccounts} office={office} agentWithAccounts={agentAccounts} />;
      case "SENDING":
        return <SendingForms office={office} agentWithAccounts={agentAccounts} />;
      case "FOREX":
        return <ForexForms office={office} agentWithAccounts={agentAccounts} />;
      case "BANKTT":
        return <BankTT office={office} agentWithAccounts={agentAccounts} />;
      default:
        null;
    }
  };

  const currencies: OfficeCurrency[] = office?.currencies as unknown as OfficeCurrency[];
  const baseCurrency = currencies?.find((c) => c.base);
  return (
    <Grid>
      <GridCol
        span={{
          base: 4,
          md: 12,
          sm: 12,
          xs: 12,
          lg: 4,
        }}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Grid className="h-full">
          <GridCol span={12}>
            <Card withBorder>
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
            </Card>
          </GridCol>
          <GridCol>
            <Card withBorder className="mt-2">
              <Flex justify={"space-between"}>
                <Badge variant="dot" size="xl" radius={"sm"}>
                  FUND BALANCE
                </Badge>
                <Badge variant="dot" size="xl" radius={"sm"}>
                  <NumberFormatter
                    value={officeAccounts?.find((a) => a.type == "FUND")?.balance ?? 0}
                    thousandSeparator
                    decimalScale={3}
                    prefix={getMoneyPrefix(officeAccounts?.find((a) => a.type === "FUND")?.currency)}
                  />{" "}
                  /{" "}
                  <NumberFormatter
                    value={(officeAccounts?.find((a) => a.type == "FUND")?.balance ?? 0) * baseCurrency!.defaultRate}
                    thousandSeparator
                    decimalScale={3}
                    prefix={getMoneyPrefix(baseCurrency!.name)}
                  />
                </Badge>
              </Flex>
            </Card>
          </GridCol>
          <GridCol>
            <Card withBorder className="mt-2">
              <Flex justify={"space-between"}>
                <Badge variant="dot" size="xl" radius={"sm"}>
                  Office Account
                </Badge>
                <Badge variant="dot" size="xl" radius={"sm"}>
                  <NumberFormatter
                    value={officeAccounts?.find((a) => a.type == "OFFICE")?.balance ?? 0}
                    thousandSeparator
                    decimalScale={3}
                    prefix={getMoneyPrefix(officeAccounts?.find((a) => a.type === "OFFICE")?.currency)}
                  />{" "}
                  /{" "}
                  <NumberFormatter
                    value={(officeAccounts?.find((a) => a.type == "OFFICE")?.balance ?? 0) * baseCurrency!.defaultRate}
                    thousandSeparator
                    decimalScale={3}
                    prefix={getMoneyPrefix(baseCurrency!.name)}
                  />
                </Badge>
              </Flex>
            </Card>
          </GridCol>
        </Grid>
      </GridCol>
      <GridCol
        span={{
          base: 8,
          md: 12,
          sm: 12,
          xs: 12,
          lg: 8,
        }}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Card withBorder className="w-full">
          {getContent(form)}
        </Card>
      </GridCol>
    </Grid>
  );
}
