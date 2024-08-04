import zod from "zod";
import { zfd } from "zod-form-data";
import { zPNumber } from "./transactionsResolvers";
export const TradeType = zod.enum(["BUY", "SELL", "EXCHANGE"]);

export const TradeWallet = zfd.formData({
  trading_type: TradeType,
  amount: zPNumber,
  walletID: zfd.text(zod.string()),
  daily_rate: zPNumber,
  trading_rate: zPNumber,
});
