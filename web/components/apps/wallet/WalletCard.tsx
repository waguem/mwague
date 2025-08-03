import { OfficeWalletResponse } from "@/lib/client";
import { getCryptoPrefix, getMoneyPrefix } from "@/lib/utils";
import { Badge, Card, Grid, GridCol, Group, NumberFormatter, Stack, Title } from "@mantine/core";
import WalletPartnerBalance from "./WalletPartnerBalance";

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
              <Title order={4}>Wallet Name</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                {wallet.wallet_name}
              </Badge>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                {wallet.wallet_type} WALLET
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
            <WalletPartnerBalance wallet={wallet} />
          </Stack>
        </GridCol>
        <GridCol span={4}>
          <Stack>
            <Group>
              <Title order={4}>Pendings IN</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                <NumberFormatter
                  value={wallet.pending_in}
                  thousandSeparator
                  decimalScale={4}
                  prefix={getCryptoPrefix(wallet.crypto_currency)}
                />
              </Badge>
            </Group>
            <Group>
              <Title order={4}>Pendings Out</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                <NumberFormatter
                  value={wallet.pending_out}
                  thousandSeparator
                  decimalScale={4}
                  prefix={getCryptoPrefix(wallet.crypto_currency)}
                />
              </Badge>
            </Group>
            <Group>
              <Title order={4}>Pendings Payment</Title>
              <Badge radius={"md"} size="xl" variant="dot" color="blue">
                <NumberFormatter
                  value={wallet.pending_payment}
                  thousandSeparator
                  decimalScale={4}
                  prefix={getMoneyPrefix(wallet.trading_currency)}
                />
              </Badge>
            </Group>
          </Stack>
        </GridCol>
      </Grid>
    </Card>
  );
}
