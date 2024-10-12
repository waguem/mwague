import { cancelPayment } from "@/lib/actions/transactions";
import { ActionIcon, Button, Dialog, Group, LoadingOverlay, Text, Textarea, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCancel } from "@tabler/icons-react";
import { Fragment, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";
import { Payment, TransactionResponse } from "@/lib/client";

interface Props {
  payment: Payment;
  transaction: TransactionResponse;
}

export default function CancelPayment({ payment, transaction }: Props) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const form = useForm<{
    message: string;
  }>({
    initialValues: {
      message: "",
    },
  });

  const handleCancel = async () => {
    try {
      console.log("H");
      const response = await cancelPayment(payment.id ?? "", {
        code: transaction.code,
        description: form.values.message,
        reason: [],
        type: payment.transaction_type,
      });
      console.log("H");
      if (response.status === "success") {
        form.reset();
        close();
      }

      decodeNotification("CANCEL PAYMENT", response);
    } catch (e) {
      console.log(e);
    }
  };

  const [pending, startTransition] = useTransition();

  return (
    <Fragment>
      <Tooltip label="Cancel" position="left">
        <ActionIcon onClick={toggle} size="md" variant="outline" color="red" radius={"md"}>
          <IconCancel size={14} />
        </ActionIcon>
      </Tooltip>
      <Dialog withBorder opened={opened} withCloseButton onClose={close} size="xl" radius={"md"}>
        <Text size="sm" mb="xs" fw={500}>
          Are you sure ?
        </Text>
        <form action={() => startTransition(() => handleCancel())}>
          <LoadingOverlay visible={pending} />
          <Group align="flex-end">
            <Textarea placeholder="Give Your explanation" style={{ flex: 1 }} {...form.getInputProps("message")} />
            <Button gradient={{ from: "red", to: "pink", deg: 120 }} variant="gradient" type="submit">
              Cancel Payment
            </Button>
          </Group>
        </form>
      </Dialog>
    </Fragment>
  );
}
