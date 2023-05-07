Feature: Ping Backend server
    Scenario: Ping Backend server
        Given I have a backend server
        When I ping the backend server
        Then I should get a response
