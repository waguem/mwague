# pylint: disable=missing-module-docstring
from sqlalchemy import create_engine, text
from sqlalchemy.orm.session import Session

# from sqlalchemy.exc.asyncio import AsyncSession
from decimal import Decimal
from tests.tools.config import config

engine = create_engine(
    url=config.DATABASE_URI,
    isolation_level="REPEATABLE READ",
    pool_size=5,
    max_overflow=10,
    echo=False,
)


def clean_transactions():
    with Session(engine) as session:
        session.execute(text("DELETE FROM public.externals"))
        session.execute(text("DELETE FROM public.sendings"))
        session.execute(text("DELETE FROM public.deposits"))
        session.execute(text("DELETE FROM public.forex"))
        session.commit()


def clean_db():
    with Session(engine) as session:
        clean_transactions()
        session.execute(text("DELETE FROM public.fundcommits"))
        session.execute(text("DELETE FROM public.activities"))
        session.execute(text("DELETE FROM public.employees"))
        session.execute(text("DELETE FROM public.agents"))
        session.execute(text("DELETE FROM public.offices"))
        session.execute(text("DELETE FROM public.organizations"))
        session.commit()


def create_root_org():
    """create root org"""
    with Session(engine) as session:
        clean_db()
        session.execute(
            text(
                "INSERT INTO public.organizations (initials, org_name) VALUES (:initials, :org_name)"
            ),
            {"initials": "ROOT", "org_name": "ROOT"},
        )
        session.commit()


def create_root_office():
    """create root office"""
    with Session(engine) as session:
        session.execute(text("DELETE FROM public.offices"))
        root_org = session.execute(
            text("SELECT * FROM public.organizations WHERE initials = :initials"),
            {"initials": "ROOT"},
        ).fetchone()

        org_id = root_org.id

        session.execute(
            text(
                "INSERT INTO public.offices (country,initials, name, organization_id) VALUES (:country,:initials, :name, :organization_id)"
            ),
            {"initials": "ROOT", "name": "ROOT", "organization_id": org_id, "country": "World"},
        )

        session.commit()


def create_first_user(username, email, roles):
    """create first user"""
    org, office = None, None
    user = None
    with Session(engine) as session:
        session.execute(text("DELETE FROM public.employees"))
        root_office = session.execute(
            text("SELECT * FROM public.offices WHERE initials = :initials"),
            {"initials": "ROOT"},
        ).fetchone()

        office_id, org_id = root_office.id, root_office.organization_id

        session.execute(
            text(
                "INSERT INTO public.employees (email, username, roles,office_id,organization_id) VALUES (:email,:username,:roles,:office_id,:organization_id)"
            ),
            {
                "email": email,
                "username": username,
                "office_id": office_id,
                "organization_id": org_id,
                "roles": roles,
            },
        )
        session.commit()
        user = session.execute(
            text("SELECT * FROM public.employees WHERE email = :email"),
            {"email": email},
        ).fetchone()
        org = session.execute(
            text("SELECT * FROM public.organizations WHERE id = :id"),
            {"id": org_id},
        ).fetchone()
        office = session.execute(
            text("SELECT * FROM public.offices WHERE id = :id"),
            {"id": office_id},
        ).fetchone()
    return org, office, user


# create a connection


def remove_internals():
    """remove internals"""
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM public.internals"))
        conn.commit()


def remove_activity():
    """remove activity"""
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM public.fundcommits"))
        conn.execute(text("DELETE FROM public.activities"))
        conn.commit()


def remove_externals():
    """remove externals"""
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM public.externals"))
        conn.commit()


def remove_deposits():
    """remove deposits"""
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM public.deposits"))
        conn.commit()


def get_agent_account(agent_initials: str):
    """get agent account"""
    account = None
    with Session(engine) as session:
        agent = session.execute(
            text("SELECT * FROM public.agents WHERE initials = :initials"),
            {"initials": agent_initials},
        ).fetchone()

        if not agent:
            return None
        # accounts
        account = session.execute(
            text("SELECT * FROM public.accounts WHERE owner_id = :owner_id AND type = 'AGENT'"),
            {"owner_id": agent.id},
        ).fetchone()

    return account


def reset_office_invariant(office_id: str):
    """reset office invariant , set all accounts for this office to zero"""
    with Session(engine) as session:
        session.execute(
            text("UPDATE public.accounts SET balance = 0 WHERE office_id = :office_id"),
            {"office_id": office_id},
        )
        session.commit()


def get_office_account(officeId: str):
    """get office account"""
    account = None
    with Session(engine) as session:
        account = session.execute(
            text("SELECT * FROM public.accounts WHERE owner_id = :owner_id AND type = 'OFFICE'"),
            {"owner_id": officeId},
        ).fetchone()

    return account


def get_account(initials: str):
    account = None
    with Session(engine) as session:
        account = session.execute(
            text("SELECT * FROM public.accounts WHERE initials = :initials"), {"initials": initials}
        ).fetchone()

    return account


def get_fund_account(office_id: str):
    """get fund account"""
    account = None
    with Session(engine) as session:
        account = session.execute(
            text("SELECT * FROM public.accounts WHERE owner_id = :owner_id AND type = 'FUND'"),
            {"owner_id": office_id},
        ).fetchone()

    return account


def get_office_invariant(office_id: str) -> Decimal:
    """
    positive_balance_sum, fund_balance = (
        self.db.query(
            func.sum(Account.balance).filter(Account.type != protocol.AccountType.FUND),
            func.sum(Account.balance).filter(Account.type == protocol.AccountType.FUND),
        )
        .filter(Account.office_id == office_id)
        .one()
    )
    """
    sql_query = """
    SELECT
        SUM(CASE WHEN type != 'FUND' THEN balance ELSE 0 END) AS positive_balance_sum,
        SUM(CASE WHEN type = 'FUND' THEN balance ELSE 0 END) AS fund_balance
    FROM
        accounts
    WHERE
        office_id = :office_id
    """
    try:
        invariant = None

        with Session(engine) as session:
            result = session.execute(text(sql_query), {"office_id": office_id}).fetchone()
            invariant = result[0] - result[1]

        return invariant
    except Exception as e:
        print(e)
