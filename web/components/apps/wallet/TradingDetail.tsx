"use client";
import { Currency, OfficeWalletResponse, WalletTradingResponse } from "@/lib/client";
import { getCryptoPrefix, getMoneyPrefix } from "@/lib/utils";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBook, IconCircleDashed, IconCoinBitcoin, IconExchange, IconMinus, IconWallet } from "@tabler/icons-react";
import { Fragment } from "react";

export function TradingDetail({ trading, wallet }: { trading: WalletTradingResponse; wallet: OfficeWalletResponse }) {
  const [opened, { open, close }] = useDisclosure(false);

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
                {["SELL", "EXCHANGE", "EXCHANGE WITH SIMPLE WALLET"].includes(trading?.trading_type) ? (
                  <NumberFormatter value={trading.trading_rate} />
                ) : (
                  "-"
                )}
              </Table.Td>
              <Table.Td>
                {["EXCHANGE", "EXCHANGE WITH SIMPLE WALLET"].includes(trading?.trading_type) ? (
                  <NumberFormatter value={trading?.exchange_rate} />
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
                  Name
                </Badge>
              </Box>
              <Badge variant="dot">{wallet.wallet_name}</Badge>
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
                {trading.trading_type} {trading.trading_currency}
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
        <Divider label="Payment" />
      </Drawer>
    </Fragment>
  );
}

function TrAmount({ trading, wallet }: { wallet: OfficeWalletResponse; trading: WalletTradingResponse }) {
  let currency = getMoneyPrefix(trading.trading_currency as Currency);
  if (trading.trading_type == "EXCHANGE") {
    currency = getCryptoPrefix(wallet.crypto_currency);
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
  if (!["SELL", "EXCHANGE"].includes(trading.trading_type)) {
    return <Badge color="gray" variant="dot"></Badge>;
  }
  return (
    <Badge size="lg" variant="dot">
      <NumberFormatter value={trading.trading_amount} thousandSeparator decimalScale={3} prefix={currency} />
    </Badge>
  );
}

function TrExchange({ trading }: { wallet: OfficeWalletResponse; trading: WalletTradingResponse }) {
  let currency = getMoneyPrefix(trading?.trading_currency as Currency);
  if (!["EXCHANGE", "EXCHANGE WITH SIMPLE WALLET"].includes(trading.trading_type)) {
    return <Badge color="gray" variant="dot"></Badge>;
  }
  return (
    <Badge size="lg" variant="dot">
      <NumberFormatter value={trading.trading_exchange} thousandSeparator decimalScale={3} prefix={currency} />
    </Badge>
  );
}
