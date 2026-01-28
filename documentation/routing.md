# Server Routing & Startup Documentation

## Server Startup Flow

The application is built using **Node.js** and **Express**. While the entry point file is not explicitly detailed here, the standard startup sequence for this architecture typically follows these steps:

1.  **Environment Configuration**: Loads environment variables (port, database credentials, JWT secrets).
2.  **Database Connection**: Initializes the **Sequelize** instance and connects to the PostgreSQL database.
3.  **Middleware Initialization**: Sets up global middleware (CORS, Body Parser, Cookie Parser, Logger).
4.  **Route Mounting**: Mounts the API routes (typically prefixed with `/api/v1`).
5.  **Server Listen**: Starts the HTTP server on the configured port.

## API Routes

The application follows a RESTful architecture with resource nesting where appropriate (e.g., Hives belong to Locations). Below is a summary of the available endpoints based on the controller logic.

### 1. Authentication (`/auth`)

Managed by `AuthController`. Handles user identity and session management.

| Method | Endpoint           | Description                                    | Access                    |
| :----- | :----------------- | :--------------------------------------------- | :------------------------ |
| `POST` | `/register`        | Register a new user                            | Public                    |
| `POST` | `/login`           | Login with email/password                      | Public                    |
| `POST` | `/logout`          | Logout (Invalidates token via Redis blacklist) | Authenticated             |
| `GET`  | `/me`              | Get current user profile                       | Authenticated             |
| `PUT`  | `/me`              | Update current user profile                    | Authenticated             |
| `POST` | `/refresh-token`   | Refresh access token                           | Public (w/ Refresh Token) |
| `GET`  | `/google/callback` | OAuth2 callback for Google Login               | Public                    |

### 2. Administration (`/admin`)

Managed by `AdminController`.

| Method   | Endpoint          | Description                      | Access |
| :------- | :---------------- | :------------------------------- | :----- |
| `GET`    | `/roles`          | List all system roles            | Admin  |
| `GET`    | `/users`          | Dashboard: List users with roles | Admin  |
| `GET`    | `/users/:id`      | Get specific user details        | Admin  |
| `POST`   | `/user-roles`     | Assign a role to a user          | Admin  |
| `PUT`    | `/user-roles/:id` | Update a user-role assignment    | Admin  |
| `DELETE` | `/user-roles/:id` | Remove a role from a user        | Admin  |

### 3. Locations (`/locations`)

Managed by `LocationController`. Represents apiaries or sites.

| Method   | Endpoint       | Description                        | Access      |
| :------- | :------------- | :--------------------------------- | :---------- |
| `POST`   | `/`            | Create a new location              | Owner       |
| `GET`    | `/`            | Get all locations for current user | Owner       |
| `GET`    | `/map-data`    | Get public map data (aggregated)   | Public/Auth |
| `GET`    | `/:locationId` | Get specific location details      | Owner       |
| `PUT`    | `/:locationId` | Update location details            | Owner       |
| `DELETE` | `/:locationId` | Delete a location                  | Owner       |

### 4. Hives (`/locations/:locationId/hives`)

Managed by `HiveController`. Nested under Locations to ensure ownership context.

| Method   | Endpoint    | Description                    | Access |
| :------- | :---------- | :----------------------------- | :----- |
| `GET`    | `/`         | Get all hives at a location    | Owner  |
| `POST`   | `/`         | Create a new hive              | Owner  |
| `GET`    | `/:hive_id` | Get specific hive details      | Owner  |
| `PUT`    | `/:hive_id` | Update hive details            | Owner  |
| `DELETE` | `/:hive_id` | Delete a hive                  | Owner  |
| `DELETE` | `/`         | Delete all hives at a location | Owner  |

### 5. Major Inspections (`/locations/:locationId/major-inspections`)

Managed by `MajorInspectionController`. Represents a site visit event.

| Method   | Endpoint              | Description                     | Access |
| :------- | :-------------------- | :------------------------------ | :----- |
| `GET`    | `/`                   | List inspections for a location | Owner  |
| `POST`   | `/`                   | Create a new major inspection   | Owner  |
| `GET`    | `/:majorInspectionId` | Get inspection details          | Owner  |
| `PUT`    | `/:majorInspectionId` | Update inspection               | Owner  |
| `DELETE` | `/:majorInspectionId` | Delete inspection               | Owner  |

### 6. Hive Inspections

**Base URL:** `/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections`

Managed by `HiveInspectionController`. Represents the inspection of a specific hive during a major inspection visit.

| Method   | Endpoint             | Description                       | Access |
| :------- | :------------------- | :-------------------------------- | :----- |
| `GET`    | `/`                  | List hive inspections for a visit | Owner  |
| `POST`   | `/`                  | Create a hive inspection record   | Owner  |
| `GET`    | `/:hiveInspectionId` | Get specific record details       | Owner  |
| `PUT`    | `/:hiveInspectionId` | Update record                     | Owner  |
| `DELETE` | `/:hiveInspectionId` | Delete record                     | Owner  |

## Middleware Usage

- **`authenticate`**: Used on almost all routes (except login/register) to populate `req.currentUser`.
- **Ownership Checks**: Services often perform a "triple check" (User -> Location -> Resource) to ensure a user cannot access resources they do not own, even if they have a valid token.
