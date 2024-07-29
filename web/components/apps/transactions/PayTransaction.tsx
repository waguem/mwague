"use client";
import {
  Drawer,
  Table,
  LoadingOverlay,
  ScrollArea,
  Group,
  Avatar,
  Stack,
  rem,
  ActionIcon,
  Badge,
  Tooltip,
  NumberFormatter,
  Button,
  Space,
  TextInput,
  NumberInput,
  Textarea,
  Divider,
  Accordion,
  Loader,
} from "@mantine/core";
import { useEffect, useState, useTransition } from "react";
import {
  IconCancel,
  IconCurrencyDirham,
  IconCurrencyDollar,
  IconHandGrab,
  IconReceipt,
  IconSend,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { payTransaction } from "@/lib/actions/transactions";

import { PaymentRequest } from "@/lib/schemas/actions";
import { decodeNotification } from "../notifications/notifications";
interface PayTransactionProps {
  row: any;
  opened: boolean;
  close: () => void;
  officeId: string;
  // eslint-disable-next-line
  getAvatarGroup: (users: string[]) => any[];
}

export default function PayTransaction({ row, opened, close, officeId, getAvatarGroup }: PayTransactionProps) {
  const [pending, startTransition] = useTransition();

  const [transaction, setTransaction] = useState<any>(undefined);

  const form = useForm<PaymentRequest>({
    mode: "controlled",
    initialValues: {
      convertedAmount: 0,
      mainAmount: 0,
      rate: 0,
      customerName: "",
      customerPhone: "",
      notes: "",
      type: "EXTERNAL",
      code: "",
    },
    validate: {
      convertedAmount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      mainAmount: (value) => (value <= 0 ? "Amount must be greater than 0" : undefined),
      customerName: (value) => (value && value.length > 32 ? "Too long" : undefined),
      customerPhone: (value) => (value && value && value?.length > 32 ? "Too long" : undefined),
      notes: (value) => (value && value.length > 512 ? "Too long" : undefined),
    },
  });

  const handlePayment = async () => {
    try {
      const response = await payTransaction(officeId, form.values);
      decodeNotification("Transaction Payment", response);
    } catch (e) {}
  };

  useEffect(() => {
    async function fetchTransaction(code: string, type: string) {
      const res = await fetch(`/api/transaction?code=${code}&type=${type}`);
      const data = await res.json();
      
      let amount = data.amount
      if(data.type==="FOREX"){
        // buying amount => amount / buying_rate
        amount = data.amount / data.buying_rate
      }
      form.setValues({
        rate: data.rate,
        mainAmount: amount,
        convertedAmount: amount * data.rate,
        type: data.type,
        code: data.code,
      });

      console.log(data);
      setTransaction(data);
    }
    console.log("fetching transaction");

    if (row?.code && row?.type) {
      setTransaction(undefined);
      fetchTransaction(row.code, row.type);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  let rows = transaction?.payments?.map((item: any) => {
    // const selected = selection.includes(item.id);
    const payerProfile = getAvatarGroup([item.paid_by])[0];
    return (
      <Table.Tr key={item.id}>
        <Table.Td>{item.payment_date}</Table.Td>
        <Table.Td>
          <Group gap="sm" justify="left">
            <Avatar size={26} src={payerProfile.avatar_url} radius={26} />
            {payerProfile.username}
          </Group>
        </Table.Td>
        <Table.Td>
          <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={item.amount} />
        </Table.Td>
        <Table.Td>
          <Group justify="left">
            <Badge size="sm" color={item.state == 1 ? "teal" : "red"} variant="outline">
              {item.state == 1 ? "Paid" : "Cancelled"}
            </Badge>
            <Tooltip label="Cancel" position="left">
              <ActionIcon size="sm" variant="gradient" gradient={{ from: "red", to: "pink", deg: 100 }}>
                <IconCancel size={12} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Download Receipt" position="left">
              <ActionIcon size="sm" variant="gradient" gradient={{ from: "teal", to: "pink", deg: 130 }}>
                <IconReceipt size={12} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });
  if (rows?.length == 0) {
    rows = (
      <Table.Tr>
        <Table.Td colSpan={4}>No payments found</Table.Td>
      </Table.Tr>
    );
  }
  console.log(form.isValid());
  return (
    <Drawer
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      opened={opened}
      onClose={close}
      size="lg"
      offset={8}
      radius="md"
      position="right"
      withCloseButton={false}
    >
      <ScrollArea>
        <LoadingOverlay
          visible={pending || !transaction}
          loaderProps={{
            children: <Loader size={20} />,
          }}
        />
        <Space h="xs" />
        {row?.state === "PENDING" && (
          <Accordion defaultValue={"payment"}>
            <Accordion.Item defaultChecked key={"Add Payment"} value={"payment"}>
              <Accordion.Control icon={<IconHandGrab />}>Payment Form</Accordion.Control>
              <Accordion.Panel>
                <form action={() => startTransition(() => handlePayment())}>
                  <Stack>
                    <Group justify="space-between" grow>
                      <NumberInput
                        label="Amount in $"
                        radius="md"
                        placeholder="Enter amount"
                        leftSection={<IconCurrencyDollar style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}
                        decimalScale={2}
                        value={form.values.mainAmount}
                        thousandSeparator=","
                        onChange={(value: number | string) => {
                          if (isNaN(Number(value))) {
                            form.setFieldValue("mainAmount", 0);
                            return;
                          }
                          // do conversion
                          form.setValues({
                            ...form.values,
                            mainAmount: Number(value),
                            convertedAmount: Number(value) * form.values.rate,
                          });
                        }}
                      />
                      <NumberInput
                        label="Amount in AED"
                        radius="md"
                        placeholder="Enter amount"
                        value={form.values.convertedAmount}
                        decimalScale={2}
                        thousandSeparator=","
                        onChange={(value: number | string) => {
                          if (isNaN(Number(value))) {
                            form.setFieldValue("convertedAmount", 0);
                            return;
                          }
                          // do conversion
                          form.setValues({
                            ...form.values,
                            convertedAmount: Number(value),
                            mainAmount: Number(value) / form.values.rate,
                          });
                        }}
                        leftSection={<IconCurrencyDirham style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}
                      />
                    </Group>
                    <Divider label="Customer details" />
                    <Group justify="space-between" grow>
                      <TextInput
                        label="Customer Name"
                        placeholder="Enter customer name"
                        value={form.values.customerName}
                        onChange={(event) => form.setFieldValue("customerName", event.currentTarget.value)}
                      />
                      <TextInput
                        label="Customer Phone"
                        placeholder="Enter customer phone"
                        value={form.values.customerPhone}
                        onChange={(event) => form.setFieldValue("customerPhone", event.currentTarget.value)}
                      />
                    </Group>
                    <Textarea
                      label="Notes"
                      placeholder="Enter notes..."
                      value={form.values.notes}
                      onChange={(event) => form.setFieldValue("notes", event.currentTarget.value)}
                      rows={2}
                    />
                    <Button
                      type="submit"
                      disabled={!form.isValid()}
                      size="xs"
                      variant="gradient"
                      gradient={{ from: "teal", to: "pink", deg: 120 }}
                      leftSection={pending ? <Loader color="yellow" size={16} /> : <IconSend size={16} />}
                    >
                      Pay
                    </Button>
                  </Stack>
                </form>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
        <Space h="xs" />
        <Table verticalSpacing="sm" withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Cashier</Table.Th>
              <Table.Th>Payment</Table.Th>
              <Table.Th>State</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Drawer>
  );
}
