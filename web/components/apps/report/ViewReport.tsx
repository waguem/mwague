import { ForEx } from "@/lib/client";
import { getMoneyPrefix } from "@/lib/utils";
import { Badge, Drawer, NumberFormatter, Table } from "@mantine/core";
import { formatDate } from "date-fns";
interface Props {
  opened: boolean;
  close: () => void;
  report: string;
  range: [Date | null, Date | null] | null;
  reports: ForEx[];
}
export default function ViewReport({ opened, close, report, reports }: Props) {
  const getBuying = (item: ForEx) => {
    let buying_amount = 0;
    if (item.tag == "BANKTT") {
      if (item.bank_fees && item.bank_rate) {
        buying_amount = (item.amount * item.bank_rate + item.bank_fees) / item.rate;
      } else {
        buying_amount = item.amount;
      }
    } else {
      buying_amount = item.amount / item.buying_rate;
    }
    return buying_amount;
  };

  const getSelling = (item: ForEx) => {
    let selling_amount = 0;
    if (item.tag == "BANKTT") {
      selling_amount = item.amount * (1 + item.selling_rate / 100);
    } else {
      selling_amount = item.amount / item.selling_rate;
    }
    return selling_amount;
  };

  const getBenefit = (item: ForEx) => {
    const buying_amount = getBuying(item);
    const selling_amount = getSelling(item);
    return selling_amount - buying_amount;
  };
  return (
    <Drawer
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      opened={opened}
      onClose={close}
      size="50%"
      offset={8}
      radius="md"
      position="right"
      withCloseButton={false}
    >
      <Drawer.Header>
        <Drawer.Title>
          <Badge variant="outline" size="xl" color="blue" radius={"md"}>
            {report} Report
          </Badge>
        </Drawer.Title>
      </Drawer.Header>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Code</Table.Th>
            <Table.Th>Buyer</Table.Th>
            <Table.Th>Supplier</Table.Th>
            {report == "BANKTT" ? (
              <>
                <Table.Th>B/ Rate</Table.Th>
                <Table.Th>Rate (%)</Table.Th>
              </>
            ) : (
              <>
                <Table.Th>B/ Rate</Table.Th>
                <Table.Th>S/ Rate</Table.Th>
              </>
            )}
            <Table.Th>Amount</Table.Th>
            <Table.Th>Buying</Table.Th>
            <Table.Th>Selling</Table.Th>
            <Table.Th>Benefit</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reports.map((report, index) => (
            <Table.Tr key={index}>
              <Table.Td>{formatDate(report.created_at ?? "", "MM dd")}</Table.Td>
              <Table.Td>{report.code}</Table.Td>
              <Table.Td>{report.customer_account}</Table.Td>
              <Table.Td>{report.provider_account}</Table.Td>
              {report.tag == "BANKTT" ? (
                <>
                  <Table.Td>{report.bank_rate ?? "-"}</Table.Td>
                  <Table.Td>{report.buying_rate}</Table.Td>
                </>
              ) : (
                <>
                  <Table.Td>
                    <NumberFormatter decimalScale={2} thousandSeparator value={report.buying_rate} />
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter decimalScale={2} thousandSeparator value={report.selling_rate} />
                  </Table.Td>
                </>
              )}
              <Table.Td>
                <NumberFormatter
                  decimalScale={2}
                  prefix={getMoneyPrefix(report.currency)}
                  thousandSeparator
                  value={report.amount}
                />
              </Table.Td>
              <Table.Td>
                <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={getBuying(report)} />
              </Table.Td>
              <Table.Td>
                <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={getSelling(report)} />
              </Table.Td>
              <Table.Td>
                <NumberFormatter decimalScale={2} prefix="$" thousandSeparator value={getBenefit(report)} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Drawer>
  );
}
