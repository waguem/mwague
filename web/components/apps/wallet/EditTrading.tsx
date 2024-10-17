import { updateTrade } from "@/lib/actions/wallet";
import { WalletTradingResponse } from "@/lib/client";
import { currencyOptions } from "@/lib/utils";
import {
  ActionIcon,
  Button,
  Divider,
  Drawer,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCurrency, IconEdit, IconMoneybag, IconUser, IconWallet } from "@tabler/icons-react";
import { Fragment, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";

interface SelectOption {
  label: string;
  value: string;
}
interface EditProps {
  trading: WalletTradingResponse;
  accountOptions: SelectOption[];
  walletOptions: SelectOption[];
}

export default function EditTrading({ trading, accountOptions, walletOptions }: EditProps) {
  const [opened, { close, open }] = useDisclosure(false);

  const getNote = (trading: WalletTradingResponse) => {
    const msg = Number(trading?.notes?.length) > 0 ? trading.notes![0] : undefined;
    return msg;
  };
  const form = useForm<WalletTradingResponse>({
    initialValues: {
      ...trading,
    },
  });

  const [pending, startTransition] = useTransition();

  const handleEdit = async () => {
    try {
      const response = await updateTrade(form.values);
      decodeNotification("Update Trade", response);
      if (response.status == "success") {
        form.reset();
        close();
      }
    } catch (e) {}
  };

  if (trading.state !== "REVIEW") {
    return null;
  }
  return (
    <Fragment>
      <ActionIcon color="red" variant="outline" onClick={open} radius={"md"}>
        <IconEdit size={16} />
      </ActionIcon>
      <Drawer
        opened={opened}
        onClose={close}
        radius={"md"}
        position="right"
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        size={"md"}
        offset={8}
      >
        <LoadingOverlay visible={pending} loaderProps={{ color: "pink", type: "dots" }} />
        <form action={() => startTransition(() => handleEdit())}>
          <Stack gap={"xs"}>
            <Divider label="Infos" />
            <Group grow>
              <Select
                label="Account"
                data={accountOptions}
                leftSection={<IconUser size={16} />}
                {...form.getInputProps("account")}
              />
            </Group>
            {trading.trading_type.includes("EXCHANGE") && (
              <Group grow>
                <Select
                  leftSection={<IconWallet size={16} />}
                  data={walletOptions}
                  label="Exchange Wallet"
                  {...form.getInputProps("exchange_walletID")}
                />
              </Group>
            )}
            <Group grow>
              <NumberInput
                decimalScale={3}
                leftSection={<IconMoneybag size={16} />}
                thousandSeparator
                label="Amount"
                {...form.getInputProps("amount")}
              />
            </Group>
            <Divider label="Currencies" />
            <Group grow>
              <Select
                leftSection={<IconCurrency size={16} />}
                label="Trading Currency"
                data={currencyOptions}
                {...form.getInputProps("trading_currency")}
              />
            </Group>
            <Group grow>
              <Select
                leftSection={<IconCurrency size={16} />}
                data={currencyOptions}
                label="Exchange Currency"
                {...form.getInputProps("exchange_currency")}
              />
            </Group>
            <Group grow>
              <Select
                leftSection={<IconCurrency size={16} />}
                label="Selling Currency"
                data={currencyOptions}
                {...form.getInputProps("selling_currency")}
              />
            </Group>
            <Divider label="Rates" />
            <Group grow>
              <NumberInput
                decimalScale={3}
                leftSection={<IconMoneybag size={16} />}
                label="Daily Rate"
                {...form.getInputProps("daily_rate")}
              />
            </Group>
            <Group grow>
              <NumberInput
                decimalScale={3}
                leftSection={<IconMoneybag size={16} />}
                label="Trading Rate"
                {...form.getInputProps("trading_rate")}
              />
            </Group>
            <Group grow>
              <NumberInput
                decimalScale={3}
                leftSection={<IconMoneybag size={16} />}
                label="Exchange Rate"
                {...form.getInputProps("exchange_rate")}
              />
            </Group>
            <Group grow>
              <Textarea
                label={"Message"}
                value={(getNote(form.values)?.message as string) ?? ""}
                required
                onChange={(event) => {
                  const note: any = getNote(form.values);
                  form.setValues((values) => ({
                    ...values,
                    notes: [
                      {
                        ...note,
                        message: event.target.value,
                      },
                    ],
                  }));
                }}
              />
            </Group>
            <Group grow>
              <Button size="xs" variant="gradient" gradient={{ from: "blue", to: "pink", deg: 120 }} type="submit">
                Save Edit
              </Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </Fragment>
  );
}
