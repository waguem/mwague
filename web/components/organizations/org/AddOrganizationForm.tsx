"use client";
import clsx from "clsx";
import { FieldPath, useForm, Controller } from "react-hook-form";
import { useFormState } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { addOffice, State } from "@/lib/action";
import { ErrorMessage } from "@hookform/error-message";
import { FormSchema } from "@/lib/schemas/actions";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { getTranslation } from "@/i18n";
import ReactSelect from "react-select";
type Inputs = {
  name: string;
  initials: string;
  country: string;
};

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char: any) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const countryOptions = [
  { value: "Mali", label: "Mali", code: "ML" },
  { value: "China", label: "China", code: "CN" },
  { value: "Turkey", label: "Turkey", code: "TR" },
  { value: "USA", label: "United States", code: "US" },
  { value: "France", label: "France", code: "FR" },
  { value: "Ivory Cost", label: "Ivory Cost", code: "CI" },
  { value: "Guinea", label: "Guinea", code: "GN" },
  { value: "Burkina Faso", label: "Burkina Faso", code: "BF" },
  { value: "United Arab Emirates", label: "United Arab Emirates", code: "AE" },
  { value: "Mozambique", label: "Mozambique", code: "MZ" },
];

export function AddOrganizationForm() {
  const {
    register,
    formState: { errors, isValid },
    setError,
    reset,
    control,
  } = useForm<Inputs>({
    mode: "all",
    resolver: zodResolver(FormSchema),
  });
  const [state, formAction] = useFormState<State, FormData>(addOffice, null);
  const options = countryOptions.map((option) => ({
    value: option.value,
    label: `${getFlagEmoji(option.code)} ${option.label}`,
  }));
  useEffect(() => {
    if (!state) return;

    Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    }).fire({
      title: state.message,
      icon: state.status === "error" ? "error" : "success",
      padding: "10px 20px",
    });

    if (state.status === "error") {
      state.errors?.forEach((error) => {
        setError(error.path as FieldPath<Inputs>, {
          message: error.message,
        });
      });
    } else {
      reset();
    }
  }, [state, setError, reset]);
  const { t } = getTranslation();
  return (
    <form action={formAction} className="mb-5 mt-2 p-2">
      <h6 className="mb-5 text-lg font-bold">{t("add_office")}</h6>
      <div className="flex flex-col sm:flex-row">
        <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
          <div
            className={clsx({
              "has-error": errors?.name,
              "has-success": !errors?.name,
            })}
          >
            <label htmlFor="name">{t("name")}</label>
            <input
              {...register("name", { required: true, maxLength: 20 })}
              id="name"
              type="text"
              placeholder="MGW Mali"
              className="form-input"
            />
            <ErrorMessage errors={errors} name="name" />
          </div>
          <div
            className={clsx({
              "has-error": errors?.initials,
              "has-success": !errors?.initials,
            })}
          >
            <label htmlFor="initials">{t("initials")}</label>
            <input
              {...register("initials", { required: true, maxLength: 5 })}
              id="initials"
              type="text"
              placeholder="MGW"
              className="form-input"
            />
            <ErrorMessage errors={errors} name="initials" />
          </div>
          <div className="nice-select">
            <label htmlFor="country">{t("country")}</label>
            <Controller
              name="country"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur } }) => (
                <ReactSelect
                  id="country"
                  placeholder="Select a option"
                  options={options}
                  {...register("country")}
                  onChange={(option) => {
                    onChange(option!.value);
                  }}
                  onBlur={onBlur}
                  className={clsx({
                    "has-error": errors?.country,
                    "has-success": !errors?.country,
                    dark: true,
                  })}
                />
              )}
            />
          </div>
          <div className="mt-3 sm:col-span-2">
            <button type="submit" className="btn btn-primary" disabled={!isValid}>
              {t("save")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
