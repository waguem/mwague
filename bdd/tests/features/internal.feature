Feature: Internal Transaction

    @internal @internal_tr
    Scenario Outline: Internal Transaction Request
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

        When I request an internal transaction of <amount> from <sender> to <receiver> with <charges>
        Then I should get a response with the transaction details, the transaction is at a given state <state> or and error with a reason <reason>
        Then I logout

        Examples: Valid Internal Transaction
            | username     | password  | sender | receiver | amount |charges | state    | reason  |
            | wagueAdmin   | waguepass | GZM    | MDM      | 100    | 3.45   | PENDING  | None    |
            | botoreAdmin  | botorepass| ASTM   | OMM      | 200    | 0      | PENDING  | None    |
            | samAdmin     | sampass   | ALM    | BOBM     | 300    | 10     | PENDING  | None    |

        Examples: Invalid Internal Transaction
            | username     | password  | sender | receiver | amount |charges |  state   |  reason               |
            | botoreAdmin  | botorepass| GZM    | MDM      | 100    | 1.2    | REJECTED |  Resource not found   |
            | samAdmin     | sampass   | ASTM   | OMM      | 200    | 4.5    | REJECTED |  Resource not found   |
            | wagueAdmin   | waguepass | ALM    | BOBM     | 300    | 0      | REJECTED |  Resource not found   |

    @internal @internal_review
    Scenario Outline: Approve pending transactions
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
        When I review an internal transaction from <sender> to <receiver> for <amount> with <charges>
        Then I should get a response with the reviewed transaction details, the transaction is at a given state <state>
        And The receiver account should be credited with the amount of the transaction
        And The sender account should be debited with the amount of the transaction and the <charges> if any
        And The office account should be credited with the <charges> of the transaction
        And  My Office Invariant should be correct
        Then I logout

        Examples: Valid Internal Review Transaction
            | username     | password  | sender | receiver | state     | amount  | charges |
            | wagueAdmin   | waguepass | GZ     | MD       | APPROVED  |   100   | 3.45    |
            | botoreAdmin  | botorepass| AST    | OM       | APPROVED  |   200   | 0       |
            | samAdmin     | sampass   | AL     | BOB      | APPROVED  |   300   | 10      |
