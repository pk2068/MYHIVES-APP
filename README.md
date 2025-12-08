# MYHIVES-APP Overview

This is a Node.js + Express + TypeScript REST API for managing beekeeping data (users, locations, hives, major inspections and hive inspections).​
PostgreSQL is accessed via sequelize-typescript models, and JWT-based auth is used (with optional Google/LinkedIn OAuth).​

Base API path: /api/v1 (for example: http://localhost:3000/api/v1).​

Check server running on http://localhost:3000/api/v1/health

# Tech stack

Runtime: Node.js, Express, TypeScript.​

Database: PostgreSQL, sequelize-typescript models with associations for users, locations, hives, major_inspections and hive_inspections.​

Auth: Username/password with bcrypt and JWT. Google and LinkedIn OAuth hooks will follow later.​

Middleware: CORS, Helmet, Morgan, JSON/urlencoded body parsing, centralized error handler.​

4 routes

> apiRouter.use('/auth', authRoutes);

> apiRouter.use('/locations', locationRoutes);

app.use('/api/v1/locations/:locationId/major-inspections', majorInspectionRoutes);
app.use('/api/v1/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections', hiveInspectionRoutes);

## General Endpoints

**GET** /api/v1/health (The health check endpoint)

# 1. 🔑 Authentication Endpoints (/api/v1/auth)

- ## _POST_ /api/v1/auth/register

        Description : Creates a new user account.

- ## _POST_ /api/v1/auth/login

        Description: Authenticates a user and returns a JWT token.

- ## _GET_ /api/v1/auth/me

        Description: Retrieves the authenticated user's profile information.

- ## _POST_ /api/v1/auth/logout

        Description: Invalidates the user's current session or token.

## 2. 📍 Location Endpoints (/api/v1/locations)

- ## _POST_ /api/v1/locations

        Description: Creates a new beehive location for the authenticated user.

- ## _GET_ /api/v1/locations

        Description: Retrieves a list of all locations for the authenticated user.

- ## _GET_ /api/v1/locations/{locationId}

        Description: Retrieves a specific location by its ID.

- ## _PUT_ /api/v1/locations/{locationId}

        Description: Updates an existing location by its ID.

- ## _DELETE_ /api/v1/locations/{locationId}

        Description: Deletes a specific location by its ID.

# 3. 🗓️ Major Inspection Endpoints (/api/v1/locations/{locationId}/major-inspections)

- ## _POST_ /api/v1/locations/{locationId}/major-inspections

         Description: Creates a new major inspection for a specific location.

- ## _GET_ /api/v1/locations/{locationId}/major-inspections

        Description: Retrieves all major inspections for a specific location.

- ## _GET_ /api/v1/locations/{locationId}/major-inspections/{majorInspectionId}

       Description: Retrieves a specific major inspection by its ID.

- ## _PUT_ /api/v1/locations/{locationId}/major-inspections/{majorInspectionId}

        Description: Updates a specific major inspection by its ID.

- ## _DELETE_ /api/v1/locations/{locationId}/major-inspections/{majorInspectionId}

        Description: Deletes a specific major inspection by its ID.

# 4. 🐝 Hive Inspection Endpoints (/api/v1/locations/{locationId}/major-inspections/{majorInspectionId}/hive-inspections)

- ## _POST_ `/api/v1/locations/{locationId}/major-inspections/{majorInspectionId}/hive-inspections`

        Description: Creates a new hive inspection for a specific major inspection.

- ## _GET_ /api/v1/locations/{locationId}/major-inspections/{majorInspectionId}/hive-inspections

       Description: Retrieves all hive inspections for a specific major inspection.

- ## _GET_ /api/v1/locations/{locationId}/major-inspections/{majorInspectionId}/hive-inspections/{hiveInspectionId}

        Description: Retrieves a specific hive inspection by its ID.

- ## _PUT_ /api/v1/locations/{locationId}/major-inspections/{majorInspectionId}/hive-inspections/{hiveInspectionId}

        Description: Updates a specific hive inspection by its ID.

- ## _DELETE_ /api/v1/locations/{locationId}/major-inspections/{majorInspectionId}/hive-inspections/{hiveInspectionId}

        Description: Deletes a specific hive inspection by its ID.
