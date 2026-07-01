```markdown
# REST API Specification for Exercise Scheduling & Tracking Application

Base path: `/api/v1`

---

## 1. Authentication & User Management

### 1.1 Register User
- Method: POST
- Path: /api/v1/auth/register
- Description: Register a new user account.
- Request body:
  ```json
  {
    "email": "string (email)",
    "password": "string (min 8 chars)",
    "timezone": "string (e.g., 'America/New_York')"
  }
  ```
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "timezone": "string",
    "emailRemindersEnabled": true
  }
  ```

### 1.2 Login User
- Method: POST
- Path: /api/v1/auth/login
- Description: Authenticate user and return access token.
- Request body:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "accessToken": "jwt-token",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
  ```

### 1.3 Logout User
- Method: POST
- Path: /api/v1/auth/logout
- Description: Invalidate user session/token.
- Request body: None
- Query params: None
- Path params: None
- Response: Status 204 No Content

### 1.4 Get Current User Profile
- Method: GET
- Path: /api/v1/users/me
- Description: Returns the authenticated user's profile.
- Request body: None
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "timezone": "string",
    "emailRemindersEnabled": true,
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 1.5 Update User Profile
- Method: PUT
- Path: /api/v1/users/me/profile
- Description: Update timezone or other profile settings.
- Request body: (Any or all fields optional)
  ```json
  {
    "timezone": "string (IANA tz database name)",
    "email": "string (optional - to change email)"
  }
  ```
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "timezone": "string",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 1.6 Update Email Preferences
- Method: PUT
- Path: /api/v1/users/me/email-preferences
- Description: Update user notification/reminder email preferences.
- Request body:
  ```json
  {
    "emailRemindersEnabled": true
  }
  ```
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "emailRemindersEnabled": true
  }
  ```

---

## 2. Exercise Management

