// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";
import type {
  PingApiV1PingGetResponse,
  GetVersionApiV1VersionGetResponse,
  GetOrganizationsApiV1OrganizationGetResponse,
  CreateOrganizationApiV1OrganizationPostData,
  CreateOrganizationApiV1OrganizationPostResponse,
  GetMyOrganizationApiV1OrganizationMeGetResponse,
  GetOrgOfficesApiV1OrganizationOfficeGetResponse,
  CreateOfficeApiV1OrganizationOfficePostData,
  CreateOfficeApiV1OrganizationOfficePostResponse,
  GetOfficeApiV1OrganizationOfficeOfficeIdGetData,
  GetOfficeApiV1OrganizationOfficeOfficeIdGetResponse,
  GetEmployeesApiV1OfficeEmployeeGetResponse,
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
  GetOfficeAccountsApiV1OfficeOfficeIdAccountGetData,
  GetOfficeAccountsApiV1OfficeOfficeIdAccountGetResponse,
  GetAgentAccountsApiV1AgentAgentInitialAccountGetData,
  GetAgentAccountsApiV1AgentAgentInitialAccountGetResponse,
  GetActivityApiV1OfficeActivityGetResponse,
  StartActivityApiV1OfficeActivityPostData,
  StartActivityApiV1OfficeActivityPostResponse,
  GetAgentTransactionsApiV1AgentInitialsTransactionsGetData,
  GetAgentTransactionsApiV1AgentInitialsTransactionsGetResponse,
  RequestTransactionApiV1TransactionPostData,
  RequestTransactionApiV1TransactionPostResponse,
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
 * Get Version
 * @returns unknown Successful Response
 * @throws ApiError
 */
export const getVersionApiV1VersionGet = (): CancelablePromise<GetVersionApiV1VersionGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/version",
  });
};

/**
 * Get Organizations
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
 * create_office: The request payload containing the details of the office to be created.
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
 * @param data The data for the request.
 * @param data.officeId
 * @returns AccountResponse Successful Response
 * @throws ApiError
 */
export const getOfficeAccountsApiV1OfficeOfficeIdAccountGet = (
  data: GetOfficeAccountsApiV1OfficeOfficeIdAccountGetData
): CancelablePromise<GetOfficeAccountsApiV1OfficeOfficeIdAccountGetResponse> => {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/office/{office_id}account",
    path: {
      office_id: data.officeId,
    },
    errors: {
      422: "Validation Error",
    },
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
 * Get Agent Transactions
 * @param data The data for the request.
 * @param data.initials
 * @returns TransactionResponse Successful Response
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
    errors: {
      422: "Validation Error",
    },
  });
};

/**
 * Request Transaction
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
