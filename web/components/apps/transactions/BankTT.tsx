import { AgentReponseWithAccounts, Currency, OfficeResponse } from "@/lib/client";
import { currencyOptions, getAccountOptions } from "@/lib/utils";
import { Group, NumberInput, Select, Stack, Avatar, Button, LoadingOverlay, Textarea, Divider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCurrencyDirham, IconCurrencyDollar, IconLoader, IconMessage, IconSend } from "@tabler/icons-react";
import { useTransition } from "react";
import { getMoneyIcon } from "@/lib/utils";
import { addTransaction } from "@/lib/actions/transactions";
import { decodeNotification } from "../notifications/notifications";
interface Props {
  agentWithAccounts: AgentReponseWithAccounts[];
  office: OfficeResponse;
}

interface FormInputs {
  account: string;
  currency: Currency; // buying currency
  mainCurrency: Currency;
  provider: string;
  sellingRate: number;
  amountInBuyedCurrency: number; // amount in buying currency
  amountInBaseCurrency: number;
  amountInMainCurrency: number;
  bankAmountInBaseCurrency: number;
  bankAmountInMainCurrency: number;
  dailyRate: number;
  bankRate: number;
  bankFees: number;
  message: string;
}

export default function BankTT({ agentWithAccounts, office }: Props) {
  const currencies: any = office?.currencies ?? [];

  const mainCurrency = currencies.find((currency: any) => currency?.main) as any;
  const baseCurrency = currencies.find((currency: any) => currency?.base) as any;
  const form = useForm<FormInputs>({
    initialValues: {
      account: "",
      currency: mainCurrency?.name,
      provider: "",
      dailyRate: baseCurrency?.defaultRate,
      bankRate: baseCurrency?.defaultRate,
      sellingRate: 0,
      amountInBuyedCurrency: 0,
      amountInBaseCurrency: 0,
      bankAmountInBaseCurrency: 0,
      bankAmountInMainCurrency: 0,
      bankFees: 0,
      amountInMainCurrency: 0,
      mainCurrency: mainCurrency?.name,
      message: "",
    },
    mode: "controlled",
    validate: {
      account: (value) => (value?.length > 0 ? null : "Account is required"),
      currency: (value) => (value?.length > 0 ? null : "Currency is required"),
      amountInBaseCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInBuyedCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInMainCurrency: (value) => (value > 0 ? null : "Amount is required"),
      sellingRate: (value) => (value >= 0 ? null : "Rate is required"),
      dailyRate: (value) => (value > 0 ? null : "Rate is required"),
      provider: (value) => (value?.length > 0 ? null : "Provider is required"),
    },
  });

  const [pending, startTransition] = useTransition();
  const handleSubmit = async () => {
    const data: FormData = new FormData();
    data.append("provider_account", form.values.provider);
    data.append("customer_account", form.values.account);
    data.append("base_currency", baseCurrency?.name);
    data.append("currency", form.values.currency);
    data.append("daily_rate", form.values.dailyRate.toString());
    data.append("bank_rate", form.values.bankRate.toString());
    data.append("bank_fees", form.values.bankFees.toString());
    data.append("selling_rate", form.values.sellingRate.toString());
    data.append("buying_rate", form.values.sellingRate.toString());
    data.append("amount", form.values.amountInBuyedCurrency.toString());
    data.append("message", form.values.message);
    data.append("type", "FOREX");
    data.append("tag", "BANKTT");
    const response = await addTransaction(null, data);

    decodeNotification("Forex Transaction", response, (errors) => {
      form.setErrors(errors);
    });

    response?.status === "success" && form.reset();
  };
  // when ever the agentOptions changes the agentAccounts should also change
  // the agentAccounts should be the accounts of the selected agent
  const accountsOptions = getAccountOptions("AGENT", agentWithAccounts);

  const supplierOptions = agentWithAccounts
    .filter((agent) => agent.type == "SUPPLIER")
    .map((agent) => agent.accounts!)
    .flat()
    .map((account) => ({
      label: `${account.initials}`,
      value: account.initials,
    }));

  // get main currency from office.currencies and find the associated option

  return (
    <form action={() => startTransition(() => handleSubmit())} className="p-5">
      <LoadingOverlay
        loaderProps={{ color: "pink", type: "dots" }}
        visible={pending}
        opacity={0.9}
        color="gray"
        zIndex={1000}
      />
      <Stack gap={"xl"}>
        <Group grow>
          <Select
            searchable
            data={supplierOptions}
            label="Provider"
            placeholder="Select provider"
            leftSection={<Avatar src={"/assets/avatars/avat-10.png"} alt="User avatar" size="xs" />}
            id="provider"
            required
            value={form.values.provider}
            onChange={(value) => form.setFieldValue("provider", value as any)}
          />
          <Select
            searchable
            data={accountsOptions}
            label="Customer"
            placeholder="Select Account"
            id="customer"
            value={form.values.account}
            onChange={(value) => form.setFieldValue("account", value as any)}
            required
          />
          <Select
            data={currencyOptions}
            label="Buying Currency"
            placeholder="Select currency"
            leftSection={getMoneyIcon(form.values.currency, 16)}
            id="currency"
            required
            value={form.values.currency}
            onChange={(value) => form.setFieldValue("currency", value as any)}
          />
        </Group>

        <Group grow>
          <NumberInput
            id="dailyRate"
            label={"Daily Rate 1 " + mainCurrency?.name}
            placeholder="Enter rate"
            required
            leftSection={<Group>{getMoneyIcon(baseCurrency?.name, 16)}</Group>}
            value={form.values.dailyRate}
            onChange={(value) => form.setFieldValue("dailyRate", value as any)}
            thousandSeparator=","
          />
          <NumberInput
            id="bankRate"
            label={"Bank Rate 1 " + mainCurrency?.name}
            placeholder="Enter rate"
            required
            leftSection={<Group>{getMoneyIcon(baseCurrency?.name, 16)}</Group>}
            value={form.values.bankRate}
            onChange={(value) => form.setFieldValue("bankRate", value as any)}
            thousandSeparator=","
          />
          <NumberInput
            id="bankFees"
            label={"Bank Fees"}
            placeholder="Enter rate"
            required
            leftSection={<Group>{getMoneyIcon(baseCurrency?.name, 16)}</Group>}
            value={form.values.bankFees}
            onChange={(value) => form.setFieldValue("bankFees", value as any)}
            thousandSeparator=","
          />
        </Group>
        <Group grow>
          <NumberInput
            id="charge_rate"
            label={"Customer Charge Percentage %"}
            placeholder="Enter Charge Rate"
            required
            allowNegative={false}
            decimalScale={5}
            value={form.values.sellingRate}
            leftSection={"%"}
            onChange={(value) => form.setFieldValue("sellingRate", Number(value))}
            thousandSeparator=","
          />
          <NumberInput
            decimalScale={2}
            thousandSeparator=","
            label={"TT Amount in " + form.values.currency}
            leftSection={getMoneyIcon(form.values.currency, 16)}
            placeholder="Enter amount"
            id="amount"
            required
            allowNegative={false}
            value={form.values.amountInBuyedCurrency}
            onChange={(value) => {
              const bankAmount = Number(value) * form.values.bankRate + form.values.bankFees;
              console.log(form.values.bankRate, form.values.bankFees, bankAmount);
              form.setValues({
                ...form.values,
                amountInBuyedCurrency: Number(value),
                amountInMainCurrency: Number(value) * (1 + form.values.sellingRate / 100),
                amountInBaseCurrency: Number(value) * (1 + form.values.sellingRate / 100) * form.values.dailyRate,
                bankAmountInBaseCurrency: bankAmount,
                bankAmountInMainCurrency: bankAmount / form.values.dailyRate,
              });
            }}
          />
        </Group>
        <Divider label="Bank Payment" />
        <Group grow>
          <NumberInput
            decimalScale={2}
            thousandSeparator=","
            label={"Amount in " + baseCurrency?.name}
            placeholder="Enter amount"
            id="amountInBaseCurrency"
            required
            readOnly
            value={form.values.bankAmountInBaseCurrency}
            allowNegative={false}
            leftSection={<IconCurrencyDirham size={16} />}
          />
          <NumberInput
            decimalScale={2}
            thousandSeparator=","
            label={"Payment in " + mainCurrency?.name}
            leftSection={<IconCurrencyDollar size={16} />}
            placeholder="Enter amount"
            id="sellingAmount"
            required
            readOnly
            allowNegative={false}
            value={form.values.bankAmountInMainCurrency}
          />
        </Group>
        <Divider label="Customer Payment" />
        <Group grow>
          <NumberInput
            decimalScale={2}
            thousandSeparator=","
            label={"Amount in " + baseCurrency?.name}
            placeholder="Enter amount"
            id="amountInBaseCurrency"
            required
            value={form.values.amountInBaseCurrency}
            allowNegative={false}
            leftSection={<IconCurrencyDirham size={16} />}
            onChange={(value) => {
              const amount = Number(value) / form.values.dailyRate;
              form.setValues({
                ...form.values,
                amountInBaseCurrency: Number(value),
                amountInBuyedCurrency: amount / (1 + form.values.sellingRate / 100),
                amountInMainCurrency: amount,
              });
            }}
          />
          <NumberInput
            decimalScale={2}
            thousandSeparator=","
            label={"Payment in " + mainCurrency?.name}
            leftSection={<IconCurrencyDollar size={16} />}
            placeholder="Enter amount"
            id="sellingAmount"
            required
            allowNegative={false}
            value={form.values.amountInMainCurrency}
            onChange={(value) => {
              const amount = Number(value);
              form.setValues({
                ...form.values,
                amountInMainCurrency: Number(value),
                amountInBuyedCurrency: amount / (1 + form.values.sellingRate / 100),
                amountInBaseCurrency: Number(value) * form.values.dailyRate,
              });
            }}
          />
        </Group>
        <Divider label="Benefit" />
        <Group grow>
          <Textarea
            rows={2}
            value={form.values.message}
            onChange={(event) => form.setFieldValue("message", event.currentTarget.value)}
            placeholder="Enter message"
            label={
              <Group gap="xs">
                <IconMessage size={16} />
                Your Message
              </Group>
            }
            id="message"
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
  );
}
