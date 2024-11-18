// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";
import type {
  PingApiV1PingGetResponse,
  GetOrganizationsApiV1OrganizationGetResponse,
  CreateOrganizationApiV1OrganizationPostData,
  CreateOrganizationApiV1OrganizationPostResponse,
  GetMyOrganizationApiV1OrganizationMeGetResponse,
  GetOrgOfficesApiV1OrganizationOfficeGetResponse,
  CreateOfficeApiV1OrganizationOfficePostData,
  CreateOfficeApiV1OrganizationOfficePostResponse,
  GetMyOfficeApiV1OrganizationMyofficeGetResponse,
  GetOfficeApiV1OrganizationOfficeOfficeIdGetData,
  GetOfficeApiV1OrganizationOfficeOfficeIdGetResponse,
  UpdateOfficeApiV1OrganizationOfficeOfficeIdPutData,
  UpdateOfficeApiV1OrganizationOfficeOfficeIdPutResponse,
  GetWalletsApiV1OrganizationOfficeWalletGetResponse,
  CreateWalletApiV1OrganizationOfficeWalletPostData,
  CreateWalletApiV1OrganizationOfficeWalletPostResponse,
  GetOfficeHealthApiV1OrganizationHealthGetResponse,
  GetFundCommitsApiV1OrganizationMyofficeFundCommitsGetData,
  GetFundCommitsApiV1OrganizationMyofficeFundCommitsGetResponse,
  GetEmployeesApiV1OfficeEmployeeGetResponse,
  UpdateOfficeEmployeesApiV1OfficeEmployeePutData,
  UpdateOfficeEmployeesApiV1OfficeEmployeePutResponse,
  CreateEmployeeApiV1OfficeEmployeePostData,
  CreateEmployeeApiV1OfficeEmployeePostResponse,
  GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetData,
  GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetResponse,
  GetEmployeeApiV1OfficeEmployeeMeGetResponse,
  UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutData,
  UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutResponse,
  GetAgentsApiV1OfficeAgentGetResponse,
  CreateAgentApiV1OfficeAgentPostData,
  CreateAgentApiV1OfficeAgentPostResponse,
  GetOfficeAgentsApiV1OfficeOfficeIdAgentGetData,
  GetOfficeAgentsApiV1OfficeOfficeIdAgentGetResponse,
  GetAgentApiV1OfficeAgentAgentInitialsGetData,
  GetAgentApiV1OfficeAgentAgentInitialsGetResponse,
  OpenAccountApiV1AccountPostData,
  OpenAccountApiV1AccountPostResponse,
  GetOfficeAccountsApiV1OfficeMyOfficeAccountGetResponse,
  GetAgentAccountsApiV1AgentAgentInitialAccountGetData,
  GetAgentAccountsApiV1AgentAgentInitialAccountGetResponse,
  GetActivityApiV1OfficeActivityGetResponse,
  StartActivityApiV1OfficeActivityPostData,
  StartActivityApiV1OfficeActivityPostResponse,
  GetOfficeTransactionsApiV1OfficeTransactionsGetResponse,
  GetOfficeTransactionsByIntervalApiV1OfficeTransactionsIntervalGetData,
  GetOfficeTransactionsByIntervalApiV1OfficeTransactionsIntervalGetResponse,
  GetAgentTransactionsApiV1AgentInitialsTransactionsGetData,
  GetAgentTransactionsApiV1AgentInitialsTransactionsGetResponse,
  RequestTransactionApiV1TransactionPostData,
  RequestTransactionApiV1TransactionPostResponse,
  ReviewTransactionApiV1TransactionTransactionCodeReviewPostData,
  ReviewTransactionApiV1TransactionTransactionCodeReviewPostResponse,
  GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetData,
  GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetResponse,
  UpdateTransactionApiV1TransactionCodePutData,
  UpdateTransactionApiV1TransactionCodePutResponse,
  AddPaymentApiV1TransactionCodePayPostData,
  AddPaymentApiV1TransactionCodePayPostResponse,
  CancelTransactionApiV1TransactionCodeCancelDeleteData,
  CancelTransactionApiV1TransactionCodeCancelDeleteResponse,
  CancelPaymentApiV1PaymentIdCancelPostData,
  CancelPaymentApiV1PaymentIdCancelPostResponse,
  GroupPayApiV1GroupPayForexPostData,
  GroupPayApiV1GroupPayForexPostResponse,
  TradeWalletApiV1WalletPostData,
  TradeWalletApiV1WalletPostResponse,
  GetWalletTradingsApiV1WalletWalletIdTradingsGetData,
  GetWalletTradingsApiV1WalletWalletIdTradingsGetResponse,
  PayTradeApiV1WalletTradeTradeIdPayPostData,
  PayTradeApiV1WalletTradeTradeIdPayPostResponse,
  GetAgentTradingsApiV1OfficeAgentInitialsTradingsGetData,
  GetAgentTradingsApiV1OfficeAgentInitialsTradingsGetResponse,
  CommitTradeApiV1WalletTradeTradeCodeCommitPostData,
  CommitTradeApiV1WalletTradeTradeCodeCommitPostResponse,
  ReviewTradeApiV1TradeReviewPostData,
  ReviewTradeApiV1TradeReviewPostResponse,
  RollbackApiV1TradeRollbackPostData,
  RollbackApiV1TradeRollbackPostResponse,
  UpdateTradeApiV1TradeUpdatePatchData,
  UpdateTradeApiV1TradeUpdatePatchResponse,
  GetMonthlyReportApiV1OfficeMonthlyReportGetData,
  GetMonthlyReportApiV1OfficeMonthlyReportGetResponse,
  GetAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGetData,
  GetAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGetResponse,
  GetAgentFullReportApiV1OfficeAgentFullReportReportIdGetData,
  GetAgentFullReportApiV1OfficeAgentFullReportReportIdGetResponse,
} from "./types.gen";

