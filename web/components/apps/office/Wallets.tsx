"use client";
import { getDefaultMRTOptions } from "@/components/mantine";
import { createWallet } from "@/lib/actions";
import { CryptoCurrency, Currency, OfficeResponse, OfficeWalletResponse } from "@/lib/client";
import { cryptoCurrencyOptions, currencyOptions, getCryptoPrefix, getMoneyPrefix } from "@/lib/utils";
import { ActionIcon, Badge, Box, Button, Group, NumberFormatter, Select, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconExchange, IconWallet } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef, MRT_TableOptions, useMantineReactTable } from "mantine-react-table";
import { useMemo, useState, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";
import { useRouter } from "next/navigation";
interface Props {
  office: OfficeResponse;
}

const options = getDefaultMRTOptions<OfficeWalletResponse>();
export default function Wallets({ office }: Props) {
  const [newWallet, setNewWallet] = useState<{ crypto_currency?: CryptoCurrency; trading_currency?: Currency } | null>(
    null
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const handleCreateWalled: MRT_TableOptions<OfficeWalletResponse>["onCreatingRowSave"] = async ({
    exitCreatingMode,
  }) => {
    if (!newWallet?.crypto_currency || !newWallet?.trading_currency) {
      notifications.show({
        message: "Please select both payment and wallet currency",
        color: "red",
        title: "Error",
        withBorder: true,
        withCloseButton: true,
        autoClose: 5000,
      });
      return;
    }

    const create_wallet = async (crypto_currency: CryptoCurrency, trading_currency: Currency) => {
      const response = await createWallet(crypto_currency, trading_currency!);
      decodeNotification("Wallet", response);
    };

    startTransition(() => create_wallet(newWallet.crypto_currency!, newWallet.trading_currency!));
    exitCreatingMode();
  };
  const columns = useMemo<MRT_ColumnDef<OfficeWalletResponse>[]>(
    () => [
      {
        header: "Wallet ID",
        accessorKey: "walletID",
        enableEditing: false,
        Cell: ({ row }) => (
          <Badge
            variant="gradient"
            size="lg"
            gradient={{
              from: "teal",
              to: "cyan",
              deg: 90,
            }}
          >
            {row.original.crypto_currency} / {row.original.trading_currency}
          </Badge>
        ),
      },
      {
        header: "Crypto Currency",
        accessorKey: "crypto_currency",
        Cell: ({ cell }) => (
          <Badge
            variant="gradient"
            size="lg"
            gradient={{
              from: "teal",
              to: "cyan",
              deg: 90,
            }}
          >
            {cell.getValue() as string}
          </Badge>
        ),
        Edit: ({ row }) => (
          <Select
            placeholder="Pick a value"
            defaultValue={row.original.crypto_currency}
            data={cryptoCurrencyOptions}
            onChange={(value) => {
              setNewWallet((wallet) => ({
                ...wallet,
                crypto_currency: value as CryptoCurrency,
              }));
            }}
          />
        ),
      },
      {
        header: "Currency",
        accessorKey: "trading_currency",
        Cell: ({ cell }) => {
          return (
            <Box>
              <Badge
                variant="gradient"
                size="lg"
                gradient={{
                  from: "teal",
                  to: "cyan",
                  deg: 90,
                }}
              >
                {cell.getValue() as string}
              </Badge>
            </Box>
          );
        },
        Edit: ({ row }) => (
          <Select
            placeholder="Pick a value"
            defaultValue={row.original.trading_currency}
            data={currencyOptions}
            onChange={(value) => {
              setNewWallet((wallet) => ({
                ...wallet,
                trading_currency: value as Currency,
              }));
            }}
          />
        ),
      },
      {
        header: "Crypto Balance",
        accessorKey: "crypto_balance",
        enableEditing: false,
        Cell: ({ cell, row }) => {
          return (
            <NumberFormatter
              prefix={getCryptoPrefix(row.original.crypto_currency)}
              value={cell.getValue() as number}
              decimalScale={4}
              thousandSeparator=","
            />
          );
        },
      },
      {
        header: "Trading Balance",
        accessorKey: "trading_balance",
        enableEditing: false,
        Cell: ({ cell, row }) => {
          return (
            <NumberFormatter
              prefix={getMoneyPrefix(row.original.trading_currency)}
              value={cell.getValue() as number}
              decimalScale={4}
              thousandSeparator=","
            />
          );
        },
      },
      {
        header: "Wallet Rates",
        accessorKey: "office_id",
        enableEditing: false,
        Cell: ({ row }) => {
          const rate = Number(
            row.original.crypto_balance! > 0 ? row.original.trading_balance! / row.original.crypto_balance! : 0
          );
          const vRate = Number(row.original.value > 0 ? row.original.crypto_balance! / row.original.value : 0);
          return (
            <>
              <Badge variant="dot" radius={"md"} color="teal">
                <NumberFormatter value={rate} decimalScale={6} />
              </Badge>{" "}
              /{" "}
              <Badge variant="dot" radius={"md"}>
                {" "}
                <NumberFormatter value={vRate} decimalScale={6} />
              </Badge>
            </>
          );
        },
      },
      {
        header: "Evaluation",
        accessorKey: "value",
        enableEditing: false,
        Cell: ({ cell }) => {
          return (
            <NumberFormatter
              prefix={getMoneyPrefix("USD")}
              value={cell.getValue() as number}
              decimalScale={2}
              thousandSeparator=","
            />
          );
        },
      },
    ],
    []
  );

  const visit = (walletID: string) => {
    router.push(`/dashboard/wallet/${walletID}`);
  };
  const table = useMantineReactTable({
    columns,
    data: office.wallets ?? [],
    ...options,
    createDisplayMode: "row",
    editDisplayMode: "row",
    positionActionsColumn: "first",
    onCreatingRowSave: handleCreateWalled,
    enableRowActions: false,
    renderRowActions: ({ row }) => {
      return (
        <Group gap="xs">
          <Tooltip label="Buy/Exchange" position="top" onClick={() => visit(row.original.walletID)}>
            <ActionIcon variant="gradient" gradient={{ from: "gray", to: "gray" }}>
              <IconExchange size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        size="xs"
        leftSection={<IconWallet size={18} />}
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        New Wallet
      </Button>
    ),
    state: {
      isSaving: pending,
    },
  });

  return (
    <div className="mt-5">
      <MantineReactTable table={table} />
    </div>
  );
}
