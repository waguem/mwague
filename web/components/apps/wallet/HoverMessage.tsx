import { ActionIcon, HoverCard, Text } from "@mantine/core";
import { IconMessage2Exclamation } from "@tabler/icons-react";

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
