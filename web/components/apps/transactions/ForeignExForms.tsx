import { AgentReponseWithAccounts, OfficeResponse } from "@/lib/client";
import { getCryptoIcon, getCryptoPrefix, getMoneyPrefix } from "@/lib/utils";
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
import { IconMessage, IconSend, IconWallet } from "@tabler/icons-react";
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
  amountInCryptoCurrency: number; // amount in buying currency
  amountInTradingCurrency: number;
  dailyRate: number;
  message: string;
  walletID: string;
  buying_rate: number;
  trading_rate: number;
  forexType: "Buying" | "Selling";
}

export default function ForeignExForms({ agentWithAccounts, office }: Props) {
  const currencies: any = office?.currencies ?? [];

  const mainCurrency = currencies.find((currency: any) => currency?.main) as any;
  const baseCurrency = currencies.find((currency: any) => currency?.base) as any;
  const walletOptions = office?.wallets?.map((wallet) => {
    return {
      label: wallet.walletID,
      value: wallet.walletID,
    };
  });
  const forexTypeOptions = ["Buying", "Selling"].map((type) => ({
    label: type,
    value: type,
  }));

  const form = useForm<FormInputs>({
    initialValues: {
      agent: "",
      account: "",
      dailyRate: mainCurrency?.defaultRate,
      buying_rate: 0,
      trading_rate: 0,
      amountInCryptoCurrency: 0,
      amountInTradingCurrency: 0,
      message: "",
      forexType: "Buying",
      walletID: "",
    },
    mode: "controlled",
    validate: {
      account: (value) => (value?.length > 0 ? null : "Account is required"),
      agent: (value) => (value?.length > 0 ? null : "Agent is required"),
      amountInCryptoCurrency: (value) => (value > 0 ? null : "Amount is required"),
      amountInTradingCurrency: (value) => (value > 0 ? null : "Amount is required"),
      dailyRate: (value) => (value > 0 ? null : "Rate is required"),
    },
  });

  const [pending, startTransition] = useTransition();
  const handleSubmit = async () => {
    const data: FormData = new FormData();
    data.append("walletID", form.values.walletID);
    data.append("is_buying", form.values.forexType === "Buying" ? "true" : "false");
    data.append("daily_rate", form.values.dailyRate.toString());
    data.append("account", form.values.account);
    data.append("amount", form.values.amountInCryptoCurrency.toString());
    data.append("message", form.values.message);
    data.append("type", "FOREX");
    const response = await addTransaction(null, data);

    decodeNotification("Forex Transaction", response, (errors) => {
      form.setErrors(errors);
    });
    response?.status === "success" && form.reset();
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

  const activeWallet = office?.wallets?.find((wallet) => wallet.walletID === form.values?.walletID);

  const crypto_prefix = getCryptoPrefix(activeWallet?.crypto_currency ?? "BTC");
  const trading_prefix = getMoneyPrefix(activeWallet?.trading_currency ?? "USD");
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
                searchable
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
                id="buying_rate"
                label={"Buying Rate 1 " + activeWallet?.crypto_currency}
                required
                placeholder="Enter rate"
                value={form.values.buying_rate}
                leftSection={<Group>{getMoneyIcon(baseCurrency?.name, 16)}</Group>}
                onChange={(value) => form.setFieldValue("buying_rate", value as any)}
                thousandSeparator=","
                decimalScale={4}
              />
            </Group>

            <Group grow>
              <NumberInput
                id="buying_rate_converted"
                label={"Buying Rate 1 " + activeWallet?.crypto_currency}
                required
                value={form.values.buying_rate / form.values.dailyRate}
                leftSection={<Group>{getMoneyIcon(mainCurrency?.name, 16)}</Group>}
                onChange={(value) => form.setFieldValue("buying_rate", value as any)}
                thousandSeparator=","
                decimalScale={4}
                readOnly
              />
              <NumberInput
                id="rate"
                label={"Trading Rate 1" + activeWallet?.crypto_currency}
                placeholder={"Enter " + form.values.forexType + " rate"}
                required
                allowNegative={false}
                decimalScale={5}
                value={form.values.trading_rate}
                leftSection={getMoneyIcon(
                  office.wallets?.find((wallet) => wallet.walletID === form.values.walletID)?.trading_currency ?? "USD",
                  16
                )}
                onChange={(value) => {
                  form.setValues({
                    ...form.values,
                    trading_rate: Number(value),
                    amountInTradingCurrency: Number(value) * form.values.amountInCryptoCurrency,
                  });
                }}
                thousandSeparator=","
              />
            </Group>

            <Group grow>
              <NumberInput
                decimalScale={2}
                thousandSeparator=","
                label={
                  form.values.forexType +
                  " Amount in " +
                  office?.wallets?.find((wallet) => wallet.walletID === form.values.walletID)?.crypto_currency
                }
                leftSection={getCryptoIcon(activeWallet?.crypto_currency ?? "BTC", 16)}
                placeholder="Enter amount"
                id="amount"
                required
                allowNegative={false}
                value={form.values.amountInCryptoCurrency}
                onChange={(value) => {
                  form.setValues({
                    ...form.values,
                    amountInCryptoCurrency: Number(value),
                    amountInTradingCurrency: Number(value) * form.values.trading_rate,
                  });
                }}
              />
              <NumberInput
                decimalScale={3}
                thousandSeparator=","
                label={form.values.forexType + " Amount in " + activeWallet?.trading_currency}
                leftSection={getMoneyIcon(activeWallet?.trading_currency ?? "USD", 16)}
                placeholder="Enter amount"
                id="sellingAmount"
                required
                allowNegative={false}
                value={form.values.amountInTradingCurrency}
                onChange={(value) => {
                  form.setValues({
                    ...form.values,
                    amountInTradingCurrency: Number(value),
                  });
                }}
              />
            </Group>
            {/* {form.values.forexType == "Selling" && (
              <Group grow>
                <Alert variant="light" color="blue" title="">
                  You previously bought{" "}
                  <NumberFormatter
                    value={detail.amount}
                    prefix={getMoneyPrefix(activeWallet?.wallet_currency ?? "USD")}
                    thousandSeparator=","
                  />{" "}
                  /{" "}
                  <NumberFormatter
                    thousandSeparator=","
                    decimalScale={3}
                    prefix={getMoneyPrefix(activeWallet?.payment_currency ?? "USD")}
                    value={detail.buyed}
                  />{" "}
                  at a rate of <NumberFormatter decimalScale={5} value={detail.wallet_rate} thousandSeparator="," />.
                  the Exchange benefit would be :{" "}
                  <NumberFormatter
                    decimalScale={2}
                    value={detail.sold - detail.buyed}
                    prefix={getMoneyPrefix(activeWallet?.payment_currency ?? "USD")}
                    thousandSeparator=","
                  />
                </Alert>
              </Group>
            )} */}
          </Stack>
        </GridCol>
        <GridCol span={4} p={"xs"} pt="md">
          <Stack gap="xs">
            <Paper shadow="xs" radius={"md"} p="xl">
              <Grid>
                <GridCol span={4}>
                  <Group gap="sm">
                    {form.values.walletID}
                    <NumberFormatter
                      value={activeWallet?.crypto_balance}
                      thousandSeparator=","
                      prefix={crypto_prefix}
                      color="red"
                    />
                    <NumberFormatter
                      value={activeWallet?.trading_balance}
                      thousandSeparator=","
                      prefix={trading_prefix}
                      color="red"
                    />
                  </Group>
                </GridCol>
                <GridCol span={8}>
                  <Text fz={"md"} fw={500}>
                    Wallet Buying Rate 1 {activeWallet?.crypto_currency} = {activeWallet?.trading_currency}
                  </Text>
                  <Space h="md" />
                  <Text fz={"md"} fw={500}>
                    <NumberFormatter value={1} thousandSeparator="," prefix={crypto_prefix} decimalScale={2} /> ={" "}
                    <NumberFormatter
                      value={
                        Number(activeWallet?.crypto_balance) > 0
                          ? Number(activeWallet?.trading_balance) / Number(activeWallet?.crypto_balance)
                          : 0
                      }
                      decimalScale={5}
                      suffix={getMoneyPrefix(activeWallet?.trading_currency ?? "USD")}
                    />
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
