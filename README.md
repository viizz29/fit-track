# Fit Track

Fit Track is a full-stack exercise scheduling and tracking application. It lets users register, manage exercise types, create recurring schedules, mark completions, receive email reminders, and review progress reports through a React frontend backed by a NestJS API.

This repository is especially useful for developers who want to see how a modular NestJS backend can be paired with a modern React frontend, packaged with Docker, and validated through GitHub Actions.

Repository: `github.com/viizz29/fit-track`

## Read Me First

Use the docs in this order depending on what you need:

- Start here in the root README for the product overview, architecture, and full-stack setup flow
- Go to [`code/backend/README.md`](./code/backend/README.md) for the NestJS backend structure, env requirements, migrations, and API notes
- Go to [`code/frontend/README.md`](./code/frontend/README.md) for the React app structure, routing, API client setup, and frontend commands

## Tech Stack

### Backend

- NestJS 11
- Sequelize with PostgreSQL
- Redis for throttling and cache storage
- JWT authentication
- Swagger for API documentation
- Nodemailer for email delivery
- Jest for unit and e2e testing

### Frontend

- React 19
- Vite
- TypeScript
- Material UI
- React Router
- TanStack Query
- Redux Toolkit
- Vitest and Testing Library

### DevOps

- Docker
- GitHub Actions

## Architecture Overview

### 1. NestJS backend architecture

The backend is organized as a modular monolith. Instead of splitting the system into many services too early, the code keeps related business logic inside focused NestJS modules:

- `AuthModule`: registration, login, email verification, password reset, 2FA toggle
- `UsersModule`: current user profile and email preferences
- `ExerciseTypesModule`: CRUD for exercise definitions
- `ExerciseSchedulesModule`: recurring schedules, weekly and date-based queries
- `ExerciseCompletionsModule`: mark and remove completions
- `ReportsModule`: completions, missed sessions, completion-rate reporting
- `ExerciseNotificationsModule`: notification-related background logic
- `MailModule`: email template rendering and SMTP delivery
- `HealthModule`: health and readiness checks

At runtime, NestJS wires these modules together through dependency injection. DTOs and global validation pipes protect request input, guards protect private routes, and Swagger documents the API.

### 2. React frontend architecture

The frontend is a single-page application built with Vite and React. It uses:

- React Router for route-based navigation
- TanStack Query for server-state fetching
- Redux Toolkit for app-level state where needed
- Context providers for auth, socket setup, theme mode, and local storage
- Material UI for UI components

Protected pages are wrapped in auth-aware routes. API requests flow through a shared Axios client that injects the JWT token automatically.

### 3. Docker architecture

This repo currently uses Docker in two ways:

- `code/frontend/Dockerfile` builds the React app and serves it with Nginx
- `code/backend/Dockerfile` builds the NestJS app and runs it in production

The production pipeline treats the backend image as the main deployable artifact. During CI, the frontend is built first, then its `dist/` output is copied into `code/backend/public`, so the NestJS container can serve both the API and the compiled frontend from one image.

### 4. GitHub workflow architecture

The GitHub Actions workflow in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) does three things:

1. Tests and builds the backend
2. Tests and builds the frontend
3. On pushes to `main`, builds and pushes the production Docker image

This is a clean portfolio-friendly flow because it shows:

- automated quality checks
- repeatable builds
- artifact passing between jobs
- container-based deployment packaging

## Repository Structure

```text
.
├── code/
│   ├── backend/    # NestJS API, Sequelize models, migrations, tests, Dockerfile
│   └── frontend/   # React app, pages, components, tests, Dockerfile
├── docs/           # HLD, LLD, requirements, API and screen notes
└── .github/
    └── workflows/  # CI/CD pipeline
```

For implementation-level details, the two most important follow-up docs are:

- [`code/backend/README.md`](./code/backend/README.md)
- [`code/frontend/README.md`](./code/frontend/README.md)

## Core Product Features

- User registration and login
- Email verification and password reset
- Optional 2FA login step
- Exercise type management
- Recurring exercise schedules
- Daily and weekly schedule views
- Completion history
- Progress reports
- Email notification preferences
- Swagger API docs

