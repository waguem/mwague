// This file is auto-generated by @hey-api/openapi-ts

export const $AccountResponse = {
  properties: {
    type: {
      $ref: "#/components/schemas/AccountType",
    },
    currency: {
      $ref: "#/components/schemas/Currency",
    },
    initials: {
      type: "string",
      maxLength: 4,
      title: "Initials",
    },
    balance: {
      type: "number",
      title: "Balance",
    },
    is_open: {
      type: "boolean",
      title: "Is Open",
    },
    version: {
      type: "integer",
      title: "Version",
    },
    created_by: {
      type: "string",
      format: "uuid",
      title: "Created By",
    },
    office_id: {
      type: "string",
      format: "uuid",
      title: "Office Id",
    },
  },
  type: "object",
  required: ["type", "currency", "initials", "balance", "is_open", "version"],
  title: "AccountResponse",
} as const;

export const $AccountType = {
  enum: ["AGENT", "SUPPLIER", "OFFICE", "FUND"],
  title: "AccountType",
  description: "An enumeration.",
} as const;

export const $ActivityResponse = {
  properties: {
    started_at: {
      type: "string",
      format: "date",
      title: "Started At",
    },
    state: {
      $ref: "#/components/schemas/ActivityState",
    },
    openning_fund: {
      type: "number",
      title: "Openning Fund",
    },
    closing_fund: {
      type: "number",
      title: "Closing Fund",
    },
    openning_rate: {
      type: "object",
      title: "Openning Rate",
    },
    closing_rate: {
      type: "object",
      title: "Closing Rate",
    },
  },
  type: "object",
  required: ["started_at", "state", "openning_fund"],
  title: "ActivityResponse",
} as const;

export const $ActivityState = {
  enum: ["OPEN", "CLOSED", "PAUSED"],
  title: "ActivityState",
  description: "An enumeration.",
} as const;

export const $AgentReponseWithAccounts = {
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
    initials: {
      type: "string",
      maxLength: 4,
      title: "Initials",
      nullable: false,
      unique: true,
    },
    email: {
      type: "string",
      maxLength: 128,
      title: "Email",
      nullable: false,
      unique: true,
    },
    phone: {
      type: "string",
      maxLength: 16,
      title: "Phone",
      nullable: false,
    },
    country: {
      type: "string",
      maxLength: 64,
      title: "Country",
      nullable: false,
    },
    type: {
      $ref: "#/components/schemas/AgentType",
    },
    accounts: {
      items: {
        $ref: "#/components/schemas/AccountResponse",
      },
      type: "array",
      title: "Accounts",
      default: [],
    },
  },
  type: "object",
  required: ["name", "initials", "email", "phone", "country", "type"],
  title: "AgentReponseWithAccounts",
} as const;

export const $AgentResponse = {
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
    initials: {
      type: "string",
      maxLength: 4,
      title: "Initials",
      nullable: false,
      unique: true,
    },
    email: {
      type: "string",
      maxLength: 128,
      title: "Email",
      nullable: false,
      unique: true,
    },
    phone: {
      type: "string",
      maxLength: 16,
      title: "Phone",
      nullable: false,
    },
    country: {
      type: "string",
      maxLength: 64,
      title: "Country",
      nullable: false,
    },
    type: {
      $ref: "#/components/schemas/AgentType",
    },
  },
  type: "object",
  required: ["name", "initials", "email", "phone", "country", "type"],
  title: "AgentResponse",
} as const;

export const $AgentType = {
  enum: ["AGENT", "SUPPLIER"],
  title: "AgentType",
  description: "An enumeration.",
} as const;

export const $Amount = {
  properties: {
    amount: {
      type: "number",
      minimum: 0,
      title: "Amount",
      strict: true,
    },
    rate: {
      type: "number",
      minimum: 0,
      title: "Rate",
      strict: true,
    },
  },
  type: "object",
  required: ["amount", "rate"],
  title: "Amount",
} as const;

export const $Body_create_office_api_v1_organization_office_post = {
  properties: {
    create_office: {
      $ref: "#/components/schemas/CreateOfficeRequest",
    },
  },
  type: "object",
  required: ["create_office"],
  title: "Body_create_office_api_v1_organization_office_post",
} as const;

export const $Body_create_organization_api_v1_organization_post = {
  properties: {
    create_org: {
      $ref: "#/components/schemas/CreateOrganizationRequest",
    },
  },
  type: "object",
  required: ["create_org"],
  title: "Body_create_organization_api_v1_organization_post",
} as const;

export const $CreateAccountRequest = {
  properties: {
    type: {
      $ref: "#/components/schemas/AccountType",
    },
    currency: {
      $ref: "#/components/schemas/Currency",
    },
    initials: {
      type: "string",
      maxLength: 4,
      title: "Initials",
    },
    balance: {
      type: "number",
      title: "Balance",
      default: 0,
      nullable: true,
    },
    owner_initials: {
      type: "string",
      title: "Owner Initials",
    },
  },
  type: "object",
  required: ["type", "currency", "initials", "owner_initials"],
  title: "CreateAccountRequest",
} as const;

