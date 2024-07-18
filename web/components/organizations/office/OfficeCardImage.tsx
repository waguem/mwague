"use client";
import { Card, Avatar, Text, Group, Button } from "@mantine/core";
import classes from "./OfficeCardImage.module.css";
import { OfficeResponse } from "@/lib/client";
const stats = [
  { value: "50", label: "Agents" },
  { value: "5", label: "Currencies" },
  { value: "1.6K", label: "Posts" },
];

export function OfficeCardImage({ office }: { office: OfficeResponse }) {
  const items = stats.map((stat) => (
    <div key={stat.label}>
      <Text ta="center" fz="lg" fw={500}>
        {stat.value}
      </Text>
      <Text ta="center" fz="sm" c="dimmed" lh={1}>
        {stat.label}
      </Text>
    </div>
  ));
  const ucFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return (
    <Card withBorder padding="xl" radius="md" className={classes.card}>
      <Card.Section
        h={140}
        style={{
          backgroundImage: `url(/assets/images/city-1.png)`,
        }}
      />
      <Avatar
        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png"
        size={80}
        radius={80}
        mx="auto"
        mt={-30}
        className={classes.avatar}
      />
      <Text ta="center" fz="lg" fw={500} mt="sm">
        {office.name}
      </Text>
      <Text ta="center" fz="sm" c="dimmed">
        Office Located at {ucFirst(office.country)}
      </Text>
      <Group mt="md" justify="center" gap={30}>
        {items}
      </Group>
      <Button fullWidth radius="md" mt="xl" size="md" variant="default">
        Start Chat
      </Button>
    </Card>
  );
}
