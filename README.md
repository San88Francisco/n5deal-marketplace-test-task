# N5Deal

Full-stack TypeScript workspace with a Next.js frontend and NestJS API.

## Stack

- `frontend`: Next.js, React, Tailwind CSS, shadcn/ui-style components, React Hook Form, Zod
- `backend`: NestJS, PostgreSQL, Prisma ORM, Zod

## Setup

1. Install dependencies with `npm install` at the repository root.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
3. Run `npm run prisma:migrate --workspace backend` after PostgreSQL is available.
4. Start both apps with `npm run dev`.

The frontend runs on `http://localhost:3000`; the API health endpoint is `http://localhost:3001/health`.
