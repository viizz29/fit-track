# Fit Track Backend

This folder contains the NestJS backend for Fit Track. It is responsible for authentication, user management, exercise and schedule APIs, completion tracking, reports, email workflows, and production serving of the compiled frontend.

Repository: `github.com/viizz29/fit-track`

## How To Use This README

- Use the root [`../../README.md`](../../README.md) for the product overview and full-stack setup flow
- Use this file when you want backend-specific structure, commands, env variables, and Docker notes
- Use [`../frontend/README.md`](../frontend/README.md) when you need the React-side implementation details

## Stack

- NestJS 11
- TypeScript
- Sequelize
- PostgreSQL
- Redis
- JWT
- Swagger
- Nodemailer
- Jest

## What This Backend Does

The backend exposes a REST API for the frontend and handles the main business logic of the product:

- account registration and login
- email verification and password reset
- optional 2FA login step
- user profile and email preferences
- exercise type CRUD
- recurring schedule CRUD
- completion history
- reporting endpoints
- email notification infrastructure
- health endpoints

## Architecture

The backend follows a modular monolith structure. Business capabilities are grouped into NestJS modules instead of being mixed into one large service layer.

This README focuses on backend implementation details. For the broader system view, go back to the root [`../../README.md`](../../README.md).

### Main modules

- `src/modules/auth`: registration, login, verification, reset password, 2FA toggle
- `src/modules/users`: current-user profile and email preferences
- `src/modules/exercise-types`: exercise definitions
- `src/modules/exercise-schedules`: recurring schedules and date/week queries
- `src/modules/exercise-completions`: mark and remove completions
- `src/modules/reports`: summary reporting
- `src/modules/exercise-stats`: stats endpoints
- `src/modules/exercise-notifications`: scheduled notification logic
- `src/modules/mail`: mail transport and template rendering
- `src/modules/health`: health, liveness, and readiness endpoints
- `src/modules/chat`: optional Socket.IO support

### Infrastructure choices

The application is assembled in [`src/modules/app/app.module.ts`](./src/modules/app/app.module.ts). A few important patterns used there:

- `ConfigModule` loads environment-based config
- `SequelizeModule` connects to PostgreSQL
- `CacheModule` and `ThrottlerModule` are backed by Redis
- `JwtAuthGuard` and `EmailVerifiedGuard` are registered globally
- `ServeStaticModule` serves the compiled frontend in production-style deployments

The entry point is [`src/main.ts`](./src/main.ts), where the app sets the global prefix, Swagger, validation, CORS, and interceptors.

## Request Flow

A typical NestJS request in this project looks like this:

1. A request hits a controller under `src/modules/**`
2. DTO validation runs through Nest pipes
3. Global guards check JWT auth and email verification
4. The controller delegates to a service
5. The service talks to repositories/models and returns data
6. Global interceptors shape the response

This is a good portfolio pattern because it shows clear separation between transport, validation, business logic, and persistence.

## API Surface

The main route groups are:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/exercises`
- `/api/v1/schedules`
- `/api/v1/completions`
- `/api/v1/reports`
- `/api/v1/stats`
- `/api/health`

Swagger UI is available at `/docs`.

For the frontend consumer of these APIs, see [`../frontend/README.md`](code/frontend/README.md).

### Important route note

The final paths are built from two layers:

- a global prefix from `API_BASE_URL`
- controller-level versioned paths such as `v1/auth`

If `API_BASE_URL=/api`, then auth endpoints resolve to `/api/v1/auth/...`.

## Folder Structure

```text
code/backend
├── assets/                  # swagger init script and mail templates
├── src/
│   ├── common/              # guards, decorators, interceptor, pipes
│   ├── configs/             # shared config helpers
│   ├── database/
│   │   └── sequelize/       # migrations, seeders, config
│   ├── lib/                 # env validation, jwt strategy
│   ├── modules/             # feature modules
│   └── util/                # utility helpers
├── test/                    # e2e tests
├── Dockerfile
└── package.json
```

## Environment Variables

There is a sample file at [`./.env.example`](./.env.example), but the app currently validates more keys than that file lists. For local development, make sure your `./.env.local` includes at least:

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

### Why SMTP and Redis are required locally

Even if you are not actively testing scheduled emails, the app validates these values at startup. That means placeholder values are not enough unless they satisfy the schema and your code paths avoid using them.

## Local Development

### Install dependencies

```bash
npm ci
```

### Start supporting services

Before starting the Nest app, make sure:

- PostgreSQL is running
- Redis is running
- your backend env file matches those service credentials

### Run database migrations

```bash
npm run migrate:dev
```

### Optional: seed demo data

```bash
npm run seed:dev
```

### Start the app

```bash
npm run start:dev
```

By default, the backend runs on `http://localhost:3000`.

If you are setting up the complete application, return to the root [`../../README.md`](README.md) for the frontend startup steps as well.

## Useful Commands

```bash
npm run start:dev
npm run build
npm run start:prod
npm run migrate:dev
npm run seed:dev
npm test
npm run test:e2e
```

## Database

This backend uses Sequelize with migrations and seeders under [`src/database/sequelize`](./src/database/sequelize).

### Main entities

- users
- exercise types
- exercise schedules
- exercise completions
- email notifications
- password reset tokens
- user OTPs
- daily exercise stats

The design documents in the repo give additional context:

- [`../../docs/database.md`]../../docs/database.md)
- [`../../docs/apis.md`]../../docs/apis.md)
- [`../../docs/lld.md`]../../docs/lld.md)

## Security Patterns

This project includes several backend-focused patterns worth highlighting:

- JWT auth via strategy and global auth guard
- email verification guard
- DTO validation with `class-validator`
- rate limiting through Nest throttler and Redis storage
- password hashing with `bcrypt`
- request shaping through pipes and interceptors

## Email and Background Processing

The mail system is centered around:

- `assets/mail-templates/`
- `src/modules/mail/`
- `src/modules/exercise-notifications/`

This part of the backend is important from a portfolio perspective because it shows the system goes beyond simple CRUD and includes real operational concerns like reminders and delivery logic.

## Testing

Tests are split across:

- module and service specs inside `src/`
- end-to-end tests inside `test/`

Run them with:

```bash
npm test
npm run test:e2e
```

## Docker

The backend includes a production Dockerfile at [`./Dockerfile`](./Dockerfile).

### How production packaging works

In the CI pipeline:

1. the backend is built
2. the frontend is built separately
3. the frontend `dist/` output is copied into `public/`
4. the backend Docker image is built and pushed

That means this backend image can serve both:

- the API
- the compiled frontend assets

For the standalone frontend container and Nginx notes, see [`../frontend/README.md`](code/frontend/README.md).

### Helper scripts

- [`./build-docker-image.sh`](./build-docker-image.sh)
- [`./run-docker-image.sh`](./run-docker-image.sh)

### Port caveat

The Dockerfile exposes `5701`, while the Nest app listens on `PORT`. For a production container run that maps `5701:5701`, set `PORT=5701` in `.env.production`.

## Why This Backend Is Portfolio-Ready

This backend is a strong showcase for a NestJS-oriented developer because it demonstrates:

- modular design
- API validation and documentation
- authentication and authorization
- relational modeling and migrations
- Redis-backed operational concerns
- email integrations
- automated testing
- Docker packaging
- CI/CD integration

For the full project story that connects this backend to the UI and deployment flow, see the root [`../../README.md`](README.md).
