REST API Endpoints
We'll categorize the endpoints by resource. All endpoints will be prefixed with /api/v1 for versioning.

Base URL: http://localhost:3000/api/v1 (assuming your backend runs on port 3000)

1. Authentication Endpoints
   These are crucial but we won't go into the full implementation details here as it's a complex topic involving OAuth strategies and JWTs.

POST /auth/register

Purpose: Register a new user with username/password.
Request Body: { username, email, password }
Response: { message: "User registered successfully", user: { id, username, email } } or { error: "..." }
POST /auth/login

Purpose: Authenticate user with username/password.
Request Body: { email, password }
Response: { message: "Logged in successfully", token: "jwt_token", user: { id, username, email } } or { error: "..." }
GET /auth/google (Initiate Google OAuth flow)

GET /auth/google/callback (Google OAuth callback)

GET /auth/linkedin (Initiate LinkedIn OAuth flow)

GET /auth/linkedin/callback (LinkedIn OAuth callback)

GET /auth/me (Protected)

Purpose: Get authenticated user's profile.
Headers: Authorization: Bearer <jwt_token>
Response: { id, username, email, ... } 2. Locations Endpoints
GET /locations (Protected)

Purpose: Retrieve all locations for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: Array<Location>
JSON

[
{
"id": "uuid1",
"userId": "user_uuid",
"name": "My Backyard Apiary",
"address": "123 Main St",
"latitude": 40.7128,
"longitude": -74.0060,
"description": "Hives behind the garage",
"createdAt": "2023-10-26T10:00:00Z",
"updatedAt": "2023-10-26T10:00:00Z"
},
// ... more locations
]
GET /locations/:id (Protected)

Purpose: Retrieve a specific location by ID for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: Location object
JSON

{
"id": "uuid1",
"userId": "user_uuid",
"name": "My Backyard Apiary",
"address": "123 Main St",
"latitude": 40.7128,
"longitude": -74.0060,
"description": "Hives behind the garage",
"createdAt": "2023-10-26T10:00:00Z",
"updatedAt": "2023-10-26T10:00:00Z"
}
POST /locations (Protected)

Purpose: Create a new location for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Request Body: { name, address, latitude, longitude, description }
JSON

{
"name": "New Orchard Location",
"address": "456 Apple Blvd",
"latitude": 34.0522,
"longitude": -118.2437,
"description": "Hives near the apple trees"
}
Response: New Location object (including id, userId, createdAt, updatedAt)
JSON

{
"id": "uuid_new_location",
"userId": "user_uuid",
"name": "New Orchard Location",
"address": "456 Apple Blvd",
"latitude": 34.0522,
"longitude": -118.2437,
"description": "Hives near the apple trees",
"createdAt": "2023-10-26T10:00:00Z",
"updatedAt": "2023-10-26T10:00:00Z"
}
PUT /locations/:id (Protected)

Purpose: Update an existing location for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Request Body: { name?, address?, latitude?, longitude?, description? } (partial updates allowed)
JSON

{
"description": "Hives moved to the lower orchard"
}
Response: Updated Location object
JSON

{
"id": "uuid1",
"userId": "user_uuid",
"name": "My Backyard Apiary",
"address": "123 Main St",
"latitude": 40.7128,
"longitude": -74.0060,
"description": "Hives moved to the lower orchard",
"createdAt": "2023-10-26T10:00:00Z",
"updatedAt": "2023-10-26T11:30:00Z"
}
DELETE /locations/:id (Protected)

Purpose: Delete a location for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: { message: "Location deleted successfully" } or { error: "..." }
GET /locations/map-data (Protected)

Purpose: Retrieve all beehive locations with owner information and hive counts for the map view. (This could be a public endpoint or protected depending on your design for the map view visibility). If public, owner info should be limited (e.g., username, not email).
Headers: Authorization: Bearer <jwt_token> (if protected)
Response: Array<MapLocationData>
JSON

[
{
"id": "uuid1",
"latitude": 40.7128,
"longitude": -74.0060,
"hiveCount": 5,
"ownerUsername": "beekeeper_john"
},
{
"id": "uuid2",
"latitude": 34.0522,
"longitude": -118.2437,
"hiveCount": 8,
"ownerUsername": "apiary_master"
}
// ... more map data
]

3. Major Inspections Endpoints
   Major Inspections are nested under Locations.

GET /locations/:locationId/major-inspections (Protected)

Purpose: Retrieve all major inspections for a specific location, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: Array<MajorInspection>
JSON

[
{
"id": "major_uuid_1",
"locationId": "uuid1",
"inspectionDate": "2024-05-01",
"notes": "General check-up before summer",
"createdAt": "2024-05-01T10:00:00Z",
"updatedAt": "2024-05-01T10:00:00Z"
},
// ... more major inspections for this location
]
GET /locations/:locationId/major-inspections/:id (Protected)

