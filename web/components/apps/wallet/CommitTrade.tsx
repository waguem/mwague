import { CommitTradeRequest, OfficeWalletResponse, WalletTradingResponse } from "@/lib/client";
import { getCryptoPrefix, getMoneyPrefix } from "@/lib/utils";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  NumberInput,
  Stack,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconGitCommit, IconSend } from "@tabler/icons-react";
import { Fragment, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";
import { commitTrade } from "@/lib/actions/wallet";

interface CommitTradeProps {
  wallet: OfficeWalletResponse;
  trade: WalletTradingResponse;
}

interface CommintInputs {
  amount: number;
  trading_rate: number;
  trading_cost: number; // expressed usually in wallet value
  sold_amount: number;
  trading_result: number;
  crypto_amount: number;
}

export default function CommitTrade({ wallet, trade }: CommitTradeProps) {
  const [opened, { close, open }] = useDisclosure(false);
  const form = useForm<CommintInputs>({
    initialValues: {
      amount: trade.amount,
      trading_rate: trade.trading_rate,
      trading_cost: (wallet.value / wallet.trading_balance) * trade.amount,
      sold_amount: trade.amount / trade.trading_rate,
      trading_result: trade.amount / trade.trading_rate - (wallet.value / wallet.trading_balance) * trade.amount,
      crypto_amount: trade.amount * (wallet.crypto_balance / wallet.trading_balance),
    },
  });

  const isActive = trade.state === "PENDING" && trade.amount <= wallet.trading_balance;
  // how much the trading.amount is evaluated in the wallet ?

  const [pending, startTransition] = useTransition();
  const commit = async () => {
    try {
      const request: CommitTradeRequest = {
        amount: form.values.amount,
        trading_rate: form.values.trading_rate,
        trading_cost: form.values.trading_cost,
        sold_amount: form.values.sold_amount,
        trading_result: form.values.trading_result,
        tradeID: trade.id,
        walletID: wallet.walletID,
        crypto_amount: form.values.crypto_amount,
      };

      const response = await commitTrade(request);
      decodeNotification("Commit Trade", response);
      if (response.status == "success") {
        close();
      }
    } catch (e) {}
  };
  return (
    <Fragment>
      <Tooltip label="Commit Trade">
        <ActionIcon color="cyan" disabled={!isActive} variant="outline" radius={"md"} onClick={open}>
          <IconGitCommit size={16} />
        </ActionIcon>
      </Tooltip>
      <Modal withCloseButton={false} size="60%" centered opened={opened} onClose={close}>
        <LoadingOverlay
          visible={pending}
          loaderProps={{
            children: <Loader size={32} color="blue" />,
          }}
        />
        <form action={() => startTransition(() => commit())}>
          <Stack>
            <Divider label="Wallet" />
            <Group grow>
              Balance :
              <Badge color="blue" size="md" variant="dot">
                <NumberFormatter
                  value={wallet.crypto_balance}
                  thousandSeparator
                  decimalScale={3}
                  prefix={getCryptoPrefix(wallet.crypto_currency)}
                />
              </Badge>
              <Badge color="blue" size="md" variant="dot">
                <NumberFormatter
                  value={wallet.trading_balance}
                  thousandSeparator
                  decimalScale={3}
                  prefix={getMoneyPrefix(wallet.trading_currency)}
                />
              </Badge>
              <Badge color="blue" size="md" variant="dot">
                <NumberFormatter
                  value={wallet.value}
                  thousandSeparator
                  decimalScale={3}
                  prefix={getMoneyPrefix("USD")}
                />
              </Badge>
            </Group>
            <Group grow>
              Rate :
              <Badge color="blue" size="md" variant="dot">
                1 {"USD"} ={" "}
                <NumberFormatter
                  value={wallet.trading_balance / wallet?.value}
                  thousandSeparator
                  decimalScale={5}
                  prefix={getMoneyPrefix(wallet.trading_currency)}
                />
              </Badge>
              <Badge color="blue" size="md" variant="dot">
                1 {"USD"} ={" "}
                <NumberFormatter
                  value={wallet.crypto_balance / wallet?.value}
                  thousandSeparator
                  decimalScale={5}
                  prefix={getMoneyPrefix(wallet.trading_currency)}
                />
              </Badge>
              <Badge color="blue" size="md" variant="dot">
                1 {wallet.crypto_currency} ={" "}
                <NumberFormatter
                  value={wallet.trading_balance / wallet?.crypto_balance}
                  thousandSeparator
                  decimalScale={5}
                  prefix={getMoneyPrefix(wallet.trading_currency)}
                />
              </Badge>
            </Group>
            <Divider label="Trade" />
            <Group grow>
              <NumberInput
                placeholder="Amount"
                value={form.values.amount}
                {...form.getInputProps("amount")}
                onChange={(value) =>
                  form.setValues({
                    ...form.values,
                    amount: Number(value),
                    sold_amount: Number(value) / form.values.trading_rate,
                    trading_cost: (wallet.value / wallet.trading_balance) * Number(value),
                    crypto_amount: Number(value) * (wallet.crypto_balance / wallet.trading_balance),
                    trading_result:
                      Number(value) / form.values.trading_rate -
                      (wallet.value / wallet.trading_balance) * Number(value),
                  })
                }
                label="Amount"
                decimalScale={3}
                thousandSeparator
                prefix={getMoneyPrefix(wallet.trading_currency)}
              />
              <NumberInput
                placeholder="Selling Rate"
                {...form.getInputProps("trading_rate")}
                onChange={(value) =>
                  form.setValues({
                    ...form.values,
                    trading_rate: Number(value),
                    sold_amount: form.values.amount / Number(value),
                    trading_result: form.values.amount / Number(value) - form.values.trading_cost,
                  })
                }
                label="Selling Rate"
                decimalScale={6}
                thousandSeparator
              />
            </Group>
            <Divider label="Trade Result" />
            <Group grow>
              <Group>
                Cost :
                <Badge color="blue" size="lg" variant="dot">
                  <NumberFormatter
                    value={form.values.trading_cost}
                    decimalScale={3}
                    thousandSeparator
                    prefix={getMoneyPrefix("USD")}
                  />
                </Badge>
                <Badge variant="dot" color="gray" size="lg">
                  <NumberFormatter
                    value={form.values.crypto_amount}
                    decimalScale={3}
                    thousandSeparator
                    prefix={getCryptoPrefix(wallet.crypto_currency)}
                  />
                </Badge>
              </Group>
              <Group>
                Sold :
                <Badge color="blue" size="lg" variant="dot">
                  <NumberFormatter
                    value={form.values.sold_amount}
                    decimalScale={3}
                    thousandSeparator
                    prefix={getMoneyPrefix("USD")}
                  />
                </Badge>
              </Group>
              <Group>
                {form.values.trading_result >= 0 ? "Benefit : " : "Loss : "}
                <Badge color={form.values.trading_result >= 0 ? "teal" : "red"} size="lg" variant="dot">
                  <NumberFormatter
                    value={form.values.trading_result}
                    decimalScale={3}
                    thousandSeparator
                    prefix={getMoneyPrefix("USD")}
                  />
                </Badge>
              </Group>
            </Group>
            <Divider />
            <Group grow>
              <Button variant="gradient" size="sm" color="blue" type="submit">
                Commit
                <IconSend size={16} className="ml-3" />
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Fragment>
  );
}
