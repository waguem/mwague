"""API Router for version 1 of the API."""

from fastapi import APIRouter
from mkdi_backend.api.v1 import organization, ping
from mkdi_backend.api.v1.office import account, activity, agent, employee, office
from mkdi_backend.api.v1.transactions import transactions

api_router = APIRouter()

api_router.include_router(ping.router, tags=["testing"])
api_router.include_router(organization.router, tags=["organization"])
api_router.include_router(office.router, tags=["office"])
api_router.include_router(employee.router, tags=["employee"])
api_router.include_router(agent.router, tags=["agent"])
api_router.include_router(account.router, tags=["account"])
api_router.include_router(activity.router, tags=["activity"])
api_router.include_router(transactions.router, tags=["transactions"])
