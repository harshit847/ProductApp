# Architecture

FlowCRM uses a simple two-app setup:

- `frontend/` for the Next.js product experience
- `backend/` for the Express API
- Prisma connects the backend to Neon PostgreSQL

This split keeps deployment clear:

- Vercel serves the frontend
- Render serves the backend
- Neon stores the data

## Why this is interview-friendly

- The boundaries are easy to explain
- The auth flow is explicit
- The data model is small enough to reason about
- The UI is polished without being over-engineered
