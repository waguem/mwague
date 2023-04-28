import { Box } from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";
import { post } from "@/lib/api";

// const navigateAway = () => {
//   location.href = "https://laion.ai/";
// };

const acceptToS = async () => {
  await post("/api/tos", { arg: {} });
  location.reload();
};

export const ToSWrapper = ({ children }: { children?: ReactNode | undefined }) => {
  //   const { t } = useTranslation("tos");
  const { session, status } = {
    session: { user: { name: "amadou", image: "", role: "admin", tosAcceptanceDate: "" } },
    status: "",
  };

  //   const { data: session, status } = useSession();
  const hasAcceptedTos = Boolean(session?.user.tosAcceptanceDate);
  const isLoading = status === "loading";
  const notLoggedIn = status === "unauthenticated";

  const contents = useMemo(
    () => (
      <Box className="oa-basic-theme">
        <p>surver card</p>
      </Box>
    ),
    []
  );

  if (notLoggedIn || isLoading || hasAcceptedTos) {
    return <>{children}</>;
  }
  return contents;
};
