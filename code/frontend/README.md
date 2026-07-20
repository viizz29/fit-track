# Fit Track Frontend

This folder contains the React frontend for Fit Track. It provides the user interface for authentication, exercise management, schedules, completion tracking, reports, calendar views, and profile management.

## How To Use This README

- Use the root [`../../README.md`](../../README.md) for the product overview and full-stack setup flow
- Use this file when you want frontend-specific structure, routing, state, env variables, and build commands
- Use [`../backend/README.md`](../../code/backend/README.md) when you need the NestJS API and backend runtime details

## Stack

- React 19
- Vite
- TypeScript
- Material UI
- React Router
- TanStack Query
- Redux Toolkit
- Axios
- Vitest
- Testing Library

## What This Frontend Does

The frontend is a single-page application that consumes the NestJS backend API and gives users a complete product flow:

- register and log in
- verify email and reset password
- manage exercise types
- create and edit recurring schedules
- view dashboard and calendar screens
- mark completions
- review reports
- update profile and preferences

## Architecture

The frontend starts in [`src/main.tsx`](../../code/frontend/src/main.tsx), where the app is wrapped with:

- `QueryClientProvider`
- `LocalStorageProvider`
- `AuthProvider`
- `SocketProvider`
- `BrowserRouter`
- Redux `Provider`

This combination gives the app a clear split between:

- server state
- auth/session state
- app state
- routing
- socket integration

This README stays focused on the client application. For the end-to-end architecture, return to the root [`../../README.md`](../../README.md).

## Routing

Routes are defined in [`src/routes/app-routes.tsx`](../../code/frontend/src/routes/app-routes.tsx).

### Public pages

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/resend-verification`

### Protected pages

- `/dashboard`
- `/exercises`
- `/schedules`
- `/completions`
- `/reports`
- `/calendar`
- `/profile`

Private pages are wrapped in a `PrivateRoute` component that waits for auth initialization and redirects unauthenticated users to login.

## Folder Structure

```text
code/frontend
├── public/                  # static assets
├── src/
│   ├── api/                 # axios client and feature API wrappers
│   ├── assets/              # logos, images, animations, icons
│   ├── components/          # shared UI components
│   ├── context/             # auth context and hooks
│   ├── mocks/               # mock service worker setup
│   ├── pages/               # route-level screens
│   ├── providers/           # app-wide providers
│   ├── routes/              # app routing
│   ├── services/            # socket and other services
│   ├── store/               # Redux store and slices
│   ├── theme/               # theme context and providers
│   └── utils/               # date, navigation, timezone helpers
├── Dockerfile
├── nginx.conf
└── package.json
```

## API Integration

The shared Axios instance lives in [`src/api/client.ts`](../../code/frontend/src/api/client.ts).

It is responsible for:

- building the base URL from environment variables
- attaching the JWT token from local storage
- redirecting on `401 Unauthorized`

For the backend modules and route ownership behind these APIs, see [`../backend/README.md`](../../code/backend/README.md).

### Environment-controlled API behavior

The app reads configuration from [`src/config.ts`](../../code/frontend/src/config.ts):

- `VITE_APP_NAME`
- `VITE_MOCK_API_ON`
- `VITE_BACKEND_SERVER`
- `VITE_API_BASE_URL`
- `VITE_SOCKETIO_ENABLED`
- `VITE_SOCKETIO_ENDPOINT`

If `VITE_MOCK_API_ON=true`, the app starts MSW and can run against mocked handlers instead of the real backend.

## Auth Flow

Authentication is managed mainly through [`src/context/auth-provider.tsx`](../../code/frontend/src/context/auth-provider.tsx).

### What it handles

- persisting token and user profile in storage
- decoding JWT payloads
- hydrating auth state on app load
- refreshing profile data from the backend
- logging out on token expiry

This is a helpful implementation detail to mention in interviews because it shows practical session handling on the client side.

## UI Structure

The app uses a layout-based approach with shared building blocks under `src/components/`, especially:

- layout components
- form components
- modal components
- data display components
- navigation components

Pages under `src/pages/` compose these reusable pieces into feature screens.

## Environment Variables

There is a sample file at [`./.env.example`](../../code/frontend/.env.example). For local development, a practical `./.env.local` looks like:

```env
VITE_APP_NAME=Fit Track
VITE_MOCK_API_ON=false
VITE_BACKEND_SERVER=http://localhost:3000
VITE_API_BASE_URL=/api
VITE_SOCKETIO_ENABLED=false
VITE_SOCKETIO_ENDPOINT=/ws
```

### Route and API note

Because the backend routes end up under `/api/v1/...`, the frontend usually points to:

- `VITE_BACKEND_SERVER=http://localhost:3000`
- `VITE_API_BASE_URL=/api`

The feature-level API files then call versioned backend paths from there.

## Local Development

### Install dependencies

```bash
npm ci
```

### Start the app

```bash
npm run dev
```

Vite usually serves the app at `http://localhost:5173`.

If you are bringing up the whole product locally, return to the root [`../../README.md`](../../README.md) for the backend, PostgreSQL, and Redis steps.

### Build for production

```bash
npm run build
```

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

## Testing

The project uses Vitest and Testing Library. Tests exist across:

- API wrappers
- providers
- routes
- reusable components
- page flows

Run tests with:

```bash
npm test
```

## Docker

The frontend includes its own Dockerfile at [`./Dockerfile`](../../code/frontend/Dockerfile).

### What it does

1. builds the Vite app
2. copies the compiled output into an Nginx image
3. serves the static files from Nginx

The Nginx config is in [`./nginx.conf`](../../code/frontend/nginx.conf).

### Important deployment note

This repo’s main production pipeline does not deploy the frontend as a separate long-lived container. Instead, the CI workflow builds the frontend and copies the output into the backend image so NestJS can serve the static assets from `public/`.

So the standalone frontend Dockerfile is still useful for:

- isolated frontend testing
- alternate deployment experiments
- showing Docker familiarity in the portfolio

For the main production deployment story, where the frontend build is copied into the backend image, see:

- root [`../../README.md`](../../README.md)
- backend [`../backend/README.md`](../../code/backend/README.md)

## Key Screens

Based on the current routes and pages, the main screens include:

- login
- registration
- forgot/reset password
- dashboard
- exercises
- schedules
- completion history
- reports
- calendar
- profile

## Why This Frontend Is Portfolio-Ready

This frontend is a strong companion to the backend because it demonstrates:

- React app structure beyond a toy example
- route protection and auth hydration
- API integration with shared client logic
- state management with multiple appropriate tools
- reusable component organization
- test coverage across UI and API layers
- Docker and production build awareness

It helps present the overall project as a real, end-to-end application instead of just a backend API with a placeholder UI.

For that complete end-to-end story, use the root [`../../README.md`](../../README.md).
