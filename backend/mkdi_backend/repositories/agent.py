from mkdi_backend.api.deps import KcUser
from mkdi_backend.models.Agent import Agent
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session


class AgentRepository:
    """
    Repository class for managing agents.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_agent(self, agent_initials: str, office_id: str) -> Agent:
        """
        Retrieves an agent by initials.

        Args:
            agent_initials (str): The initials of the agent.

        Returns:
            Agent: The agent.
        """
        return (
            self.db.query(Agent)
            .filter(Agent.initials == agent_initials and Agent.office_id == office_id)
            .first()
        )

    def paginate(self, page: int, limit: int):
        """
        Paginates agents.

        Args:
            page (int): The page number.
            limit (int): The number of agents per page.

        Returns:
            List[Agent]: A list of agents.
        """
        return self.db.query(Agent).offset((page - 1) * limit).limit(limit).all()

    def get_office_agents(self, office_id: str, org_id: str):
        """
        Retrieves all agents belonging to a specific office and organization.

        Args:
            office_id (str): The ID of the office.
            org_id (str): The ID of the organization.

        Returns:
            List[Agent]: A list of agents.
        """
        return (
            self.db.query(Agent)
            .filter(Agent.office_id == office_id and Agent.organization_id == org_id)
            .all()
        )

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create(
        self, *, auth_user: KcUser, input: protocol.CreateAgentRequest
    ) -> protocol.AgentResponse:
        """
        Creates a new agent.

        Args:
            auth_user (KcUser): The authenticated user.
            input (protocol.CreateAgentRequest): The agent creation request.

        Returns:
            protocol.AgentResponse: The created agent response.
        Raises:
            MkdiError: If the authenticated user is not in the same organization or office as the agent.
            MkdiError: If an agent with the same initials already exists.
        """
        # the auth_user should be in the same organization as the agent
        # and the agent should be in the same office as the auth_user

        duplicate = self.db.query(Agent).filter(Agent.initials == input.initials).first()
        if duplicate:
            raise MkdiError(
                f"Agent with initials {input.initials} already exists",
                error_code=MkdiErrorCode.USER_EXISTS,
            )

        agent: Agent = Agent(**input.dict(), org_id=auth_user.organization_id)

        self.db.add(agent)

        return agent
