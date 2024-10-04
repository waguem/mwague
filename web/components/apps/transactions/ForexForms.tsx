import { AgentReponseWithAccounts, Currency, OfficeResponse } from "@/lib/client";
import { currencyOptions, getAccountOptions } from "@/lib/utils";
import { Group, NumberInput, Select, Stack, Avatar, Button, LoadingOverlay, Textarea, TagsInput } from "@mantine/core";
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
  buyingRate: number;
  sellingRate: number;
  intermeditateByingRate: number; // given by the provider
  intermediateSellingRate: number; // given to the client
  amountInBuyedCurrency: number; // amount in buying currency
  amountInBaseCurrency: number;
  amountInMainCurrency: number;
  dailyRate: number;
  message: string;
  tag: string;
}

export default function ForexForms({ agentWithAccounts, office }: Props) {
  const currencies: any = office?.currencies ?? [];

  const mainCurrency = currencies.find((currency: any) => currency?.main) as any;
  const baseCurrency = currencies.find((currency: any) => currency?.base) as any;
  const form = useForm<FormInputs>({
    initialValues: {
      account: "",
      currency: mainCurrency?.name,
      provider: "",
      dailyRate: baseCurrency?.defaultRate,
      buyingRate: 0,
      sellingRate: 0,
      amountInBuyedCurrency: 0,
      amountInBaseCurrency: 0,
      amountInMainCurrency: 0,
      intermediateSellingRate: 0,
      intermeditateByingRate: 0,
      mainCurrency: mainCurrency?.name,
      message: "",
      tag: "ALI PAY",
    },
    mode: "controlled",
    validate: {
      account: (value) => (value?.length > 0 ? null : "Account is required"),
      currency: (value) => (value?.length > 0 ? null : "Currency is required"),
      amountInBaseCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInBuyedCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInMainCurrency: (value) => (value > 0 ? null : "Amount is required"),
      buyingRate: (value) => (value > 0 ? null : "Rate is required"),
      sellingRate: (value) => (value > 0 ? null : "Rate is required"),
      intermeditateByingRate: (value) => (value > 0 ? null : "Rate is required"),
      dailyRate: (value) => (value > 0 ? null : "Rate is required"),
      provider: (value) => (value?.length > 0 ? null : "Provider is required"),
      intermediateSellingRate: (value) => (value > 0 ? null : "Rate is required"),
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
    data.append("buying_rate", form.values.buyingRate.toString());
    data.append("selling_rate", form.values.sellingRate.toString());
    data.append("amount", form.values.amountInBuyedCurrency.toString());
    data.append("message", form.values.message);
    data.append("type", "FOREX");
    data.append("tag", form.values.tag);
    const response = await addTransaction(null, data);

    decodeNotification("Forex Transaction", response, (errors) => {
      form.setErrors(errors);
    });
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
      <LoadingOverlay visible={pending} opacity={0.9} color="gray" zIndex={1000} />
      <Stack gap={"xl"}>
        <Group grow>
          <Select
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
            data={accountsOptions}
            label="Customer"
            placeholder="Select Account"
            id="customer"
            value={form.values.account}
            onChange={(value) => form.setFieldValue("account", value as any)}
            required
          />
          <Select
            label="Tag"
            placeholder="Select a Tag"
            value={form.values.tag}
            onChange={(value) => form.setFieldValue("tag", value as string)}
            data={["ALI PAY", "TT RMB", "BANK TT"]}
          />
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
            id="intermeditateByingRate"
            label={"Buying Rate 1" + baseCurrency?.name}
            placeholder="Enter intermediate rate"
            required
            value={form.values.intermeditateByingRate}
            leftSection={getMoneyIcon(form.values.currency, 16)}
            allowNegative={false}
            onChange={(value) => {
              form.setValues({
                ...form.values,
                intermeditateByingRate: Number(value),
                buyingRate: Number(value) * form.values.dailyRate,
                sellingRate: 0,
              });
            }}
            thousandSeparator=","
          />
          <NumberInput
            id="buyingRate"
            label={"Buying Rate 1" + mainCurrency?.name}
            placeholder="Enter buying rate"
            required
            allowNegative={false}
            decimalScale={5}
            value={form.values.buyingRate}
            leftSection={getMoneyIcon(form.values.currency, 16)}
            onChange={(value) => form.setFieldValue("buyingRate", Number(value))}
            thousandSeparator=","
          />
          <NumberInput
            id="sellingRate"
            label={"Selling Rate 1" + mainCurrency?.name}
            placeholder="Enter selling rate"
            required
            allowNegative={false}
            value={form.values.sellingRate}
            leftSection={getMoneyIcon(form.values.currency, 16)}
            onChange={(value) => {
              form.setValues({
                ...form.values,
                sellingRate: Number(value),
                intermediateSellingRate: Number(value) / form.values.dailyRate,
              });
            }}
            thousandSeparator=","
          />
        </Group>

        <Group grow>
          <NumberInput
            decimalScale={2}
            thousandSeparator=","
            label={"Amount in " + form.values.currency}
            leftSection={getMoneyIcon(form.values.currency, 16)}
            placeholder="Enter amount"
            id="amount"
            required
            allowNegative={false}
            value={form.values.amountInBuyedCurrency}
            onChange={(value) => {
              form.setValues({
                ...form.values,
                amountInBuyedCurrency: Number(value),
                amountInMainCurrency: Number(value) / form.values.sellingRate,
                amountInBaseCurrency: (Number(value) / form.values.sellingRate) * form.values.dailyRate,
              });
            }}
          />
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
              const amount = Number(value) * form.values.intermediateSellingRate;
              form.setValues({
                ...form.values,
                amountInBaseCurrency: Number(value),
                amountInBuyedCurrency: amount,
                amountInMainCurrency: amount / form.values.sellingRate,
              });
            }}
          />
          <NumberInput
            decimalScale={2}
            thousandSeparator=","
            label={"Amount in " + mainCurrency?.name}
            leftSection={<IconCurrencyDollar size={16} />}
            placeholder="Enter amount"
            id="sellingAmount"
            required
            allowNegative={false}
            value={form.values.amountInMainCurrency}
            onChange={(value) => {
              const amount = Number(value) * form.values.sellingRate;
              form.setValues({
                ...form.values,
                amountInMainCurrency: Number(value),
                amountInBuyedCurrency: amount,
                amountInBaseCurrency: Number(value) * form.values.dailyRate,
              });
            }}
          />
        </Group>
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
