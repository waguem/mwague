"use client";
import { WalletTradingResponse } from "@/lib/client";
import { ActionIcon, Avatar, Badge, Box, Group, HoverCard, NumberFormatter, Stack } from "@mantine/core";
import { IconBook, IconCircleFilled } from "@tabler/icons-react";

export function TradingDetail({ trading }: { trading: WalletTradingResponse }) {
  return (
    <HoverCard width={400}>
      <HoverCard.Target>
        <Group>
          <ActionIcon variant="outline" radius={"md"}>
            <IconBook size={16} />
          </ActionIcon>
        </Group>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Group>
          <Box>
            <Avatar src="/assets/avatars/avat-1.png" mx="auto" />
          </Box>
          <Stack gap={"xs"}>
            <Group>
              <IconCircleFilled size={12} color="gray" />
              Cost :
              <Badge color="blue" size="md" variant="outline" radius={"md"}>
                <NumberFormatter value={trading.trading_cost} thousandSeparator decimalScale={2} prefix="$" />
              </Badge>
            </Group>
            <Group>
              <IconCircleFilled color="blue" size={12} />
              Sold :{" "}
              <Badge color="blue" size="md" variant="outline" radius={"md"}>
                <NumberFormatter
                  value={trading.amount / trading.trading_rate}
                  thousandSeparator
                  decimalScale={2}
                  prefix="$"
                />
              </Badge>
            </Group>
            <Group>
              <IconCircleFilled color="teal" size={12} />
              Benefit :{" "}
              <Badge color="blue" size="md" variant="outline" radius={"md"}>
                <NumberFormatter value={trading.trading_result} thousandSeparator decimalScale={2} prefix="$" />
              </Badge>
            </Group>
          </Stack>
        </Group>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
