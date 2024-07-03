Feature: Create First User
    @init
    Scenario: Create Soft
        Given I have a backend server
        And I create a user with username "softadmin" with email "softadmin@gmail.com" and password "ChangeMe#1" and roles "soft_admin,office_admin,org_admin"
        When I login with username "softadmin" and password "ChangeMe#1"
        Then I should get an access token
        Then I logout
