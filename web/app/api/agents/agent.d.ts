export type Account = {
  initials: string;
  balance: number;
  currency: string;
};

export type Agent = {
  initials: string;
  name: string;
  country: string;
  accounts: Account[];
};
