"use client";
import { Currency, OfficeWalletResponse, Payment, WalletTradingResponse } from "@/lib/client";
import { generateReceipt, Receipt } from "@/lib/pdf/generator";
import { CANCELLATION_REASON, getMoneyPrefix } from "@/lib/utils";
import {
  ActionIcon,
  Badge,
  Card,
  Drawer,
  Group,
  NumberFormatter,
  rem,
  ThemeIcon,
  Box,
  Stack,
  Divider,
  Space,
  Table,
  Tooltip,
  TagsInput,
  Textarea,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook,
  IconCircleDashed,
  IconCoinBitcoin,
  IconDownload,
  IconExchange,
  IconMinus,
  IconRotateClockwise,
  IconTag,
  IconWallet,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { Fragment, useTransition } from "react";
import TradeReview from "./TradeReview";
import { useForm } from "@mantine/form";
import { rollbackTrade } from "@/lib/actions/wallet";
import { decodeNotification } from "../notifications/notifications";

export function TradingDetail({ trading, wallet }: { trading: WalletTradingResponse; wallet: OfficeWalletResponse }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<{
    reason: [];
    description: string;
  }>({
    initialValues: {
      reason: [],
      description: "",
    },
  });

  const getReceipt = (payment: Payment): Receipt => {
    const notes: any = payment.notes ?? [];
    const message = notes["notes"].find((message: any) => message.type === "PAYMENT");

    return {
      account: trading.account ?? "",
      amount: payment.amount,
      code: trading.code ?? "No Code",
      description: "",
      phone: message.customer_phone,
    };
  };

  const handleRollback = async () => {
    try {
      const response = await rollbackTrade({
        code: trading.code ?? "",
        reason: form.values.reason,
        description: form.values.description,
        type: "TRADING",
      });

      decodeNotification("ROLLBACK", response);
      if (response.status === "success") {
        form.reset();
      }
    } catch (e) {}
  };

  const get_currency = (trade: WalletTradingResponse) => {
    switch (trade.trading_type) {
      case "BUY":
      case "DEPOSIT":
      case "EXCHANGE WITH SIMPLE WALLET":
        return trade.trading_currency;
      case "SELL":
        return trade.selling_currency;
      case "EXCHANGE":
        return trade.exchange_currency;
    }
  };
  return (
    <Fragment>
      <ActionIcon variant="outline" onClick={open}>
        <IconBook size={16} />
      </ActionIcon>
      <Drawer
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        size={"lg"}
        offset={8}
        opened={opened}
        onClose={close}
        radius={"md"}
        position="right"
        withCloseButton={false}
      >
        <Divider label="Rates" />
        <Table withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Daily Rate</Table.Th>
              <Table.Th>Buying Rate</Table.Th>
              <Table.Th>Selling Rate</Table.Th>
              <Table.Th>Exchange Rate</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <NumberFormatter value={trading.daily_rate} thousandSeparator />
              </Table.Td>
              <Table.Td>
                {trading?.trading_type === "BUY" ? (
                  <NumberFormatter value={trading.trading_rate} />
                ) : trading?.trading_type == "DEPOSIT" ? (
                  trading.trading_rate + "%"
                ) : (
                  "-"
                )}
              </Table.Td>
              <Table.Td>
                {["SELL", "SIMPLE SELL", "EXCHANGE", "EXCHANGE WITH SIMPLE WALLET"].includes(trading?.trading_type) ? (
                  <NumberFormatter
                    suffix={trading?.trading_type === "SIMPLE SELL" ? "%" : ""}
                    value={
                      trading?.trading_type === "EXCHANGE WITH SIMPLE WALLET"
                        ? trading?.selling_rate
                        : trading.trading_rate
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Td>
              <Table.Td>
                {["EXCHANGE", "EXCHANGE WITH SIMPLE WALLET"].includes(trading?.trading_type) ? (
                  <>
                    <NumberFormatter value={trading?.exchange_rate} />
                    {trading?.trading_type === "EXCHANGE WITH SIMPLE WALLET" && (
                      <>
                        {" "}
                        / <NumberFormatter value={trading?.trading_rate} /> =
                        <NumberFormatter
                          decimalScale={6}
                          value={Number(trading?.exchange_rate) / trading?.trading_rate}
                        />
                      </>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Space h="md" />
        <Card withBorder>
          <Divider label="Wallet" />
          <Space h="lg" />
          <Stack gap={"md"}>
            <Group grow>
              <Box>
                <ThemeIcon color="blue" size={24} radius="xl">
                  <IconWallet style={{ width: rem(14), height: rem(14) }} />
                </ThemeIcon>
                <Badge size="lg" variant="transparent">
                  Provider
                </Badge>
              </Box>
              <Badge variant="dot" size="lg">
                {trading.account}
              </Badge>
            </Group>
            {trading.trading_type.includes("EXCHANGE") && (
              <Group grow>
                <Box>
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconWallet style={{ width: rem(14), height: rem(14) }} />
                  </ThemeIcon>
                  <Badge size="lg" variant="transparent">
                    WITH
                  </Badge>
                </Box>
                <Badge variant="dot" size="lg">
                  {trading.exchange_walletID}
                </Badge>
              </Group>
            )}
            <Group grow>
              <Box>
                <ThemeIcon color="blue" size={24} radius="xl">
                  <IconWallet style={{ width: rem(14), height: rem(14) }} />
                </ThemeIcon>
                <Badge size="lg" variant="transparent">
                  Name
                </Badge>
              </Box>
              <Badge variant="dot" size="lg">
                {wallet.wallet_name}
              </Badge>
            </Group>
            <Divider label="Trade" />
            <Group grow>
              <Box>
                <ThemeIcon color="blue" size={24} radius="xl">
                  <IconCircleDashed style={{ width: rem(14), height: rem(14) }} />
                </ThemeIcon>
                <Badge size="lg" variant="transparent">
                  Type
                </Badge>
              </Box>
              <Badge variant="dot" size="lg">
                {trading.trading_type} {get_currency(trading)}
              </Badge>
            </Group>
            <Group grow>
              <Box>
                <ThemeIcon color="blue" size={24} radius="xl">
                  <IconCoinBitcoin style={{ width: rem(14), height: rem(14) }} />
                </ThemeIcon>
                <Badge size="lg" variant="transparent">
                  Amount
                </Badge>
              </Box>
              <TrAmount wallet={wallet} trading={trading} />
            </Group>
            {trading.trading_type.includes("EXCHANGE") && (
              <Group grow>
                <Box>
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconExchange style={{ width: rem(14), height: rem(14) }} />
                  </ThemeIcon>
                  <Badge size="lg" variant="transparent">
                    Exchange Amount
                  </Badge>
                </Box>
                <TrExchange wallet={wallet} trading={trading} />
              </Group>
            )}
            <Group grow>
              <Box>
                <ThemeIcon color="red" size={22} radius="xl">
                  <IconMinus style={{ width: rem(14), height: rem(14) }} />
                </ThemeIcon>
                <Badge size="lg" color="red" variant="transparent">
                  Cost
                </Badge>
              </Box>
              <TrCost wallet={wallet} trading={trading} />
            </Group>
            <Group grow>
              <Box>
                <ThemeIcon color="teal" size={22} radius="xl">
                  <IconMinus style={{ width: rem(14), height: rem(14) }} />
                </ThemeIcon>
                <Badge size="lg" color="teal" variant="transparent">
                  Sold
                </Badge>
              </Box>
              <TrSell wallet={wallet} trading={trading} />
            </Group>
            <Group grow>
              <Box>
                <ThemeIcon color="teal" size={22} radius="xl">
                  <IconMinus style={{ width: rem(14), height: rem(14) }} />
                </ThemeIcon>
                <Badge size="lg" color="teal" variant="transparent">
                  Result
                </Badge>
              </Box>
              <TrResult wallet={wallet} trading={trading} />
            </Group>
          </Stack>
        </Card>
        <TradeReview trade={trading} />
        {trading.payments?.length ? (
          <Fragment>
            <Space h="md" />
            <Divider label="Payment" />
            <Space h="lg" />
            <Table withTableBorder highlightOnHover verticalSpacing={"sm"}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>State</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {trading.payments?.map((payment) => (
                  <Table.Tr key={payment.transaction_id}>
                    <Table.Td>{format(payment.payment_date, "MMM dd")}</Table.Td>
                    <Table.Td>
                      <Group justify="left">
                        <Badge size="sm" color={payment.state == 1 ? "teal" : "red"} variant="outline">
                          {payment.state == 1 ? "Paid" : "Cancelled"}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={payment.amount} />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm" justify="left">
                        <Tooltip label="Download Receipt" position="left">
                          <ActionIcon
                            onClick={() => generateReceipt(getReceipt(payment))}
                            size="md"
                            variant="outline"
                            radius={"md"}
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Fragment>
        ) : null}
        {!["REVIEW", "CANCELLED"].includes(trading.state) && (
          <Card withBorder className="mt-4">
            <LoadingOverlay visible={pending} loaderProps={{ color: "pink", type: "dots" }} />
            <Divider label="ROLLBACK" />
            <form action={() => startTransition(() => handleRollback())}>
              <Stack>
                <Group grow>
                  <TagsInput
                    data={CANCELLATION_REASON}
                    label="Reason"
                    leftSection={<IconTag size={16} />}
                    {...form.getInputProps("reason")}
                  />
                </Group>
                <Group grow>
                  <Textarea label={"Description"} {...form.getInputProps("description")} />
                </Group>
                <Group grow>
                  <Button
                    leftSection={<IconRotateClockwise size={18} />}
                    size={"xs"}
                    type="submit"
                    variant="gradient"
                    gradient={{ from: "pink", to: "red", deg: 120 }}
                  >
                    Rollback
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        )}
      </Drawer>
    </Fragment>
  );
}

function TrAmount({ trading }: { wallet: OfficeWalletResponse; trading: WalletTradingResponse }) {
  let currency = getMoneyPrefix(trading.trading_currency as Currency);
  switch (trading.trading_type) {
    case "BUY":
    case "DEPOSIT":
      currency = getMoneyPrefix(trading.trading_currency);
      break;
    case "SELL":
      currency = getMoneyPrefix(trading.selling_currency);
      break;
    case "EXCHANGE":
      currency = getMoneyPrefix(trading.trading_currency);
    default:
      break;
  }
  return (
    <Badge variant="dot" size="lg">
      <NumberFormatter value={trading.amount} thousandSeparator decimalScale={3} prefix={currency} />
    </Badge>
  );
}

function TrCost({ trading }: { wallet: OfficeWalletResponse; trading: WalletTradingResponse }) {
  let currency = getMoneyPrefix("USD");

  return (
    <Badge variant="dot" size="lg">
      <NumberFormatter value={trading.trading_cost} thousandSeparator decimalScale={3} prefix={currency} />
    </Badge>
  );
}

function TrResult({ trading }: { wallet: OfficeWalletResponse; trading: WalletTradingResponse }) {
  let currency = getMoneyPrefix("USD");
  if (["BUY", "DEPOSIT"].includes(trading.trading_type)) {
    return <Badge color="gray" variant="dot"></Badge>;
  }
  return (
    <Badge size="lg" variant="dot">
      <NumberFormatter value={trading.trading_result} thousandSeparator decimalScale={3} prefix={currency} />
    </Badge>
  );
}

function TrSell({ trading }: { wallet: OfficeWalletResponse; trading: WalletTradingResponse }) {
  let currency = getMoneyPrefix("USD");
  if (!["SELL", "SIMPLE SELL", "EXCHANGE", "EXCHANGE WITH SIMPLE WALLET"].includes(trading.trading_type)) {
    return <Badge color="gray" variant="dot"></Badge>;
  }
  return (
    <Badge size="lg" variant="dot">
      <NumberFormatter value={trading.trading_amount} thousandSeparator decimalScale={3} prefix={currency} />
    </Badge>
  );
}

function TrExchange({ trading }: { wallet: OfficeWalletResponse; trading: WalletTradingResponse }) {
  let currency = getMoneyPrefix(trading?.exchange_currency as Currency);
  if (!["EXCHANGE", "EXCHANGE WITH SIMPLE WALLET"].includes(trading.trading_type)) {
    return <Badge color="gray" variant="dot"></Badge>;
  }
  return (
    <Badge size="lg" variant="dot">
      <NumberFormatter value={trading.trading_exchange} thousandSeparator decimalScale={3} prefix={currency} />
    </Badge>
  );
}