## Backend Walkthrough

For backend-only onboarding, see [`code/backend/README.md`](./code/backend/README.md).

The backend entry point is [`code/backend/src/main.ts`](./code/backend/src/main.ts). It:

- boots the Nest application
- applies a global API prefix
- enables validation pipes
- sets up Swagger
- enables CORS outside production
- registers a global response interceptor

The root module is [`code/backend/src/modules/app/app.module.ts`](./code/backend/src/modules/app/app.module.ts). It shows the main infrastructure choices:

- `ConfigModule` for environment-driven configuration
- `SequelizeModule` for PostgreSQL access
- `CacheModule` and `ThrottlerModule` backed by Redis
- global JWT and email-verification guards
- optional Socket.IO module support
- static frontend serving through `ServeStaticModule`

### Important backend routes

The implemented API is centered around these route groups:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/exercises`
- `/api/v1/schedules`
- `/api/v1/completions`
- `/api/v1/reports`
- `/api/health`
- `/docs`

Swagger is exposed at `/docs`.

## Frontend Walkthrough

For frontend-only onboarding, see [`code/frontend/README.md`](./code/frontend/README.md).

The frontend bootstraps from [`code/frontend/src/main.tsx`](./code/frontend/src/main.tsx). It wraps the app with:

- React Query
- local storage provider
- auth provider
- socket provider
- router
- Redux store

Routes are defined in [`code/frontend/src/routes/app-routes.tsx`](./code/frontend/src/routes/app-routes.tsx). The main user-facing screens include:

- login and registration
- dashboard
- exercises
- schedules
- completion history
- reports
- calendar
- profile

The shared Axios client lives in [`code/frontend/src/api/client.ts`](./code/frontend/src/api/client.ts) and builds requests from:

- `VITE_BACKEND_SERVER`
- `VITE_API_BASE_URL`
- `VITE_MOCK_API_ON`

## Getting Started

### Prerequisites

Install these first:

- Node.js 20 or newer
- npm
- Docker
- PostgreSQL
- Redis
- an SMTP account for mail delivery

If you only want to explore the code and not use email features yet, you should still provide SMTP values because the backend validates them at startup.

## Environment Setup

If you want the service-specific setup steps, use:

- [`code/backend/README.md`](./code/backend/README.md) for backend env variables
- [`code/frontend/README.md`](./code/frontend/README.md) for frontend env variables

### Backend

There is already a sample file at [`code/backend/.env.example`](./code/backend/.env.example), but the running application requires more variables than that file currently lists. Create `code/backend/.env.local` with values like the following:

```env
APP_ENV=local
NODE_ENV=local
PORT=3000
API_BASE_URL=/api
DOCS_URL=/docs
SOCKETIO_ENDPOINT=/ws
SOCKETIO_ENDPOINT_ON=false

JWT_SECRET=replace-with-a-long-secret

DB_HOST=127.0.0.1
DB_DATABASE=fitrack
DB_USERNAME=postgres
DB_PASSWORD=postgres

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=your-redis-password

PUBLIC_HOST_WITH_PORT=http://localhost:3000
FRONTEND_BUILD_PATH=public
ENABLE_NOTIFICATION_EMAILS=false
SCHEDULED_TASKS_ENABLED=false

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=your-smtp-password
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME=Fit Track
```

### Frontend

There is also a sample file at [`code/frontend/.env.example`](./code/frontend/.env.example). For local development, a working `code/frontend/.env.local` can look like this:

```env
VITE_APP_NAME=Fit Track
VITE_MOCK_API_ON=false
VITE_BACKEND_SERVER=http://localhost:3000
VITE_API_BASE_URL=/api
VITE_SOCKETIO_ENABLED=false
VITE_SOCKETIO_ENDPOINT=/ws
```

### Why the API paths look like `/api/v1/...`

This is one of the easiest places to get confused when cloning the repo:

- the backend applies a global prefix from `API_BASE_URL`
- controllers are already versioned with `v1/...`

So if `API_BASE_URL=/api`, the final route becomes `/api/v1/...`.

## Running The Project Locally

### 1. Install dependencies

```bash
cd code/backend
npm ci
```

```bash
cd code/frontend
npm ci
```

### 2. Start PostgreSQL and Redis

Make sure both services are reachable using the values from your backend env file.

### 3. Run database migrations

```bash
cd code/backend
npm run migrate:dev
```

### 4. Optional: seed demo data

```bash
cd code/backend
npm run seed:dev
```

### 5. Start the backend

```bash
cd code/backend
npm run start:dev
```

The API should now be available at `http://localhost:3000/api/v1` and Swagger at `http://localhost:3000/docs`.

