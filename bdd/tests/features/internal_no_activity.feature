Feature: Internal Transaction

    @internal @internal_tr
    Scenario Outline: Activity Not started
        Background: User is logged in
            Given I have a backend server
            When I login with username "<username>" and password "<password>"
            Then I should get an access token
            And I have a required role "any" for this feature

        When I request an internal transaction of <amount> from <sender> to <receiver> with <charges>
        Then I should get a response with the transaction details, the transaction is at a given state <state> or and error with a reason <reason>
        Then I logout
        Examples: Valid Internal Transaction
            | username     | password  | sender | receiver | amount | state    | charges | reason               |
            | wagueAdmin   | waguepass | GZM    | MDM      | 100    | REJECTED | 3.45    | No activity found    |
            | botoreAdmin  | botorepass| ASTM   | OMM      | 200    | REJECTED | 0       | No activity found    |
            | samAdmin     | sampass   | ALM    | BOBM     | 300    | REJECTED | 10      | No activity found    |
