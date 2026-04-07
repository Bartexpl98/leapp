# Evidence-Based Discourse Platform

A web-based platform for structured, evidence-based online discussions and debates. 
Users can create debates, contribute arguments with clear stances, attach evidence, 
and evaluate arguments based on factuality and soundness.

## Features

- Structured debate threads
- Argument stances (affirmative, opposing, neutral)
- Evidence attachment system
- Two-dimensional voting (factuality and soundness)
- User authentication

## Tech Stack

- Next.js (App Router)
- TypeScript
- MongoDB with Mongoose
- NextAuth (authentication)

## Project structure

The project follows a modular structure separating routing, UI, and data layers:

```text
src/
  app/
    api/                  # Next.js route handlers
    debate/               # Debate pages and nested route actions
    dashboard/            # Admin and dashboard pages
    profile/              # Profile settings and onboarding pages
    signin/               # Sign-in UI route
    signup/               # Sign-up UI route
    layout.tsx            # App layout
    page.tsx              # Homepage
  components/             # Reusable UI and page components
  lib/                    # Database and auth helpers
  models/                 # Mongoose schemas and models
  services/               # Auth, OTP, password, and domain logic
  types/                  # Shared TypeScript types
  scripts/                # Seeding and DB helper scripts
```

## Requirements
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

## Setup

1. Clone the repository
2. Install dependencies:
   npm install

3. Create a `.env.local` file in the repository root and provide the following keys:

```env
MONGODB_URI=<your-mongodb-connection-string>
NEXTAUTH_SECRET=<your-next-auth-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are required for Google authentication.

4. Run the development server:
   npm run dev

5. Open http://localhost:3000

## Running the Application

- Register a new account
- Create a debate
- Add an argument with evidence
- Vote on an argument

If these steps work, the system is functioning correctly.  These can be tested both locally after following the setup steps, or on the online Vercel deployment at: https://discourse-gold.vercel.app/

## Available scripts

- `npm run dev` — start the Next.js development server
- `npm run build` — build the app for production
- `npm start` — run the built production app
- `npm run lint` — run ESLint
- `npm run test` — run Vitest tests

## Notes

- The MongoDB connection helper lives in `src/app/lib/mongoose.ts`.
- Authentication configuration uses `src/app/api/auth-options.ts`.
- The app routes are implemented with Next.js App Router conventions under `src/app`.
- Deployment can target Vercel or any Node.js host that supports Next.js.
- If any part of the local hosting doesn't work, the system can always be accessed online at: https://discourse-gold.vercel.app/