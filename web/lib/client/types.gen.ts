// This file is auto-generated by @hey-api/openapi-ts

/**
 * Account monthly report.
 */
export type AccountMonthlyReport = {
  account: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
  start_balance: number;
  end_balance: number;
  report_json?: Array<{
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  }>;
  id?: string;
  account_id: string;
  updated_at?: string;
};

export type AccountResponse = {
  type: AccountType;
  currency: Currency;
  initials: string;
  balance: number;
  is_open: boolean;
  version: number;
  created_by?: string;
  office_id?: string;
};

/**
 * An enumeration.
 */
export type AccountType = "AGENT" | "SUPPLIER" | "OFFICE" | "FUND";

export type ActivityResponse = {
  started_at: string;
  state: ActivityState;
  openning_fund: number;
  closing_fund?: number;
  openning_rate?: {
    [key: string]: unknown;
  };
  closing_rate?: {
    [key: string]: unknown;
  };
};

/**
 * An enumeration.
 */
export type ActivityState = "OPEN" | "CLOSED" | "PAUSED";

export type AgentReponseWithAccounts = {
  name: string;
  initials: string;
  phone: string;
  country: string;
  type: AgentType;
  accounts?: Array<AccountResponse>;
};

export type AgentResponse = {
  name: string;
  initials: string;
  phone: string;
  country: string;
  type: AgentType;
};

/**
 * An enumeration.
 */
export type AgentType = "AGENT" | "SUPPLIER";

/**
 * Amount and rate of a transaction.
 */
export type Amount = {
  amount: number;
  rate: number;
};

export type Body_create_office_api_v1_organization_office_post = {
  request: CreateOfficeRequest;
};

export type Body_create_organization_api_v1_organization_post = {
  create_org: CreateOrganizationRequest;
};

export type BuyRequest = {
  request_type: "BUY";
  provider: string;
};

export type request_type = "BUY";

/**
 * Commit trade request.
 */
export type CommitTradeRequest = {
  walletID: string;
  tradeID: string;
  trading_rate: number;
  amount: number;
  trading_cost: number;
  sold_amount: number;
  crypto_amount: number;
  trading_result: number;
};

export type CreateAccountRequest = {
  type: AccountType;
  currency: Currency;
  initials: string;
  balance?: number | null;
  owner_initials: string;
};

export type CreateActivityRequest = {
  rates: Array<Rate>;
};

export type CreateAgentRequest = {
  name: string;
  initials: string;
  phone: string;
  country: string;
  type: AgentType;
};

export type CreateEmployeeRequest = {
  email: string;
  username: string;
  office_id: string;
  roles: Array<string>;
  password: string;
};

export type CreateOfficeRequest = {
  country: string;
  initials: string;
  name: string;
  default_rates: Array<Rate>;
};

export type CreateOfficeWalletRequest = {
  crypto_currency: CryptoCurrency;
  trading_currency: Currency;
  wallet_name?: string;
  initials?: string;
  wallet_type?: WalletType;
};

export type CreateOrganizationRequest = {
  initials: string;
  org_name: string;
};

/**
 * An enumeration.
 */
export type CryptoCurrency = "BTC" | "ETH" | "USDT" | "NA";

/**
 * An enumeration.
 */
export type Currency = "USD" | "EUR" | "AED" | "CFA" | "GNF" | "RMB";

export type CustomerDetails = {
  name: string;
  phone: string;
};

/**
 * Transaction database model
 */
export type Deposit = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  owner_initials: string;
};

export type DepositRequest = {
  type: "DEPOSIT";
  receiver: string;
};

export type type = "DEPOSIT";

export type EmployeeResponse = {
  email: string;
  username: string;
  id: string;
  office_id: string;
  organization_id: string;
  roles: Array<string>;
  avatar_url?: string;
};

export type EmployeeResponseComplete = {
  email: string;
  username: string;
  id: string;
  office_id: string;
  organization_id: string;
  roles: Array<string>;
  avatar_url?: string;
  office: OfficeResponse;
};

