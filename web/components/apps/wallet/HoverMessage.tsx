import { formDateToMyLocal } from "@/lib/utils";
import { ActionIcon, Avatar, Badge, Box, Group, HoverCard, Text, Timeline } from "@mantine/core";
import { IconMessage2Exclamation } from "@tabler/icons-react";
import { formatDistanceToNowStrict } from "date-fns";

interface Props {
  message: string;
}
export function HoverMessage({ message }: Props) {
  return (
    <HoverCard width={280} shadow="md">
      <HoverCard.Target>
        <ActionIcon variant="outline" radius={"md"}>
          <IconMessage2Exclamation size={16} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="sm">{message}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

interface Message {
  message: string;
  date: string;
  user_id: string;
  type: "REQUEST" | "REVIEW" | "PAYMENT";
}
interface MessagesProps {
  messages: Message[];
}

export function HoverMessages({ messages }: MessagesProps) {
  const messageRequest = messages.find((message) => message.type === "REQUEST");
  return (
    <HoverCard width={500} shadow="md">
      <HoverCard.Target>
        <Group gap={"sx"}>
          <ActionIcon variant="outline" radius={"md"}>
            <IconMessage2Exclamation size={16} />
          </ActionIcon>
          <Box>
            <Text size="sm">
              {messageRequest?.message.slice(0, 20)}
              {messageRequest && messageRequest.message.length > 20 ? "..." : ""}
            </Text>
          </Box>
        </Group>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Timeline lineWidth={1}>
          {messages.map((message, index) => (
            <Timeline.Item
              bullet={<Avatar size="xs" radius="xl" src={"/assets/avatars/avat-10.png"} />}
              title={
                <Group grow>
                  <Badge size="xs" variant="dot" color="gray">
                    {formatDistanceToNowStrict(formDateToMyLocal(message.date), { addSuffix: true })}
                  </Badge>
                  <Box>{message.type}</Box>
                </Group>
              }
              key={index}
            >
              {message.message}
            </Timeline.Item>
          ))}
        </Timeline>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
