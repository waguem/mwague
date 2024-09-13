"use client";
import { Carousel } from "@mantine/carousel";
import { ActionIcon, Badge, Card, Group, NumberFormatter, Space, Timeline, Title } from "@mantine/core";
import { IconDownload, IconPlayerPlay, IconPlayerStop } from "@tabler/icons-react";

interface MonthReport {
  month: string;
  start_balance: number;
  end_balance: number;
  total_trades: number;
  total_trasactions: number;
}
const dummyData: MonthReport[] = [
  {
    month: "January",
    start_balance: 1000,
    end_balance: 2000,
    total_trades: 10,
    total_trasactions: 20,
  },
  {
    month: "February",
    start_balance: 2000,
    end_balance: 4000,
    total_trades: 20,
    total_trasactions: 40,
  },
  {
    month: "March",
    start_balance: 4000,
    end_balance: 8000,
    total_trades: 40,
    total_trasactions: 80,
  },
  {
    month: "April",
    start_balance: 8000,
    end_balance: 16000,
    total_trades: 80,
    total_trasactions: 160,
  },
  {
    month: "May",
    start_balance: 16000,
    end_balance: 32000,
    total_trades: 160,
    total_trasactions: 320,
  },
  {
    month: "June",
    start_balance: 32000,
    end_balance: 64000,
    total_trades: 320,
    total_trasactions: 640,
  },
  {
    month: "July",
    start_balance: 64000,
    end_balance: 128000,
    total_trades: 640,
    total_trasactions: 1280,
  },
  {
    month: "August",
    start_balance: 128000,
    end_balance: 256000,
    total_trades: 1280,
    total_trasactions: 2560,
  },
  {
    month: "September",
    start_balance: 256000,
    end_balance: 512000,
    total_trades: 2560,
    total_trasactions: 5120,
  },
  {
    month: "October",
    start_balance: 512000,
    end_balance: 1024000,
    total_trades: 5120,
    total_trasactions: 10240,
  },
  {
    month: "November",
    start_balance: 1024000,
    end_balance: 2048000,
    total_trades: 10240,
    total_trasactions: 20480,
  },
  {
    month: "December",
    start_balance: 2048000,
    end_balance: 4096000,
    total_trades: 20480,
    total_trasactions: 40960,
  },
];
export default function AgentReports({ initials }: { initials: string }) {
  /**
   * create a carousel to display yearly reports for this agent
   * each slide should contain a card with the month and the report of that month
   */
  console.log(initials);
  // create a list of months and their
  return (
    <Carousel height={300} slideSize="33.333333%" slideGap="md" loop align="start" slidesToScroll={3}>
      {dummyData.map((report, index) => (
        <Carousel.Slide key={index}>
          <Card
            // add style to the card to give it a background color gradient
            style={{
              // backgroundImage: `linear-gradient(-60deg,  var(--mantine-color-blue-4) 0%, var(--mantine-color-blue-7) 100%)`,
              height: 300,
            }}
            withBorder
            radius={"md"}
            shadow="xs"
            padding="xl"
          >
            <Card.Section className="p-5 text-center text-dark">
              <Title order={2}>{report.month}</Title>
            </Card.Section>
            <Group grow>
              <Timeline lineWidth={1}>
                <Timeline.Item bullet={<IconPlayerPlay size={12} color="teal" />} title="Start Balance" color="teal">
                  <Badge color="teal" variant="dot" size="lg" radius={"sm"}>
                    <NumberFormatter thousandSeparator decimalScale={2} prefix="$" value={report.start_balance} />
                  </Badge>
                </Timeline.Item>
                <Timeline.Item bullet={<IconPlayerStop size={12} color="red" />} title="End Balance" color="teal">
                  <Badge color="red" variant="dot" size="lg" radius={"sm"}>
                    <NumberFormatter thousandSeparator decimalScale={2} prefix="$" value={report.end_balance} />
                  </Badge>
                </Timeline.Item>
              </Timeline>
              <Timeline lineWidth={1}>
                <Timeline.Item title="Total Trades" color="teal">
                  {report.total_trades}
                </Timeline.Item>
                <Timeline.Item title="Total Transactions" color="teal">
                  {report.total_trasactions}
                </Timeline.Item>
              </Timeline>
            </Group>
            <Space h="md" />
            <Group grow>
              <ActionIcon variant="gradient" size={"lg"} radius={"lg"}>
                Download
                <IconDownload size={20} className="ml-4" />
              </ActionIcon>
            </Group>
          </Card>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