export type ExchangeRequest = {
  request_type: "EXCHANGE";
  exchange_rate: number;
  walletID: string;
};

export type request_type2 = "EXCHANGE";

export type ExchangeWithSimpleWalletRequest = {
  request_type: "EXCHANGE WITH SIMPLE WALLET";
  walletID: string;
  exchange_rate: number;
  selling_rate: number;
};

export type request_type3 = "EXCHANGE WITH SIMPLE WALLET";

/**
 * Transaction database model
 */
export type External = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  sender_initials: string;
  charges: number;
  customer?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
};

export type ExternalRequest = {
  type: "EXTERNAL";
  sender: string;
  customer?: CustomerDetails;
  payment_currency: Currency;
  tags?: string;
};

export type type2 = "EXTERNAL";

/**
 * Transaction database model
 */
export type ExternalWithPayments = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  sender_initials: string;
  charges: number;
  customer?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  payments?: Array<Payment>;
};

/**
 * Une transaction de change est effectué
 */
export type ForEx = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  currency: Currency;
  base_currency: Currency;
  buying_rate: number;
  selling_rate: number;
  provider_account: string;
  customer_account: string;
  tag: string;
  charge_percentage: number;
};

export type ForExRequest = {
  type: "FOREX";
  provider_account: string;
  customer_account: string;
  tag: string;
  currency: Currency;
  base_currency: Currency;
  daily_rate: number;
  buying_rate: number;
  selling_rate: number;
  amount: number;
};

export type type3 = "FOREX";

/**
 * Une transaction de change est effectué
 */
export type ForExWithPayments = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  currency: Currency;
  base_currency: Currency;
  buying_rate: number;
  selling_rate: number;
  provider_account: string;
  customer_account: string;
  tag: string;
  charge_percentage: number;
  payments?: Array<Payment>;
};

export type FundCommit = {
  id?: string;
  is_out: boolean;
  v_from: number;
  variation: number;
  date?: string;
  account: string;
  description: string;
  activity_id: string;
};

export type HTTPValidationError = {
  detail?: Array<ValidationError>;
};

/**
 * Transaction database model
 */
export type Internal = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  sender_initials: string;
  receiver_initials: string;
  charges: number;
};

/**
 * Internal transaction request.
 */
export type InternalRequest = {
  type: "INTERNAL";
  sender: string;
  receiver: string;
  tags?: string;
};

export type type4 = "INTERNAL";

export type Note = {
  date: string;
  message: string;
  type: string;
  user?: string;
};

/**
 * Offic health response.
 */
export type OfficeHealth = {
  status: "healthy" | "unhealthy";
  invariant: number;
  accounts: Array<AccountResponse>;
};

export type OfficeResponse = {
  country: string;
  initials: string;
  name: string;
  id: string;
  currencies?:
    | {
        [key: string]: unknown;
      }
    | Array<{
        [key: string]: unknown;
      }>;
  wallets?: Array<OfficeWalletResponse>;
};

/**
 * Office result.
 */
export type OfficeResult = {
  result_source: TransactionType;
  amount: number;
  code: string;
  tag?: string;
  state: TransactionState;
  result_type: ResultType;
  date: string;
  transaction_id: string;
};

export type OfficeWalletResponse = {
  crypto_currency: CryptoCurrency;
  trading_currency: Currency;
  wallet_name?: string;
  initials?: string;
  wallet_type?: WalletType;
  walletID: string;
  crypto_balance: number;
  trading_balance: number;
  value: number;
  office_id: string;
};

export type OrganizationResponse = {
  initials: string;
  org_name: string;
  id: string;
};

export type Payment = {
  payment_date: string;
  amount: number;
  transaction_id: string;
  transaction_type: TransactionType;
  paid_by: string;
  state: PaymentState;
  notes?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  id?: string;
};

