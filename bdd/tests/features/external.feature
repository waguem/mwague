Feature: External Transaction
    @external @external_tr
    Scenario Outline: External Transaction request
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
        When I request an external transaction with the following details
        """
        {
            "sender": "<sender>",
            "amount": "<amount>",
            "currency": "<currency>",
            "charges": <charges>,
            "rate": <rate>
        }
        """
        Then I should get a response with the transaction details, the transaction is at a given state <state> or and error with a reason <reason>
        Then I logout
        Examples: Valid Transaction
            | username   | password  | sender | amount | currency | charges | rate | state      | reason |
            | wagueAdmin | waguepass | MDM    | 100    | USD      | 5.0     | 3.67 | REVIEW     | None   |
            | wagueAdmin | waguepass | MDM    | 1400   | USD      | 5.0     | 3.67 | REVIEW     | None   |
            | wagueAdmin | waguepass | MDM    | 60000  | USD      | 5.0     | 3.67 | REVIEW     | None   |
            | samAdmin   | sampass   | BOBM   | 300    | USD      | 0       | 3.67 | REVIEW     | None   |
            | samAdmin   | sampass   | BOBM   | 300    | USD      | 0       | 3.67 | REVIEW     | None   |

    @external @external_review
    Scenario Outline: Approve pending externals
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
        When I <review> a pending external <amount> for <sender> with <account>
        Then I should get a response with the reviewed transaction at a given state <state>
        And The sender <sender> account should not be debited
        And  My Office Invariant should be correct
        Then I logout
        Examples: Valid External Reviews
            | username   | password  | review   | sender | account | amount | state      |
            | wagueAdmin | waguepass | APPROVED | MD     | MDM     | 100    | PENDING    |
            | wagueAdmin | waguepass | REJECTED | MD     | MDM     | 1400   | REJECTED   |
            | wagueAdmin | waguepass | CANCELLED| MD     | MDM     | 60000  | CANCELLED  |

    @external @external_pay
    Scenario Outline: External Payment
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
        When I pay <payment> an external <amount> for <sender> with <account>
        Then The transaction is at a given state <state>
        And the sender <sender> account should be debited and charged if complete <transaction_charges>
        And the fund account should be credited
        And the office account should be credited with the charges
        And My Office Invariant should be correct
        Then I logout

        Examples:
            | username   | password  | payment       | sender | account | amount | state      | transaction_charges |
            | wagueAdmin | waguepass | COMPLETE      | MD     | MDM     | 100    | PAID       | 5.0                 |
            | wagueAdmin | waguepass | COMPLETE      | MD     | MDM     | 1400   | PAID       | 5.0                 |
            | wagueAdmin | waguepass | COMPLETE      | MD     | MDM     | 60000  | PENDING    | 5.0                 |
