"use client";

import { AccountResponse, AgentReponseWithAccounts, OfficeResponse } from "@/lib/client";
import { currencySymbols, getMoneyIcon } from "@/lib/utils";
import { useTransition } from "react";
import { addTransaction } from "@/lib/actions/transactions";
import { OfficeCurrency } from "@/lib/types";
import { Button, Group, NumberInput, Select, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { isNumber } from "lodash";
import { decodeNotification } from "../notifications/notifications";
import { IconLoader, IconSend } from "@tabler/icons-react";
interface Props {
  agentWithAccounts: AgentReponseWithAccounts[];
  office: OfficeResponse;
}

interface TransactionBase {
  amount: number;
  convertedAmount: number;
  rate: number;
  currency: string;
  message?: string;
}

interface InternalRequestForm extends TransactionBase {
  sender: string;
  receiver: string;
  type: string;
  charges: number;
}

export default function InternalForms({ agentWithAccounts, office }: Props) {
  const currencies: OfficeCurrency[] = (office.currencies as OfficeCurrency[]) || [];
  const mainCurrency = currencies.find((currency) => currency.main);
  const baseCurrency = currencies.find((currency) => currency.base);

  const form = useForm<InternalRequestForm>({
    mode: "controlled",
    validateInputOnBlur: true,
    validateInputOnChange: true,
    initialValues: {
      sender: "",
      receiver: "",
      type: "INTERNAL",
      currency: mainCurrency?.name || "",
      amount: 0,
      convertedAmount: 0,
      rate: baseCurrency?.defaultRate || 0,
      charges: 0,
    },
    validate: {
      amount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      rate: (value) => (value <= 0 ? "Rate must be greater than 0" : undefined),
      convertedAmount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      sender: (value, values) => {
        if (!value) {
          return "Sender is required";
        }
        if (value === values.receiver) {
          return "Sender and receiver must be different";
        }
        return undefined;
      },
      receiver: (value, values) => {
        if (!value) {
          return "Receiver is required";
        }
        if (value === values.sender) {
          return "Sender and receiver must be different";
        }
        return undefined;
      },
    },
  });

  const accountsOptions = agentWithAccounts
    .map((agent) => agent.accounts!)
    .flat()
    .map((account: AccountResponse) => ({
      label: `${account.initials} ${currencySymbols[account.currency]}`,
      value: account.initials,
    }));

  const [pending, startTransition] = useTransition();

  const onSubmit = async () => {
    try {
      const data: FormData = new FormData();
      data.append("type", form.values.type);
      data.append("currency", form.values.currency);
      data.append("sender", form.values.sender);
      data.append("receiver", form.values.receiver);
      data.append("amount", form.values.amount.toString());
      data.append("rate", form.values.rate.toString());
      data.append("charges", form.values.charges.toString());
      form.values.message && data.append("message", form.values.message);
      const response = await addTransaction(null, data);
      decodeNotification("Internal Transaction", response);
      form.reset();
    } catch (e) {}
  };
  console.log("Values : ", form.values);
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="p-4 w-full lg:py-4">
        <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Internal Transaction</h2>
        <form action={() => startTransition(() => onSubmit())}>
          <Stack gap={"lg"}>
            <Group grow>
              <Select
                id="sender"
                placeholder="Select a option"
                label="Sender"
                key={form.key("sender")}
                {...form.getInputProps("sender")}
                required
                data={accountsOptions}
                onChange={(value) => value && form.setFieldValue("sender", value)}
              />
              <Select
                id="receiver"
                placeholder="Select a option"
                label="Receiver"
                key={form.key("receiver")}
                {...form.getInputProps("receiver")}
                required
                data={accountsOptions}
                onChange={(value) => value && form.setFieldValue("receiver", value)}
              />
            </Group>
            <Group grow>
              <NumberInput
                id="dailyRate"
                label={"Daily Rate 1 " + mainCurrency?.name}
                key={form.key("rate")}
                {...form.getInputProps("rate")}
                required
                value={form.values.rate}
                thousandSeparator=","
                decimalScale={2}
                allowDecimal
                leftSection={getMoneyIcon(baseCurrency?.name, 16)}
                allowNegative={false}
                onChange={(value) => isNumber(value) && form.setFieldValue("rate", value)}
              />
              <NumberInput
                id="charges"
                label="Charges"
                required
                key={form.key("charges")}
                {...form.getInputProps("charges")}
                leftSection={getMoneyIcon(mainCurrency?.name, 16)}
                thousandSeparator=","
                decimalScale={2}
                allowDecimal
                allowNegative={false}
                onChange={(value) => isNumber(value) && form.setFieldValue("charges", value)}
              />
            </Group>
            <Group grow>
              <NumberInput
                label="Amount"
                key={form.key("amount")}
                {...form.getInputProps("amount")}
                required
                leftSection={getMoneyIcon(mainCurrency?.name, 16)}
                thousandSeparator=","
                decimalScale={2}
                allowDecimal
                allowNegative={false}
                onChange={(value) => {
                  if (isNumber(value)) {
                    form.setValues((values) => ({
                      ...values,
                      amount: value,
                      convertedAmount: value * form.values.rate,
                    }));
                  }
                }}
              />
              <NumberInput
                label="Amount"
                required
                key={form.key("convertedAmount")}
                {...form.getInputProps("convertedAmount")}
                leftSection={getMoneyIcon(baseCurrency?.name, 16)}
                thousandSeparator=","
                decimalScale={2}
                allowDecimal
                allowNegative={false}
                onChange={(value) => {
                  if (isNumber(value)) {
                    form.setValues((values) => ({
                      ...values,
                      convertedAmount: value,
                      amount: value / form.values.rate,
                    }));
                  }
                }}
              />
            </Group>
            <Group grow>
              <Textarea
                id="message"
                label="Your message"
                rows={2}
                value={form.values.message}
                onChange={(event) => form.setFieldValue("message", event.currentTarget.value)}
                placeholder="Leave a comment..."
              />
            </Group>
            <Group grow>
              <Button
                disabled={!form.isValid()}
                type="submit"
                variant="gradient"
                gradient={{ from: "pink", to: "blue", deg: 120 }}
              >
                {!pending ? <IconSend /> : <IconLoader className="animate-spin me-2 -ms-1 text-white" />}
                Send for approval
              </Button>
            </Group>
          </Stack>
        </form>
      </div>
    </section>
  );
}
