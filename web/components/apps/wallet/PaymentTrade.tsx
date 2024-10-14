import { payTrade } from "@/lib/actions";
import { AccountResponse, OfficeWalletResponse, WalletTradingResponse } from "@/lib/client";
import { getCryptoIcon, getCryptoPrefix, getMoneyIcon, getMoneyPrefix } from "@/lib/utils";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Grid,
  GridCol,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  NumberInput,
  Stack,
  NumberFormatter,
  Badge,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCashRegister } from "@tabler/icons-react";
import { Fragment, useState, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";

interface Props {
  trade: WalletTradingResponse;
  accounts: AccountResponse[];
  wallet: OfficeWalletResponse;
}

export function PayTrade({ trade, accounts, wallet }: Props) {
  const [opened, { close, open }] = useDisclosure(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const fund = accounts.find((account) => account.type === "FUND");
  if (!fund) return null;
  const pay = async () => {
    try {
      let payment = trade.amount * (trade.trading_rate / trade.daily_rate);
      if (trade.trading_type === "DEPOSIT") {
        payment = trade.amount * (1 + trade.trading_rate / 100);
      }
      const response = await payTrade(wallet.walletID, trade.code ?? "", {
        amount: payment,
        payment_type: "FOREX",
        notes: message,
        rate: trade.daily_rate,
      });
      decodeNotification("Pay Trade", response);
      if (response.status === "success") {
        close();
      }
    } catch (e) {}
  };
  return (
    <Fragment>
      <ActionIcon disabled={trade.state !== "PENDING"} variant="outline" radius="md" onClick={open}>
        <IconCashRegister size={16} />
      </ActionIcon>

      <Modal size="xl" centered opened={opened} onClose={close} withCloseButton={false}>
        <LoadingOverlay
          visible={pending}
          loaderProps={{
            children: <Loader size={32} color="blue" />,
          }}
        />
        <form action={() => startTransition(() => pay())}>
          <Stack>
            <Divider label="Payment" />
            <Group grow>
              <NumberInput
                placeholder="Trading Rate"
                value={trade.trading_rate}
                label="Rate"
                decimalScale={3}
                readOnly
                leftSection={trade.trading_type === "BUY" ? getMoneyIcon("USD") : "%"}
              />
              <NumberInput
                label={`Amount (${getCryptoPrefix(wallet.crypto_currency)})`}
                value={trade.trading_type === "BUY" ? trade.amount : trade.amount * (1 + trade.trading_rate / 100)}
                placeholder="Amount"
                required
                thousandSeparator=","
                allowDecimal
                decimalScale={2}
                readOnly
                leftSection={
                  trade.trading_type === "BUY"
                    ? getCryptoIcon(wallet?.crypto_currency)
                    : getMoneyIcon(wallet?.trading_currency)
                }
              />
              <NumberInput
                placeholder="Amount"
                label={`Amount (${getMoneyPrefix("USD")})`}
                value={
                  trade.trading_type == "BUY"
                    ? trade.amount * trade.trading_rate
                    : trade.amount * trade.daily_rate * (1 + trade.trading_rate / 100)
                }
                readOnly
                decimalScale={2}
                thousandSeparator=","
                leftSection={getMoneyIcon("AED", 16)}
              />
            </Group>
            <Divider label="Summary" />
            <Group grow>
              <Card withBorder shadow="xs" radius="md">
                <Grid>
                  <GridCol span={6}>
                    <Stack gap="xs">
                      <Group grow>
                        <span>Balance</span>
                        <Badge variant="dot">
                          <NumberFormatter
                            value={fund?.balance}
                            thousandSeparator=","
                            decimalScale={3}
                            prefix={getMoneyPrefix("USD")}
                          />
                        </Badge>
                      </Group>
                      <Group grow>
                        <span>Fund Out</span>
                        <Badge variant="dot" color="red">
                          <NumberFormatter
                            value={
                              trade.trading_type === "BUY"
                                ? trade.amount * (trade.trading_rate / trade.daily_rate)
                                : trade.amount * (1 + trade.trading_rate / 100)
                            }
                            thousandSeparator=","
                            decimalScale={2}
                            prefix={getMoneyPrefix("USD")}
                          />{" "}
                          /{" "}
                          <NumberFormatter
                            value={
                              trade.trading_type === "BUY"
                                ? trade.amount * trade.trading_rate
                                : trade.amount * (1 + trade.trading_rate / 100) * trade.daily_rate
                            }
                            thousandSeparator=","
                            decimalScale={3}
                          />
                        </Badge>
                      </Group>
                      <Group grow>
                        <span>Balance</span>
                        <Badge variant="dot" color="teal">
                          <NumberFormatter
                            value={
                              fund.balance -
                              (trade.trading_type === "BUY"
                                ? trade.amount * (trade.trading_rate / trade.daily_rate)
                                : trade.amount * (1 + trade.trading_rate / 100))
                            }
                            thousandSeparator=","
                            decimalScale={3}
                            prefix={getMoneyPrefix("USD")}
                          />
                        </Badge>
                      </Group>
                    </Stack>
                  </GridCol>
                  <GridCol span={6}>
                    <Stack gap="xs">
                      <Group grow>
                        <span>Wallet Balance</span>
                        <Badge variant="dot">
                          <NumberFormatter
                            value={wallet.crypto_balance}
                            thousandSeparator=","
                            decimalScale={3}
                            prefix={getCryptoPrefix(wallet.crypto_currency)}
                          />
                        </Badge>
                      </Group>
                      <Group grow>
                        <span>Wallet In</span>
                        <Badge variant="dot" color="teal">
                          <NumberFormatter
                            value={trade.amount}
                            thousandSeparator=","
                            decimalScale={3}
                            prefix={getCryptoPrefix(wallet.crypto_currency)}
                          />
                        </Badge>
                      </Group>
                      <Group grow>
                        <span>Balance</span>
                        <Badge variant="dot" color="teal">
                          <NumberFormatter
                            value={wallet.crypto_balance + trade.amount}
                            thousandSeparator=","
                            decimalScale={3}
                            prefix={getCryptoPrefix(wallet.crypto_currency)}
                          />
                        </Badge>
                      </Group>
                    </Stack>
                  </GridCol>
                </Grid>
              </Card>
            </Group>
            <Group grow>
              <Textarea label="Payment Message" value={message} onChange={(value) => setMessage(value.target.value)} />
            </Group>
            <Button disabled={trade.state !== "PENDING"} type="submit" variant="gradient" size="xs">
              <IconCashRegister size={18} className="mr-1" />
              PAY
            </Button>
          </Stack>
        </form>
      </Modal>
    </Fragment>
  );
}
