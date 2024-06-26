"use client";
import { State } from "@/lib/actions";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { FieldPath } from "react-hook-form";
interface Props {
  response: State;
  setError: any;
  reset: any;
}
export default function useResponse({ response, setError, reset }: Props) {
  useEffect(() => {
    if (!response) return;
    Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    }).fire({
      title: response.message,
      icon: response.status === "error" ? "error" : "success",
    });
    if (response.status === "error") {
      response.errors?.forEach((error) => {
        setError(error.path as FieldPath<any>, {
          message: error.message,
        });
      });
    } else {
      reset();
    }
  }, [response, setError, reset]);
}
