import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";
import { post } from "@/lib/api";
import { useTranslation } from "next-i18next";
import { SubmitButton } from "@/ui/Buttons/Submit";
import { SurveyCard } from "@/ui/Survey";
const navigateAway = () => {
  location.href = "https://laion.ai/";
};

const acceptToS = async () => {
  await post("/api/tos", { arg: {} });
  location.reload();
};

export const ToSWrapper = ({ children }: { children?: ReactNode | undefined }) => {
  const { t } = useTranslation("tos");
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
        <SurveyCard display="flex" flexDir="column" w="full" maxWidth="7xl" m="auto" gap={4}>
          <Text fontWeight="bold" fontSize="xl" as="h2">
            {t("title")}
          </Text>
          <Text>{t("content")}</Text>
          {/* <TermsOfService /> */}
          <Flex gap={10} justifyContent="center">
            <SubmitButton onClick={navigateAway} colorScheme="red">
              {t("decline")}
            </SubmitButton>
            <SubmitButton onClick={acceptToS} colorScheme="blue" data-cy="accept-tos">
              {t("accept")}
            </SubmitButton>
          </Flex>
        </SurveyCard>
      </Box>
    ),
    [t]
  );

  if (notLoggedIn || isLoading || hasAcceptedTos) {
    return <>{children}</>;
  }
  return contents;
};
