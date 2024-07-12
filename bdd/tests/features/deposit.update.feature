Feature: Deposit Update workflow

    @deposit @deposit_edit
    Scenario Outline: Edit Deposit Transaction when it is on REVIEW state
        Background: User is logged in
            When I login with username "<username>" and password "<password>"
            Then I should get an access token
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
        And I review the transaction first with <action> for <agent>
        And I edit the transaction with the following details with a new amount <new_amount>
        Then I should get a response with the updated transaction or an <error>
        Then I logout

        Examples: Valid Deposit Transaction
            | username     | password  |agent | receiver | action  | amount | new_amount | state    | error  |
            | wagueAdmin   | waguepass | MD   | MDM      | APPROVE | 100    | 200        | REJECTED | Cannot update TransactionState.PAID transaction    |
            | wagueAdmin   | waguepass | MD   | MDM      | REJECT  | 1400   | 1500       | REVIEW   | None    |
            | wagueAdmin   | waguepass | MD   | MDM      | CANCEL  | 60000  | 70000      | REVIEW   |  Cannot update TransactionState.CANCELLED transaction    |
            | wagueAdmin   | waguepass | MD   | MDM      | None    | 529    | 5390       | REVIEW   | None    |