### 6. Start the frontend

Open a second terminal:

```bash
cd code/frontend
npm run dev
```

Vite will print the frontend URL, typically `http://localhost:5173`.

## Running Tests

For more targeted commands and folder-level testing notes, use the backend and frontend READMEs directly.

### Backend

```bash
cd code/backend
npm test
```

### Frontend

```bash
cd code/frontend
npm test
```

## Building Docker Images

### Backend image

```bash
cd code/backend
docker build -t fitrack-backend:latest .
```

### Frontend image

```bash
cd code/frontend
docker build -t fitrack-frontend:latest .
```

## Running The Production-Style Backend Image

The backend production image is the most important image in this repo because it is the one used by CI/CD.

### What it expects

Before you run it, make sure:

- the frontend has been built and copied into `code/backend/public`, or CI has done that for you
- you have a production env file
- PostgreSQL, Redis, and SMTP are reachable from the container

### Beginner-friendly manual flow

1. Build the frontend
2. Copy `code/frontend/dist` into `code/backend/public`
3. Build the backend image
4. Run the container with `--env-file`

Commands:

```bash
cd code/frontend
npm ci
npm run build
```

```bash
cd code/backend
rm -rf public
cp -r ../frontend/dist public
docker build -t fitrack:latest .
```

```bash
cd code/backend
docker run --name fitrack --env-file .env.production -p 5701:5701 fitrack:latest
```

The repo already contains helper scripts for this flow:

- [`code/backend/build-docker-image.sh`](./code/backend/build-docker-image.sh)
- [`code/backend/run-docker-image.sh`](./code/backend/run-docker-image.sh)

### Important note about the Docker port

The backend Dockerfile exposes port `5701`, but the Nest app itself listens on `process.env.PORT` and defaults to `3000`. In practice, you should set `PORT=5701` in `.env.production` when running the container exactly as shown above.

## GitHub Actions Pipeline

The CI file is [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

### Backend job

- installs dependencies
- runs Jest tests
- builds the NestJS app
- uploads `dist/` as an artifact

### Frontend job

- installs dependencies
- runs Vitest tests
- creates `.env.production`
- builds the React app
- uploads `dist/` as an artifact

### Docker job

- downloads both build artifacts
- copies the frontend build into `code/backend/public`
- logs into Docker Hub
- builds and pushes the production image

This is a strong portfolio detail because it demonstrates both application development and delivery automation.

## Useful Commands

```bash
# backend
cd code/backend
npm run start:dev
npm run migrate:dev
npm run seed:dev
npm test
```

```bash
# frontend
cd code/frontend
npm run dev
npm run build
npm test
```

## Documentation References

Additional project notes already exist in:

- [`code/backend/README.md`](./code/backend/README.md)
- [`code/frontend/README.md`](./code/frontend/README.md)
- [`docs/hld.md`](./docs/hld.md)
- [`docs/lld.md`](./docs/lld.md)
- [`docs/apis.md`](./docs/apis.md)
- [`docs/database.md`](./docs/database.md)
- [`docs/screens.md`](./docs/screens.md)
- [`docs/workflows.md`](./docs/workflows.md)

## Why This Project Works Well In A Portfolio

From a backend-focused perspective, this repo showcases:

- modular NestJS design instead of a flat controller-only structure
- validation, guards, auth, rate limiting, and API documentation
- relational data modeling with migrations
- Redis-backed throttling and caching
- email and background-task integration points
- frontend/backend coordination in a real product flow
- containerization and CI/CD automation

It is a good example of a backend-heavy application that still feels complete when demonstrated end to end.
