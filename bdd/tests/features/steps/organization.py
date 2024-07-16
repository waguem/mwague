# pylint: disable=missing-module-docstring
import json
from behave import given, when, then  # pylint: disable=no-name-in-module
import client as api_client
from client.rest import ApiException
from client.exceptions import BadRequestException
from tests.tools import oidc, types
from loguru import logger
from tests.tools import database


@given('logged user has role "{user_role}"')
def logged_user_has_role(context, user_role):
    """logged user has role"""
    assert hasattr(context, "logged_user")
    assert context.logged_user is not None
    logged_user = context.logged_user
    assert user_role in logged_user.roles


@when('I create an organization with name "{org_name}" and initials "{initials}"')
def create_organization_step(context, org_name, initials):
    """create an organization"""
    context.org_name = org_name
    context.initials = initials
    with api_client.ApiClient(context.config) as api:
        org_api = api_client.OrganizationApi(api)

        request = api_client.BodyCreateOrganizationApiV1OrganizationPost(
            create_org=api_client.CreateOrganizationRequest(initials=initials, org_name=org_name)
        )
        context.request = request
        try:
            response: api_client.OrganizationResponse = (
                org_api.create_organization_api_v1_organization_post(
                    body_create_organization_api_v1_organization_post=request
                )
            )
            context.response = response
            context.error = None
        except ApiException as e:
            logger.error(f"{e}")
            context.response = e


@then("I should get a response with the created organization")
def create_organization_response(context):
    """verification"""

    assert context.response is not None
    if isinstance(context.response, BadRequestException):
        #
        response = context.response
        error = json.loads(response.body)
        assert error["error_code"] == 5
        assert error["message"] == f"Organization {context.initials} already exists"


############################################################################################################
#
# Scenario Outline: Create Offices
#         Background: Background name
#             Given I have a backend server
#             When I login with username "amadou" and password "amadou"
#             Then I should get an access token
#         Given logged user has role "org_admin"
#         When I create an office with name "<office_name>" and initials "<initials>" at country "<country>"
#         Then I should get a response with the created office
#         Examples:
#             | office_name | initials | country      |
############################################################################################################


@when(
    'I create an office with name "{office_name}" and initials "{initials}" at country "{country}"'
)
def create_office_step(context, office_name, initials, country):
    """create an office"""
    with api_client.ApiClient(context.config) as api:
        office_api = api_client.OfficeApi(api)
        request = api_client.BodyCreateOfficeApiV1OrganizationOfficePost(
            create_office=api_client.CreateOfficeRequest(
                country=country, initials=initials, name=office_name, default_rates=[]
            )
        )
        context.request = request
        try:
            response: api_client.OfficeResponse = (
                office_api.create_office_api_v1_organization_office_post(
                    body_create_office_api_v1_organization_office_post=request
                )
            )
            context.response = response
            context.error = None
        except ApiException as e:
            context.response = e


@then("I should get a response with the created office")
def created_office_response(ctx):
    """response"""
    assert ctx.response is not None

    if isinstance(ctx.response, BadRequestException):
        error = json.loads(ctx.response.body)
        assert error["message"] == f"Office {ctx.request.create_office.initials} already exists"
    elif isinstance(ctx.response, api_client.OfficeResponse):
        response: api_client.OfficeResponse = ctx.response
        assert response.initials == ctx.request.create_office.initials
        assert response.country == ctx.request.create_office.country
        assert response.name == ctx.request.create_office.name


############################################################################################################
#  Scenario Outline: Create employees
#         Background: Background name
#             Given I have a backend server
#             When I login with username "amadou" and password "amadou"
#             Then I should get an access token

#         Given logged user has role "org_admin"
#         When I create an employee with employee "<data>" at office "<office>"
#         Then I should get a response with the created employee
#         Then the employee should be able to login and get an access token
#         Examples:
#             | data                                                                                                                                  | office_initials       |
#             | {"username":"wagueAdmin","email":"wagueadmin@gmail.com","password":"waguepass","roles":["office_admin"]}                              | WGO                   |
############################################################################################################


@when('I create an employee with employee "{data}" at office "{office_initials}"')
def create_employee_step(ctx, data, office_initials):
    user = json.loads(data)
    ctx.user_data = user
    ctx.office = database.get_office(office_initials)
    with api_client.ApiClient(ctx.config) as api:
        employee_api = api_client.EmployeeApi(api)
        request = api_client.CreateEmployeeRequest(
            username=user["username"],
            email=user["email"],
            password=user["password"],
            roles=user["roles"],
            office_id=str(ctx.office.id),
        )

        ctx.request = request
        try:
            response: api_client.EmployeeResponse = (
                employee_api.create_employee_api_v1_office_employee_post(
                    create_employee_request=request
                )
            )
            ctx.response = response
            ctx.error = None
        except ApiException as e:
            ctx.response = e


@then("I should get a response with the created employee")
def created_employee_response(ctx):
    assert ctx.response is not None
    if isinstance(ctx.response, BadRequestException):
        error = json.loads(ctx.response.body)
        assert error["message"] == f"Username {ctx.request.username} already exists"
    elif isinstance(ctx.response, api_client.EmployeeResponse):
        response: api_client.EmployeeResponse = ctx.response
        assert response.username == ctx.request.username
        assert response.email == ctx.request.email
        assert response.roles == ctx.request.roles
        assert response.office_id is not None
        assert response.organization_id is not None


