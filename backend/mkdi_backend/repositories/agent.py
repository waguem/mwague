from mkdi_backend.api.deps import KcUser
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session, and_


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

    def get_office_agents(
        self, office_id: str, org_id: str
    ) -> list[protocol.AgentReponseWithAccounts]:
        """
        Retrieves all agents belonging to a specific office and organization, along with their accounts.

        Args:
            office_id (str): The ID of the office.
            org_id (str): The ID of the organization.

        Returns:
            list[protocol.AgentReponseWithAccounts]: A list of agents with their accounts.
        """
        # Query to fetch agents and their accounts
        response = (
            self.db.query(Agent, Account)
            .outerjoin(Account, Agent.id == Account.owner_id)
            .filter(Agent.office_id == office_id, Agent.org_id == org_id)
            .all()
        )

        # Aggregate accounts for each agent
        agents_accounts_map = {}
        for agent, account in response:
            if agent.id not in agents_accounts_map:
                agents_accounts_map[agent.id] = protocol.AgentReponseWithAccounts(
                    **agent.dict(), accounts=[]
                )
            if account:
                agents_accounts_map[agent.id].accounts.append(account)

        # Convert the map to a list
        agents_with_accounts = list(agents_accounts_map.values())
        return agents_with_accounts

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create(
        self, *, auth_user: KcUser, usr_input: protocol.CreateAgentRequest
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
        # get the office_id from the auth_user
        duplicate = self.db.query(Agent).filter(Agent.initials == usr_input.initials).first()
        if duplicate:
            raise MkdiError(
                f"Agent with initials {usr_input.initials} already exists",
                error_code=MkdiErrorCode.USER_EXISTS,
            )

        agent: Agent = Agent(
            **usr_input.dict(),
            org_id=auth_user.organization_id,
            office_id=auth_user.office_id,
        )

        self.db.add(agent)

        return agent
