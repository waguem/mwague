import { AgentReponseWithAccounts, Currency, OfficeResponse } from "@/lib/client";
import { currencyOptions } from "@/lib/utils";
import {
  Grid,
  GridCol,
  Group,
  NumberInput,
  Text,
  Select,
  Stack,
  NumberFormatter,
  Tooltip,
  Paper,
  Space,
  Avatar,
  Button,
  LoadingOverlay,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCurrencyDirham, IconCurrencyDollar, IconMessage, IconSend } from "@tabler/icons-react";
import { useTransition } from "react";
import { getMoneyIcon } from "@/lib/utils";
import { addTransaction } from "@/lib/actions/transactions";
import { decodeNotification } from "../notifications/notifications";
interface Props {
  agentWithAccounts: AgentReponseWithAccounts[];
  office: OfficeResponse;
}

interface FormInputs {
  agent: string;
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
}

export default function ForexForms({ agentWithAccounts, office }: Props) {
  const currencies: any = office?.currencies ?? [];

  const mainCurrency = currencies.find((currency: any) => currency?.main) as any;
  const baseCurrency = currencies.find((currency: any) => currency?.base) as any;
  const form = useForm<FormInputs>({
    initialValues: {
      agent: "",
      account: "",
      currency: mainCurrency?.name,
      provider: "",
      dailyRate: mainCurrency?.defaultRate,
      buyingRate: 0,
      sellingRate: 0,
      amountInBuyedCurrency: 0,
      amountInBaseCurrency: 0,
      amountInMainCurrency: 0,
      intermediateSellingRate: 0,
      intermeditateByingRate: 0,
      mainCurrency: mainCurrency?.name,
      message: "",
    },
    mode: "controlled",
    validate: {
      account: (value) => (value.length > 0 ? null : "Account is required"),
      agent: (value) => (value.length > 0 ? null : "Agent is required"),
      currency: (value) => (value.length > 0 ? null : "Currency is required"),
      amountInBaseCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInBuyedCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInMainCurrency: (value) => (value > 0 ? null : "Amount is required"),
      buyingRate: (value) => (value > 0 ? null : "Rate is required"),
      sellingRate: (value) => (value > 0 ? null : "Rate is required"),
      intermeditateByingRate: (value) => (value > 0 ? null : "Rate is required"),
      dailyRate: (value) => (value > 0 ? null : "Rate is required"),
      provider: (value) => (value.length > 0 ? null : "Provider is required"),
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
    const response = await addTransaction(null, data);

    decodeNotification("Forex Transaction", response, (errors) => {
      form.setErrors(errors);
    });
  };
  const agentOptions = agentWithAccounts.map((agent) => ({
    label: agent.name,
    value: agent.initials,
  }));
  // when ever the agentOptions changes the agentAccounts should also change
  // the agentAccounts should be the accounts of the selected agent
  const accountsOptions =
    agentWithAccounts
      .find((agent) => agent.initials === form.values.agent)
      ?.accounts?.map((account) => ({
        label: `${account.initials} ${account.currency}`,
        value: account.initials,
      })) ?? [];

  const supplierOptions = agentWithAccounts
    .filter((agent) => agent.type == "SUPPLIER")
    .map((agent) => agent.accounts!)
    .flat()
    .map((account) => ({
      label: `${account.initials}`,
      value: account.initials,
    }));

  // get main currency from office.currencies and find the associated option

  const getMainCurrencyOption = () => {
    const currencies: { name: string; main: boolean }[] = office?.currencies ?? ([] as any);
    const mainCurrency = currencies.find((currency) => currency.main);
    return currencyOptions.find((currency) => currency.value === mainCurrency?.name);
  };

  return (
    <form action={() => startTransition(() => handleSubmit())}>
      <Grid style={{ padding: "10px" }}>
        <LoadingOverlay visible={pending} opacity={0.9} color="gray" zIndex={1000} />
        <GridCol span={8} style={{ margin: "0" }}>
          <Stack gap={"xl"}>
            <Group grow>
              <Select
                data={currencyOptions}
                label="Main Currency"
                placeholder="Select currency"
                leftSection={getMoneyIcon(mainCurrency?.name, 16)}
                id="currency"
                defaultValue={getMainCurrencyOption()?.value}
                readOnly
                required
              />
              <NumberInput
                id="dailyRate"
                label={"Daily Rate 1 " + mainCurrency?.name}
                placeholder="Enter rate"
                required
                leftSection={
                  <Group>
                    <Tooltip label="aed">{getMoneyIcon(baseCurrency?.name, 16)}</Tooltip>
                  </Group>
                }
                value={form.values.dailyRate}
                onChange={(value) => form.setFieldValue("dailyRate", value as any)}
                thousandSeparator=","
              />
            </Group>
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
                data={agentOptions}
                label="Agent"
                placeholder="Select agent"
                id="agent"
                value={form.values.agent}
                onChange={(value) => {
                  form.setValues({
                    ...form.values,
                    agent: value as any,
                    account: "",
                  });
                }}
                required
              />
              <Select
                data={accountsOptions}
                label="Account"
                placeholder="Select Account"
                id="account"
                value={form.values.account}
                onChange={(value) => form.setFieldValue("account", value as any)}
                required
              />
            </Group>
            <Group grow>
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
                leftSection={getMoneyIcon(baseCurrency?.name, 16)}
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
                leftSection={getMoneyIcon(baseCurrency?.name, 16)}
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
          </Stack>
        </GridCol>
        <GridCol span={4} p={"xs"} pt="md">
          <Stack gap="xs">
            <Paper shadow="xs" radius={"md"} p="xl">
              <Grid>
                <GridCol span={4}>
                  <Group gap="sm">
                    <Avatar src={"/assets/avatars/avat-1.png"} alt="User avatar" size="md" />
                    {form.values.provider}
                    <NumberFormatter value={100000} thousandSeparator="," prefix="$" color="red" />
                  </Group>
                </GridCol>
                <GridCol span={8}>
                  <Text fz={"md"} fw={500}>
                    Selling 1 AED = 1.971 RMB
                  </Text>
                  <Space h="md" />
                  <Text fz={"md"} fw={500}>
                    <NumberFormatter
                      value={form.values.amountInBuyedCurrency}
                      thousandSeparator=","
                      prefix={"¥"}
                      decimalScale={2}
                    />{" "}
                    = <NumberFormatter value={form.values.amountInBaseCurrency} decimalScale={2} suffix=" aed" />
                  </Text>
                </GridCol>
              </Grid>
            </Paper>
            <Paper shadow="xs" radius={"md"} p="xl">
              <Grid>
                <GridCol span={4}>
                  <Group gap="sm">
                    <Avatar src={"/assets/avatars/avat-1.png"} alt="User avatar" size="md" />
                    {form.values.provider}
                    <NumberFormatter value={100000} thousandSeparator="," prefix="$" color="red" />
                  </Group>
                </GridCol>
                <GridCol span={8}>
                  <Text fz={"md"} fw={500}>
                    Selling 1 AED = 1.971 RMB
                  </Text>
                  <Space h="md" />
                  <Text fz={"md"} fw={500}>
                    <NumberFormatter
                      value={form.values.amountInBuyedCurrency}
                      thousandSeparator=","
                      prefix={"¥"}
                      decimalScale={2}
                    />{" "}
                    = <NumberFormatter value={form.values.amountInBaseCurrency} decimalScale={2} suffix=" aed" />
                  </Text>
                </GridCol>
              </Grid>
            </Paper>
            <Paper shadow="xs" radius={"md"} p="xl">
              <Grid>
                <GridCol span={4}>
                  <Group gap="sm">
                    <Avatar src={"/assets/avatars/avat-1.png"} alt="User avatar" size="md" />
                    {form.values.provider}
                    <NumberFormatter value={100000} thousandSeparator="," prefix="$" color="red" />
                  </Group>
                </GridCol>
                <GridCol span={8}>
                  <Text fz={"md"} fw={500}>
                    Selling 1 AED = 1.971 RMB
                  </Text>
                  <Space h="md" />
                  <Text fz={"md"} fw={500}>
                    <NumberFormatter
                      value={form.values.amountInBuyedCurrency}
                      thousandSeparator=","
                      prefix={"¥"}
                      decimalScale={2}
                    />{" "}
                    = <NumberFormatter value={form.values.amountInBaseCurrency} decimalScale={2} suffix=" aed" />
                  </Text>
                </GridCol>
              </Grid>
            </Paper>
          </Stack>
          <Space h="xs" />
          <Button
            variant="gradient"
            gradient={{ from: "cyan", to: "pink", deg: 45 }}
            disabled={!form.isValid()}
            type="submit"
            leftSection={<IconSend size={20} />}
            fullWidth
            size="xs"
            color="blue"
          >
            Submit
          </Button>
        </GridCol>
      </Grid>
    </form>
  );
}
