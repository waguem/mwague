import { Button, LoadingOverlay } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { Fragment, useTransition } from "react";
import { genAgentReport } from "@/lib/pdf/generator";
import { AccountMonthlyReport } from "@/lib/client";
import { notifications } from "@mantine/notifications";
import { getFullReport } from "@/lib/actions/agents";

interface Props {
  report: AccountMonthlyReport;
}
export default function GenerateAgentReport({ report }: Props) {
  const [pending, startTransition] = useTransition();

  const handleGenerate = async () => {
    const taskId = notifications.show({
      title: `Report`,
      radius: "md",
      loading: true,
      withCloseButton: false,
      autoClose: false,
      message: "report is being generated.",
      withBorder: true,
    });

    try {
      const fullReport = await getFullReport(report);
      notifications.update({
        id: taskId,
        message: "Report generated",
        loading: false,
        autoClose: 3000,
        color: "teal",
        icon: <IconDownload size={12} />,
      });
      genAgentReport(fullReport);
    } catch (e) {}
  };

  return (
    <Fragment>
      <LoadingOverlay visible={pending} loaderProps={{ color: "pink", type: "dots" }} />
      <Button
        leftSection={<IconDownload size={20} className="ml-4" />}
        variant="gradient"
        radius={"md"}
        onClick={() => startTransition(() => handleGenerate())}
      >
        Download
      </Button>
    </Fragment>
  );
}
