Feature: Organization and Office Management
    Scenario Outline: Create an organization
        Background: Background name
            Given I have a backend server
            When I login with username "amadou" and password "amadou"
            Then I should get an access token


        Given logged user has role "soft_admin"
        When I create an organization with name "<org_name>" and initials "<initials>"
        Then I should get a response with the created organization
        Then I logout


        Examples:
            | org_name     | initials |
            | WAGUE_ORG    | WGR      |
            | BOTORE_ORG   | BRR      |

    Scenario Outline: Create Offices
        Background: Background name
            Given I have a backend server
            When I login with username "amadou" and password "amadou"
            Then I should get an access token

        Given logged user has role "org_admin"
        When I create an office with name "<office_name>" and initials "<initials>" at country "<country>"
        Then I should get a response with the created office
        Then I logout

        Examples:
            | office_name             | initials | country      |
            | WAGUE_OFF               | WGO      | SENEGAL      |
            | BOTORE_OFF              | BTO      | GUINEA       |
            | FRANCE OFFICE           | FRO      | France       |
            | Montpellier Site        | SAM      | GUINEA       |


    Scenario Outline: Create employees
        Background: Background name
            Given I have a backend server
            When I login with username "amadou" and password "amadou"
            Then I should get an access token

        Given logged user has role "org_admin"
        When I create an employee with employee "<data>" at office "<office_initials>"
        Then I should get a response with the created employee
        Then I should be able to setup the account fully
        Then the employee should be able to login and get an access token
        Then I logout

        Examples:
            | data                                                                                                                                                                | office_initials       |
            | {"first_name":"Wague","last_name":"Admin","username":"wagueAdmin","email":"wagueadmin@gmail.com","password":"waguepass","roles":["office_admin"]}                   | WGO                   |
            | {"first_name":"Layla","last_name":"Admin","username":"botoreAdmin","email":"btoreadmin@gmail.com","password":"botorepass","roles":["office_admin"]}                 | BTO                   |
            | {"first_name":"Benoi","last_name":"PSSI","username":"samAdmin","email":"samadming@gmail.com","password":"sampass","roles":["office_admin"]}                         | SAM                   |
            | {"first_name":"Kante","last_name":"Golo","username":"franceAdmin","email":"franceadmin@gmail.com","password":"francepass","roles":["office_admin"]}                 | FRO                   |

    @create_office_accounts
    Scenario Outline: Open an Account in an Office
        Background: Background name
            Given I have a backend server

        Given I am logged with user <username> and password <password>
        And I have <role> role
        When I create an office account in my office with data <data>
        Then I should get a response with the created account
        Then I logout
        Examples:
            | username     | password  | role         | data                                                                             |
            | wagueAdmin   | waguepass | office_admin | {"type":"FUND"   ,"currency":"USD","initials":"WGF","owner_initials":"WGO"}      |
            | wagueAdmin   | waguepass | office_admin | {"type":"OFFICE" ,"currency":"USD","initials":"WGM","owner_initials":"WGO"}      |

            | botoreAdmin  | botorepass| office_admin | {"type":"FUND"   ,"currency":"USD","initials":"BTF","owner_initials":"BTO"}      |
            | botoreAdmin  | botorepass| office_admin | {"type":"OFFICE" ,"currency":"USD","initials":"BTM","owner_initials":"BTO"}      |

            | samAdmin     | sampass   | office_admin | {"type":"FUND"   ,"currency":"USD","initials":"SAMF","owner_initials":"SAM"}     |
            | samAdmin     | sampass   | office_admin | {"type":"OFFICE" ,"currency":"USD","initials":"SOM","owner_initials":"SAM"}      |

            | franceAdmin  | francepass| office_admin | {"type":"FUND"   ,"currency":"USD","initials":"FROF","owner_initials":"FRO"}     |
            | franceAdmin  | francepass| office_admin | {"type":"OFFICE" ,"currency":"USD","initials":"FROM","owner_initials":"FRO"}     |

            # Agents accounts


    @create_agent
    Scenario Outline: Create Office Agents
        Background: Background name
            Given I have a backend server


        Given I am logged with user <username> and password <password>
        And I have <role> role
        When I create an agent in my office with data <data>
        Then I should get a response with the created agent
        Then I logout

        Examples:
            | username     | password  | role         | data                                                                                                    |
            | wagueAdmin   | waguepass | office_admin | {"name":"Guanzu","initials":"GZ","email":"guanzu@gmail.com","phone":"+91565894","country":"Senegal"}    |
            | wagueAdmin   | waguepass | office_admin | {"name":"Mamadou","initials":"MD","email":"mamadou@gmail.com","phone":"+91565894","country":"Mali"}     |

            | botoreAdmin  | botorepass | office_admin | {"name":"Aissatou","initials":"AST","email":"aissatou@gmail.com","phone":"+91565894","country":"Mali"}  |
            | botoreAdmin  | botorepass | office_admin | {"name":"Omar","initials":"OM","email":"omar@gmail.com","phone":"+91565894","country":"Guinea"}         |

            | samAdmin     | sampass   | office_admin | {"name":"Alice","initials":"AL","email":"alice@gmail.com","phone":"+91565894","country":"France"}       |
            | samAdmin     | sampass   | office_admin | {"name":"Bob", "initials":"BOB","email":"bob@gmail.com","phone":"+91565894","country":"Burkina Faso"}   |


    @create_agent
    Scenario Outline: Open an Account in an Office
        Background: Background name
            Given I have a backend server

        Given I am logged with user <username> and password <password>
        And I have <role> role
        When I create an office account in my office with data <data>
        Then I should get a response with the created account
        Then I logout

        Examples:
            | username     | password  | role         | data                                                                             |
            | wagueAdmin   | waguepass | office_admin | {"type":"AGENT"  ,"currency":"USD","initials":"GZM","owner_initials":"GZ"}       |
            | wagueAdmin   | waguepass | office_admin | {"type":"AGENT"  ,"currency":"USD","initials":"MDM","owner_initials":"MD"}       |