export type PaymentBase = {
  payment_date: string;
  amount: number;
  transaction_id: string;
  transaction_type: TransactionType;
  paid_by: string;
  state: PaymentState;
  notes?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
};

/**
 * An enumeration.
 */
export type PaymentMethod = "CASH" | "BANK" | "MOBILE";

export type PaymentRequest = {
  amount: number;
  rate: number;
  payment_type: TransactionType;
  customer?: CustomerDetails;
  notes?: string;
};

export type PaymentResponse = {
  payment_date: string;
  amount: number;
  transaction_id: string;
  transaction_type: TransactionType;
  paid_by?: string;
  state: PaymentState;
  notes?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
};

/**
 * An enumeration.
 */
export type PaymentState = 1 | 2;

export type Rate = {
  currency: string;
  rate: number;
};

/**
 * Monthly report response.
 */
export type ReportResponse = {
  results: Array<OfficeResult>;
};

/**
 * Result type.
 */
export type ResultType = "CHARGE" | "BENEFIT" | "LOSS" | "EXPENSE";

export type SellRequest = {
  request_type: "SELL";
  customer: string;
  currency: Currency | CryptoCurrency;
};

export type request_type4 = "SELL";

/**
 * Transaction database model
 */
export type Sending = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  receiver_initials: string;
  method: PaymentMethod;
  payment_currency: Currency;
  charges: number;
};

export type SendingRequest = {
  type: "SENDING";
  receiver_initials: string;
  payment_method: PaymentMethod;
  payment_currency: Currency;
};

export type type5 = "SENDING";

/**
 * Transaction database model
 */
export type SendingWithPayments = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  id?: string;
  office_id: string;
  org_id: string;
  created_by: string;
  reviwed_by?: string;
  history?: {
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  };
  notes?: string;
  receiver_initials: string;
  method: PaymentMethod;
  payment_currency: Currency;
  charges: number;
  payments?: Array<Payment>;
};

/**
 * An enumeration.
 */
export type TradingType = "BUY" | "SELL" | "SIMPLE SELL" | "DEPOSIT" | "EXCHANGE" | "EXCHANGE WITH SIMPLE WALLET";

export type TransactionItem = {
  item: Internal | Deposit | Sending | External | ForEx;
  notes: Array<Note>;
};

export type TransactionRequest = {
  currency?: Currency;
  amount: Amount;
  charges?: Amount;
  message?: string;
  tags?: string;
  transaction_type?: TransactionType;
  data?: InternalRequest | DepositRequest | ExternalRequest | SendingRequest | ForExRequest;
};

export type TransactionResponse = {
  amount: number;
  rate: number;
  code: string;
  state: TransactionState;
  type: TransactionType;
  created_at?: string;
  charges?: number;
  notes?: string;
};

export type TransactionReviewReq = {
  currency?: Currency;
  amount: Amount;
  charges?: Amount;
  message?: string;
  tags?: string;
  transaction_type?: TransactionType;
  data?: InternalRequest | DepositRequest | ExternalRequest | SendingRequest | ForExRequest;
  code: string;
  type: TransactionType;
  state: ValidationState;
  notes?: string;
};

/**
 * An enumeration.
 */
export type TransactionState = "REVIEW" | "PENDING" | "PAID" | "CANCELLED" | "REJECTED";

/**
 * An enumeration.
 */
export type TransactionType = "DEPOSIT" | "INTERNAL" | "EXTERNAL" | "SENDING" | "FOREX" | "TRADING";

/**
 * Update employee list request.
 */
export type UpdateEmployeeListRequest = {
  employees: Array<EmployeeResponse>;
};

export type UpdateOffice = {
  name?: string;
  country?: string;
  currencies?: Array<string>;
  baseCurrency?: string;
  mainCurrency?: string;
};

export type ValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

/**
 * An enumeration.
 */
export type ValidationState = "APPROVED" | "REJECTED" | "CANCELLED";