export const $CreateActivityRequest = {
  properties: {
    rates: {
      items: {
        $ref: "#/components/schemas/Rate",
      },
      type: "array",
      title: "Rates",
    },
  },
  type: "object",
  required: ["rates"],
  title: "CreateActivityRequest",
} as const;

export const $CreateAgentRequest = {
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
    initials: {
      type: "string",
      maxLength: 4,
      title: "Initials",
      nullable: false,
      unique: true,
    },
    email: {
      type: "string",
      maxLength: 128,
      title: "Email",
      nullable: false,
      unique: true,
    },
    phone: {
      type: "string",
      maxLength: 16,
      title: "Phone",
      nullable: false,
    },
    country: {
      type: "string",
      maxLength: 64,
      title: "Country",
      nullable: false,
    },
    type: {
      $ref: "#/components/schemas/AgentType",
    },
    office_id: {
      type: "string",
      format: "uuid",
      title: "Office Id",
    },
  },
  type: "object",
  required: ["name", "initials", "email", "phone", "country", "type"],
  title: "CreateAgentRequest",
} as const;

export const $CreateEmployeeRequest = {
  properties: {
    email: {
      type: "string",
      maxLength: 128,
      title: "Email",
      nullable: false,
      unique: true,
    },
    username: {
      type: "string",
      maxLength: 128,
      title: "Username",
      nullable: false,
      unique: true,
    },
    office_id: {
      type: "string",
      format: "uuid",
      title: "Office Id",
    },
    roles: {
      items: {
        type: "string",
      },
      type: "array",
      title: "Roles",
    },
    password: {
      type: "string",
      title: "Password",
    },
  },
  type: "object",
  required: ["email", "username", "office_id", "roles", "password"],
  title: "CreateEmployeeRequest",
} as const;

export const $CreateOfficeRequest = {
  properties: {
    country: {
      type: "string",
      maxLength: 64,
      title: "Country",
      nullable: false,
    },
    initials: {
      type: "string",
      maxLength: 8,
      title: "Initials",
      nullable: false,
      unique: true,
    },
    name: {
      type: "string",
      maxLength: 64,
      title: "Name",
      nullable: false,
    },
  },
  type: "object",
  required: ["country", "initials", "name"],
  title: "CreateOfficeRequest",
} as const;

export const $CreateOrganizationRequest = {
  properties: {
    initials: {
      type: "string",
      maxLength: 8,
      title: "Initials",
      nullable: false,
      unique: true,
    },
    org_name: {
      type: "string",
      maxLength: 64,
      title: "Org Name",
      nullable: false,
    },
  },
  type: "object",
  required: ["initials", "org_name"],
  title: "CreateOrganizationRequest",
} as const;

export const $Currency = {
  enum: ["USD", "EUR", "AED", "CFA", "GNF", "RMB"],
  title: "Currency",
  description: "An enumeration.",
} as const;

export const $DepositRequest = {
  properties: {
    type: {
      type: "string",
      enum: ["DEPOSIT"],
      title: "Type",
    },
    receiver: {
      type: "string",
      title: "Receiver",
    },
  },
  type: "object",
  required: ["type", "receiver"],
  title: "DepositRequest",
} as const;

export const $EmployeeResponse = {
  properties: {
    email: {
      type: "string",
      maxLength: 128,
      title: "Email",
      nullable: false,
      unique: true,
    },
    username: {
      type: "string",
      maxLength: 128,
      title: "Username",
      nullable: false,
      unique: true,
    },
    id: {
      type: "string",
      format: "uuid",
      title: "Id",
    },
    office_id: {
      type: "string",
      format: "uuid",
      title: "Office Id",
    },
    organization_id: {
      type: "string",
      format: "uuid",
      title: "Organization Id",
    },
    roles: {
      items: {
        type: "string",
      },
      type: "array",
      title: "Roles",
    },
  },
  type: "object",
  required: ["email", "username", "id", "office_id", "organization_id", "roles"],
  title: "EmployeeResponse",
} as const;

export const $EmployeeResponseComplete = {
  properties: {
    email: {
      type: "string",
      maxLength: 128,
      title: "Email",
      nullable: false,
      unique: true,
    },
    username: {
      type: "string",
      maxLength: 128,
      title: "Username",
      nullable: false,
      unique: true,
    },
    id: {
      type: "string",
      format: "uuid",
      title: "Id",
    },
    office_id: {
      type: "string",
      format: "uuid",
      title: "Office Id",
    },
    organization_id: {
      type: "string",
      format: "uuid",
      title: "Organization Id",
    },
    roles: {
      items: {
        type: "string",
      },
      type: "array",
      title: "Roles",
    },
    office: {
      $ref: "#/components/schemas/OfficeResponse",
    },
  },
  type: "object",
  required: ["email", "username", "id", "office_id", "organization_id", "roles", "office"],
  title: "EmployeeResponseComplete",
} as const;

