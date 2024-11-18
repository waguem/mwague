"use client";
import { AccountMonthlyReport } from "@/lib/client";
import { Carousel } from "@mantine/carousel";
import { Badge, Card, Group, NumberFormatter, Space, Timeline, Title } from "@mantine/core";
import { IconPlayerPlay, IconPlayerStop } from "@tabler/icons-react";
import { formatDate } from "date-fns";
import GenerateAgentReport from "./GenerateReporte";

export default function AgentReports({ reports }: { initials: string; reports: AccountMonthlyReport[] }) {
  /**
   * create a carousel to display yearly reports for this agent
   * each slide should contain a card with the month and the report of that month
   */

  // create a list of months and their
  return (
    <Carousel height={300} slideSize="33.333333%" slideGap="md" loop align="start" slidesToScroll={3}>
      {reports.map((report, index) => (
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
              <Title order={2}>{formatDate(new Date(report.start_date), "MMMM")}</Title>
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
            </Group>
            <Space h="md" />
            <Group grow>
              <GenerateAgentReport report={report} />
            </Group>
          </Card>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
