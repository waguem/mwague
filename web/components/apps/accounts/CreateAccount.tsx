import { openAccount } from "@/lib/actions";
import { accountTypeOptions, currencyOptions } from "@/lib/utils";
import { ActionIcon, Button, Group, LoadingOverlay, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconAlphabetGreek, IconPlus } from "@tabler/icons-react";
import { Fragment, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";

interface Props {
  owner_initials: string;
}

type Inputs = {
  initials: string;
  currency: string;
  type: string;
};

export default function CreateAccount({ owner_initials }: Props) {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm<Inputs>({
    initialValues: {
      initials: owner_initials,
      currency: "",
      type: "",
    },
    validate: {
      initials: (value) => (value.length == 0 ? "Initials must be at least 1 character" : null),
      currency: (value) => (!value ? "Currency is required" : null),
      type: (value) => (!value ? "Account Type is required" : null),
    },
  });

  const [pending, startTransition] = useTransition();

  const onSubmit = async () => {
    const data: FormData = new FormData();
    data.append("initials", form.values.initials);
    data.append("currency", form.values.currency);
    data.append("type", form.values.type);
    data.append("owner_initials", owner_initials);
    //
    const response = await openAccount(null, data);
    decodeNotification("New Account", response);
  };

  return (
    <Fragment>
      <Modal opened={opened} onClose={close} title={"Create Account for Agent " + owner_initials} size="lg" centered>
        <form action={() => startTransition(() => onSubmit())}>
          <LoadingOverlay visible={pending} />
          <Stack>
            <Group grow>
              <TextInput
                label="Initials"
                placeholder="Account Initials"
                leftSection={<IconAlphabetGreek size={16} />}
                required
                {...form.getInputProps("initials")}
              />
            </Group>
            <Group grow>
              <Select
                label="Currency"
                placeholder="Select Currency"
                data={currencyOptions}
                required
                searchable
                {...form.getInputProps("currency")}
              />
            </Group>
            <Group grow>
              <Select
                label="Account Type"
                placeholder="Select Account Type"
                data={accountTypeOptions}
                required
                searchable
                {...form.getInputProps("type")}
              />
            </Group>
            <Group grow>
              <Button disabled={!form.isValid()} size="xs" color="blue" variant="gradient" type="submit">
                <IconPlus size={16} className="mr-2" />
                Create Account
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <ActionIcon onClick={open} variant="outline" size={"md"} radius={"md"} color="blue">
        <IconPlus size={16} />
      </ActionIcon>
    </Fragment>
  );
}