Purpose: Retrieve a specific major inspection by ID for a specific location, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: MajorInspection object
JSON

{
"id": "major_uuid_1",
"locationId": "uuid1",
"inspectionDate": "2024-05-01",
"notes": "General check-up before summer",
"createdAt": "2024-05-01T10:00:00Z",
"updatedAt": "2024-05-01T10:00:00Z"
}
POST /locations/:locationId/major-inspections (Protected)

Purpose: Create a new major inspection for a specific location, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Request Body: { inspectionDate, notes }
JSON

{
"inspectionDate": "2024-06-05",
"notes": "Post-spring inspection, focusing on new queen cells."
}
Response: New MajorInspection object
JSON

{
"id": "major_uuid_new",
"locationId": "uuid1",
"inspectionDate": "2024-06-05",
"notes": "Post-spring inspection, focusing on new queen cells.",
"createdAt": "2024-06-05T10:00:00Z",
"updatedAt": "2024-06-05T10:00:00Z"
}
PUT /locations/:locationId/major-inspections/:id (Protected)

Purpose: Update an existing major inspection for a specific location, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Request Body: { inspectionDate?, notes? } (partial updates allowed)
JSON

{
"notes": "Updated notes: Queen confirmed laying well."
}
Response: Updated MajorInspection object
JSON

{
"id": "major_uuid_1",
"locationId": "uuid1",
"inspectionDate": "2024-05-01",
"notes": "Updated notes: Queen confirmed laying well.",
"createdAt": "2024-05-01T10:00:00Z",
"updatedAt": "2024-06-05T11:00:00Z"
}
DELETE /locations/:locationId/major-inspections/:id (Protected)

Purpose: Delete a major inspection for a specific location, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: { message: "Major inspection deleted successfully" } 4. Hive Inspections Endpoints
Hive Inspections are nested under Major Inspections.

GET /locations/:locationId/major-inspections/:majorInspectionId/hive-inspections (Protected)

Purpose: Retrieve all hive inspections for a specific major inspection, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: Array<HiveInspection>
JSON

[
{
"id": "hive_uuid_1",
"majorInspectionId": "major_uuid_1",
"hiveNumber": "Hive A",
"inspectionHour": "10:30",
"colonyHealthStatus": "thriving",
"numberOfChambers": 3,
"amountOfBrood": "5 frames",
"queenStatus": "seen",
"approximateAmountOfHoney": "10 lbs",
"amountOfDroneComb": "1 frame",
"sugarFeedAdded": true,
"sugarFeedQuantity": "1 gallon",
"beehiveConfiguration": {
"broodChambers": 2,
"supers": 1,
"queenExcluder": true
},
"numberOfVarroaMitesFound": 5,
"varroaTreatment": false,
"treatmentApplied": "None",
"dosageAmount": null,
"raisingNewQueen": false,
"queenCellAge": null,
"queenCellStatus": null,
"otherNotes": "Strong colony, good build-up.",
"createdAt": "2024-05-01T10:30:00Z",
"updatedAt": "2024-05-01T10:30:00Z"
},
// ... more hive inspections for this major inspection
]
GET /locations/:locationId/major-inspections/:majorInspectionId/hive-inspections/:id (Protected)

Purpose: Retrieve a specific hive inspection by ID for a specific major inspection, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: HiveInspection object
POST /locations/:locationId/major-inspections/:majorInspectionId/hive-inspections (Protected)

Purpose: Create a new hive inspection for a specific major inspection, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Request Body: (All fields for HiveInspection except id, createdAt, updatedAt)
JSON

{
"hiveNumber": "Hive B",
"inspectionHour": "11:00",
"colonyHealthStatus": "weak",
"numberOfChambers": 2,
"amountOfBrood": "2 frames",
"queenStatus": "not seen",
"approximateAmountOfHoney": "5 lbs",
"amountOfDroneComb": "0 frames",
"sugarFeedAdded": true,
"sugarFeedQuantity": "0.5 gallon",
"beehiveConfiguration": {
"broodChambers": 2,
"supers": 0,
"queenExcluder": false
},
"numberOfVarroaMitesFound": 20,
"varroaTreatment": true,
"treatmentApplied": "Formic acid",
"dosageAmount": "60ml",
"raisingNewQueen": true,
"queenCellAge": 3,
"queenCellStatus": "closed",
"otherNotes": "Queen likely superseded, high varroa count."
}
Response: New HiveInspection object
PUT /locations/:locationId/major-inspections/:majorInspectionId/hive-inspections/:id (Protected)

