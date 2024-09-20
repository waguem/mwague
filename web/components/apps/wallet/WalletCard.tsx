import { OfficeWalletResponse } from "@/lib/client";
import { getCryptoPrefix, getMoneyPrefix } from "@/lib/utils";
import { Badge, Card, Grid, GridCol, Group, NumberFormatter, Stack, Title } from "@mantine/core";

interface Props {
  wallet: OfficeWalletResponse;
}
export default function WalletCard({ wallet }: Props) {
  return (
    <Card withBorder shadow="sm" radius="md">
      <Grid>
        <GridCol span={4}>
          <Stack>
            <Group>
              <Title order={4}>Wallet ID</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                {wallet.walletID}
              </Badge>
            </Group>
            <Group>
              <Title order={4}>Valuation</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                <NumberFormatter
                  value={wallet.value}
                  thousandSeparator
                  decimalScale={4}
                  prefix={getMoneyPrefix("USD")}
                />
              </Badge>
            </Group>
          </Stack>
        </GridCol>
        <GridCol span={4}>
          <Stack>
            <Group>
              <Title order={4}>Trading Balance</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                <NumberFormatter
                  value={wallet.trading_balance}
                  thousandSeparator
                  decimalScale={4}
                  prefix={getMoneyPrefix(wallet.trading_currency)}
                />
              </Badge>
            </Group>
            <Group>
              <Title order={4}>Crypto Balance</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                <NumberFormatter
                  value={wallet.crypto_balance}
                  thousandSeparator
                  decimalScale={4}
                  prefix={getCryptoPrefix(wallet.crypto_currency)}
                />
              </Badge>
            </Group>
          </Stack>
        </GridCol>
      </Grid>
    </Card>
  );
}
