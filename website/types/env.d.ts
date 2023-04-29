import type account from "@/app/public/locales/en/account.json";
import type chat from "@/app/public/locales/en/chat.json";
import type common from "@/app/public/locales/en/common.json";
import type dashboard from "@/app/public/locales/en/dashboard.json";
import type error from "@/app/public/locales/en/error.json";
import type index from "@/app/public/locales/en/index.json";
import type labelling from "@/app/public/locales/en/labelling.json";
import type leaderboard from "@/app/public/locales/en/leaderboard.json";
import type message from "@/app/public/locales/en/message.json";
import type stats from "@/app/public/locales/en/stats.json";
import type tasks from "@/app/public/locales/en/tasks.json";
import type tos from "@/app/public/locales/en/tos.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      account: typeof account;
      chat: typeof chat;
      common: typeof common;
      dashboard: typeof dashboard;
      error: typeof error;
      index: typeof index;
      labelling: typeof labelling;
      leaderboard: typeof leaderboard;
      message: typeof message;
      stats: typeof stats;
      tasks: typeof tasks;
      tos: typeof tos;
    };
  }
}
