import { type NextRequest } from "next/server";
import { withToken } from "@/lib/actions/withToken";

import {
  getOfficeTransactionsWithDetailsApiV1TransactionCodeGet as getTransactionByCode,
  $TransactionType,
} from "@/lib/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const trType = $TransactionType.enum.find((t) => t === type);

  if (!code || !trType) {
    return Response.error();
  }

  const response: any = await withToken(async () => {
    return getTransactionByCode({
      code: code,
      trType: trType,
    });
  });

  return Response.json(response);
}
