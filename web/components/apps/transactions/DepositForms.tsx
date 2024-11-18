"use client";

import { AccountResponse, AgentReponseWithAccounts, OfficeResponse } from "@/lib/client";
import { defaultTags, getAccountOptions, getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import { useTransition } from "react";

import { useForm } from "@mantine/form";
import { OfficeCurrency } from "@/lib/types";
import { Button, Group, NumberInput, Select, Stack, TagsInput, Textarea } from "@mantine/core";
import { IconLoader, IconSend } from "@tabler/icons-react";
import { addTransaction } from "@/lib/actions/transactions";
import { decodeNotification } from "../notifications/notifications";
interface Props {
  agentWithAccounts: AgentReponseWithAccounts[];
  officeAccounts: AccountResponse[];
  office: OfficeResponse;
}

interface TransactionBase {
  amount: number;
  convertedAmount: number;
  rate: number;
  currency: string;
  message?: string;
}

interface DepositRequestForm extends TransactionBase {
  receiver: string;
  type: string;
  tags?: string[];
}

export default function DepositForms({ agentWithAccounts, office, officeAccounts }: Props) {
  const currencies: OfficeCurrency[] = (office.currencies as OfficeCurrency[]) || [];
  const mainCurrency = currencies.find((currency) => currency.main);
  const baseCurrency = currencies.find((currency) => currency.base);

  const form = useForm<DepositRequestForm>({
    validateInputOnBlur: true,
    validateInputOnChange: true,
    initialValues: {
      receiver: "",
      type: "DEPOSIT",
      currency: mainCurrency?.name || "",
      amount: 0,
      convertedAmount: 0,
      rate: baseCurrency?.defaultRate || 0,
      tags: [],
      message: "",
    },
    validate: {
      receiver: (value) => (!value ? "Receiver is required" : undefined),
      amount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      convertedAmount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      rate: (value) => (value <= 0 ? "Rate must be greater than 0" : undefined),
    },
  });

  const agentAccountsOptions = getAccountOptions("AGENT", agentWithAccounts);
  const officeAccountsOptions = officeAccounts
    ?.filter((ac) => ac.type === "OFFICE")
    .map((account) => ({ value: account.initials, label: `[${account.type}] ${account.initials}` }));

  const accountsOptions = [...agentAccountsOptions, ...officeAccountsOptions];
  const [pending, startTransition] = useTransition();

  const onSubmit = async () => {
    const data: FormData = new FormData();
    data.append("receiver", form.values.receiver);
    data.append("type", form.values.type);
    data.append("currency", mainCurrency?.name || "");
    data.append("amount", form.values.amount.toString());
    data.append("rate", form.values.rate.toString());
    data.append("message", form.values.message || "");
    if (form.values.tags?.length) {
      data.append("tags", form.values.tags.join(","));
    }
    const respsonse = await addTransaction(null, data);
    decodeNotification("Deposit", respsonse);
    respsonse?.status === "success" && form.reset();
  };

  const isOfficeSelected = officeAccounts?.find((ac) => ac.initials === form.values.receiver);

  if (!accountsOptions) return null;

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="p-4 w-full lg:py-4">
        <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Add a Deposit Transaction</h2>
        <form action={() => startTransition(() => onSubmit())}>
          <Stack gap={"lg"}>
            <Group grow>
              <Select
                searchable
                id="receiver"
                placeholder="Select a option"
                label="Receiver"
                key={form.key("receiver")}
                data={accountsOptions}
                {...form.getInputProps("receiver")}
                onChange={(value) => value && form.setFieldValue("receiver", value)}
              />
              <NumberInput
                id="rate"
                label={"Daily Rate 1 " + getMoneyPrefix(mainCurrency?.name)}
                placeholder="Enter rate"
                key={form.key("rate")}
                {...form.getInputProps("rate")}
                leftSection={getMoneyIcon(baseCurrency?.name)}
                required
                allowDecimal
                thousandSeparator=","
                decimalScale={2}
                allowNegative={false}
              />
              {isOfficeSelected && <TagsInput label="Benefit Tag" data={defaultTags} {...form.getInputProps("tags")} />}
            </Group>
            <Group grow>
              <NumberInput
                id="amount"
                label={"Amount in " + getMoneyPrefix(mainCurrency?.name)}
                placeholder="Amount"
                key={form.key("amount")}
                {...form.getInputProps("amount")}
                required
                allowDecimal
                leftSection={getMoneyIcon(mainCurrency?.name)}
                thousandSeparator=","
                decimalScale={2}
                onChange={(value) =>
                  form.setValues((values) => ({
                    ...values,
                    amount: Number(value),
                    convertedAmount: Number(value) * form.values.rate,
                  }))
                }
                allowNegative={false}
              />
              <NumberInput
                id="convertedAmount"
                label={"Amount in " + getMoneyPrefix(baseCurrency?.name)}
                placeholder={"Amount in " + getMoneyPrefix(baseCurrency?.name)}
                key={form.key("convertedAmount")}
                {...form.getInputProps("convertedAmount")}
                required
                leftSection={getMoneyIcon(baseCurrency?.name)}
                onChange={(value) =>
                  form.setValues((values) => ({
                    ...values,
                    convertedAmount: Number(value),
                    amount: Number(value) / form.values.rate,
                  }))
                }
                allowDecimal
                thousandSeparator=","
                decimalScale={2}
                allowNegative={false}
              />
            </Group>
            <Group grow>
              <Textarea
                label="Your message"
                placeholder="Leave a comment..."
                {...form.getInputProps("message")}
                onChange={(event) => form.setFieldValue("message", event.currentTarget.value)}
              />
            </Group>
            <Group grow>
              <Button
                disabled={!form.isValid()}
                type="submit"
                variant="gradient"
                gradient={{ from: "pink", to: "blue", deg: 120 }}
              >
                {!pending ? <IconSend /> : <IconLoader className="animate-spin text-white" />}
                Send for approval
              </Button>
            </Group>
          </Stack>
        </form>
      </div>
    </section>
  );
}
