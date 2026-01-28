# System Use Cases

This diagram provides a high-level overview of the functional requirements and actor interactions within the MyHives application.

```mermaid
usecaseDiagram
    actor User as "Beekeeper"
    actor Admin as "System Admin"

    package "Authentication" {
        usecase UC1 as "Register"
        usecase UC2 as "Login (Local/OAuth)"
        usecase UC3 as "Logout"
    }

    package "Hive Management" {
        usecase UC4 as "Manage Locations"
        usecase UC5 as "Manage Hives"
        usecase UC6 as "Record Inspections"
        usecase UC7 as "View Map"
    }

    package "Administration" {
        usecase UC8 as "Manage Users"
        usecase UC9 as "Manage Roles"
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    Admin --> UC2
    Admin --> UC8
    Admin --> UC9
```
