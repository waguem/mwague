# pylint: disable=missing-module-docstring
import client
from decimal import Decimal
from client.rest import ApiException
import json


def request_transaction_generic(ctx, request):
    with client.ApiClient(ctx.config) as api:
        transaction_api = client.TransactionsApi(api)
        try:
            response: client.TransactionResponse = (
                transaction_api.request_transaction_api_v1_transaction_post(
                    transaction_request=ctx.request
                )
            )
            ctx.response = response
            ctx.error = None
        except ApiException as e:

            if hasattr(e, "body"):
                ctx.error = json.loads(e.body)["message"]
            else:
                ctx.error = e


def request_transaction(ctx, amount, charges, currency, data):
    """request internal transaction"""
    with client.ApiClient(ctx.config) as api:
        transaction_api = client.TransactionsApi(api)

        rate = Decimal(1.0)
        if hasattr(ctx, "rates"):
            rate_dic = list(filter(lambda x: x["currency"] == "USD", ctx.rates))[0]
            rate = Decimal(rate_dic["rate"])
        request = {
            "amount": {"amount": Decimal(amount), "rate": rate},
            "currency": currency,
            "charges": {"amount": Decimal(charges), "rate": rate},
            "data": data,
        }
        ctx.request = client.TransactionRequest.from_dict(request)
        try:
            response: client.TransactionResponse = (
                transaction_api.request_transaction_api_v1_transaction_post(
                    transaction_request=ctx.request
                )
            )
            ctx.response = response
            ctx.error = None
        except ApiException as e:

            if hasattr(e, "body"):
                ctx.error = json.loads(e.body)["message"]
            else:
                ctx.error = e


def review_transaction(ctx, agent, state, currency, data, tr_type, amount, charges=None, rate=None):
    """review internal transaction"""
    with client.ApiClient(ctx.config) as api:
        tr_api = client.TransactionsApi(api)
        # get transaction
        res = tr_api.get_agent_transactions_api_v1_agent_initials_transactions_get(initials=agent)

        # find the transaction to review
        transaction = list(
            filter(
                lambda x: x.state == client.TransactionState.REVIEW
                and x.type == tr_type
                and abs(Decimal(x.amount) - Decimal(str(amount))) < 0.001,
                res,
            )
        )

        if len(transaction) > 0:
            ctx.transaction = transaction[0]
            # review transaction
            assert ctx.transaction.code is not None
            assert ctx.transaction.type == tr_type
            assert ctx.transaction.state == client.TransactionState.REVIEW
            charges = Decimal(charges) if charges else ctx.transaction.charges

            try:
                review = client.TransactionReviewReq.from_dict(
                    {
                        "code": ctx.transaction.code,
                        "type": ctx.transaction.type,
                        "state": state,
                        "data": data,
                        "notes": f"{ctx.transaction.code} {state} by {ctx.logged_user.username}",
                        "currency": currency,
                        "amount": {
                            "amount": ctx.transaction.amount,
                            "rate": rate or ctx.transaction.rate,
                        },
                        "charges": {"amount": charges or 0, "rate": ctx.transaction.rate},
                    }
                )
                response: client.TransactionResponse = (
                    tr_api.review_transaction_api_v1_transaction_transaction_code_review_post(
                        transaction_code=ctx.transaction.code, transaction_review_req=review
                    )
                )
                ctx.response = response
                ctx.error = None
                ctx.review_successful = True
            except ApiException as e:
                ctx.error = e


def get_transaction(ctx, tr_type: client.TransactionType, amount: Decimal, intials: str):
    """get transaction"""
    with client.ApiClient(ctx.config) as api:
        tr_api = client.TransactionsApi(api)
        # get transaction
        res = tr_api.get_agent_transactions_api_v1_agent_initials_transactions_get(initials=intials)

        # find the transaction to review
        transactions = list(
            filter(
                lambda x: x.type == tr_type
                and abs(Decimal(x.amount) - Decimal(str(amount))) < 0.001,
                res,
            )
        )
        assert len(transactions) <= 1
        return transactions[0] if len(transactions) > 0 else None


def pay_transaction(ctx, transaction: client.TransactionResponse, payment: client.PaymentRequest):
    """pay transaction"""
    with client.ApiClient(ctx.config) as api:
        tr_api = client.TransactionsApi(api)
        try:
            response: client.PaymentResponse = tr_api.add_payment_api_v1_transaction_code_pay_post(
                code=transaction.code, payment_request=payment
            )
            ctx.response = response
            ctx.error = None
        except ApiException as e:
            ctx.error = e
