"use client";
import { getDefaultMRTOptions } from "@/components/mantine";
import { createWallet } from "@/lib/actions";
import { Currency, OfficeResponse, OfficeWalletResponse } from "@/lib/client";
import { currencyOptions, getMoneyPrefix } from "@/lib/utils";
import { Badge, Box, Button, NumberFormatter, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconWallet } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef, MRT_TableOptions, useMantineReactTable } from "mantine-react-table";
import { useMemo, useState, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";
interface Props {
  office: OfficeResponse;
}

const options = getDefaultMRTOptions<OfficeWalletResponse>();
export default function Wallets({ office }: Props) {
  const [newWallet, setNewWallet] = useState<{ payment_currency?: Currency; wallet_currency?: Currency } | null>(null);
  const [pending, startTransition] = useTransition();
  const handleCreateWalled: MRT_TableOptions<OfficeWalletResponse>["onCreatingRowSave"] = async ({
    exitCreatingMode,
  }) => {
    if (!newWallet?.payment_currency || !newWallet?.wallet_currency) {
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

    const create_wallet = async (payment_currency: Currency, wallet_currency: Currency) => {
      const response = await createWallet(payment_currency, wallet_currency!);
      decodeNotification("Wallet", response);
    };

    startTransition(() => create_wallet(newWallet.payment_currency!, newWallet.wallet_currency!));
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
            {row.original.payment_currency} / {row.original.wallet_currency}
          </Badge>
        ),
      },
      {
        header: "Payment Currency",
        accessorKey: "payment_currency",
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
            defaultValue={row.original.payment_currency}
            data={currencyOptions}
            onChange={(value) => {
              setNewWallet((wallet) => ({
                ...wallet,
                payment_currency: value as Currency,
              }));
            }}
          />
        ),
      },
      {
        header: "Currency",
        accessorKey: "wallet_currency",
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
            defaultValue={row.original.wallet_currency}
            data={currencyOptions}
            onChange={(value) => {
              setNewWallet((wallet) => ({
                ...wallet,
                wallet_currency: value as Currency,
              }));
            }}
          />
        ),
      },
      {
        header: "Buyed",
        accessorKey: "buyed",
        enableEditing: false,
        Cell: ({ cell, row }) => {
          return (
            <NumberFormatter
              prefix={getMoneyPrefix(row.original.wallet_currency)}
              value={cell.getValue() as number}
              decimalScale={4}
              thousandSeparator=","
            />
          );
        },
      },
      {
        header: "Paid",
        accessorKey: "paid",
        enableEditing: false,
        Cell: ({ cell, row }) => {
          return (
            <NumberFormatter
              prefix={getMoneyPrefix(row.original.payment_currency)}
              value={cell.getValue() as number}
              decimalScale={4}
              thousandSeparator=","
            />
          );
        },
      },
      {
        header: "Buying Rate",
        accessorKey: "buyed",
        enableEditing: false,
        Cell: ({ row }) => {
          const rate = Number(row.original.paid! > 0 ? row.original.buyed! / row.original.paid! : 0);
          return <NumberFormatter value={rate} decimalScale={6} />;
        },
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: office.wallets ?? [],
    ...options,
    createDisplayMode: "row",
    editDisplayMode: "row",
    positionActionsColumn: "first",
    onCreatingRowSave: handleCreateWalled,
    enableRowActions: false,
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