/**
 * Ping
 * @returns unknown Successful Response
 * @throws ApiError
 */
export const pingApiV1PingGet = (): CancelablePromise<PingApiV1PingGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/ping",
  });
};

/**
 * Get Organizations
 * get all organizations
 * @returns OrganizationResponse Successful Response
 * @throws ApiError
 */
export const getOrganizationsApiV1OrganizationGet =
  (): CancelablePromise<GetOrganizationsApiV1OrganizationGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organization",
    });
  };

/**
 * Create Organization
 * create an organization
 * @param data The data for the request.
 * @param data.requestBody
 * @returns OrganizationResponse Successful Response
 * @throws ApiError
 */
export const createOrganizationApiV1OrganizationPost = (
  data: CreateOrganizationApiV1OrganizationPostData
): CancelablePromise<CreateOrganizationApiV1OrganizationPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/organization",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get My Organization
 * get my organization
 * @returns OrganizationResponse Successful Response
 * @throws ApiError
 */
export const getMyOrganizationApiV1OrganizationMeGet =
  (): CancelablePromise<GetMyOrganizationApiV1OrganizationMeGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organization/me",
    });
  };

/**
 * Get Org Offices
 * Retrieve a list of offices for the organization.
 *
 * Args:
 * user (KcUser): The authenticated user object.
 * db (Session, optional): The database session. Defaults to Depends(get_db).
 *
 * Returns:
 * List[protocol.OfficeResponse]: A list of office responses.
 * @returns OfficeResponse Successful Response
 * @throws ApiError
 */
export const getOrgOfficesApiV1OrganizationOfficeGet =
  (): CancelablePromise<GetOrgOfficesApiV1OrganizationOfficeGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organization/office",
    });
  };

/**
 * Create Office
 * Create a new office.
 *
 * Args:
 * user: The authenticated user making the request.
 * request: The request payload containing the details of the office to be created.
 * db: The database session.
 *
 * Returns:
 * The response containing the created office details.
 * @param data The data for the request.
 * @param data.requestBody
 * @returns OfficeResponse Successful Response
 * @throws ApiError
 */
export const createOfficeApiV1OrganizationOfficePost = (
  data: CreateOfficeApiV1OrganizationOfficePostData
): CancelablePromise<CreateOfficeApiV1OrganizationOfficePostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/organization/office",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get My Office
 * return the office of the authenticated user
 * @returns OfficeResponse Successful Response
 * @throws ApiError
 */