export type WalletDepositRequest = {
  request_type: "DEPOSIT";
  provider: string;
};

export type request_type5 = "DEPOSIT";

export type WalletTradingRequest = {
  code?: string;
  walletID: string;
  trading_currency?: string | Currency;
  exchange_currency?: string | Currency;
  selling_currency?: string | Currency;
  trading_type: TradingType;
  amount: number;
  daily_rate: number;
  trading_rate: number;
  message?: string;
  request: BuyRequest | SellRequest | ExchangeRequest | ExchangeWithSimpleWalletRequest | WalletDepositRequest;
};

export type WalletTradingResponse = {
  code?: string;
  walletID: string;
  trading_currency?: string | Currency;
  exchange_currency?: string | Currency;
  selling_currency?: string | Currency;
  trading_type: TradingType;
  amount: number;
  daily_rate: number;
  trading_rate: number;
  id: string;
  state: TransactionState;
  created_by: string;
  created_at: string;
  reviwed_by?: string;
  wallet_value: number;
  wallet_crypto: number;
  wallet_trading: number;
  trading_cost: number;
  trading_amount: number;
  trading_crypto: number;
  trading_result: number;
  trading_exchange: number;
  account?: string;
  exchange_rate?: number;
  selling_rate?: number;
  exchange_walletID?: string;
  notes?: Array<{
    [key: string]:
      | {
          [key: string]: unknown;
        }
      | unknown;
  }>;
  payments: Array<PaymentBase>;
};

/**
 * An enumeration.
 */
export type WalletType = "CRYPTO" | "SIMPLE";

export type PingApiV1PingGetResponse = unknown;

export type GetOrganizationsApiV1OrganizationGetResponse = Array<OrganizationResponse>;

export type CreateOrganizationApiV1OrganizationPostData = {
  requestBody: Body_create_organization_api_v1_organization_post;
};

export type CreateOrganizationApiV1OrganizationPostResponse = OrganizationResponse;

export type GetMyOrganizationApiV1OrganizationMeGetResponse = OrganizationResponse;

export type GetOrgOfficesApiV1OrganizationOfficeGetResponse = Array<OfficeResponse>;

export type CreateOfficeApiV1OrganizationOfficePostData = {
  requestBody: Body_create_office_api_v1_organization_office_post;
};

export type CreateOfficeApiV1OrganizationOfficePostResponse = OfficeResponse;

export type GetMyOfficeApiV1OrganizationMyofficeGetResponse = OfficeResponse;

export type GetOfficeApiV1OrganizationOfficeOfficeIdGetData = {
  officeId: string;
};

export type GetOfficeApiV1OrganizationOfficeOfficeIdGetResponse = OfficeResponse;

export type UpdateOfficeApiV1OrganizationOfficeOfficeIdPutData = {
  officeId: string;
  requestBody: UpdateOffice;
};

export type UpdateOfficeApiV1OrganizationOfficeOfficeIdPutResponse = OfficeResponse;

export type GetWalletsApiV1OrganizationOfficeWalletGetResponse = Array<OfficeWalletResponse>;

export type CreateWalletApiV1OrganizationOfficeWalletPostData = {
  requestBody: CreateOfficeWalletRequest;
};

export type CreateWalletApiV1OrganizationOfficeWalletPostResponse = OfficeWalletResponse;

export type GetOfficeHealthApiV1OrganizationHealthGetResponse = OfficeHealth;

export type GetFundCommitsApiV1OrganizationMyofficeFundCommitsGetData = {
  endDate?: string;
  startDate?: string;
};

export type GetFundCommitsApiV1OrganizationMyofficeFundCommitsGetResponse = Array<FundCommit>;

export type GetEmployeesApiV1OfficeEmployeeGetResponse = Array<EmployeeResponse>;

export type UpdateOfficeEmployeesApiV1OfficeEmployeePutData = {
  requestBody: UpdateEmployeeListRequest;
};

