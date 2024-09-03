"use client";
import {
  Currency,
  Deposit,
  EmployeeResponse,
  External,
  ForEx,
  Internal,
  OfficeResponse,
  Sending,
  TransactionItem,
  TransactionType,
} from "@/lib/client";
import { useEffect, useTransition } from "react";

import {
  List,
  ThemeIcon,
  rem,
  Text,
  NumberFormatter,
  Timeline,
  Drawer,
  Textarea,
  Space,
  Group,
  Button,
  Box,
  LoadingOverlay,
  Loader,
  Alert,
  Avatar,
  Tooltip,
} from "@mantine/core";
import {
  IconCash,
  IconCircleCheck,
  IconCoin,
  IconGitBranch,
  IconUser,
  IconMessageDots,
  IconTrash,
  IconCancel,
  IconX,
  IconCheck,
  IconArrowsExchange,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { ReviewFormData, reviewTransaction } from "@/lib/actions/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionReviewResolver } from "@/lib/schemas/actions";
import { useFormState } from "react-dom";
import { State } from "@/lib/actions";
import { notifications } from "@mantine/notifications";
import { getMoneyPrefix } from "@/lib/utils";
import { OfficeCurrency } from "@/lib/types";

interface Props {
  row: TransactionItem;
  opened: boolean;
  office: OfficeResponse;
  close: () => void;
  getEmployee: (users: string[]) => EmployeeResponse[]; // eslint-disable-line
}

type ReviewInput = {
  notes: string;
  action: "APPROVE" | "REJECT" | "CANCEL";
  code: string;
  type: TransactionType;
  charges: number;
  amount: number;
};

function ExternalView({ transaction }: { transaction: External }) {
  return (
    <List
      style={{ marginTop: 5 }}
      spacing={"xs"}
      size="sm"
      center
      icon={
        <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
          <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
        </ThemeIcon>
      }
    >
      <List.Item
        style={{
          marginTop: 5,
        }}
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconUser style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <Text size="sm">From : {transaction.sender_initials}</Text>
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Amount : <NumberFormatter thousandSeparator prefix="$" value={transaction.amount} />
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconCoin style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        {" "}
        Charges : <NumberFormatter value={transaction.charges ?? 0} thousandSeparator prefix="$" />{" "}
      </List.Item>
    </List>
  );
}
function InternalView({ transaction }: { transaction: Internal; mainCurrency: Currency }) {
  return (
    <List
      style={{ marginTop: 5 }}
      spacing={"xs"}
      size="sm"
      center
      icon={
        <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
          <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
        </ThemeIcon>
      }
    >
      <List.Item
        style={{
          marginTop: 5,
        }}
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconUser style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <Text size="sm">From : {transaction.sender_initials}</Text>
      </List.Item>
      <List.Item
        style={{
          marginTop: 5,
        }}
        icon={
          <ThemeIcon color="red" size={"sm"} radius={"xl"}>
            <IconUser style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <Text size="sm">to : {transaction.receiver_initials}</Text>
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Amount : <NumberFormatter thousandSeparator prefix="$" value={transaction.amount} />
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconCoin style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        {" "}
        Charges : <NumberFormatter value={transaction.charges ?? 0} thousandSeparator prefix="$" />{" "}
      </List.Item>
    </List>
  );
}

function DepositView({ transaction }: { transaction: Deposit; mainCurrency: Currency }) {
  return (
    <List
      style={{ marginTop: 5 }}
      spacing={"xs"}
      size="sm"
      center
      icon={
        <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
          <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
        </ThemeIcon>
      }
    >
      <List.Item
        style={{
          marginTop: 5,
        }}
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconUser style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <Text size="sm">Depositer : {transaction.owner_initials}</Text>
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Amount : <NumberFormatter thousandSeparator prefix="$" value={transaction.amount} />
      </List.Item>
    </List>
  );
}

function ForexView({ transaction, office }: { transaction: ForEx; office: OfficeResponse }) {
  const currencies: OfficeCurrency[] = (office?.currencies ?? []) as OfficeCurrency[];
  const mainCurrency = currencies?.find((currency: any) => currency.main);
  const buying_amount = transaction.amount / transaction.buying_rate;
  const selling_amount = transaction.amount / transaction.selling_rate;
  const exchange_benefit = selling_amount - buying_amount;
  return (
    <List
      style={{ marginTop: 5 }}
      spacing={"xs"}
      size="sm"
      center
      icon={
        <ThemeIcon color="blue" size={"sm"} radius={"xl"}>
          <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
        </ThemeIcon>
      }
    >
      <List.Item
        style={{
          marginTop: 5,
        }}
        icon={
          <ThemeIcon color="blue" size={"sm"} radius={"xl"}>
            <IconUser style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <Text size="sm">Provider : {transaction.provider_account}</Text>
      </List.Item>
      <List.Item
        style={{
          marginTop: 5,
        }}
        icon={
          <ThemeIcon color="blue" size={"sm"} radius={"xl"}>
            <IconUser style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <Text size="sm">Customer : {transaction.customer_account}</Text>
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="grape" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Amount :{" "}
        <NumberFormatter
          thousandSeparator
          prefix={`${getMoneyPrefix(transaction.currency ?? "USD")} `}
          value={transaction.amount}
          decimalScale={3}
        />{" "}
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="grape" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Buying Amount :{" "}
        <NumberFormatter
          thousandSeparator
          prefix={`${getMoneyPrefix(mainCurrency?.name)} `}
          value={buying_amount}
          decimalScale={3}
        />{" "}
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="grape" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Selling Amount :{" "}
        <NumberFormatter
          thousandSeparator
          prefix={`${getMoneyPrefix(mainCurrency?.name)} `}
          value={selling_amount}
          decimalScale={3}
        />{" "}
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="cyan" size={"sm"} radius={"xl"}>
            <IconArrowsExchange style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        (B/S) Rates : <NumberFormatter thousandSeparator value={transaction.buying_rate ?? 0} decimalScale={5} /> /{" "}
        <NumberFormatter thousandSeparator value={transaction.selling_rate ?? 0} decimalScale={5} />
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="grape" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Exchange Benefit :{" "}
        <NumberFormatter
          thousandSeparator
          prefix={`${getMoneyPrefix(mainCurrency?.name)} `}
          value={exchange_benefit}
          decimalScale={3}
        />{" "}
      </List.Item>
    </List>
  );
}

function SendingView({ transaction }: { transaction: Sending; mainCurrency: Currency; baseCurrency: Currency }) {
  return (
    <List
      style={{ marginTop: 5 }}
      spacing={"xs"}
      size="sm"
      center
      icon={
        <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
          <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
        </ThemeIcon>
      }
    >
      <List.Item
        style={{
          marginTop: 5,
        }}
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconUser style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <Text size="sm">Agent : {transaction.receiver_initials}</Text>
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconCash style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        Amount : <NumberFormatter thousandSeparator prefix="$" value={transaction.amount} />
      </List.Item>
      <List.Item
        icon={
          <ThemeIcon color="teal" size={"sm"} radius={"xl"}>
            <IconCoin style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        {" "}
        Charges : <NumberFormatter value={transaction.charges ?? 0} thousandSeparator prefix="$" />{" "}
      </List.Item>
    </List>
  );
}

export default function TransactionReview({ row, opened, close, office, getEmployee }: Props) {
  const { register, reset, setValue, getValues } = useForm<ReviewInput>({
    mode: "all",
    resolver: zodResolver(TransactionReviewResolver),
    defaultValues: {
      action: "APPROVE",
      notes: "",
      code: row?.item?.code,
      type: row?.item?.type,
      charges: 0,
      amount: row?.item?.amount ?? 0,
    },
  });
  const currencies: any = office?.currencies ?? [];
  const mainCurrency = currencies?.find((currency: any) => currency.main);
  const baseCurrency = currencies?.find((currency: any) => currency.base);

  const [pending, startTransition] = useTransition();
  const [state, formAction] = useFormState<State, ReviewFormData>(reviewTransaction, null);

  useEffect(() => {
    if (state?.status === "success") {
      notifications.show({
        title: "Review Transaction",
        color: "teal",
        message: state.message,
        className: "",
        withBorder: true,
        radius: "md",
        icon: <IconCheck size={20} />,
        loading: false,
        withCloseButton: true,
        autoClose: 3000,
        style: { marginTop: 10 },
      });
      close();
      reset();
    } else if (state?.status == "error" && state.errors?.length! > 0) {
      state.errors!.forEach((error) => {
        notifications.show({
          title: "Review Transaction",
          color: "red",
          message: `Input ${error.path} ${error.message}`,
          className: "mt-2",
          radius: "md",
          withBorder: true,
          icon: <IconX size={20} />,
          loading: false,
          withCloseButton: true,
          autoClose: 3000,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (row?.item) {
      reset({
        action: "APPROVE",
        notes: "",
        code: row?.item?.code,
        type: row?.item?.type,
        charges: 0,
        amount: row?.item?.amount ?? 0,
      });
    }
  }, [row, reset]);

  let View: any = ExternalView;
  switch (row?.item.type) {
    case "EXTERNAL":
      View = ExternalView;
      break;
    case "INTERNAL":
      View = InternalView;
      break;
    case "DEPOSIT":
      View = DepositView;
      break;
    case "SENDING":
      View = SendingView;
      break;
    case "FOREX":
      View = ForexView;
      break;
  }

  const requestMessage = row?.notes?.find((note) => note.type === "REQUEST");
  const reviewMessage = row?.notes?.find((note) => note.type === "REVIEW");
  const requester = getEmployee([requestMessage?.user ?? ""]);
  const reviewer = getEmployee([reviewMessage?.user ?? ""]);
  return (
    <Drawer
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      transitionProps={{ duration: 500 }}
      offset={8}
      radius="md"
      position="right"
      opened={opened}
      onClose={close}
    >
      <Box pos="relative">
        <LoadingOverlay
          visible={pending}
          loaderProps={{
            children: <Loader size={20} />,
          }}
        />
        <Timeline active={0} bulletSize={24} lineWidth={2}>
          <Timeline.Item bullet={<IconGitBranch size={12} />} title="Transaction Request">
            <Space h={10} />
            <Alert title="Message" icon={<IconMessageDots size={14} />}>
              <Group>
                <Tooltip label={requester?.length >= 1 ? requester[0].username : "Requester"}>
                  <Avatar src={requester?.length >= 1 ? requester[0].avatar_url : ""} />
                </Tooltip>
                {row?.notes?.find((note) => note.type === "REQUEST")?.message ?? "Transaction request"}
              </Group>
            </Alert>
            <Space h={10} />
            <Text size="xs" mt={4}></Text>
            {row?.item && (
              <View
                office={office}
                baseCurrency={baseCurrency?.name}
                mainCurrency={mainCurrency?.name}
                transaction={row.item}
              />
            )}
          </Timeline.Item>
          <Timeline.Item title="Transaction review" bullet={<IconMessageDots size={12} />}>
            {row?.item && row?.item.state === "REVIEW" && (
              <form
                className="mt-5"
                action={(formData) => {
                  const data: any = {
                    ...formData,
                    ...getValues(),
                    officeId: row?.item.office_id,
                  };
                  startTransition(() => formAction(data as unknown as ReviewFormData));
                }}
              >
                <Textarea rows={5} {...register("notes", { required: false })} placeholder="Add notes here" />
                <Space h={10} />
                <Group style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    color="green"
                    variant="outline"
                    leftSection={<IconCircleCheck size={16} />}
                    size={"xs"}
                    type="submit"
                    onClick={() => {
                      setValue("action", "APPROVE");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    color="orange"
                    variant="outline"
                    leftSection={<IconCancel size={16} />}
                    size={"xs"}
                    type="submit"
                    onClick={() => {
                      setValue("action", "REJECT");
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    color="red"
                    variant="outline"
                    leftSection={<IconTrash size={16} />}
                    size="xs"
                    type="submit"
                    onClick={() => {
                      setValue("action", "CANCEL");
                    }}
                  >
                    Cancel
                  </Button>
                </Group>
              </form>
            )}
            <Space h={10} />
            {reviewMessage && (
              <Alert title="Message" icon={<IconMessageDots size={14} />}>
                <Group>
                  <Tooltip label={reviewer?.length >= 1 ? reviewer[0].username : "Reviewer"}>
                    <Avatar src={reviewer?.length >= 1 ? reviewer[0].avatar_url : ""} />
                  </Tooltip>
                  {reviewMessage?.message ?? "Transaction has been reviewed"}
                </Group>
              </Alert>
            )}
          </Timeline.Item>
        </Timeline>
      </Box>
    </Drawer>
  );
}