export const getMyOfficeApiV1OrganizationMyofficeGet =
  (): CancelablePromise<GetMyOfficeApiV1OrganizationMyofficeGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organization/myoffice",
    });
  };

/**
 * Get Office
 * Retrieve an office by ID.
 *
 * Args:
 * user (KcUser): The authenticated user object.
 * office_id (int): The ID of the office to retrieve.
 * db (Session, optional): The database session. Defaults to Depends(get_db).
 *
 * Returns:
 * protocol.OfficeResponse: The office response.
 * @param data The data for the request.
 * @param data.officeId
 * @returns OfficeResponse Successful Response
 * @throws ApiError
 */
export const getOfficeApiV1OrganizationOfficeOfficeIdGet = (
  data: GetOfficeApiV1OrganizationOfficeOfficeIdGetData
): CancelablePromise<GetOfficeApiV1OrganizationOfficeOfficeIdGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/organization/office/{office_id}",
    path: {
      office_id: data.officeId,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Update Office
 * Update an office by ID.
 *
 * Args:
 * user (KcUser): The authenticated user object.
 * office_id (int): The ID of the office to update.
 * data (protocol.UpdateOfficeRequest): The data to update the office with.
 * db (AsyncDBSessionDep): The database session.
 *
 * Returns:
 * protocol.OfficeResponse: The updated office response.
 * @param data The data for the request.
 * @param data.officeId
 * @param data.requestBody
 * @returns OfficeResponse Successful Response
 * @throws ApiError
 */
export const updateOfficeApiV1OrganizationOfficeOfficeIdPut = (
  data: UpdateOfficeApiV1OrganizationOfficeOfficeIdPutData
): CancelablePromise<UpdateOfficeApiV1OrganizationOfficeOfficeIdPutResponse> => {
  return __request(OpenAPI, {
    method: "PUT",
    url: "/api/v1/organization/office/{office_id}",
    path: {
      office_id: data.officeId,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Wallets
 * return all wallets for an office
 * @returns OfficeWalletResponse Successful Response
 * @throws ApiError
 */
export const getWalletsApiV1OrganizationOfficeWalletGet =
  (): CancelablePromise<GetWalletsApiV1OrganizationOfficeWalletGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organization/office/wallet",
    });
  };

/**
 * Create Wallet
 * create a new wallet for an office
 * @param data The data for the request.
 * @param data.requestBody
 * @returns OfficeWalletResponse Successful Response
 * @throws ApiError
 */
export const createWalletApiV1OrganizationOfficeWalletPost = (
  data: CreateWalletApiV1OrganizationOfficeWalletPostData
): CancelablePromise<CreateWalletApiV1OrganizationOfficeWalletPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/organization/office/wallet",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Office Health
 * return the health of the office
 * @returns OfficeHealth Successful Response
 * @throws ApiError
 */
export const getOfficeHealthApiV1OrganizationHealthGet =
  (): CancelablePromise<GetOfficeHealthApiV1OrganizationHealthGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organization/health",
    });
  };

/**
 * Get Fund Commits
 * return all daily fund commits for an office
 * @param data The data for the request.
 * @param data.startDate
 * @param data.endDate
 * @returns FundCommit Successful Response
 * @throws ApiError
 */
export const getFundCommitsApiV1OrganizationMyofficeFundCommitsGet = (
  data: GetFundCommitsApiV1OrganizationMyofficeFundCommitsGetData = {}
): CancelablePromise<GetFundCommitsApiV1OrganizationMyofficeFundCommitsGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/organization/myoffice/fund_commits",
    query: {
      start_date: data.startDate,
      end_date: data.endDate,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Employees
 * @returns EmployeeResponse Successful Response
 * @throws ApiError
 */
export const getEmployeesApiV1OfficeEmployeeGet = (): CancelablePromise<GetEmployeesApiV1OfficeEmployeeGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/employee",
  });
};