export const $HTTPValidationError = {
  properties: {
    detail: {
      items: {
        $ref: "#/components/schemas/ValidationError",
      },
      type: "array",
      title: "Detail",
    },
  },
  type: "object",
  title: "HTTPValidationError",
} as const;

export const $InternalRequest = {
  properties: {
    type: {
      type: "string",
      enum: ["INTERNAL"],
      title: "Type",
    },
    sender: {
      type: "string",
      title: "Sender",
    },
    receiver: {
      type: "string",
      title: "Receiver",
    },
  },
  type: "object",
  required: ["type", "sender", "receiver"],
  title: "InternalRequest",
} as const;

export const $OfficeResponse = {
  properties: {
    country: {
      type: "string",
      maxLength: 64,
      title: "Country",
      nullable: false,
    },
    initials: {
      type: "string",
      maxLength: 8,
      title: "Initials",
      nullable: false,
      unique: true,
    },
    name: {
      type: "string",
      maxLength: 64,
      title: "Name",
      nullable: false,
    },
    id: {
      type: "string",
      format: "uuid",
      title: "Id",
    },
    currencies: {
      anyOf: [
        {
          type: "object",
        },
        {
          items: {
            type: "object",
          },
          type: "array",
        },
      ],
      title: "Currencies",
    },
  },
  type: "object",
  required: ["country", "initials", "name", "id"],
  title: "OfficeResponse",
} as const;

export const $OrganizationResponse = {
  properties: {
    initials: {
      type: "string",
      maxLength: 8,
      title: "Initials",
      nullable: false,
      unique: true,
    },
    org_name: {
      type: "string",
      maxLength: 64,
      title: "Org Name",
      nullable: false,
    },
    id: {
      type: "string",
      format: "uuid",
      title: "Id",
    },
  },
  type: "object",
  required: ["initials", "org_name", "id"],
  title: "OrganizationResponse",
} as const;

export const $Rate = {
  properties: {
    currency: {
      type: "string",
      title: "Currency",
    },
    rate: {
      type: "number",
      exclusiveMinimum: 0,
      title: "Rate",
      strict: true,
    },
  },
  type: "object",
  required: ["currency", "rate"],
  title: "Rate",
} as const;

export const $TransactionRequest = {
  properties: {
    currency: {
      $ref: "#/components/schemas/Currency",
    },
    amount: {
      $ref: "#/components/schemas/Amount",
    },
    charges: {
      $ref: "#/components/schemas/Amount",
    },
    data: {
      oneOf: [
        {
          $ref: "#/components/schemas/InternalRequest",
        },
        {
          $ref: "#/components/schemas/DepositRequest",
        },
      ],
      title: "Data",
      discriminator: {
        propertyName: "type",
        mapping: {
          INTERNAL: "#/components/schemas/InternalRequest",
          DEPOSIT: "#/components/schemas/DepositRequest",
        },
      },
    },
  },
  type: "object",
  required: ["currency", "amount", "data"],
  title: "TransactionRequest",
} as const;

export const $TransactionResponse = {
  properties: {
    amount: {
      type: "number",
      minimum: 0,
      title: "Amount",
      strict: true,
    },
    rate: {
      type: "number",
      exclusiveMinimum: 0,
      title: "Rate",
      strict: true,
    },
    code: {
      type: "string",
      maxLength: 16,
      title: "Code",
    },
    state: {
      $ref: "#/components/schemas/TransactionState",
    },
    type: {
      $ref: "#/components/schemas/TransactionType",
    },
    created_at: {
      type: "string",
      format: "date-time",
      title: "Created At",
    },
  },
  type: "object",
  required: ["amount", "rate", "code", "state", "type"],
  title: "TransactionResponse",
} as const;

export const $TransactionState = {
  enum: ["REVIEW", "PENDING", "PAID", "CANCELLED"],
  title: "TransactionState",
  description: "An enumeration.",
} as const;

export const $TransactionType = {
  enum: ["DEPOSIT", "INTERNAL"],
  title: "TransactionType",
  description: "An enumeration.",
} as const;

export const $ValidationError = {
  properties: {
    loc: {
      items: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "integer",
          },
        ],
      },
      type: "array",
      title: "Location",
    },
    msg: {
      type: "string",
      title: "Message",
    },
    type: {
      type: "string",
      title: "Error Type",
    },
  },
  type: "object",
  required: ["loc", "msg", "type"],
  title: "ValidationError",
} as const;
