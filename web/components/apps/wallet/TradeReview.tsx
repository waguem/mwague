import { reviewTrade } from "@/lib/actions/wallet";
import { TradeReviewReq, ValidationState, WalletTradingResponse } from "@/lib/client";
import { reviewTags } from "@/lib/utils";
import { Button, Card, Group, LoadingOverlay, Stack, TagsInput } from "@mantine/core";
import { IconCancel, IconCheck, IconX } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { decodeNotification } from "../notifications/notifications";

interface Props {
  trade: WalletTradingResponse;
}

export default function TradeReview({ trade }: Props) {
  const [tags, setTags] = useState<string[]>([]);

  const [pending, startTransition] = useTransition();

  const review = async (state: ValidationState) => {
    try {
      const review: TradeReviewReq = {
        ...trade,
        review: state,
        tags,
      };
      const response = await reviewTrade(review);
      decodeNotification("Review Trade", response);
      setTags([]);
    } catch (e) {}
  };

  const handleClick = (state: ValidationState) => startTransition(() => review(state));
  if (trade.state !== "REVIEW") {
    return null;
  }
  return (
    <Card withBorder className="mt-4">
      <LoadingOverlay visible={pending} loaderProps={{ color: "pink", type: "dots" }} />
      <Stack>
        <Group grow>
          <TagsInput
            label="Review Tag"
            data={reviewTags}
            acceptValueOnBlur
            value={tags}
            onChange={(value: string[]) => setTags(value)}
          />
        </Group>
        <Group grow>
          <Button
            size="xs"
            variant="gradient"
            onClick={() => handleClick("APPROVED")}
            leftSection={<IconCheck size={12} />}
            gradient={{ from: "teal", to: "blue", deg: 120 }}
          >
            Approve
          </Button>
          <Button
            leftSection={<IconX size={12} />}
            size="xs"
            onClick={() => handleClick("REJECTED")}
            variant="gradient"
            gradient={{ from: "teal", to: "orange", deg: 90 }}
          >
            Reject
          </Button>
          <Button
            leftSection={<IconCancel size={12} />}
            size="xs"
            onClick={() => handleClick("CANCELLED")}
            variant="gradient"
            gradient={{ from: "red", to: "pink", deg: 120 }}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
