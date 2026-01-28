# Request Lifecycle & Layered Architecture

This document explains the standard flow of data through the application layers. Understanding this pattern is crucial for adding new features and maintaining separation of concerns.

## Architectural Layers

The application follows a strict **Separation of Concerns**:

1.  **Routes**: Define endpoints and map them to controller methods.
2.  **Middleware**: Handles cross-cutting concerns (Auth, Validation, Error Handling).
3.  **Controllers**: Handle HTTP concerns (Request parsing, Response formatting, Status codes). **No business logic here.**
4.  **Services**: Contain **Business Logic** (Validations, Calculations, Ownership Checks). **No SQL queries here.**
5.  **Repositories**: Handle **Data Access** (Sequelize queries, Database interactions). **No business logic here.**

## Sequence Diagram: Standard Data Fetch

The following diagram illustrates the flow for a typical request, such as "Get Location by ID".

```mermaid
sequenceDiagram
    participant Client
    participant Route
    participant Middleware
    participant Controller as LocationController
    participant Service as LocationService
    participant Repo as LocationRepository
    participant DB as Database

    note over Client, DB: 1. HTTP Layer
    Client->>Route: GET /locations/:id
    Route->>Middleware: authenticate()
    Middleware-->>Route: next() (user attached)
    Route->>Controller: getLocationById(req, res)

    note over Client, DB: 2. Business Logic Layer
    Controller->>Service: getLocation(id, currentUserId)
    Service->>Service: Validate Input

    note over Client, DB: 3. Data Access Layer
    Service->>Repo: findById(id)
    Repo->>DB: SELECT * FROM locations WHERE...
    DB-->>Repo: Raw Data
    Repo-->>Service: LocationDTO

    Service->>Service: Verify Ownership (user_id match)

    alt Not Owner / Not Found
        Service-->>Controller: throw Error
        Controller-->>Client: 403 Forbidden / 404 Not Found
    else Success
        Service-->>Controller: LocationDTO
        Controller-->>Client: 200 OK { data }
    end
```
