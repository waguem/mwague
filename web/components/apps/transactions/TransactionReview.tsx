"use client";
import {
  Currency,
  Deposit,
  EmployeeResponse,
  External,
  ForEx,
  Internal,
  Note,
  OfficeResponse,
  Sending,
  TransactionState,
  TransactionType,
} from "@/lib/client";
import { Fragment, useEffect, useTransition } from "react";

import { useForm as useFromMantine } from "@mantine/form";

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
  Stack,
  TagsInput,
  Badge,
  Blockquote,
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
  IconTag,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { cancelTransaction, ReviewFormData, reviewTransaction } from "@/lib/actions/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionReviewResolver } from "@/lib/schemas/actions";
import { useFormState } from "react-dom";
import { State } from "@/lib/actions";
import { notifications } from "@mantine/notifications";
import { CANCELLATION_REASON, getMoneyPrefix } from "@/lib/utils";
import { AllTransactions, OfficeCurrency } from "@/lib/types";
import { decodeNotification } from "../notifications/notifications";

interface Props {
  row: AllTransactions;
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
  let buying_amount = transaction.amount / transaction.buying_rate;
  let selling_amount = transaction.amount / transaction.selling_rate;
  if (transaction.tag === "BANKTT") {
    buying_amount = transaction.amount;
    selling_amount = transaction.amount * (1 + transaction.selling_rate / 100);
  }
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
            <IconTag size={16} />
          </ThemeIcon>
        }
      >
        Tag : {transaction.tag}
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
        {transaction.tag == "BANKTT" ? (
          <>
            Rates :{" "}
            <NumberFormatter thousandSeparator value={transaction.buying_rate ?? 0} decimalScale={5} prefix="%" />
          </>
        ) : (
          <>
            (B/S) Rates : <NumberFormatter thousandSeparator value={transaction.buying_rate ?? 0} decimalScale={5} /> /{" "}
            <NumberFormatter thousandSeparator value={transaction.selling_rate ?? 0} decimalScale={5} />
          </>
        )}
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
      code: row?.code,
      type: row?.type,
      charges: 0,
      amount: row?.amount ?? 0,
    },
  });

  const getNotes = (): Note[] => {
    if (row?.notes?.length) {
      return JSON.parse(row.notes);
    }
    return [];
  };
  const getTags = () => {
    const n = getNotes();
    if (n.length) {
      return n[0].tags ?? [];
    }
    return [];
  };

  const form = useFromMantine<{
    reason: string[];
    description: string;
  }>({
    initialValues: {
      reason: getTags(),
      description: "",
    },
  });

  const currencies: any = office?.currencies ?? [];
  const mainCurrency = currencies?.find((currency: any) => currency.main);
  const baseCurrency = currencies?.find((currency: any) => currency.base);

  const [pending, startTransition] = useTransition();
  const [state, formAction] = useFormState<State, ReviewFormData>(reviewTransaction, null);

  const handleCancel = async () => {
    try {
      const response = await cancelTransaction({
        type: row?.type,
        reason: form.values.reason,
        description: form.values.description,
        code: row?.code,
      });
      decodeNotification("CANCELLATION", response);
      response?.status === "success" && form.reset();
    } catch (e) {}
  };
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
    if (row) {
      reset({
        action: "APPROVE",
        notes: "",
        code: row?.code,
        type: row?.type,
        charges: 0,
        amount: row?.amount ?? 0,
      });
    }
  }, [row, reset]);

  let View: any = ExternalView;

  if (!row) return null;

  switch (row?.type) {
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
  const notes = getNotes();
  const requestMessage = notes.find((note) => note.type === "REQUEST");
  const reviewMessage = notes.find((note) => note.type === "REVIEW");
  const cancelMessage = notes.find((note) => note.type === "CANCEL");
  const requester = getEmployee([requestMessage?.user ?? ""]);
  const reviewer = getEmployee([reviewMessage?.user ?? ""]);
  const canceller = getEmployee([cancelMessage?.user ?? ""]);
  const activeState: Record<TransactionState, number> = {
    REVIEW: 1,
    PENDING: 1,
    REJECTED: 2,
    PAID: 2,
    CANCELLED: 3,
    INIT: 1,
  };

  console.log("Vlue", form.values.reason);

  return (
    <Drawer
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      transitionProps={{ duration: 500 }}
      offset={8}
      radius="md"
      position="right"
      withCloseButton={false}
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
        <Timeline active={activeState[row?.state]} bulletSize={24} lineWidth={2}>
          <Timeline.Item bullet={<IconGitBranch size={12} />} title="Transaction Request">
            <Space h={10} />
            <Alert title="Message" icon={<IconMessageDots size={14} />}>
              <Group>
                <Tooltip label={requester?.length >= 1 ? requester[0].username : "Requester"}>
                  <Avatar src={requester?.length >= 1 ? requester[0].avatar_url : ""} />
                </Tooltip>
                {notes.find((note) => note.type === "REQUEST")?.message ?? "Transaction request"}
              </Group>
            </Alert>
            <Space h={10} />
            <Text size="xs" mt={4}></Text>
            {row && (
              <View
                office={office}
                baseCurrency={baseCurrency?.name}
                mainCurrency={mainCurrency?.name}
                transaction={row}
              />
            )}
          </Timeline.Item>
          <Timeline.Item color="teal" title="Transaction review" bullet={<IconMessageDots size={12} />}>
            {row && row.state === "REVIEW" && (
              <form
                className="mt-5"
                action={(formData) => {
                  const data: any = {
                    ...formData,
                    ...getValues(),
                    officeId: row.office_id,
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

          <Timeline.Item color="red" title="Cancellation" bullet={<IconCancel size={12} />}>
            <Space h="xl" />
            {row?.state === "PAID" ? (
              <form action={() => startTransition(() => handleCancel())}>
                <Stack>
                  <Group grow>
                    <TagsInput
                      label="Reason"
                      data={CANCELLATION_REASON}
                      {...form.getInputProps("reason")}
                      value={form.values.reason}
                    />
                  </Group>
                  <Group grow>
                    <Textarea label="Description" {...form.getInputProps("description")} />
                  </Group>
                  <Group grow>
                    <Button type="submit" variant="gradient" size="xs" gradient={{ from: "red", to: "pink", deg: 120 }}>
                      Cancel
                    </Button>
                  </Group>
                </Stack>
              </form>
            ) : row?.state === "CANCELLED" ? (
              <Blockquote color="red">
                <Group grow>
                  {cancelMessage?.tags?.map((t) => (
                    <Badge variant="dot" radius={"md"} key={t}>
                      {t}
                    </Badge>
                  ))}
                </Group>
                <Group className="mt-2">
                  <Tooltip label={canceller?.length >= 1 ? canceller[0].username : "Reviewer"}>
                    <Avatar src={canceller?.length >= 1 ? canceller[0].avatar_url : ""} />
                  </Tooltip>
                  {cancelMessage?.message}
                </Group>
              </Blockquote>
            ) : null}
          </Timeline.Item>

          <Timeline.Item color="gray" bullet={<IconX size={12} />} title="Cancelled">
            {row?.state === "CANCELLED" && <Fragment></Fragment>}
          </Timeline.Item>
        </Timeline>
      </Box>
    </Drawer>
  );
}
