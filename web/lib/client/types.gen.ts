// This file is auto-generated by @hey-api/openapi-ts

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

export type AgentResponse = {
  name: string;
  initials: string;
  email: string;
  phone: string;
  country: string;
  type: AgentType;
};

/**
 * An enumeration.
 */
export type AgentType = "AGENT" | "SUPPLIER";

export type Body_create_office_api_v1_organization_office_post = {
  create_office: CreateOfficeRequest;
};

export type Body_create_organization_api_v1_organization_post = {
  create_org: CreateOrganizationRequest;
};

export type CreateAccountRequest = {
  type: AccountType;
  currency: Currency;
  initials: string;
  balance?: number | null;
  owner_initials: string;
};

export type CreateAgentRequest = {
  name: string;
  initials: string;
  email: string;
  phone: string;
  country: string;
  type: AgentType;
  office_id?: string;
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
};

export type CreateOrganizationRequest = {
  initials: string;
  org_name: string;
};

/**
 * An enumeration.
 */
export type Currency = "USD" | "EUR" | "AED" | "CFA" | "GNF" | "RMB";

export type EmployeeResponse = {
  email: string;
  username: string;
  id: string;
  office_id: string;
  organization_id: string;
  roles: Array<string>;
};

export type HTTPValidationError = {
  detail?: Array<ValidationError>;
};

export type OfficeResponse = {
  country: string;
  initials: string;
  name: string;
  id: string;
};

export type OrganizationResponse = {
  initials: string;
  org_name: string;
  id: string;
};

export type ValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

export type PingApiV1PingGetResponse = unknown;

export type GetVersionApiV1VersionGetResponse = unknown;

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

export type GetOfficeApiV1OrganizationOfficeOfficeIdGetData = {
  officeId: string;
};

export type GetOfficeApiV1OrganizationOfficeOfficeIdGetResponse = OfficeResponse;

export type GetEmployeesApiV1OfficeEmployeeGetResponse = Array<EmployeeResponse>;

export type CreateEmployeeApiV1OfficeEmployeePostData = {
  requestBody: CreateEmployeeRequest;
};

export type CreateEmployeeApiV1OfficeEmployeePostResponse = EmployeeResponse;

export type GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetData = {
  officeId: string;
};

export type GetOfficeEmployeesApiV1OfficeOfficeIdEmployeeGetResponse = Array<EmployeeResponse>;

export type GetEmployeeApiV1OfficeEmployeeMeGetResponse = EmployeeResponse;

export type UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutData = {
  employeeId: string;
  requestBody: EmployeeResponse;
};

export type UpdateEmployeeApiV1OfficeEmployeeEmployeeIdAssignPutResponse = EmployeeResponse;

export type GetAgentsApiV1OfficeAgentGetResponse = unknown;

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

export type GetOfficeAccountsApiV1AccountGetResponse = unknown;

export type OpenAccountApiV1AccountPostData = {
  requestBody: CreateAccountRequest;
};

export type OpenAccountApiV1AccountPostResponse = AccountResponse;

export type GetAgentAccountsApiV1AgentAgentInitialAccountGetData = {
  agentInitial: string;
};

export type GetAgentAccountsApiV1AgentAgentInitialAccountGetResponse = Array<AccountResponse>;

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
  "/api/v1/version": {
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
        200: EmployeeResponse;
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
        200: unknown;
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
    get: {
      res: {
        /**
         * Successful Response
         */
        200: unknown;
      };
    };
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
};