@then("I should be able to setup the account fully")
def setup_user_account(ctx):
    oidc.fully_setup_account(
        username=ctx.user_data["username"],
        last_name=ctx.user_data["first_name"],
        first_name=ctx.user_data["last_name"],
    )


@then("the employee should be able to login and get an access token")
def employee_login(ctx):
    token: dict = oidc.get_access_token(ctx.user_data["username"], ctx.user_data["password"])
    logged_user: types.KcUser = oidc.decode_access_token(token["access_token"])
    assert logged_user is not None
    assert logged_user.email == ctx.user_data["email"]
    assert logged_user.roles == ctx.user_data["roles"]
    assert logged_user.id is not None


############################################################################################################
# Scenario Outline: Create Office Accounts
#         Background: Background name
#             Given I have a backend server

#         Given I am logged with user <username> and password <password>
#         And I have <role> role
#         When I create an office account in my office with data "<data>"
#         Then I should get a response with the created office account
#         Examples:
#             | username     | password  | role         | data                                                                      |
#             | wagueAdmin   | waguepass | office_admin | {"type":"FUND"   ,currency:"USD",initials:"WGF",owner_initals:"WGO"}      |
############################################################################################################


@given("I am logged with user {username} and password {password}")
def login_user(ctx, username, password):
    """authenticate the user"""
    token: dict = oidc.get_access_token(username, password)
    ctx.logged_user = oidc.decode_access_token(token["access_token"])
    ctx.config.access_token = token["access_token"]
    assert ctx.logged_user is not None


@given("I have {role} role")
def user_has_role(ctx, role):
    """check that user has a role"""
    assert hasattr(ctx, "logged_user")
    assert ctx.logged_user is not None
    assert role in ctx.logged_user.roles


@when("I create an office account in my office with data {data}")
def create_office_account(ctx, data):
    """create an office account"""
    account = json.loads(data)
    ctx.account_data = account
    with api_client.ApiClient(ctx.config) as api:
        account_api = api_client.AccountApi(api)
        request = api_client.CreateAccountRequest(
            currency=account["currency"],
            initials=account["initials"],
            owner_initials=account["owner_initials"],
            type=account["type"],
        )
        ctx.request = request
        try:
            response: api_client.AccountResponse = account_api.open_account_api_v1_account_post(
                create_account_request=request
            )
            ctx.response = response
            ctx.error = None
        except ApiException as e:
            ctx.response = e


@then("I should get a response with the created account")
def created_office_account_response(ctx):
    assert ctx.response is not None
    if isinstance(ctx.response, BadRequestException):
        error = json.loads(ctx.response.body)
        assert error["message"].startswith(f"Account with initials {ctx.request.initials}")
    elif isinstance(ctx.response, api_client.AccountResponse):
        response: api_client.AccountResponse = ctx.response
        assert response.currency == ctx.request.currency
        assert response.initials == ctx.request.initials
        assert response.type == ctx.request.type
        assert response.office_id is not None
        assert response.balance == 0


############################################################################################################
#     @create_agent
#     Scenario Outline: Create Office Agents
#         Background: Background name
#             Given I have a backend server


#         Given I am logged with user <username> and password <password>
#         And I have <role> role
#         When I create an agent in my office with data <data>
#         Then I should get a response with the created agent
#         Examples:
#             | username     | password  | role         | data                                                                                                    |
#             | wagueAdmin   | waguepass | office_admin | {"name":"Guanzu","initials":"GZ","email":"guanzu@gmail.com","phone":"+91565894","country":"Senegal"}    |
############################################################################################################
@when("I create an agent in my office with data {data}")
def create_agent(ctx, data):
    """create an agent"""
    agent = json.loads(data)
    ctx.agent_data = agent
    with api_client.ApiClient(ctx.config) as api:
        agent_api = api_client.AgentApi(api)
        request = api_client.CreateAgentRequest(
            country=agent["country"],
            email=agent["email"],
            initials=agent["initials"],
            name=agent["name"],
            type=api_client.AgentType.AGENT,
            phone=agent["phone"],
        )
        ctx.request = request
        try:
            response: api_client.AgentResponse = agent_api.create_agent_api_v1_office_agent_post(
                create_agent_request=request
            )
            ctx.response = response
            ctx.error = None
        except ApiException as e:
            ctx.response = e


@then("I should get a response with the created agent")
def created_agent_response(ctx):
    assert ctx.response is not None
    if isinstance(ctx.response, BadRequestException):
        error = json.loads(ctx.response.body)
        assert error["message"].startswith(f"Agent with initials {ctx.request.initials}")
    elif isinstance(ctx.response, api_client.AgentResponse):
        response: api_client.AgentResponse = ctx.response
        assert response.country == ctx.request.country
        assert response.email == ctx.request.email
        assert response.initials == ctx.request.initials
        assert response.name == ctx.request.name
        assert response.phone == ctx.request.phone
        assert response.type == ctx.request.type

    oidc.clear_sessions(ctx.logged_user.id)
