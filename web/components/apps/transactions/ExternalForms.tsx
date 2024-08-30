"use client";

import { AgentReponseWithAccounts, Currency, OfficeResponse } from "@/lib/client";
import { getAccountOptions, getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import { useTransition } from "react";
import { addTransaction } from "@/lib/actions/transactions";
import { useForm as useMantineForm } from "@mantine/form";
import { Button, Group, NumberInput, Select, Stack, Textarea } from "@mantine/core";
import { OfficeCurrency } from "@/lib/types";
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

interface ExternalRequestForm extends TransactionBase {
  sender: string;
  type: string;
  charges: number;
  customer_name: string;
  currency: Currency;
  customer_phone: string;
  payment_currency: Currency;
  charge_pencentage: number;
}

export default function ExternalForms({ agentWithAccounts, office }: Props) {
  const currencies: OfficeCurrency[] = (office.currencies as OfficeCurrency[]) || [];

  const mainCurrency = currencies.find((currency) => currency.main);
  const baseCurrency = currencies.find((currency) => currency.base);
  const form = useMantineForm<ExternalRequestForm>({
    validateInputOnBlur: true,
    validateInputOnChange: true,
    initialValues: {
      sender: "",
      type: "EXTERNAL",
      currency: "USD",
      payment_currency: "AED",
      amount: 0,
      convertedAmount: 0,
      customer_name: "",
      customer_phone: "",
      rate: baseCurrency?.defaultRate || 0,
      charges: 0,
      charge_pencentage: 0,
    },
    validate: {
      sender: (value) => (!value ? "Sender is required" : undefined),
      amount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      convertedAmount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      rate: (value) => (value <= 0 ? "Rate must be greater than 0" : undefined),
    },
  });

  const accountsOptions = getAccountOptions("AGENT", agentWithAccounts);
  const [pending, startTransition] = useTransition();

  const onSubmit = async () => {
    try {
      const data: FormData = new FormData();
      data.append("sender", form.values.sender);
      data.append("type", form.values.type);
      data.append("currency", form.values.currency);
      data.append("payment_currency", form.values.payment_currency);
      data.append("amount", form.values.amount.toString());
      data.append("rate", form.values.rate.toString());
      data.append("charges", form.values.charges.toString());
      form.values.message && data.append("message", form.values.message);
      const response = await addTransaction(null, data);
      decodeNotification("External Transaction", response);
      response?.status === "success" && form.reset();
    } catch (e) {}
  };

  if (!accountsOptions) return null;

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="p-4 w-full lg:py-4">
        <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Add External Transaction</h2>
        <form action={() => startTransition(() => onSubmit())}>
          <Stack gap={"lg"}>
            <Group grow>
              <Select
                id="sender"
                placeholder="Select a option"
                label="Sender"
                key={form.key("sender")}
                data={accountsOptions}
                {...form.getInputProps("sender")}
                onChange={(value) => value && form.setFieldValue("sender", value)}
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
                allowNegative={false}
              />
              <NumberInput
                id="charge_pencentage"
                placeholder="Charges Percentage"
                label="Charges Percentage"
                key={form.key("charges")}
                {...form.getInputProps("charge_pencentage")}
                allowDecimal
                leftSection="%"
                max={100}
                min={0}
                required
              />
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
                onChange={(value) =>
                  form.setValues((values) => ({
                    ...values,
                    amount: Number(value),
                    convertedAmount: Number(value) * form.values.rate,
                    charges: (Number(value) * form.values.charge_pencentage) / 100,
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
                allowDecimal
                thousandSeparator=","
                allowNegative={false}
              />
              <NumberInput
                id="charges"
                label={"Charges in " + getMoneyPrefix(mainCurrency?.name)}
                placeholder={"Charges in " + getMoneyPrefix(mainCurrency?.name)}
                key={form.key("charges")}
                {...form.getInputProps("charges")}
                required
                leftSection={getMoneyIcon(mainCurrency?.name)}
                allowDecimal
                thousandSeparator=","
                allowNegative={false}
                decimalScale={3}
              />
            </Group>
            <Group grow>
              <Textarea
                key={form.key("message")}
                {...form.getInputProps("message")}
                label="Your message"
                placeholder="Leave a comment..."
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