### 2.1 Create Exercise Type
- Method: POST
- Path: /api/v1/exercises
- Description: Create a new exercise type.
- Request body:
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 2.2 Get All Exercise Types
- Method: GET
- Path: /api/v1/exercises
- Description: Return list of all exercise types for authenticated user.
- Request body: None
- Query params: None
- Path params: None
- Response:
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "description": "string or null",
      "createdAt": "ISO8601 datetime",
      "updatedAt": "ISO8601 datetime"
    },
    ...
  ]
  ```

### 2.3 Get Exercise Type by ID
- Method: GET
- Path: /api/v1/exercises/{exerciseId}
- Description: Retrieve details of an exercise type.
- Request body: None
- Query params: None
- Path params:
  - `exerciseId` (uuid) - ID of the exercise type.
- Response:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 2.4 Update Exercise Type
- Method: PUT
- Path: /api/v1/exercises/{exerciseId}
- Description: Update an existing exercise type.
- Request body:
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- Query params: None
- Path params:
  - `exerciseId` (uuid)
- Response:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string or null",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 2.5 Delete Exercise Type
- Method: DELETE
- Path: /api/v1/exercises/{exerciseId}
- Description: Delete an exercise type.
- Request body: None
- Query params: None
- Path params:
  - `exerciseId` (uuid)
- Response: Status 204 No Content

---

## 3. Scheduling Module

### 3.1 Create Exercise Schedule
- Method: POST
- Path: /api/v1/schedules
- Description: Create a new scheduled recurring exercise.
- Request body:
  ```json
  {
    "exerciseTypeId": "uuid",
    "recurrenceType": "HOURLY|DAILY|WEEKLY",
    "recurrenceInterval": "integer > 0",
    "startDateTime": "ISO8601 datetime with timezone",
    "timezone": "string (IANA tz name)"
  }
  ```
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "id": "uuid",
    "exerciseTypeId": "uuid",
    "recurrenceType": "HOURLY|DAILY|WEEKLY",
    "recurrenceInterval": integer,
    "startDateTime": "ISO8601 datetime with timezone",
    "timezone": "string",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 3.2 List Exercise Schedules
- Method: GET
- Path: /api/v1/schedules
- Description: Get all schedules of the authenticated user.
- Request body: None
- Query params: None
- Path params: None
- Response:
  ```json
  [
    {
      "id": "uuid",
      "exerciseTypeId": "uuid",
      "recurrenceType": "HOURLY|DAILY|WEEKLY",
      "recurrenceInterval": integer,
      "startDateTime": "ISO8601 datetime with timezone",
      "timezone": "string",
      "exerciseTypeName": "string",
      "createdAt": "ISO8601 datetime",
      "updatedAt": "ISO8601 datetime"
    },
    ...
  ]
  ```

### 3.3 Get Schedule by ID
- Method: GET
- Path: /api/v1/schedules/{scheduleId}
- Description: Retrieve a schedule details.
- Request body: None
- Query params: None
- Path params:
  - `scheduleId` (uuid)
- Response:
  ```json
  {
    "id": "uuid",
    "exerciseTypeId": "uuid",
    "recurrenceType": "HOURLY|DAILY|WEEKLY",
    "recurrenceInterval": integer,
    "startDateTime": "ISO8601 datetime with timezone",
    "timezone": "string",
    "exerciseTypeName": "string",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 3.4 Update Schedule
- Method: PUT
- Path: /api/v1/schedules/{scheduleId}
- Description: Update an existing exercise schedule.
- Request body:
  ```json
  {
    "exerciseTypeId": "uuid",
    "recurrenceType": "HOURLY|DAILY|WEEKLY",
    "recurrenceInterval": "integer > 0",
    "startDateTime": "ISO8601 datetime with timezone",
    "timezone": "string"
  }
  ```
- Query params: None
- Path params:
  - `scheduleId` (uuid)
- Response:
  ```json
  {
    "id": "uuid",
    "exerciseTypeId": "uuid",
    "recurrenceType": "HOURLY|DAILY|WEEKLY",
    "recurrenceInterval": integer,
    "startDateTime": "ISO8601 datetime with timezone",
    "timezone": "string",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
  ```

### 3.5 Delete Schedule
- Method: DELETE
- Path: /api/v1/schedules/{scheduleId}
- Description: Delete an exercise schedule.
- Request body: None
- Query params: None
- Path params:
  - `scheduleId` (uuid)
- Response: Status 204 No Content

---

## 4. Completion Tracking

### 4.1 Mark Exercise as Completed
- Method: POST
- Path: /api/v1/completions
- Description: Record a completion for a scheduled exercise.
- Request body:
  ```json
  {
    "scheduleId": "uuid",
    "completionDateTime": "ISO8601 datetime with timezone (optional, defaults to now)"
  }
  ```
- Query params: None
- Path params: None
- Response:
  ```json
  {
    "id": "uuid",
    "scheduleId": "uuid",
    "completionDateTime": "ISO8601 datetime with timezone",
    "createdAt": "ISO8601 datetime"
  }
  ```

### 4.2 List Completions
- Method: GET
- Path: /api/v1/completions
- Description: List completions filtered by optional date range and/or schedule.
- Request body: None
- Query params:
  - `startDate` (optional ISO8601 date string) - filter completions >= startDate
  - `endDate` (optional ISO8601 date string) - filter completions <= endDate
  - `scheduleId` (optional UUID) - filter completions for specific schedule
- Path params: None
- Response:
  ```json
  [
    {
      "id": "uuid",
      "scheduleId": "uuid",
      "completionDateTime": "ISO8601 datetime with timezone",
      "createdAt": "ISO8601 datetime"
    },
    ...
  ]
  ```

### 4.3 Delete Completion (Optional)
- Method: DELETE
- Path: /api/v1/completions/{completionId}
- Description: Delete a completion record, e.g., for correction.
- Request body: None
- Query params: None
- Path params:
  - `completionId` (uuid)
- Response: Status 204 No Content

---

## 5. Reporting

### 5.1 Get Completed Exercises Report
- Method: GET
- Path: /api/v1/reports/completions
- Description: Returns count of completed exercises grouped by specified period.
- Request body: None
- Query params:
  - `startDate` (required ISO8601 date, e.g., "2024-01-01")
  - `endDate` (required ISO8601 date)
  - `period` (required enum: `daily`, `weekly`, `monthly`)
- Path params: None
- Response:
  ```json
  {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "period": "daily",
    "data": [
      {
        "date": "2024-01-01",
        "completionCount": 3
      },
      ...
    ]
  }
  ```

### 5.2 Get Missed Exercises Report
- Method: GET
- Path: /api/v1/reports/missed
- Description: Returns count of missed exercises over time.
- Request body: None
- Query params:
  - `startDate` (required ISO8601 date)
  - `endDate` (required ISO8601 date)
- Path params: None
- Response:
  ```json
  {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "missedCount": 5
  }
  ```

### 5.3 Get Completion Rate / Streak Report
- Method: GET
- Path: /api/v1/reports/completion-rate
- Description: Returns completion rate and optionally current streak within date range.
- Request body: None
- Query params:
  - `startDate` (required ISO8601 date)
  - `endDate` (required ISO8601 date)
- Path params: None
- Response:
  ```json
  {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "completionRate": 0.75,
    "currentStreak": 4
  }
  ```

---

## Security

- All endpoints (except /auth/*) require Bearer JWT token authentication.
- User actions are authorized; no access to other users’ data.
- Errors return appropriate HTTP status codes (401 unauthorized, 403 forbidden, 404 not found, 400 bad request).

---
```