import IconLoader from "@/components/icon/icon-loader";
import IconPlayCircle from "@/components/icon/icon-play-circle";
import { State } from "@/lib/actions";
import { startActivity } from "@/lib/actions/activity";
import { OfficeResponse } from "@/lib/client";
import clsx from "clsx";
import { useEffect, useTransition } from "react";
import { useFormState } from "react-dom";
import { FieldPath, useForm } from "react-hook-form";
import Swal from "sweetalert2";

interface Props {
  office: OfficeResponse;
}

type Inputs = {
  [key: string]: number;
};
export default function StartActivityForm({ office }: Props) {
  let currencies: { name: string; default_rate: number; enabled: boolean }[] = [];
  if (Array.isArray(office.currencies)) {
    currencies = office.currencies as any;
  }
  const [pending, startTansition] = useTransition();
  const [state, formAction] = useFormState<State, FormData>(startActivity, null);
  const mainCurrency = currencies.find((currency: any) => currency.main);
  const otherCurrencies = currencies.filter((currency: any) => !currency.main);

  const {
    register,
    setError,
    reset,
    formState: { errors, touchedFields, isValid },
  } = useForm<Inputs>({
    mode: "all",
  });

  useEffect(() => {
    if (!state) return;
    Swal.mixin({
      toast: true,
      position: "bottom-left",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    }).fire({
      title: state.message,
      icon: state.status === "success" ? "success" : "error",
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

  return (
    <form className="mt-4" action={(formData: any) => startTansition(() => formAction(formData))}>
      {otherCurrencies.map((currency, index) => (
        <div
          className={clsx("mb-5 flex-1", {
            "has-error": errors[currency.name] && touchedFields[currency.name],
            "has-success": !errors[currency.name] && touchedFields[currency.name],
          })}
          key={index}
        >
          <label htmlFor="type">
            Daily Rate {mainCurrency?.name} to {currency.name}
          </label>
          <input
            id={`rate-${currency.name}`}
            type="number"
            step="any"
            className="form-input"
            {...register(`${currency.name}`, { required: true })}
            placeholder="Enter rate"
          />
        </div>
      ))}
      <div className="flex flex-row-reverse">
        <button type="submit" id="submit" disabled={!isValid} className="btn btn-primary w-full space-x-2">
          {pending ? <IconLoader className="animate-spin" /> : <IconPlayCircle className="h-5 w-5" />}
          <span>START</span>
        </button>
      </div>
    </form>
  );
}
