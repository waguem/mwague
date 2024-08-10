import { State } from "@/lib/actions";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { isArray } from "lodash";

// eslint-disable-next-line no-unused-vars
export const decodeNotification = (title: string, response: State, cb: (errors: any) => void = () => {}) => {
  if (!response) {
    return;
  }
  if (response.status === "error") {
    if (isArray(response.errors)) {
      response.errors.forEach((error) => {
        notifications.show({
          title: title,
          color: "red",
          message: `Input ${error.path} ${error.message}`,
          className: "mt-2",
          radius: "md",
          withBorder: true,
          icon: <IconX size={20} />,
          loading: false,
          withCloseButton: true,
          autoClose: 3000,
        });
        cb(response.errors);
      });
    } else {
      notifications.show({
        title: title,
        color: "red",
        message: response.message,
        className: "mt-2",
        radius: "md",
        withBorder: true,
        icon: <IconX size={20} />,
        loading: false,
        withCloseButton: true,
        autoClose: 3000,
      });
    }
  } else if (response.status === "success") {
    notifications.show({
      title: title,
      color: "teal",
      message: response.message,
      className: "mt-2",
      radius: "md",
      withBorder: true,
      icon: <IconCheck size={20} />,
      loading: false,
      withCloseButton: true,
      autoClose: 3000,
    });
  }
};
