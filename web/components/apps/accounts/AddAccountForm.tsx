"use client";
import { getTranslation } from "@/i18n";
import FormModal from "@/components/layouts/FormModal";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { State, openAccount } from "@/lib/actions";
import clsx from "clsx";
import { ErrorMessage } from "@hookform/error-message";
import { AddAccountSchema } from "@/lib/schemas/actions";
import ReactSelect from "react-select";
import { accountTypeOptions, currencyOptions } from "@/lib/utils";

interface Props {
  initials: string;
  type?: "AGENT" | "FUND" | "SUPPLIER" | "OFFICE";
}

type Inputs = {
  initials: string;
  currency: string;
  type: string;
  owner_initials: string;
};

export default function AddAccountForm({ initials, type }: Props) {
  const { t } = getTranslation();

  const {
    register,
    setError,
    reset,
    control,
    getValues,
    formState: { isValid, errors, touchedFields },
  } = useForm<Inputs>({
    mode: "all",
    resolver: zodResolver(AddAccountSchema),
  });

  const [state, formAction] = useFormState<State, FormData>(openAccount, null);
  const isCorrect = getValues("type")?.length > 0 && getValues("currency")?.length > 0;
  return (
    <FormModal
      title={t(`add_${type ? type.toLowerCase() : ""}_account`)}
      key={"Add account"}
      action={formAction}
      state={state}
      isValid={isValid && isCorrect}
      setError={setError}
      onSuccess={() => reset()}
    >
      <div className="flex justify-between gap-3">
        <div
          className={clsx("mb-5 flex-1", {
            "has-error": errors?.initials && touchedFields?.initials,
            "has-success": !errors?.initials && touchedFields?.initials,
          })}
        >
          <label htmlFor="initials">{t("initials")}</label>
          <input
            id="initials"
            type="text"
            placeholder="Account Initials"
            className="form-input"
            {...register("initials", { required: true, minLength: 4 })}
          />
          <ErrorMessage errors={errors} name="initials" />
        </div>
        <div>
          <input id="owner_initials" type="hidden" {...register("owner_initials")} value={initials} />
        </div>
      </div>
      <div className="flex justify-between gap-3">
        <div className={clsx("mb-5 flex-1")}>
          <label htmlFor="type">{t("account_type")}</label>
          <Controller
            name="type"
            control={control}
            render={({ field: { onBlur, onChange } }) => {
              if (type !== undefined) {
                return (
                  <ReactSelect
                    id="type"
                    placeholder={"Select Type"}
                    onBlur={onBlur}
                    onChange={(option) => onChange(option?.value)}
                    options={accountTypeOptions}
                    isDisabled={type !== undefined}
                    defaultValue={
                      type !== undefined ? accountTypeOptions.find((option) => option.value === type) : null
                    }
                  />
                );
              }

              return (
                <ReactSelect
                  id="type"
                  placeholder={"Select Type"}
                  {...register("type", { required: true })}
                  onBlur={onBlur}
                  onChange={(option) => onChange(option?.value)}
                  options={accountTypeOptions}
                  isDisabled={type !== undefined}
                  defaultValue={type !== undefined ? accountTypeOptions.find((option) => option.value === type) : null}
                />
              );
            }}
          />
        </div>
      </div>
      <div className="flex justify-between gap-3">
        <div className={clsx("mb-5 flex-1")}>
          <label htmlFor="currency">{t("currency")}</label>
          <Controller
            name="currency"
            control={control}
            render={({ field: { onBlur, onChange } }) => (
              <ReactSelect
                id="currency"
                placeholder={"Select currency"}
                {...register("currency", { required: true })}
                onBlur={onBlur}
                onChange={(option) => onChange(option?.value)}
                options={currencyOptions}
              />
            )}
          />
        </div>
        {type !== undefined && (
          <input id="type" type="hidden" className="form-input" {...register("type")} value={type} />
        )}
      </div>
    </FormModal>
  );
}