/**
 * Update Office Employees
 * update list of employees
 * @param data The data for the request.
 * @param data.requestBody
 * @returns EmployeeResponse Successful Response
 * @throws ApiError
 */
export const updateOfficeEmployeesApiV1OfficeEmployeePut = (
  data: UpdateOfficeEmployeesApiV1OfficeEmployeePutData
): CancelablePromise<UpdateOfficeEmployeesApiV1OfficeEmployeePutResponse> => {
  return __request(OpenAPI, {
    method: "PUT",
    url: "/api/v1/office/employee",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Create Employee
 * Create a new employee.
 *
 * Args:
 * user (KcUser): The authenticated user making the request.
 * input (protocol.CreateEmployeeRequest): The input data for creating the employee.
 * Returns:
 * Employee: The created employee.
 * @param data The data for the request.
 * @param data.requestBody
 * @returns EmployeeResponse Successful Response
 * @throws ApiError
 */
export const createEmployeeApiV1OfficeEmployeePost = (
  data: CreateEmployeeApiV1OfficeEmployeePostData
): CancelablePromise<CreateEmployeeApiV1OfficeEmployeePostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/office/employee",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Office Employees
 * @param data The data for the request.
 * @param data.officeId
 * @returns EmployeeResponse Successful Response
 * @throws ApiError
 */
export const getOfficeEmployeesApiV1OfficeOfficeIdEmployeeGet = (
  data: GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetData
): CancelablePromise<GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/{office_id}/employee",
    path: {
      office_id: data.officeId,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Employee
 * @returns EmployeeResponseComplete Successful Response
 * @throws ApiError
 */
export const getEmployeeApiV1OfficeEmployeeMeGet =
  (): CancelablePromise<GetEmployeeApiV1OfficeEmployeeMeGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/office/employee/me",
    });
  };

/**
 * Update Employee
 * @param data The data for the request.
 * @param data.employeeId
 * @param data.requestBody
 * @returns EmployeeResponse Successful Response
 * @throws ApiError
 */
export const updateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPut = (
  data: UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutData
): CancelablePromise<UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutResponse> => {
  return __request(OpenAPI, {
    method: "PUT",
    url: "/api/v1/office/employee/{employee_id}/assign",
    path: {
      employee_id: data.employeeId,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Agents
 * @returns AgentReponseWithAccounts Successful Response
 * @throws ApiError
 */
export const getAgentsApiV1OfficeAgentGet = (): CancelablePromise<GetAgentsApiV1OfficeAgentGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/agent",
  });
};

/**
 * Create Agent
 * @param data The data for the request.
 * @param data.requestBody
 * @returns AgentResponse Successful Response
 * @throws ApiError
 */
export const createAgentApiV1OfficeAgentPost = (
  data: CreateAgentApiV1OfficeAgentPostData
): CancelablePromise<CreateAgentApiV1OfficeAgentPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/office/agent",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Office Agents
 * @param data The data for the request.
 * @param data.officeId
 * @returns unknown Successful Response
 * @throws ApiError
 */
export const getOfficeAgentsApiV1OfficeOfficeIdAgentGet = (
  data: GetOfficeAgentsApiV1OfficeOfficeIdAgentGetData
): CancelablePromise<GetOfficeAgentsApiV1OfficeOfficeIdAgentGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/{office_id}/agent",
    path: {
      office_id: data.officeId,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Agent
 * @param data The data for the request.
 * @param data.agentInitials
 * @returns AgentResponse Successful Response
 * @throws ApiError
 */
export const getAgentApiV1OfficeAgentAgentInitialsGet = (
  data: GetAgentApiV1OfficeAgentAgentInitialsGetData
): CancelablePromise<GetAgentApiV1OfficeAgentAgentInitialsGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/agent/{agent_initials}",
    path: {
      agent_initials: data.agentInitials,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Open Account
 * @param data The data for the request.
 * @param data.requestBody
 * @returns AccountResponse Successful Response
 * @throws ApiError
 */
export const openAccountApiV1AccountPost = (
  data: OpenAccountApiV1AccountPostData
): CancelablePromise<OpenAccountApiV1AccountPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/account",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Office Accounts
 * @returns AccountResponse Successful Response
 * @throws ApiError
 */
export const getOfficeAccountsApiV1OfficeMyOfficeAccountGet =
  (): CancelablePromise<GetOfficeAccountsApiV1OfficeMyOfficeAccountGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/office/myOffice/account",
    });
  };

/**
 * Get Agent Accounts
 * @param data The data for the request.
 * @param data.agentInitial
 * @returns AccountResponse Successful Response
 * @throws ApiError
 */
export const getAgentAccountsApiV1AgentAgentInitialAccountGet = (
  data: GetAgentAccountsApiV1AgentAgentInitialAccountGetData
): CancelablePromise<GetAgentAccountsApiV1AgentAgentInitialAccountGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/agent/{agent_initial}/account",
    path: {
      agent_initial: data.agentInitial,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Activity
 * @returns ActivityResponse Successful Response
 * @throws ApiError
 */
export const getActivityApiV1OfficeActivityGet = (): CancelablePromise<GetActivityApiV1OfficeActivityGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/activity",
  });
};

