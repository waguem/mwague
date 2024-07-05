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
            | username     | password  | sender | receiver | amount |charges | state    |
            | wagueAdmin   | waguepass | GZM    | MDM      | 100    | 3.45   | PENDING  |
            | botoreAdmin  | botorepass| ASTM   | OMM      | 200    | 0      | PENDING  |
            | samAdmin     | sampass   | ALM    | BOBM     | 300    | 10     | PENDING  |

        Examples: Transaction to be rejected
            | username     | password  | sender | receiver | amount |charges | state   |
            | wagueAdmin   | waguepass | GZM    | MDM      | 879    | 3.45   | PENDING |
            | botoreAdmin  | botorepass| ASTM   | OMM      | 458.7  | 0      | PENDING |
            | samAdmin     | sampass   | ALM    | BOBM     | 89777  | 10     | PENDING |
        Examples: Transaction to be cancelled
            | username     | password  | sender | receiver | amount |charges | state   |
            | wagueAdmin   | waguepass | GZM    | MDM      | 789    | 3.45   | PENDING |
            | botoreAdmin  | botorepass| ASTM   | OMM      | 756    | 0      | PENDING |
            | samAdmin     | sampass   | ALM    | BOBM     | 245    | 10     | PENDING |

        Examples: Invalid Internal Transaction
            | username     | password  | sender | receiver | amount |charges |  state   |  reason               |
            | botoreAdmin  | botorepass| GZM    | MDM      | 100    | 1.2    | REJECTED |  Resource not found   |
            | samAdmin     | sampass   | ASTM   | OMM      | 200    | 4.5    | REJECTED |  Resource not found   |
            | wagueAdmin   | waguepass | ALM    | BOBM     | 300    | 0      | REJECTED |  Resource not found   |

    @internal @internal_approve
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
            | wagueAdmin   | waguepass | GZ     | MD       | APPROVE  |   100   | 3.45    |
            | botoreAdmin  | botorepass| AST    | OM       | APPROVE  |   200   | 0       |
            | samAdmin     | sampass   | AL     | BOB      | APPROVE  |   300   | 10      |

    @internal @internal_reject
    Scenario Outline: Reject Pending Internal Transaction
        Background: User is logged in
            When I login with username "<username>" and password "<password>"
            Then I should get an access token
        When I reject a pending internal transaction from <sender> to <receiver> for <amount>
        Then I should get a response with the <state> transaction details
        And The sender <sender> account should not be debited
        And The receiver <receiver> account should not be credited
        And The office account should not be credited
        Then I logout

        Examples:
            | username     | password  | sender | receiver | amount | state      |
            | wagueAdmin   | waguepass | GZ     | MD       | 879    | REJECTED   |
            | botoreAdmin  | botorepass| AST    | OM       | 458.7  | REJECTED   |
            | samAdmin     | sampass   | AL     | BOB      | 89777  | REJECTED   |
    @internal @internal_cancel
        Scenario Outline: Cancel Pending Internal
        Background: User is logged in
            When I login with username "<username>" and password "<password>"
            Then I should get an access token

        When I cancel the pending internal from <sender> to receiver <receiver> for <amount>
        Then I should get a response with the <state> transaction details
        And The sender <sender> account should not be debited
        And The receiver <receiver> account should not be credited
        And The office account should not be credited
        Then I logout
        Examples:
            | username     | password  | sender | receiver | amount | state      |
            | wagueAdmin   | waguepass | GZ     | MD       | 789    | CANCELLED  |
            | botoreAdmin  | botorepass| AST    | OM       | 756    | CANCELLED  |
            | samAdmin     | sampass   | AL     | BOB      | 245    | CANCELLED  |
