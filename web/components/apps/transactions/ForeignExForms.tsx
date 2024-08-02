import { AgentReponseWithAccounts, OfficeResponse } from "@/lib/client";
import { currencyOptions, getMoneyPrefix } from "@/lib/utils";
import {
  Grid,
  GridCol,
  Group,
  NumberInput,
  Text,
  Select,
  Stack,
  NumberFormatter,
  Paper,
  Space,
  Avatar,
  Button,
  LoadingOverlay,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCurrencyDollar, IconMessage, IconSend, IconWallet } from "@tabler/icons-react";
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
  rate: number;
  intermediateRate: number; //
  amountInWalletCurrency: number; // amount in buying currency
  amountInBaseCurrency: number;
  amountInPaymentCurrency: number;
  dailyRate: number;
  message: string;
  walletID: string;
  forexType: "Buying" | "Selling";
}

export default function ForeignExForms({ agentWithAccounts, office }: Props) {
  const currencies: any = office?.currencies ?? [];

  const mainCurrency = currencies.find((currency: any) => currency?.main) as any;
  const baseCurrency = currencies.find((currency: any) => currency?.base) as any;
  const walletOptions = office?.wallets?.map((wallet)=>{
    return {
      label: wallet.walletID,
      value: wallet.walletID
    }
  })
  const forexTypeOptions = ["Buying", "Selling"].map((type) => ({
    label: type,
    value: type,
  }))

  const form = useForm<FormInputs>({
    initialValues: {
      agent: "",
      account: "",
      dailyRate: mainCurrency?.defaultRate,
      rate:0,
      amountInWalletCurrency: 0,
      amountInBaseCurrency: 0,
      amountInPaymentCurrency: 0,
      intermediateRate: 0,
      message: "",
      forexType:"Buying",
      walletID: ""
    },
    mode: "controlled",
    validate: {
      account: (value) => (value?.length > 0 ? null : "Account is required"),
      agent: (value) => (value?.length > 0 ? null : "Agent is required"),
      amountInBaseCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInWalletCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInPaymentCurrency: (value) => (value > 0 ? null : "Amount is required"),
      rate: (value) => (value > 0 ? null : "Rate is required"),
      intermediateRate: (value) => (value > 0 ? null : "Rate is required"),
      dailyRate: (value) => (value > 0 ? null : "Rate is required"),
    },
  });

  const [pending, startTransition] = useTransition();
  const handleSubmit = async () => {
    const data: FormData = new FormData();
    data.append("walletID", form.values.walletID);
    data.append("is_buying", form.values.forexType==="Buying"?"true":"false");
    data.append("daily_rate", form.values.dailyRate.toString());
    data.append("account", form.values.account);
    data.append("rate", form.values.rate.toString());
    data.append("amount", form.values.amountInWalletCurrency.toString());
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

  const activeWallet = office?.wallets?.find((wallet)=>wallet.walletID === form.values?.walletID)
  return (
    <form action={() => startTransition(() => handleSubmit())} className="mt-5">
      <Grid style={{ padding: "10px" }}>
        <LoadingOverlay visible={pending} opacity={0.9} color="gray" zIndex={1000} />
        <GridCol span={8} style={{ margin: "0" }}>
          <Stack gap={"xl"}>
            <Group grow>
              <Select
                data={walletOptions}
                label="Wallet"
                placeholder="Select wallet"
                leftSection={<IconWallet size={16} />}
                id="wallet"
                value={form.values.walletID}
                onChange={(value) => form.setFieldValue("walletID", value as any)}
                required
              />
              <Select
                data={forexTypeOptions}
                label="Are you Buying or Selling ?"
                placeholder="Select option"
                leftSection={<IconWallet size={16} />}
                id="wallet"
                value={form.values.forexType}
                onChange={(value) => form.setFieldValue("forexType", value as any)}
                required
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
            </Group>
            <Group grow>
              <Select
                data={agentOptions}
                label="Customer / Provider"
                leftSection={<Avatar src={"/assets/avatars/avat-10.png"} alt="User avatar" size="xs" />}
                placeholder="Select Provider/Customer"
                id="customer_provider"
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
                label={`${form.values.forexType} Currency`}
                placeholder="Select currency"
                leftSection={getMoneyIcon(office.wallets?.find((wallet)=> wallet.walletID === form.values.walletID)?.wallet_currency ?? "USD", 16)}
                id="currency"
                readOnly
                value={office?.wallets?.find((wallet)=> wallet.walletID === form.values.walletID)?.wallet_currency}
              />
              <NumberInput
                id="intermediateRate"
                label={form.values.forexType+" Rate 1" + baseCurrency?.name}
                placeholder="Enter intermediate rate"
                required
                value={form.values.intermediateRate}
                leftSection={getMoneyIcon(office.wallets?.find((wallet)=> wallet.walletID === form.values.walletID)?.wallet_currency ?? "USD", 16)}
                allowNegative={false}
                decimalScale={5}
                onChange={(value) => {
                  form.setValues({
                    ...form.values,
                    intermediateRate: Number(value),
                    rate: Number(value) * form.values.dailyRate
                  });
                }}
                thousandSeparator=","
              />
              <NumberInput
                id="rate"
                label={form.values.forexType+" Rate 1" + mainCurrency?.name}
                placeholder={"Enter "+form.values.forexType + " rate"}
                required
                allowNegative={false}
                decimalScale={5}
                value={form.values.rate}
                leftSection={getMoneyIcon(office.wallets?.find((wallet)=> wallet.walletID === form.values.walletID)?.wallet_currency ?? "USD", 16)}
                onChange={(value) => {
                  form.setValues({
                    ...form.values,
                    rate: Number(value),
                    intermediateRate: Number(value) / form.values.dailyRate
                  })
                }}
                thousandSeparator=","
              />
            </Group>

            <Group grow>
              <NumberInput
                decimalScale={2}
                thousandSeparator=","
                label={form.values.forexType+" Amount in " + office?.wallets?.find((wallet)=> wallet.walletID === form.values.walletID)?.wallet_currency}
                leftSection={getMoneyIcon(office.wallets?.find((wallet)=> wallet.walletID === form.values.walletID)?.wallet_currency ?? "USD", 16)}
                placeholder="Enter amount"
                id="amount"
                required
                allowNegative={false}
                value={form.values.amountInWalletCurrency}
                onChange={(value) => {
                  form.setValues({
                    ...form.values,
                    amountInWalletCurrency: Number(value),
                    amountInPaymentCurrency: Number(value) / form.values.rate,
                    amountInBaseCurrency: (Number(value) / form.values.rate) * form.values.dailyRate,
                  });
                }}
              />
              <NumberInput
                decimalScale={3}
                thousandSeparator=","
                label={form.values.forexType+" Amount in " + baseCurrency?.name}
                placeholder="Enter amount"
                id="amountInBaseCurrency"
                required
                value={form.values.amountInBaseCurrency}
                allowNegative={false}
                leftSection={getMoneyIcon(baseCurrency?.name, 16)}
                onChange={(value) => {
                  const amount = Number(value) * form.values.intermediateRate;
                  form.setValues({
                    ...form.values,
                    amountInBaseCurrency: Number(value),
                    amountInWalletCurrency: amount,
                  });
                }}
              />
              <NumberInput
                decimalScale={3}
                thousandSeparator=","
                label={form.values.forexType+" Amount in " + office.wallets?.find((wallet)=> wallet.walletID === form.values.walletID)?.payment_currency}
                leftSection={<IconCurrencyDollar size={16} />}
                placeholder="Enter amount"
                id="sellingAmount"
                required
                allowNegative={false}
                value={form.values.amountInPaymentCurrency}
                onChange={(value) => {
                  const amount = Number(value) * form.values.rate;
                  form.setValues({
                    ...form.values,
                    amountInPaymentCurrency: Number(value),
                    amountInWalletCurrency: amount,
                    amountInBaseCurrency: Number(value) * form.values.dailyRate,
                  });
                }}
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
                    {form.values.walletID}
                    <NumberFormatter value={activeWallet?.buyed} thousandSeparator="," prefix={getMoneyPrefix(activeWallet?.wallet_currency?? "USD")} color="red" />
                    <NumberFormatter value={activeWallet?.paid} thousandSeparator="," prefix={getMoneyPrefix(activeWallet?.payment_currency?? "USD")} color="red" />
                  </Group>
                </GridCol>
                <GridCol span={8}>
                  <Text fz={"md"} fw={500}>
                    Wallet Buying Rate 1 {activeWallet?.payment_currency} = {activeWallet?.wallet_currency}
                  </Text>
                  <Space h="md" />
                  <Text fz={"md"} fw={500}>
                    <NumberFormatter
                      value={1}
                      thousandSeparator=","
                      prefix={getMoneyPrefix(activeWallet?.payment_currency ?? "USD")}
                      decimalScale={2}
                    />{" "}
                    = <NumberFormatter value={(Number(activeWallet?.buyed) / Number(activeWallet?.paid))} decimalScale={5} suffix={getMoneyPrefix(activeWallet?.wallet_currency ?? "USD")}/>
                  </Text>
                </GridCol>
              </Grid>
            </Paper>
            <Group grow>
              <Textarea
                rows={4}
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
          <Space h="xs" />
          <Button
            variant="gradient"
            gradient={{ from: "cyan", to: "pink", deg: 45 }}
            disabled={!form.isValid()}
            type="submit"
            leftSection={<IconSend size={20} />}
            fullWidth
            size="md"
            color="blue"
          >
            Submit
          </Button>
        </GridCol>
      </Grid>
    </form>
  );
}
