import json

from loguru import logger
from mkdi_backend.authproviders import KeycloakAdminHelper
from mkdi_backend.config import settings
from mkdi_backend.repositories import employee
from mkdi_backend.repositories import office as of_repo
from mkdi_backend.repositories import organisation
from mkdi_shared.exceptions.mkdi_api_error import MkdiError
from mkdi_shared.schemas import protocol
from sqlmodel import Session


def seed_orgs(db: Session, orgs: list[dict]):
    """
    Seed the database with organisations
    this will work only if the DEBUG_USE_SEED_DATA setting is set to True
    and the ENV setting is not set to production

    Raises:
        ValueError: Error
    """
    kc_admin = KeycloakAdminHelper()
    org_repo = organisation.OrganizationRepository(db)
    realm_roles = kc_admin.get_kc_admin().get_realm_roles()
    for org in orgs:
        org_db = None
        try:
            org_db = org_repo.create_organization(input=protocol.CreateOrganizationRequest(**org))
        except MkdiError as error:
            org_db = org_repo.get_by_initials(org["initials"])
        except Exception as error:
            logger.error(f"Failed to create organisation {error}")

        for office in org["offices"]:
            office_db = None
            try:
                office_db = of_repo.OfficeRepository(db).create(
                    input=protocol.CreateOfficeRequest(**office), organization_id=org_db.id
                )
            except MkdiError as error:
                office_db = of_repo.OfficeRepository(db).get_by_initials(office["initials"])

            for user in office["users"]:
                user_db = None
                user["org_id"] = org_db.id
                user["office_id"] = office_db.id
                try:
                    user_db = employee.EmployeeRepository(db).create(
                        input=protocol.CreateEmployeeRequest(**user),
                        office_id=office_db.id,
                        organization_id=org_db.id,
                    )
                except Exception as error:
                    logger.info(f"Failed to create user {error}")
                    # get user from db
                    user_db = employee.EmployeeRepository(db).get_employee(
                        username=user["username"], email=user["email"], organization_id=org_db.id
                    )

                # try to see if the user already exists in keycloak
                user_id: str = None
                try:
                    query = {
                        "email": user["email"],
                        "username": user["username"],
                    }
                    response = kc_admin.get_kc_admin().get_users(query=query)
                    if len(response) == 0:
                        raise Exception("User not found in keycloak")
                    logger.info(f"User Already exist in auth Provider")
                    user_id = response[0]["id"]
                except Exception as error:
                    # try to create user in keycloak
                    logger.info(f"error {error}")
                    try:
                        data = dict(user)

                        logger.info(f"creating user {data}")

                        if "roles" in data:
                            del data["roles"]
                        del data["office_id"]
                        del data["org_id"]
                        data["attributes"] = {
                            "organizationId": str(org_db.id),
                            "officeId": str(office_db.id),
                        }

                        user_id = kc_admin.get_kc_admin().create_user(data)
                    except Exception as error:
                        logger.error(f"Failed to create user {error}")
                # assign realm role to user
                if user_db and user_id:
                    user_db.provider_account_id = user_id
                    # save changes to db
                    db.add(user_db)
                    # commit changes
                    db.commit()

                # get realm role

                if "roles" in user:
                    user_roles = []
                    user_roles: list[str] = list(
                        filter(lambda role: role["name"] in user["roles"], realm_roles)
                    )
                    logger.info(
                        f"Assigning roles for {user['username']}to user with user_id {user_id} "
                    )
                    # assing user roles
                    try:
                        kc_admin.get_kc_admin().assign_realm_roles(user_id, user_roles)
                        # update user roles in db
                        employee.EmployeeRepository(db).update_user_roles(
                            org_id=org_db.id, username=user["username"], roles=user["roles"]
                        )
                    except Exception as error:
                        logger.error(f"Failed to assign role {error}")
        # create software admin


def create_seed_data(db: Session):
    """
    Seed the database with data from the DEBUG_USE_SEED_DATA_PATH setting
    this will work only if the DEBUG_USE_SEED_DATA setting is set to True
    and the ENV setting is not set to production

    Raises:
        ValueError: Error
    """
    if not settings.DEBUG_USE_SEED_DATA:
        return

    if not settings.OFFICIAL_WEB_API_KEY:
        raise ValueError("Cannot use seed data without OFFICIAL_WEB_API_KEY set")

    with open(settings.DEBUG_USE_SEED_DATA_PATH, encoding="UTF-8") as seed_file:
        data = json.load(seed_file)
        logger.info(f"data loaded from {settings.DEBUG_USE_SEED_DATA_PATH}")
        seed_orgs(db, data["organizations"])
        logger.info("Seed data loaded")
