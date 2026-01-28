# Google OAuth2 Authentication Flow

This document details the sequence of events for a user logging in via Google OAuth2.

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant API as Backend API
    participant Service as UserService
    participant DB as Database
    participant Google as Google Identity

    User->>Browser: Click "Login with Google"
    Browser->>API: GET /auth/google
    API-->>Browser: Redirect to Google (Consent Screen)
    Browser->>Google: Request Access
    User->>Google: Approve Permissions
    Google-->>Browser: Redirect to Callback URL
    Browser->>API: GET /auth/google/callback?code=...

    note over API, Google: Passport Middleware exchanges code for Profile

    API->>Service: handleGoogleUser(profile)

    rect rgb(240, 248, 255)
        note right of Service: 1. Check for Existing Google User
        Service->>DB: readByGoogleId(profile.id)
        DB-->>Service: User | null
    end

    alt User Found via Google ID
        Service-->>API: Return User
    else User Not Found
        rect rgb(255, 250, 240)
            note right of Service: 2. Check for Existing Email (Account Linking)
            Service->>DB: readByEmail(profile.email)
            DB-->>Service: User | null
        end

        alt User Found via Email
            Service->>DB: update(user.id, { google_id: profile.id })
            DB-->>Service: Updated User
            Service-->>API: Return User
        else User Not Found
            rect rgb(240, 255, 240)
                note right of Service: 3. Create New User
                Service->>DB: create({ email, google_id, ... })
                DB-->>Service: New User
                Service-->>API: Return User
            end
        end
    end

    API->>API: Generate JWT Token
    API-->>Browser: 200 OK (Set-Cookie: jwtcookie, Body: User+Token)
```

## Logic Breakdown

The `UserService.handleGoogleUser` method implements a smart account linking strategy:

1.  **Direct Match**: First, it checks if a user already exists with the incoming `google_id`.
2.  **Account Linking**: If no Google match is found, it checks if a user exists with the same **email address**. If found, it updates that user record to include the `google_id`, effectively linking the local account with the Google account.
3.  **Registration**: If neither exists, it creates a completely new user record.
