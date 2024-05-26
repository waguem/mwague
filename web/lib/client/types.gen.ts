// This file is auto-generated by @hey-api/openapi-ts

export type Body_create_organization_api_v1_org_organization_post = {
  create_org: CreateOrganizationRequest;
};

export type CreateOrganizationRequest = {
  initials: string;
  org_name: string;
};

export type HTTPValidationError = {
  detail?: Array<ValidationError>;
};

export type OrganizationResponse = {
  initials: string;
  org_name: string;
};

export type ValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

export type PingApiV1PingGetResponse = unknown;

export type GetVersionApiV1VersionGetResponse = unknown;

export type RootApiV1AuthSecureGetResponse = unknown;

export type GetOrganizationsApiV1OrgOrganizationGetResponse = Array<OrganizationResponse>;

export type CreateOrganizationApiV1OrgOrganizationPostData = {
  requestBody: Body_create_organization_api_v1_org_organization_post;
};

export type CreateOrganizationApiV1OrgOrganizationPostResponse = OrganizationResponse;

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
  "/api/v1/auth/secure": {
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
};
