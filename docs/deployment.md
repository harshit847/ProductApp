# Deployment Guide

## Vercel

1. Connect the repository.
2. Set `NEXT_PUBLIC_API_URL`.
3. Deploy the `frontend` app.

## Render

1. Create a web service from `backend/`.
2. Install dependencies and build the TypeScript server.
3. Point `CLIENT_ORIGIN` to the Vercel URL.

## Neon

1. Create a Postgres database.
2. Paste the connection string into `DATABASE_URL`.
3. Run Prisma migrations before using the app.
