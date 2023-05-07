Feature: Feature authentication

    Allow user authentication via the API.
    Scenario: authenticate a user with username <username> and password <password>
        Given a user exists with username "Alice" and password "Alice"
        When I send a POST request to "/api/token" with body:
            """
            {
                "username": "Alice",
                "password": "Alice"
            }
            """
        Then the response should contain JSON:
            """
            {
                "access_token": "string",
                "token_type": "string"
            }
            """
    @dev
    Scenario Outline: User authentication
        Given a user <username> with a password <password>
        When I send a POST request to "/api/token" with body and wait for response:
            """
            {
                "username": "<username>",
                "password": "<password>"
            }
            """
        Then the response should contain JSON with <status>:
            """
            {
                "access_token": "string",
                "token_type": "string"
            }
            """
        Examples:
            | username | password | status                      |
            | Alice    | Alice    | access_token                |
            | Bob      | Bob      | access_token               |
            | Eve      | Eve      | INVALID_AUTHENTICATION     |