Purpose: Update an existing hive inspection for a specific major inspection, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Request Body: (Partial updates allowed for any HiveInspection field)
JSON

{
"colonyHealthStatus": "thriving",
"varroaTreatment": false,
"treatmentApplied": "None"
}
Response: Updated HiveInspection object
DELETE /locations/:locationId/major-inspections/:majorInspectionId/hive-inspections/:id (Protected)

Purpose: Delete a hive inspection for a specific major inspection, for the authenticated user.
Headers: Authorization: Bearer <jwt_token>
Response: { message: "Hive inspection deleted successfully" }
GET /locations/:locationId/hive-inspections/filter/:hiveNumber (Protected)

Purpose: Filter and view the inspection history for a specific beehive across all major inspections at a location.
Headers: Authorization: Bearer <jwt_token>
Response: Array<HiveInspection> (filtered by hiveNumber for the given location)
Key Backend Components and Considerations:
Project Structure (Node.js/Express/TypeScript):

src/
├── app.ts // Express app setup, middleware, routes
├── server.ts // Entry point, starts the server
├── config/ // Environment variables, database config
│ └── index.ts
├── database/ // ORM setup (Sequelize/TypeORM), models, migrations
│ ├── index.ts
│ ├── models/
│ │ ├── User.ts
│ │ ├── Location.ts
│ │ ├── MajorInspection.ts
│ │ └── HiveInspection.ts
│ └── migrations/
├── middleware/ // Custom middleware (auth, validation, error handling)
│ ├── auth.ts // JWT verification, authorization checks
│ ├── validation.ts // Joi/Zod for input validation
│ └── errorHandler.ts // Centralized error handling
├── controllers/ // Business logic for each resource
│ ├── authController.ts
│ ├── locationController.ts
│ ├── majorInspectionController.ts
│ └── hiveInspectionController.ts
├── routes/ // API routes for each resource
│ ├── authRoutes.ts
│ ├── locationRoutes.ts
│ ├── majorInspectionRoutes.ts
│ └── hiveInspectionRoutes.ts
├── services/ // Database interaction logic (optional, for separation of concerns)
│ ├── locationService.ts
│ └── ...
├── types/ // TypeScript interfaces/types
│ ├── express.d.ts // Extend Request for user property
│ ├── models.ts
│ └── auth.ts
└── utils/ // Utility functions (e.g., password hashing)
└── jwt.ts
Authentication and Authorization:

JWT (JSON Web Tokens): After successful login (traditional or OAuth), issue a JWT. The frontend will include this token in the Authorization header (Bearer <token>) for all protected requests.
Middleware: Implement an authMiddleware that verifies the JWT. If valid, it should extract the userId from the token and attach it to the req.user object (you'll need to extend Express's Request interface in TypeScript).
Authorization: In your controllers, ensure that the userId from the authenticated request matches the userId associated with the data being accessed/modified (e.g., a user can only CRUD their own locations). For nested resources, you'll need to verify ownership of the parent resource as well (e.g., checking if the locationId belongs to the userId before allowing CRUD on MajorInspections within that location).
Input Validation:

Use a library like Joi or Zod to define schemas for your request bodies.
Implement a validationMiddleware that applies these schemas to incoming requests and returns a 400 Bad Request error if validation fails.
Error Handling:

Create a centralized errorHandler middleware. This catches errors thrown by your controllers or other middleware and formats them into a consistent JSON error response (e.g., { success: false, message: "Error message", statusCode: 500 }).
Use try-catch blocks in your controllers to handle asynchronous operations and potential errors gracefully.
ORM (Sequelize or TypeORM):

Sequelize: You'll define models, associations (e.g., User.hasMany(Location), Location.hasMany(MajorInspection)), and use its methods for CRUD operations.
TypeORM: Similar concept, using decorators to define entities and repositories for database interactions.
Migrations: Crucial for managing database schema changes over time.
Concurrency:

Node.js is single-threaded but handles I/O operations asynchronously, making it efficient for many concurrent connections.
Database connection pooling (managed by your ORM) will help handle concurrent database requests.
Ensure your queries are optimized and that you're using indexes where appropriate in PostgreSQL.
Environment Configuration (dotenv):

Store sensitive information (database credentials, JWT secret, OAuth client IDs/secrets) in a .env file and load them into your application using dotenv. Never hardcode these values.
Testing:

Use a testing framework like Mocha or Jest with Supertest for API integration tests.
Write unit tests for individual functions (e.g., utility functions, controller logic that doesn't involve direct DB calls).
This detailed API design and component breakdown should provide a solid foundation for building your Node.js/Express/TypeScript backend. Remember to focus on modularity, testability, and security throughout your development process.
