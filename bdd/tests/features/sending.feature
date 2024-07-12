Feature: Sending Transaction
    @sending @sending_tr
    Scenario Outline: Sending Transaction request
        Background: User is logged in
            Given I have a backend server
            When I login with username "<username>" and password "<password>"
            Then I should get an access token
            And I have a required role "any" for this feature
            And I have started an activity with the following details
            """
            {
                "rates": [
                    {
                    "currency":"USD",
                    "rate": 3.67
                    },
                    {
                    "currency":"EUR",
                    "rate": 3.94
                    }
                ]
            }
            """
        When I request a sending transaction with the following details
        """
        {
            "currency": "<currency>",
            "amount": {
                "amount":<amount>,
                "rate": <rate>
            },
            "charges": {
                "amount": <charges>,
                "rate": <rate>
            },
            "transaction_type": "SENDING",
            "data":{
                "type":"SENDING",
                "receiver_initials":"<receiver>",
                "bid_rate": <bid_rate>,
                "offer_rate":<offer_rate>,
                "payment_method":"<payment_method>",
                "payment_currency":"<payment_currency>"
            }
        }
        """
        Then I should get a response with the transaction details, the transaction is at a given state <state> or and error with a reason <reason>
        Then I logout
        Examples: Valid Transaction
            | username  | password  | currency |rate  | amount | charges | bid_rate | offer_rate | receiver | payment_method | payment_currency | state      | reason |
            | wagueAdmin| waguepass | USD      | 3.67 | 100    | 5.0     | 3.67     | 3.67       | MDM      | CASH           | USD              | REVIEW     | None   |
            | wagueAdmin| waguepass | USD      | 3.67 | 1400   | 5.0     | 604.52   | 604.52     | MDM      | CASH           | CFA              | REVIEW     | None   |
            | wagueAdmin| waguepass | USD      | 3.67 | 60000  | 5.0     | 8608.56  | 8608.56    | MDM      | CASH           | GNF              | REVIEW     | None   |
            | samAdmin  | sampass   | USD      | 3.67 | 300    | 0       | 3.67     | 3.67       | BOBM     | CASH           | EUR              | REVIEW     | None   |
            | samAdmin  | sampass   | USD      | 3.67 | 300    | 0       | 3.67     | 3.67       | BOBM     | CASH           | USD              | REVIEW     | None   |

    @sending @sending_review
    Scenario Outline: Approve pending sendings
        Background: User is logged in
            Given I have a backend server
            When I login with username "<username>" and password "<password>"
            Then I should get an access token
            And I have a required role "any" for this feature
            And I have started an activity with the following details
            """
            {
                "rates": [
                    {
                    "currency":"USD",
                    "rate": 3.67
                    },
                    {
                    "currency":"EUR",
                    "rate": 3.94
                    }
                ]
            }
            """
        Given My Office Invariant is correct
        When I review a pending sending with the following details
        """
        {
            "review": "<review>",
            "amount": <amount>,
            "receiver":"<receiver>",
            "account": "<account>"
        }
        """
        Then I should get a response with the reviewed transaction at a given state <state>
        And The receiver <receiver> account should not be credited
        And  My Office Invariant should be correct
        Then I logout
        Examples: Valid External Reviews
            | username   | password  | review   | amount | receiver | account | state     |
            | wagueAdmin | waguepass | APPROVE  | 100    | MD       | MDM     | PENDING   |
            | wagueAdmin | waguepass | REJECT   | 1400   | MD       | MDM     | REJECTED  |
            | wagueAdmin | waguepass | CANCEL   | 60000  | MD       | MDM     | CANCELLED |

    @sending @sending_pay
    Scenario Outline: Sending Payment
        Background: User is logged in
            Given I have a backend server
            When I login with username "<username>" and password "<password>"
            Then I should get an access token
            And I have a required role "any" for this feature
            And I have started an activity with the following details
            """
            {
                "rates": [
                    {
                    "currency":"USD",
                    "rate": 3.67
                    },
                    {
                    "currency":"EUR",
                    "rate": 3.94
                    }
                ]
            }
            """
        Given My Office Invariant is correct
        When the customer pay <payment> <amount> for <receiver> with <account>
        Then The transaction is at a given state <state>
        And the receiver <receiver> account should be credited by the amount
        And the fund account should be credited by the <amount> + <transaction_charges>
        And the office account should be credited with the <transaction_charges>
        And My Office Invariant should be correct
        Then I logout

        Examples:
            | username   | password  | payment       | receiver| account | amount | state      | transaction_charges |
            | wagueAdmin | waguepass | COMPLETE      | MD     | MDM     | 100    | PAID       | 5.0                 |
            | wagueAdmin | waguepass | COMPLETE      | MD     | MDM     | 1400   | PAID       | 5.0                 |
            | wagueAdmin | waguepass | COMPLETE      | MD     | MDM     | 60000  | PAID       | 5.0                 |
