# Deployment & Architecture

This document illustrates the high-level deployment architecture and component interactions for the MyHives application.

## System Architecture Diagram

The following diagram visualizes how the Client, Server, Database, and External Services interact.

```mermaid
graph TD
    %% Nodes
    User((User / Beekeeper))

    subgraph Client_Side [Client Side]
        Frontend[Frontend Web App]
    end

    subgraph Backend_Infrastructure [Backend Infrastructure]
        API[Node.js Express API Server]

        subgraph Data_Persistence [Data Persistence]
            Postgres[(PostgreSQL Database)]
            Redis[(Redis Cache)]
        end
    end

    subgraph External_Services [External Services]
        GoogleAuth[Google OAuth 2.0]
    end

    %% Relationships
    User -- "HTTPS / Browser" --> Frontend
    Frontend -- "REST API (JSON) / HTTPS" --> API

    API -- "Read/Write Data (Sequelize)" --> Postgres
    API -- "Token Blacklist / Caching" --> Redis

    API -.->|"Verify Identity"| GoogleAuth
    Frontend -.->|"Redirect Login"| GoogleAuth
```

## Component Details

1.  **Frontend Web App**: The client-side interface (SPA) used by beekeepers to manage their data.
2.  **Node.js Express API**: The core application server. It handles:
    - **Authentication**: JWT generation, validation, and Google OAuth callbacks.
    - **Business Logic**: Managing Hives, Locations, and Inspections.
3.  **PostgreSQL**: The primary relational database storing persistent data (Users, Roles, Locations, Hives, Inspections).
4.  **Redis**: An in-memory key-value store used primarily for **Token Blacklisting** (logout functionality) and potentially for caching frequently accessed data.
5.  **Google OAuth**: An external identity provider allowing users to sign in using their Google accounts.
