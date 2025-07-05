import { CommitTradeRequest, OfficeResponse, OfficeWalletResponse, WalletTradingResponse } from "@/lib/client";
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Drawer,
  Group,
  LoadingOverlay,
  NumberFormatter,
  Table,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconGitPullRequest } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import { getMoneyPrefix } from "@/lib/utils";
import { groupedCommit } from "@/lib/actions/wallet";
import { decodeNotification } from "../notifications/notifications";
import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";

interface Props {
  office: OfficeResponse;
  tradings: WalletTradingResponse[];
  wallet: OfficeWalletResponse;
}

function getDefaultSelectedRows(wallet: OfficeWalletResponse, tradings: WalletTradingResponse[]) {
  let sum = 0;
  const matchedBalance = [];
  // sort the list of tradings by amount in descending order the oldest first
  const sortedTradings = tradings.sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  // iterate through the sorted tradings and select the ones that can be committed
  for (const trading of sortedTradings) {
    if (trading.state === "PENDING" && trading.amount + sum <= wallet.trading_balance) {
      sum += trading.amount;
      matchedBalance.push(trading.code!);
    }
    // stop when the sum is greater than the wallet balance
    if (sum >= wallet.trading_balance) {
      break;
    }
  }
  return matchedBalance;
}
export default function GroupedCommit({ wallet, tradings }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // reset selected rows when the wallet or tradings change
    setSelectedRows(getDefaultSelectedRows(wallet, tradings));
  }, [wallet, tradings]);
  const isCommitable = useMemo(() => {
    // check if there is at least one commitable trading
    // a commitable trading is a trading that the trading amount is less than or equal to the wallet balance
    return tradings.some((trading) => {
      const walletBalance = wallet!.trading_balance || 0;
      const tradingAmount = trading.amount || 0;
      return trading.state === "PENDING" && tradingAmount <= walletBalance;
    });
  }, [tradings, wallet]);

  const commit = async () => {
    try {
      const request: CommitTradeRequest[] = tradings
        .filter((tr) => selectedRows.includes(tr.code!))
        .map((trade) => ({
          code: trade.code!,
          walletID: wallet.walletID,
          tradeID: trade.id,
          amount: trade.amount,
          trading_rate: trade.trading_rate,
          trading_cost: (wallet.value / wallet.trading_balance) * trade.amount,
          sold_amount:
            trade.trading_type == "SIMPLE SELL"
              ? trade.amount * (1 + trade.trading_rate / 100)
              : trade.amount / trade.trading_rate,
          trading_result: trade.amount / trade.trading_rate - (wallet.value / wallet.trading_balance) * trade.amount,
          crypto_amount: trade.amount * (wallet.crypto_balance / wallet.trading_balance),
        }));
      const response = await groupedCommit(request);
      for (const res of response) {
        decodeNotification("Commit Trade", res);
      }
    } catch (error) {
      console.error("Error committing trades:", error);
    }
  };

  const rows = tradings
    .sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    })
    .map((trade) => (
      <Table.Tr
        key={trade.code}
        bg={selectedRows.includes(trade?.code!) ? "var(--mantine-color-blue-light)" : undefined}
      >
        <Table.Td>
          <Checkbox
            aria-label="Select row"
            checked={selectedRows.includes(trade?.code!)}
            onChange={(event) =>
              setSelectedRows(
                event.currentTarget.checked
                  ? [...selectedRows, trade?.code!]
                  : selectedRows.filter((code) => code !== trade?.code!)
              )
            }
          />
        </Table.Td>
        <Table.Td>{trade.code}</Table.Td>
        <Table.Td>
          <Badge variant="dot" color="gray" size="sm" style={{ marginLeft: 0 }}>
            {formatDistanceToNowStrict(trade.created_at as string, {
              addSuffix: true,
              roundingMethod: "ceil",
            })}
          </Badge>
        </Table.Td>
        <Table.Td>{trade.account}</Table.Td>
        <Table.Td>{trade.trading_rate}</Table.Td>
        <Table.Td>
          <Badge radius={"sm"} size="md" variant="dot" color="violet">
            <NumberFormatter
              value={trade.amount as number}
              thousandSeparator=","
              decimalScale={2}
              prefix={getMoneyPrefix(trade.trading_currency)}
            />
          </Badge>
        </Table.Td>
      </Table.Tr>
    ));
  const totalAmount = tradings
    .filter((trade) => selectedRows.includes(trade.code!))
    .reduce((acc, tr) => acc + (tr.amount || 0), 0);

  if (!isCommitable) {
    return null; // or return a message indicating no tradings to commit
  }
  return (
    <Fragment>
      <Button variant="gradient" size="compact-md" onClick={open}>
        <ActionIcon>
          <IconGitPullRequest size={18} />
        </ActionIcon>
        Grouped Commit
      </Button>
      <Drawer
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        size={"xl"}
        offset={8}
        opened={opened}
        onClose={close}
        radius={"md"}
        position="right"
        withCloseButton={false}
      >
        <LoadingOverlay visible={pending} loaderProps={{ color: "pink", type: "dots" }} />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Checkbox
                  aria-label="Select row"
                  checked={selectedRows.length > 0}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setSelectedRows(getDefaultSelectedRows(wallet, tradings));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </Table.Th>
              <Table.Th>Code</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Rate</Table.Th>
              <Table.Th>Amount</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        <Group grow className="mt-4">
          <Badge size="lg" variant="dot">
            Wallet Balance:{" "}
            <NumberFormatter
              value={wallet.trading_balance}
              thousandSeparator=","
              decimalScale={2}
              prefix={getMoneyPrefix(wallet.crypto_currency)}
            />
          </Badge>
          <Badge size="lg" variant="dot">
            Total Amount:{" "}
            <NumberFormatter
              value={totalAmount}
              thousandSeparator=","
              decimalScale={2}
              prefix={getMoneyPrefix(wallet.crypto_currency)}
            />
          </Badge>
        </Group>
        <Button
          variant="gradient"
          size="sz"
          fullWidth
          mt="md"
          onClick={() => startTransition(() => commit())}
          disabled={(totalAmount > wallet.trading_balance && totalAmount > 0) || selectedRows.length === 0}
        >
          Commit
        </Button>
      </Drawer>
    </Fragment>
  );
}