/**
 * Start Activity
 * @param data The data for the request.
 * @param data.requestBody
 * @returns ActivityResponse Successful Response
 * @throws ApiError
 */
export const startActivityApiV1OfficeActivityPost = (
  data: StartActivityApiV1OfficeActivityPostData
): CancelablePromise<StartActivityApiV1OfficeActivityPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/office/activity",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Office Transactions
 * get all transactions for an office
 * @returns TransactionItem Successful Response
 * @throws ApiError
 */
export const getOfficeTransactionsApiV1OfficeTransactionsGet =
  (): CancelablePromise<GetOfficeTransactionsApiV1OfficeTransactionsGetResponse> => {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/office/transactions",
    });
  };

/**
 * Get Office Transactions By Interval
 * get all transactions for an office
 * @param data The data for the request.
 * @param data.startDate
 * @param data.endDate
 * @returns unknown Successful Response
 * @throws ApiError
 */
export const getOfficeTransactionsByIntervalApiV1OfficeTransactionsIntervalGet = (
  data: GetOfficeTransactionsByIntervalApiV1OfficeTransactionsIntervalGetData = {}
): CancelablePromise<GetOfficeTransactionsByIntervalApiV1OfficeTransactionsIntervalGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/transactions/interval",
    query: {
      start_date: data.startDate,
      end_date: data.endDate,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Agent Transactions
 * get all transactions for an agent
 * @param data The data for the request.
 * @param data.initials
 * @param data.startDate
 * @param data.endDate
 * @returns unknown Successful Response
 * @throws ApiError
 */
export const getAgentTransactionsApiV1AgentInitialsTransactionsGet = (
  data: GetAgentTransactionsApiV1AgentInitialsTransactionsGetData
): CancelablePromise<GetAgentTransactionsApiV1AgentInitialsTransactionsGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/agent/{initials}/transactions",
    path: {
      initials: data.initials,
    },
    query: {
      start_date: data.startDate,
      end_date: data.endDate,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Request Transaction
 * request a transaction for approval, this will just created the transaction in the db
 * @param data The data for the request.
 * @param data.requestBody
 * @returns TransactionResponse Successful Response
 * @throws ApiError
 */
export const requestTransactionApiV1TransactionPost = (
  data: RequestTransactionApiV1TransactionPostData
): CancelablePromise<RequestTransactionApiV1TransactionPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/transaction",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Review Transaction
 * review a transaction request
 * @param data The data for the request.
 * @param data.transactionCode
 * @param data.requestBody
 * @returns TransactionResponse Successful Response
 * @throws ApiError
 */
export const reviewTransactionApiV1TransactionTransactionCodeReviewPost = (
  data: ReviewTransactionApiV1TransactionTransactionCodeReviewPostData
): CancelablePromise<ReviewTransactionApiV1TransactionTransactionCodeReviewPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/transaction/{transaction_code}/review",
    path: {
      transaction_code: data.transactionCode,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Office Transactions With Details
 * get all transactions for an office with details
 * @param data The data for the request.
 * @param data.code
 * @param data.trType
 * @returns unknown Successful Response
 * @throws ApiError
 */
export const getOfficeTransactionsWithDetailsApiV1TransactionCodeGet = (
  data: GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetData
): CancelablePromise<GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/transaction/{code}",
    path: {
      code: data.code,
    },
    query: {
      tr_type: data.trType,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Update Transaction
 * update a transaction
 * @param data The data for the request.
 * @param data.code
 * @param data.requestBody
 * @returns TransactionResponse Successful Response
 * @throws ApiError
 */
export const updateTransactionApiV1TransactionCodePut = (
  data: UpdateTransactionApiV1TransactionCodePutData
): CancelablePromise<UpdateTransactionApiV1TransactionCodePutResponse> => {
  return __request(OpenAPI, {
    method: "PUT",
    url: "/api/v1/transaction/{code}",
    path: {
      code: data.code,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Add Payment
 * add payment to a transaction
 * @param data The data for the request.
 * @param data.code
 * @param data.requestBody
 * @returns PaymentResponse Successful Response
 * @throws ApiError
 */
export const addPaymentApiV1TransactionCodePayPost = (
  data: AddPaymentApiV1TransactionCodePayPostData
): CancelablePromise<AddPaymentApiV1TransactionCodePayPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/transaction/{code}/pay",
    path: {
      code: data.code,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Cancel Transaction
 * @param data The data for the request.
 * @param data.code
 * @param data.requestBody
 * @returns TransactionResponse Successful Response
 * @throws ApiError
 */
export const cancelTransactionApiV1TransactionCodeCancelDelete = (
  data: CancelTransactionApiV1TransactionCodeCancelDeleteData
): CancelablePromise<CancelTransactionApiV1TransactionCodeCancelDeleteResponse> => {
  return __request(OpenAPI, {
    method: "DELETE",
    url: "/api/v1/transaction/{code}/cancel",
    path: {
      code: data.code,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Cancel Payment
 * @param data The data for the request.
 * @param data.id
 * @param data.requestBody
 * @returns PaymentResponse Successful Response
 * @throws ApiError
 */
export const cancelPaymentApiV1PaymentIdCancelPost = (
  data: CancelPaymentApiV1PaymentIdCancelPostData
): CancelablePromise<CancelPaymentApiV1PaymentIdCancelPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/payment/{id}/cancel",
    path: {
      id: data.id,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Group Pay
 * @param data The data for the request.
 * @param data.requestBody
 * @returns GroupPayResponse Successful Response
 * @throws ApiError
 */
export const groupPayApiV1GroupPayForexPost = (
  data: GroupPayApiV1GroupPayForexPostData
): CancelablePromise<GroupPayApiV1GroupPayForexPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/groupPay/forex",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Trade Wallet
 * Trade wallet
 * @param data The data for the request.
 * @param data.requestBody
 * @returns WalletTradingResponse Successful Response
 * @throws ApiError
 */
export const tradeWalletApiV1WalletPost = (
  data: TradeWalletApiV1WalletPostData
): CancelablePromise<TradeWalletApiV1WalletPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/wallet",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Wallet Tradings
 * Get wallet tradings
 * @param data The data for the request.
 * @param data.walletId
 * @returns WalletTradingResponse Successful Response
 * @throws ApiError
 */
export const getWalletTradingsApiV1WalletWalletIdTradingsGet = (
  data: GetWalletTradingsApiV1WalletWalletIdTradingsGetData
): CancelablePromise<GetWalletTradingsApiV1WalletWalletIdTradingsGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/wallet/{walletID}/tradings",
    path: {
      walletID: data.walletId,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Pay Trade
 * Pay trade
 * @param data The data for the request.
 * @param data.tradeCode
 * @param data.requestBody
 * @returns PaymentResponse Successful Response
 * @throws ApiError
 */
export const payTradeApiV1WalletTradeTradeIdPayPost = (
  data: PayTradeApiV1WalletTradeTradeIdPayPostData
): CancelablePromise<PayTradeApiV1WalletTradeTradeIdPayPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/wallet/trade/{tradeID}/pay",
    query: {
      trade_code: data.tradeCode,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Agent Tradings
 * Get agent tradings
 * @param data The data for the request.
 * @param data.initials
 * @param data.startDate
 * @param data.endDate
 * @returns WalletTradingResponse Successful Response
 * @throws ApiError
 */
export const getAgentTradingsApiV1OfficeAgentInitialsTradingsGet = (
  data: GetAgentTradingsApiV1OfficeAgentInitialsTradingsGetData
): CancelablePromise<GetAgentTradingsApiV1OfficeAgentInitialsTradingsGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1office/agent/{initials}/tradings",
    path: {
      initials: data.initials,
    },
    query: {
      start_date: data.startDate,
      end_date: data.endDate,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Commit Trade
 * Commit trade
 * @param data The data for the request.
 * @param data.tradeCode
 * @param data.requestBody
 * @returns WalletTradingResponse Successful Response
 * @throws ApiError
 */
export const commitTradeApiV1WalletTradeTradeCodeCommitPost = (
  data: CommitTradeApiV1WalletTradeTradeCodeCommitPostData
): CancelablePromise<CommitTradeApiV1WalletTradeTradeCodeCommitPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/wallet/trade/{trade_code}/commit",
    path: {
      trade_code: data.tradeCode,
    },
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Review Trade
 * Review Trade
 * @param data The data for the request.
 * @param data.requestBody
 * @returns WalletTradingResponse Successful Response
 * @throws ApiError
 */
export const reviewTradeApiV1TradeReviewPost = (
  data: ReviewTradeApiV1TradeReviewPostData
): CancelablePromise<ReviewTradeApiV1TradeReviewPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/trade/review",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Rollback
 * @param data The data for the request.
 * @param data.requestBody
 * @returns WalletTradingResponse Successful Response
 * @throws ApiError
 */
export const rollbackApiV1TradeRollbackPost = (
  data: RollbackApiV1TradeRollbackPostData
): CancelablePromise<RollbackApiV1TradeRollbackPostResponse> => {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/trade/rollback",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Update Trade
 * @param data The data for the request.
 * @param data.requestBody
 * @returns WalletTradingResponse Successful Response
 * @throws ApiError
 */
export const updateTradeApiV1TradeUpdatePatch = (
  data: UpdateTradeApiV1TradeUpdatePatchData
): CancelablePromise<UpdateTradeApiV1TradeUpdatePatchResponse> => {
  return __request(OpenAPI, {
    method: "PATCH",
    url: "/api/v1/trade/update",
    body: data.requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Monthly Report
 * @param data The data for the request.
 * @param data.startDate
 * @param data.endDate
 * @returns ReportResponse Successful Response
 * @throws ApiError
 */
export const getMonthlyReportApiV1OfficeMonthlyReportGet = (
  data: GetMonthlyReportApiV1OfficeMonthlyReportGetData = {}
): CancelablePromise<GetMonthlyReportApiV1OfficeMonthlyReportGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/monthly-report",
    query: {
      start_date: data.startDate,
      end_date: data.endDate,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Agent Yearly Reports
 * @param data The data for the request.
 * @param data.initials
 * @param data.year
 * @returns AccountMonthlyReport Successful Response
 * @throws ApiError
 */
export const getAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGet = (
  data: GetAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGetData
): CancelablePromise<GetAgentYearlyReportsApiV1OfficeAgentInitialsMonthlyReportGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/agent/{initials}/monthly-report",
    path: {
      initials: data.initials,
    },
    query: {
      year: data.year,
    },
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Get Agent Full Report
 * @param data The data for the request.
 * @param data.reportId
 * @returns AccountMonthlyReportResponse Successful Response
 * @throws ApiError
 */
export const getAgentFullReportApiV1OfficeAgentFullReportReportIdGet = (
  data: GetAgentFullReportApiV1OfficeAgentFullReportReportIdGetData
): CancelablePromise<GetAgentFullReportApiV1OfficeAgentFullReportReportIdGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/agent/fullReport/{report_id}",
    path: {
      report_id: data.reportId,
    },
    errors: {
      422: "Validation Error",
    },
  });
};