export type UpdateOfficeEmployeesApiV1OfficeEmployeePutResponse = Array<EmployeeResponse>;

export type CreateEmployeeApiV1OfficeEmployeePostData = {
  requestBody: CreateEmployeeRequest;
};

export type CreateEmployeeApiV1OfficeEmployeePostResponse = EmployeeResponse;

export type GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetData = {
  officeId: string;
};

export type GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetResponse = Array<EmployeeResponse>;

export type GetEmployeeApiV1OfficeEmployeeMeGetResponse = EmployeeResponseComplete;

export type UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutData = {
  employeeId: string;
  requestBody: EmployeeResponse;
};

export type UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutResponse = EmployeeResponse;

export type GetAgentsApiV1OfficeAgentGetResponse = Array<AgentReponseWithAccounts>;

export type CreateAgentApiV1OfficeAgentPostData = {
  requestBody: CreateAgentRequest;
};

export type CreateAgentApiV1OfficeAgentPostResponse = AgentResponse;

export type GetOfficeAgentsApiV1OfficeOfficeIdAgentGetData = {
  officeId: string;
};

export type GetOfficeAgentsApiV1OfficeOfficeIdAgentGetResponse = unknown;

export type GetAgentApiV1OfficeAgentAgentInitialsGetData = {
  agentInitials: string;
};

export type GetAgentApiV1OfficeAgentAgentInitialsGetResponse = AgentResponse;

export type OpenAccountApiV1AccountPostData = {
  requestBody: CreateAccountRequest;
};

export type OpenAccountApiV1AccountPostResponse = AccountResponse;

export type GetOfficeAccountsApiV1OfficeMyOfficeAccountGetResponse = Array<AccountResponse>;

export type GetAgentAccountsApiV1AgentAgentInitialAccountGetData = {
  agentInitial: string;
};

export type GetAgentAccountsApiV1AgentAgentInitialAccountGetResponse = Array<AccountResponse>;

export type GetActivityApiV1OfficeActivityGetResponse = ActivityResponse;

export type StartActivityApiV1OfficeActivityPostData = {
  requestBody: CreateActivityRequest;
};

export type StartActivityApiV1OfficeActivityPostResponse = ActivityResponse;

export type GetOfficeTransactionsApiV1OfficeTransactionsGetResponse = Array<TransactionItem>;

export type GetAgentTransactionsApiV1AgentInitialsTransactionsGetData = {
  endDate?: string;
  initials: string;
  startDate?: string;
};

export type GetAgentTransactionsApiV1AgentInitialsTransactionsGetResponse = Array<TransactionItem>;

export type RequestTransactionApiV1TransactionPostData = {
  requestBody: TransactionRequest;
};

export type RequestTransactionApiV1TransactionPostResponse = TransactionResponse;

export type ReviewTransactionApiV1TransactionTransactionCodeReviewPostData = {
  requestBody: TransactionReviewReq;
  transactionCode: string;
};

export type ReviewTransactionApiV1TransactionTransactionCodeReviewPostResponse = TransactionResponse;

export type GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetData = {
  code: string;
  trType: TransactionType;
};

export type GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetResponse =
  | Internal
  | Deposit
  | SendingWithPayments
  | ExternalWithPayments
  | ForExWithPayments;

export type UpdateTransactionApiV1TransactionCodePutData = {
  code: string;
  requestBody: TransactionRequest;
};

export type UpdateTransactionApiV1TransactionCodePutResponse = TransactionResponse;

export type AddPaymentApiV1TransactionCodePayPostData = {
  code: string;
  requestBody: PaymentRequest;
};

export type AddPaymentApiV1TransactionCodePayPostResponse = PaymentResponse;

export type TradeWalletApiV1WalletPostData = {
  requestBody: WalletTradingRequest;
};

export type TradeWalletApiV1WalletPostResponse = WalletTradingResponse;

export type GetWalletTradingsApiV1WalletWalletIdTradingsGetData = {
  walletId: string;
};

