import { groupPay } from "@/lib/actions/transactions";
import { ForEx, GroupedPaymentItem, Note, OfficeResponse } from "@/lib/client";
import { AllTransactions, OfficeCurrency } from "@/lib/types";
import { getMoneyPrefix } from "@/lib/utils";
import {
  Badge,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  Space,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCashRegister, IconCheck, IconX } from "@tabler/icons-react";
import { formatDate } from "date-fns";
import { MRT_Row, MRT_TableInstance } from "mantine-react-table";
import { Fragment, useMemo, useTransition } from "react";

interface Props {
  table: MRT_TableInstance<AllTransactions>;
  office: OfficeResponse;
}
export default function GroupedPayment({ table, office }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [pending, startTransition] = useTransition();
  const currencies: OfficeCurrency[] = (office.currencies ?? []) as OfficeCurrency[];
  const mainCurrency = currencies.find((c) => c.main);
  const baseCurrency = currencies.find((c) => c.base);
  const form = useForm<{ name: string; phone: string }>({
    initialValues: {
      name: "",
      phone: "",
    },
  });
  const getPayment = (row: ForEx) => {
    if (row.tag === "BANKTT") {
      return row.amount;
    }
    return row.amount / row.buying_rate;
  };

  const totals = useMemo(() => {
    return table
      .getSelectedRowModel()
      .rows.reduce((ac: number, row: MRT_Row<AllTransactions>) => ac + getPayment(row.original as ForEx), 0);
  }, [table]);

  const handleGroupPay = async () => {
    try {
      const getNote = (item: ForEx) => {
        const notes: Note[] = JSON.parse(item?.notes ?? "[]");
        return notes.find((n) => n.type == "REQUEST")?.message ?? "";
      };

      const payments: GroupedPaymentItem[] = table.getSelectedRowModel().rows.map((row) => ({
        code: row.original.code,
        request: {
          payment_type: "FOREX",
          rate: row.original.rate,
          notes: getNote(row.original as ForEx),
          customer: {
            name: form.values.name,
            phone: form.values.phone,
          },
          amount: getPayment(row.original as ForEx),
        },
      }));

      const pendingTasks: { code: string; task: string }[] = [];
      let taskId = 1;
      for (let payment of payments) {
        setTimeout(
          function (payment) {
            const task = notifications.show({
              title: `${payment.code} Payment in progress`,
              className: "mt-2",
              radius: "md",
              loading: true,
              withCloseButton: true,
              autoClose: false,
              message: `${payment.code} payment is ongoing please wait`,
            });
            pendingTasks.push({
              code: payment.code,
              task,
            });
          },
          200 * taskId,
          payment
        );
        taskId += 1;
      }
      const response = await groupPay(payments);
      let count = 1;
      for (const r of response.states) {
        let t = pendingTasks.find((t) => t.code == r.code);
        setTimeout(
          function (task) {
            notifications.update({
              id: task!.task,
              title: `${r.code} Payment`,
              color: r.state === 1 ? "green" : "red",
              className: "mt-2",
              radius: "md",
              withBorder: true,
              icon: r.state == 1 ? <IconCheck size={20} /> : <IconX size={20} />,
              loading: false,
              withCloseButton: true,
              autoClose: 3000,
              message: r.state === 1 ? `${r.code} payment was successfull` : `${r.code} payment has failed`,
            });
          },
          200 * count,
          t
        );
        count += 1;
      }
      form.reset();
      table.resetRowSelection();
    } catch (e) {}
  };
  if (table.getSelectedRowModel().rows.length == 0) {
    return null;
  }

  return (
    <Fragment>
      <Button size="xs" variant="outline" radius="md" onClick={open} leftSection={<IconCashRegister size={18} />}>
        Grouped Payment
      </Button>
      <Modal size={"lg"} centered opened={opened} withCloseButton={false} onClose={close}>
        <LoadingOverlay visible={pending} loaderProps={{ color: "pink", type: "dots" }} />
        <Table verticalSpacing={"sm"} withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Code</Table.Th>
              <Table.Th>Payment</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {table.getSelectedRowModel().rows.map((row, index) => {
              const { code, created_at } = row.original;
              const forex = row.original as ForEx;
              const amount = forex.tag == "BANKTT" ? forex.amount : forex.amount / forex.buying_rate;
              return (
                <Table.Tr tabIndex={index} key={index}>
                  <Table.Td>{formatDate(created_at as string, "MMM dd")}</Table.Td>
                  <Table.Td>{code}</Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      thousandSeparator
                      decimalScale={2}
                      value={amount}
                      prefix={getMoneyPrefix(mainCurrency?.name)}
                    />{" "}
                    -{" "}
                    <NumberFormatter
                      thousandSeparator
                      decimalScale={2}
                      suffix={getMoneyPrefix(baseCurrency?.name)}
                      value={amount * Number(baseCurrency?.defaultRate)}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
            <Table.Tr>
              <Table.Td>{formatDate(new Date(), "MMM dd")}</Table.Td>
              <Table.Td> Total Payment </Table.Td>
              <Table.Td>
                <Badge variant="dot" size="xl">
                  <NumberFormatter
                    thousandSeparator
                    decimalScale={2}
                    prefix={getMoneyPrefix(mainCurrency?.name)}
                    value={totals}
                  />{" "}
                  -{" "}
                  <NumberFormatter
                    thousandSeparator
                    decimalScale={2}
                    suffix={getMoneyPrefix(baseCurrency?.name)}
                    value={totals * Number(baseCurrency?.defaultRate)}
                  />
                </Badge>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Space h="md" />
        <Divider label="Provider Infos" />
        <form action={() => startTransition(() => handleGroupPay())}>
          <Stack>
            <Group grow>
              <TextInput label={"Provider Name"} {...form.getInputProps("name")} required />
              <TextInput label={"Provider Phone"} {...form.getInputProps("phone")} required />
            </Group>
            <Group grow>
              <Button type="submit" variant="gradient" leftSection={<IconCashRegister size={16} />}>
                Submit Payment
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Fragment>
  );
}
