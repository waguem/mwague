"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import clsx from "clsx";
import { ErrorMessage } from "@hookform/error-message";
import ReactSelect from "react-select";
import { getTranslation } from "@/i18n";

import FormModal from "@/components/layouts/FormModal";
import { countryOptions } from "@/lib/utils/index";
import { addOffice, State } from "@/lib/actions";

import { AddOfficeSchema } from "@/lib/schemas/actions";

type Inputs = {
  name: string;
  initials: string;
  country: string;
};
export default function AddOfficeForm() {
  const {
    register,
    formState: { errors, isValid, touchedFields },
    setError,
    reset,
    control,
  } = useForm<Inputs>({
    mode: "all",
    resolver: zodResolver(AddOfficeSchema),
  });
  const [state, formAction] = useFormState<State, FormData>(addOffice, null);
  const { t } = getTranslation();

  return (
    <FormModal
      title={t("add_office")}
      key={"Add account"}
      action={formAction}
      state={state}
      isValid={isValid}
      setError={setError}
      onSuccess={() => reset()}
    >
      <div className="flex justify-between gap-2">
        <div
          className={clsx("mb-5 flex-1", {
            "has-error": errors?.name && touchedFields?.name,
            "has-success": !errors?.name && touchedFields?.name,
          })}
        >
          <label htmlFor="name">{t("name")}</label>
          <input
            id="name"
            type="text"
            placeholder="Office Name"
            className="form-input"
            {...register("name", { required: true, minLength: 4 })}
          />
          <ErrorMessage errors={errors} name="name" />
        </div>
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
      </div>
      <div>
        <div className="flex justify-between gap-3">
          <div className={clsx("mb-5 flex-1")}>
            <label htmlFor="type">{t("country")}</label>
            <Controller
              name="country"
              control={control}
              render={({ field: { onBlur, onChange } }) => (
                <ReactSelect
                  id="type"
                  placeholder={"Select country"}
                  {...register("country", { required: true })}
                  onBlur={onBlur}
                  onChange={(option) => onChange(option?.value)}
                  options={countryOptions}
                />
              )}
            />
          </div>
        </div>
      </div>
    </FormModal>
  );
}
