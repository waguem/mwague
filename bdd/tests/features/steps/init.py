from behave import given, when, then
from tests.tools import database
from tests.tools import oidc
from loguru import logger

#######################
# Feature: Create First User
#     Scenario: Create Soft
#         Given I have a backend server
#         Then I create a user with username "softadmin" with email "softadmin@gmail.com" and password "ChangeMe#1" and roles "soft_admin,office_admin,org_admin"
#         Then I should be able to login with username "softadmin" and password "ChangeMe#1"
#         Then I should get an access token
#         Then I logout
#######################


@given(
    'I create a user with username "{username}" with email "{email}" and password "{password}" and roles "{roles}"'
)
def create_first_user(context, username, email, password, roles):
    context.username = username
    context.password = password
    database.create_root_org()
    database.create_root_office()
    roles = roles.split(",")
    org, office, user = database.create_first_user(username=username, email=email, roles=roles)

    # remove user if exists
    try:
        oidc.cleanup_users()
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        pass

    try:
        user_id = oidc.create_user(
            email=email,
            email_verified=True,
            password=password,
            enabled=True,
            office_id=str(office.id),
            org_id=str(org.id),
            temporary=False,
            username=username,
        )

    except Exception as e:
        # get user id
        user_id = oidc.oidc_admin.get_user_id(username)
        logger.error(f"Error creating user: {e}")
    # define soft admin roles
    logger.info(f"User id: {user_id}")
    logger.info(f"Assigning roles to user: {roles}")
    realm_roles = oidc.oidc_admin.get_realm_roles()
    oidc.oidc_admin.assign_realm_roles(user_id, realm_roles)
    oidc.fully_setup_account(username=username, first_name="Soft", last_name="Admin")
