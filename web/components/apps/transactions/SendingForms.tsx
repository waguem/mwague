"use client";

import { $PaymentMethod, AgentReponseWithAccounts, Currency, OfficeResponse } from "@/lib/client";
import { currencyOptions, getAccountOptions, getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import { useTransition } from "react";
import IconSend from "@/components/icon/icon-send";
import { addTransaction } from "@/lib/actions/transactions";
import IconLoader from "@/components/icon/icon-loader";
import { useForm as useMantineForm } from "@mantine/form";
import { Button, Group, NumberInput, Select, Stack, Textarea } from "@mantine/core";
import { OfficeCurrency } from "@/lib/types";
import { decodeNotification } from "../notifications/notifications";

interface Props {
  agentWithAccounts: AgentReponseWithAccounts[];
  office: OfficeResponse;
}

interface TransactionBase {
  amount: number;
  rate: number;
  currency: string;
  message?: string;
}

interface SendingRequestForm extends TransactionBase {
  receiver_initials: string;
  type: string;
  charges: number;
  charge_pencentage: number;
  convertedAmount: number;
  payment_method: string;
  payment_currency: Currency;
}

export default function SendingForms({ agentWithAccounts, office }: Props) {
  const currencies: OfficeCurrency[] = (office.currencies as OfficeCurrency[]) || [];

  const mainCurrency = currencies.find((currency) => currency.main);
  const baseCurrency = currencies.find((currency) => currency.base);

  const form = useMantineForm<SendingRequestForm>({
    validateInputOnBlur: true,
    validateInputOnChange: true,
    initialValues: {
      rate: baseCurrency?.defaultRate || 0,
      charge_pencentage: 0,
      charges: 0,
      amount: 0,
      convertedAmount: 0,
      receiver_initials: "",
      currency: mainCurrency?.name || "",
      message: "",
      payment_currency: (baseCurrency?.name || "") as Currency,
      payment_method: "",
      type: "SENDING",
    },
  });

  const accountsOptions = getAccountOptions("AGENT", agentWithAccounts);

  const paymentMethodOptions = $PaymentMethod.enum.map((item) => ({
    label: item,
    value: item,
  }));

  const [pending, startTransition] = useTransition();

  const onSubmit = async () => {
    try {
      const data: FormData = new FormData();
      data.append("type", form.values.type);
      data.append("amount", form.values.amount.toString());
      data.append("rate", form.values.rate.toString());
      data.append("receiver_initials", form.values.receiver_initials);
      data.append("payment_currency", form.values.payment_currency);
      data.append("payment_method", form.values.payment_method);
      data.append("charges", form.values.charges.toString());
      form.values.message && data.append("message", form.values.message);
      const response = await addTransaction(null, data);
      decodeNotification("Sending Transaction", response);
      response?.status === "success" && form.reset();
    } catch (e) {}
  };
  // revalidate currentPath

  if (!accountsOptions) return null;

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="p-4 w-full lg:py-4">
        <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Add Sending Transaction</h2>
        <form action={() => startTransition(() => onSubmit())}>
          <Stack gap={"lg"}>
            <Group grow>
              <Select
                searchable
                id="payer"
                placeholder="Select an agent payer"
                key={form.key("receiver_initials")}
                label="Agent Payer"
                {...form.getInputProps("receiver_initials")}
                required
                data={accountsOptions}
                onChange={(value) => value && form.setFieldValue("receiver_initials", value)}
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
                decimalScale={3}
                allowNegative={false}
              />
            </Group>
            <Group grow>
              <Select
                searchable
                id="payment_currency"
                placeholder="Select a option"
                label="Payment Currency"
                key={form.key("payment_currency")}
                data={currencyOptions}
                {...form.getInputProps("payment_currency")}
                onChange={(value) => value && form.setFieldValue("payment_currency", value as Currency)}
              />
              <Select
                searchable
                id="payment_method"
                placeholder="Select a option"
                label="Payment Method"
                key={form.key("payment_method")}
                data={paymentMethodOptions}
                {...form.getInputProps("payment_method")}
                onChange={(value) => value && form.setFieldValue("payment_method", value)}
              />
              <NumberInput
                id="charge_pencentage"
                placeholder="Charges Percentage"
                label="Charges Percentage"
                key={form.key("charges")}
                {...form.getInputProps("charge_pencentage")}
                allowDecimal
                decimalScale={2}
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
                decimalScale={2}
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
                decimalScale={2}
                onChange={(value) => {
                  const converted = Number(value) / form.values.rate;
                  form.setValues((values) => ({
                    ...values,
                    amount: converted,
                    convertedAmount: Number(value),
                    charges: (converted * form.values.charge_pencentage) / 100,
                  }));
                }}
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
                decimalScale={2}
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
