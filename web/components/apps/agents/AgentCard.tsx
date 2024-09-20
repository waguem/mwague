import { AccountResponse } from "@/lib/client";
import { getMoneyPrefix } from "@/lib/utils";
import { Badge, Card, Grid, GridCol, Group, NumberFormatter, Stack, Title } from "@mantine/core";

interface Props {
  accounts: AccountResponse[];
}

export default function AgentCard({ accounts }: Props) {
  return (
    <Grid>
      {accounts.map((account: AccountResponse) => (
        <GridCol span={6} key={account.initials}>
          <Card withBorder shadow="sm" radius="md">
            <Stack>
              <Group grow>
                <Title order={5}>Account Initials</Title>
                <Badge radius={"md"} size="xl" variant="dot" color="purple">
                  {account.initials}
                </Badge>
              </Group>
              <Group grow>
                <Title order={5}>Balance</Title>
                <Badge radius={"md"} size="xl" variant="dot" color={account.balance >= 0 ? "teal" : "red"}>
                  <NumberFormatter
                    value={account.balance}
                    thousandSeparator
                    decimalScale={4}
                    prefix={getMoneyPrefix(account.currency)}
                  />
                </Badge>
              </Group>
              <Group grow>
                <Title order={5}>Type</Title>
                <Badge radius={"md"} size="xl" variant="dot" color={account.type === "AGENT" ? "teal" : "red"}>
                  {account.type}
                </Badge>
              </Group>
            </Stack>
          </Card>
        </GridCol>
      ))}
    </Grid>
  );
}
