Feature: Deposit Transaction

    @deposit @deposit_tr
    Scenario Outline: Deposit Transaction request
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

        When I request a deposit transaction of <amount> for <receiver>
        Then I should get a response with the transaction details, the transaction is at a given state <state> or and error with a reason <reason>
        Then I logout

        Examples: Valid Deposit Transaction
            | username     | password  | receiver | amount | state    | reason  |
            | wagueAdmin   | waguepass | MDM      | 100    | REVIEW   | None    |
            | botoreAdmin  | botorepass| OMM      | 200    | REVIEW   | None    |
            | samAdmin     | sampass   | BOBM     | 300    | REVIEW   | None    |

        Examples: Invalid Deposit Transaction
            | username     | password  | receiver | amount | state    | reason               |
            | botoreAdmin  | botorepass| MDM      | 100    | REJECTED | Resource not found   |
            | samAdmin     | sampass   | OMM      | 200    | REJECTED | Resource not found   |
            | wagueAdmin   | waguepass | BOBM     | 300    | REJECTED | Resource not found   |

    @deposit @deposit_review
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
        When I review the pending deposit <amount> for <receiver>
        Then I should get a response with the reviewed transaction details, the transaction is at a given state <state>
        And The receiver account should be debited with the <amount> of the transaction
        And The fund account should be debited with the <amount> of the transaction
        And  My Office Invariant should be correct
        Then I logout

        Examples: Valid Deposit Review Transaction
            | username     | password  | sender | receiver | state     | amount |
            | wagueAdmin   | waguepass | GZ     | MD       | APPROVED  | 100    |
            | botoreAdmin  | botorepass| AST    | OM       | APPROVED  | 200    |
            | samAdmin     | sampass   | AL     | BOB      | APPROVED  | 300    |