export type GetWalletTradingsApiV1WalletWalletIdTradingsGetResponse = Array<WalletTradingResponse>;

export type PayTradeApiV1WalletTradeTradeIdPayPostData = {
  tradeId: string;
};

export type PayTradeApiV1WalletTradeTradeIdPayPostResponse = PaymentResponse;

export type GetAgentTradingsApiV1OfficeAgentInitialsTradingsGetData = {
  endDate?: string;
  initials: string;
  startDate?: string;
};

export type GetAgentTradingsApiV1OfficeAgentInitialsTradingsGetResponse = Array<WalletTradingResponse>;

export type CommitTraddApiV1WalletTradeWalletIdCommitPostData = {
  requestBody: CommitTradeRequest;
  walletId: string;
};

export type CommitTraddApiV1WalletTradeWalletIdCommitPostResponse = WalletTradingResponse;

export type GetMonthlyReportApiV1OfficeMonthlyReportGetData = {
  endDate?: string;
  startDate?: string;
};

export type GetMonthlyReportApiV1OfficeMonthlyReportGetResponse = ReportResponse;

export type GetAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGetData = {
  initials: string;
  year?: number;
};

export type GetAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGetResponse = Array<AccountMonthlyReport>;

export type $OpenApiTs = {
  "/api/v1/ping": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: unknown;
      };
    };
  };
  "/api/v1/organization": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<OrganizationResponse>;
      };
    };
    post: {
      req: CreateOrganizationApiV1OrganizationPostData;
      res: {
        /**
         * Successful Response
         */
        201: OrganizationResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/organization/me": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: OrganizationResponse;
      };
    };
  };
  "/api/v1/organization/office": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<OfficeResponse>;
      };
    };
    post: {
      req: CreateOfficeApiV1OrganizationOfficePostData;
      res: {
        /**
         * Successful Response
         */
        201: OfficeResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/organization/myoffice": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: OfficeResponse;
      };
    };
  };
  "/api/v1/organization/office/{office_id}": {
    get: {
      req: GetOfficeApiV1OrganizationOfficeOfficeIdGetData;
      res: {
        /**
         * Successful Response
         */
        200: OfficeResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
    put: {
      req: UpdateOfficeApiV1OrganizationOfficeOfficeIdPutData;
      res: {
        /**
         * Successful Response
         */
        200: OfficeResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/organization/office/wallet": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<OfficeWalletResponse>;
      };
    };
    post: {
      req: CreateWalletApiV1OrganizationOfficeWalletPostData;
      res: {
        /**
         * Successful Response
         */
        201: OfficeWalletResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/organization/health": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: OfficeHealth;
      };
    };
  };
  "/api/v1/organization/myoffice/fund_commits": {
    get: {
      req: GetFundCommitsApiV1OrganizationMyofficeFundCommitsGetData;
      res: {
        /**
         * Successful Response
         */
        200: Array<FundCommit>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/employee": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<EmployeeResponse>;
      };
    };
    put: {
      req: UpdateOfficeEmployeesApiV1OfficeEmployeePutData;
      res: {
        /**
         * Successful Response
         */
        200: Array<EmployeeResponse>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
    post: {
      req: CreateEmployeeApiV1OfficeEmployeePostData;
      res: {
        /**
         * Successful Response
         */
        201: EmployeeResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/{office_id}/employee": {
    get: {
      req: GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetData;
      res: {
        /**
         * Successful Response
         */
        200: Array<EmployeeResponse>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/employee/me": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: EmployeeResponseComplete;
      };
    };
  };
  "/api/v1/office/employee/{employee_id}/assign": {
    put: {
      req: UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutData;
      res: {
        /**
         * Successful Response
         */
        200: EmployeeResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/agent": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<AgentReponseWithAccounts>;
      };
    };
    post: {
      req: CreateAgentApiV1OfficeAgentPostData;
      res: {
        /**
         * Successful Response
         */
        201: AgentResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/{office_id}/agent": {
    get: {
      req: GetOfficeAgentsApiV1OfficeOfficeIdAgentGetData;
      res: {
        /**
         * Successful Response
         */
        200: unknown;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/agent/{agent_initials}": {
    get: {
      req: GetAgentApiV1OfficeAgentAgentInitialsGetData;
      res: {
        /**
         * Successful Response
         */
        200: AgentResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/account": {
    post: {
      req: OpenAccountApiV1AccountPostData;
      res: {
        /**
         * Successful Response
         */
        201: AccountResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/myOffice/account": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<AccountResponse>;
      };
    };
  };
  "/api/v1/agent/{agent_initial}/account": {
    get: {
      req: GetAgentAccountsApiV1AgentAgentInitialAccountGetData;
      res: {
        /**
         * Successful Response
         */
        200: Array<AccountResponse>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/activity": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: ActivityResponse;
      };
    };
    post: {
      req: StartActivityApiV1OfficeActivityPostData;
      res: {
        /**
         * Successful Response
         */
        200: ActivityResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/transactions": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<TransactionItem>;
      };
    };
  };
  "/api/v1/agent/{initials}/transactions": {
    get: {
      req: GetAgentTransactionsApiV1AgentInitialsTransactionsGetData;
      res: {
        /**
         * Successful Response
         */
        200: Array<TransactionItem>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/transaction": {
    post: {
      req: RequestTransactionApiV1TransactionPostData;
      res: {
        /**
         * Successful Response
         */
        201: TransactionResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/transaction/{transaction_code}/review": {
    post: {
      req: ReviewTransactionApiV1TransactionTransactionCodeReviewPostData;
      res: {
        /**
         * Successful Response
         */
        200: TransactionResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/transaction/{code}": {
    get: {
      req: GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetData;
      res: {
        /**
         * Successful Response
         */
        200: Internal | Deposit | SendingWithPayments | ExternalWithPayments | ForExWithPayments;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
    put: {
      req: UpdateTransactionApiV1TransactionCodePutData;
      res: {
        /**
         * Successful Response
         */
        200: TransactionResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/transaction/{code}/pay": {
    post: {
      req: AddPaymentApiV1TransactionCodePayPostData;
      res: {
        /**
         * Successful Response
         */
        200: PaymentResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/wallet": {
    post: {
      req: TradeWalletApiV1WalletPostData;
      res: {
        /**
         * Successful Response
         */
        201: WalletTradingResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/wallet/{walletID}/tradings": {
    get: {
      req: GetWalletTradingsApiV1WalletWalletIdTradingsGetData;
      res: {
        /**
         * Successful Response
         */
        200: Array<WalletTradingResponse>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/wallet/trade/{tradeID}/pay": {
    post: {
      req: PayTradeApiV1WalletTradeTradeIdPayPostData;
      res: {
        /**
         * Successful Response
         */
        201: PaymentResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1office/agent/{initials}/tradings": {
    get: {
      req: GetAgentTradingsApiV1OfficeAgentInitialsTradingsGetData;
      res: {
        /**
         * Successful Response
         */
        200: Array<WalletTradingResponse>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/wallet/trade/{walletID}/commit": {
    post: {
      req: CommitTraddApiV1WalletTradeWalletIdCommitPostData;
      res: {
        /**
         * Successful Response
         */
        200: WalletTradingResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/monthly-report": {
    get: {
      req: GetMonthlyReportApiV1OfficeMonthlyReportGetData;
      res: {
        /**
         * Successful Response
         */
        200: ReportResponse;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
  "/api/v1/office/agent/{initials}/monthly-report": {
    get: {
      req: GetAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGetData;
      res: {
        /**
         * Successful Response
         */
        200: Array<AccountMonthlyReport>;
        /**
         * Validation Error
         */
        422: HTTPValidationError;
      };
    };
  };
};
