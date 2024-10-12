"use client";
import { updateOfficeInfo } from "@/lib/actions";
import { OfficeResponse } from "@/lib/client";
import { countryOptions, currencyOptions } from "@/lib/utils";
import { Button, Grid, GridCol, Group, Loader, MultiSelect, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBuildingBurjAlArab, IconBuildingWarehouse, IconCheck, IconEdit, IconMapPin2 } from "@tabler/icons-react";
import { isArray } from "lodash";
import { useState, useTransition } from "react";

interface Props {
  HealthCheck: React.ReactNode;
  office: OfficeResponse;
}

export default function OfficeInfo({ office, HealthCheck }: Props) {
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<Record<string, string | string[]>>({});
  const [pending, startTransition] = useTransition();

  const saveEdit = async (name: string | string[]) => {
    const data: any = {};
    if (isArray(name)) {
      for (const n of name) {
        if (fields[n] !== undefined) {
          data[n] = fields[n];
        }
      }
      if (Object.keys(data).length === 0) {
        return;
      }
    } else {
      data[name] = fields[name];
    }

    const response = await updateOfficeInfo(office.id, data);

    if (response?.status === "success") {
      // show notification
      notifications.show({
        message: response.message,
        color: "teal",
        withBorder: true,
        title: "Success",
        withCloseButton: true,
        autoClose: 2000,
      });

      for (const f in editing) {
        if (editing[f]) {
          setEditing((prev) => ({ ...prev, [f]: "" }));
        }
      }
    } else if (response?.status === "error") {
      // show error for all found erros
      response.errors?.forEach((error: any) => {
        notifications.show({
          message: error.message,
          color: "red",
          title: "Error",
          withBorder: true,
          withCloseButton: true,
          autoClose: 5000,
        });
      });
    }
  };

  const showIcon = (field: string) => {
    if (!editing[field] && !pending) {
      // editing an other field
      return <IconEdit color="teal" size={16} />;
    }

    if (editing[field] && pending) {
      return <Loader size={16} />;
    }

    // editing the field
    return <IconCheck color="teal" size={16} />;
  };

  const handleBtnClick = (fields: string | string[]) => {
    if (!isArray(fields)) {
      if (editing[fields]) {
        startTransition(() => saveEdit(fields));
      } else {
        setEditing((prev) => ({ ...prev, [fields]: editing[fields] ? "" : fields }));
      }
    } else {
      // lists of fields at once
      const isEditing = fields.some((f) => editing[f]);
      if (isEditing) {
        startTransition(() => saveEdit(fields));
      } else {
        setEditing((prev) => fields.reduce((acc, f) => ({ ...acc, [f]: f }), prev));
      }
    }
  };
  const hasOption = (office: OfficeResponse, option: any) => {
    const currencies: { name: string; main: boolean; defaultRate: number }[] = office?.currencies ?? ([] as any);
    if (isArray(currencies)) {
      return currencies.find((curr) => curr.name === option.value) != null;
    }
    return false;
  };

  const isBaseCurrency = (office: OfficeResponse, option: any) => {
    const currencies: { name: string; main: boolean; defaultRate: number; base: boolean }[] =
      office?.currencies ?? ([] as any);
    if (isArray(currencies)) {
      return currencies.find((curr) => curr.name === option.value && curr.base) != null;
    }
    return false;
  };

  const isMainCurrency = (office: OfficeResponse, option: any) => {
    const currencies: { name: string; main: boolean; defaultRate: number; base: boolean }[] =
      office?.currencies ?? ([] as any);
    if (isArray(currencies)) {
      return currencies.find((curr) => curr.name === option.value && curr.main) != null;
    }
    return false;
  };

  const getDefaultCurrenciesOptions = () =>
    currencyOptions.filter((option) => hasOption(office, option)).map((option) => option.value);

  const getMainCurrencyOption = () => currencyOptions.find((option) => isMainCurrency(office, option))?.value;
  const getBaseCurrencyOption = () => currencyOptions.find((option) => isBaseCurrency(office, option))?.value;

  return (
    <div className="panel w-full h-full">
      <Grid>
        <GridCol span={6}>
          <Stack align="stretch" gap="md">
            <Grid>
              <GridCol span={10}>
                <TextInput
                  label="Organization"
                  readOnly
                  value={"Organization"}
                  rightSection={<IconBuildingBurjAlArab />}
                />
              </GridCol>
              <GridCol span={2} />
            </Grid>
            <Grid>
              <GridCol span={10}>
                <TextInput
                  label="Name"
                  placeholder="Input placeholder"
                  value={fields["name"]}
                  readOnly={!editing["name"]}
                  defaultValue={office.name}
                  onChange={(event) => setFields((prev) => ({ ...prev, name: event.target.value }))}
                  rightSection={<IconBuildingWarehouse />}
                />
              </GridCol>
              <GridCol span={2} pos={"relative"}>
                <Button
                  onClick={() => handleBtnClick("name")}
                  variant="outline"
                  size="sm"
                  style={{ position: "absolute", bottom: "8px" }}
                >
                  {showIcon("name")}
                </Button>
              </GridCol>
            </Grid>
            <Grid>
              <GridCol span={10}>
                <Select
                  label="Country"
                  placeholder="Select your coutnry"
                  data={countryOptions}
                  searchable
                  readOnly={!editing["country"]}
                  onChange={(value) => setFields((prev) => ({ ...prev, country: value ?? "" }))}
                  rightSection={<IconMapPin2 />}
                  defaultValue={countryOptions.find((option) => option.value === office.country)?.value}
                />
              </GridCol>
              <GridCol span={2} pos={"relative"}>
                <Button
                  onClick={() => handleBtnClick("country")}
                  variant="outline"
                  size="sm"
                  style={{ position: "absolute", bottom: "8px" }}
                >
                  {showIcon("country")}
                </Button>
              </GridCol>
            </Grid>
            <Grid>
              <GridCol span={10}>
                <TextInput label="Initials" placeholder="Office Initials" value={office.initials} readOnly />
              </GridCol>
              <GridCol span={2} pos={"relative"} />
            </Grid>
            <Grid>
              <GridCol span={10}>
                <MultiSelect
                  label="Currencies"
                  data={currencyOptions}
                  readOnly={!editing["currencies"]}
                  onChange={(value) => setFields((prev) => ({ ...prev, currencies: value }))}
                  defaultValue={getDefaultCurrenciesOptions()}
                />
              </GridCol>
              <GridCol span={2} pos={"relative"}>
                <Button
                  onClick={() => handleBtnClick("currencies")}
                  variant="outline"
                  size="sm"
                  style={{ position: "absolute", bottom: "8px" }}
                >
                  {showIcon("currencies")}
                </Button>
              </GridCol>
            </Grid>
            <Grid>
              <GridCol span={10}>
                <Group grow>
                  <Select
                    searchable
                    label="Main Currency"
                    data={currencyOptions}
                    readOnly={!(editing["mainCurrency"] && editing["baseCurrency"])}
                    defaultValue={getMainCurrencyOption()}
                    onChange={(value) => setFields((prev) => ({ ...prev, mainCurrency: value ?? "" }))}
                  />
                  <Select
                    searchable
                    label="Payment Currency"
                    data={currencyOptions}
                    readOnly={!(editing["mainCurrency"] && editing["baseCurrency"])}
                    defaultValue={getBaseCurrencyOption()}
                    onChange={(value) => setFields((prev) => ({ ...prev, baseCurrency: value ?? "" }))}
                  />
                </Group>
              </GridCol>
              <GridCol span={2} pos={"relative"}>
                <Button
                  onClick={() => {
                    handleBtnClick(["baseCurrency", "mainCurrency"]);
                  }}
                  variant="outline"
                  size="sm"
                  style={{ position: "absolute", bottom: "8px" }}
                >
                  {showIcon("baseCurrency")}
                </Button>
              </GridCol>
            </Grid>
          </Stack>
        </GridCol>
        <GridCol span={6}>{HealthCheck}</GridCol>
      </Grid>
    </div>
  );
}
