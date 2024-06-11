// This file is auto-generated by @hey-api/openapi-ts

export type Body_create_office_api_v1_org_organization_office_post = {
  create_office: CreateOfficeRequest;
};

export type Body_create_organization_api_v1_org_organization_post = {
  create_org: CreateOrganizationRequest;
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

export type GetOrganizationsApiV1OrgOrganizationGetResponse = Array<OrganizationResponse>;

export type CreateOrganizationApiV1OrgOrganizationPostData = {
  requestBody: Body_create_organization_api_v1_org_organization_post;
};

export type CreateOrganizationApiV1OrgOrganizationPostResponse = OrganizationResponse;

export type GetOrgOfficesApiV1OrgOrganizationOfficeGetResponse = Array<OfficeResponse>;

export type CreateOfficeApiV1OrgOrganizationOfficePostData = {
  requestBody: Body_create_office_api_v1_org_organization_office_post;
};

export type CreateOfficeApiV1OrgOrganizationOfficePostResponse = OfficeResponse;

export type GetOfficeApiV1OrgOrganizationOfficeOfficeIdGetData = {
  officeId: string;
};

export type GetOfficeApiV1OrgOrganizationOfficeOfficeIdGetResponse = OfficeResponse;

export type GetEmployeesApiV1OrgOfficeEmployeeGetResponse = Array<EmployeeResponse>;

export type CreateEmployeeApiV1OrgOfficeEmployeePostData = {
  requestBody: CreateEmployeeRequest;
};

export type CreateEmployeeApiV1OrgOfficeEmployeePostResponse = EmployeeResponse;

export type GetOfficeEmployeesApiV1OrgOfficeOfficeIdEmployeeGetData = {
  officeId: string;
};

export type GetOfficeEmployeesApiV1OrgOfficeOfficeIdEmployeeGetResponse = Array<EmployeeResponse>;

export type GetEmployeeApiV1OrgOfficeEmployeeMeGetResponse = EmployeeResponse;

export type UpdateEmployeeApiV1OrgOfficeEmployeeEmployeeIdAssignPutData = {
  employeeId: string;
  requestBody: EmployeeResponse;
};

export type UpdateEmployeeApiV1OrgOfficeEmployeeEmployeeIdAssignPutResponse = EmployeeResponse;

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
  "/api/v1/org/organization": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<OrganizationResponse>;
      };
    };
    post: {
      req: CreateOrganizationApiV1OrgOrganizationPostData;
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
  "/api/v1/org/organization/office": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<OfficeResponse>;
      };
    };
    post: {
      req: CreateOfficeApiV1OrgOrganizationOfficePostData;
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
  "/api/v1/org/organization/office/{office_id}": {
    get: {
      req: GetOfficeApiV1OrgOrganizationOfficeOfficeIdGetData;
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
  "/api/v1/org/office/employee": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: Array<EmployeeResponse>;
      };
    };
    post: {
      req: CreateEmployeeApiV1OrgOfficeEmployeePostData;
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
  "/api/v1/org/office/{office_id}/employee": {
    get: {
      req: GetOfficeEmployeesApiV1OrgOfficeOfficeIdEmployeeGetData;
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
  "/api/v1/org/office/employee/me": {
    get: {
      res: {
        /**
         * Successful Response
         */
        200: EmployeeResponse;
      };
    };
  };
  "/api/v1/org/office/employee/{employee_id}/assign": {
    put: {
      req: UpdateEmployeeApiV1OrgOfficeEmployeeEmployeeIdAssignPutData;
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
};
