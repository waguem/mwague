"use client";
import { Deposit, External, Internal, Sending, TransactionType } from "@/lib/client";
import { useEffect, useState, useTransition } from "react";
import {
  List,
  ThemeIcon,
  rem,
  Text,
  Skeleton,
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
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { ReviewFormData, reviewTransaction } from "@/lib/actions/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionReviewResolver } from "@/lib/schemas/actions";
import { useFormState } from "react-dom";
import { State } from "@/lib/actions";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";

interface Props {
  onClose: () => void;
  code: string;
  type: TransactionType | string;
  review: boolean;
}

type ReviewInput = {
  notes: string;
  action: "APPROVE" | "REJECT" | "CANCEL";
  code: string;
  type: TransactionType;
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
function InternalView({ transaction }: { transaction: Internal }) {
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

function DepositView({ transaction }: { transaction: Deposit }) {
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
function SendingView({ transaction }: { transaction: Sending }) {
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

export default function TransactionReview({ code, type, onClose, review }: Props) {
  const { register, reset, setValue, getValues } = useForm<ReviewInput>({
    mode: "all",
    resolver: zodResolver(TransactionReviewResolver),
  });
  const [opened, { open, close }] = useDisclosure(review);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useFormState<State, ReviewFormData>(reviewTransaction, null);
  const [transaction, setTransaction] = useState<any>(undefined);

  useEffect(() => {
    async function fetchTransaction() {
      const res = await fetch(`/api/transaction?code=${code}&type=${type}`);
      const data = await res.json();
      setTransaction(data);
      setValue("type", data.type);
    }
    if (code && type) {
      fetchTransaction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, type]);

  useEffect(() => {
    setValue("code", code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      onClose();
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

  let View: any = ExternalView;
  switch (type) {
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
  }
  return (
    <Drawer
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      transitionProps={{ duration: 1000 }}
      offset={8}
      position="right"
      radius="md"
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
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
            <Text c="dimmed" size="sm">
              You&apos;ve created new branch{" "}
              <Text variant="link" component="span" inherit>
                fix-notifications
              </Text>{" "}
              from master
            </Text>
            <Text size="xs" mt={4}>
              2 hours ago
            </Text>
            {transaction && <View transaction={transaction} />}
            {!transaction && (
              <>
                <span>Loading...</span>
                <Skeleton height={8} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} width="70%" radius="xl" />
              </>
            )}
          </Timeline.Item>
          <Timeline.Item title="Transaction review" bullet={<IconMessageDots size={12} />}>
            {transaction && transaction.state === "REVIEW" && (
              <form
                className="mt-5"
                action={(formData) => {
                  const data: any = {
                    ...formData,
                    ...getValues(),
                    officeId: transaction!.office_id,
                  };
                  startTransition(() => formAction(data as unknown as ReviewFormData));
                }}
              >
                <Textarea rows={5} {...register("notes", { required: false })} placeholder="Add notes here" />
                <Space h={10} />
                <Group style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    color="green"
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
          </Timeline.Item>
        </Timeline>
      </Box>
    </Drawer>
  );
}
