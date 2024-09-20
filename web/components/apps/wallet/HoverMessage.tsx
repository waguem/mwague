import { ActionIcon, Avatar, Badge, Box, Group, HoverCard, Text, Timeline } from "@mantine/core";
import { IconMessage2Exclamation } from "@tabler/icons-react";
import { formatDistanceToNowStrict } from "date-fns";

interface Props {
  message: string;
  show?: boolean;
  size?: number;
}
export function HoverMessage({ message, size, show = false }: Props) {
  return (
    <HoverCard width={280} shadow="md">
      <HoverCard.Target>
        <Group>
          <ActionIcon variant="outline" radius={"md"}>
            <IconMessage2Exclamation size={16} />
          </ActionIcon>
          {show && message.length && (
            <Box>
              <Text size="sm">
                {message.slice(0, size || 10)}
                {message.length > (size || 10) ? "..." : ""}
              </Text>
            </Box>
          )}
        </Group>
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
  user: string;
  type: "REQUEST" | "REVIEW" | "PAYMENT";
}
interface MessagesProps {
  messages: Message[];
  notesType?: "TRANSACTION" | "PAYMENT";
}

export function HoverMessages({ messages, notesType = "TRANSACTION" }: MessagesProps) {
  const messageRequest = messages.find((message) =>
    notesType == "TRANSACTION" ? message.type === "REQUEST" : message.type === "PAYMENT"
  );
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
                    {formatDistanceToNowStrict(message.date, { addSuffix: true })}
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
