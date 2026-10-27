# JudgeLite Architecture Plan

## Overview
JudgeLite is a full‑stack competitive programming platform built with modern, type‑safe, and developer‑friendly technologies. It combines a **Next.js (App Router) front‑end** with **Supabase** for authentication, data storage, and real‑time updates, and uses the **Piston v2** execution API to run user code safely.

---

## Tech Stack
| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend Framework** | **Next.js (App Router)** (TypeScript) | Server‑side rendering, API routes, file‑system routing, edge capabilities |
| **Styling** | **Tailwind CSS** + **shadcn/ui** | Utility‑first CSS, configurable design system, accessible UI components |
| **Editor** | **@monaco-editor/react** | Rich code editor with syntax highlighting, IntelliSense, and theming |
| **Layout / Panels** | **react-resizable-panels** | Flexible, drag‑adjustable UI panels (e.g., problem list ↔ editor ↔ console) |
| **Icons** | **lucide-react** | Consistent, lightweight SVG icons |
| **Utility** | **clsx**, **tailwind-merge** | Class name composition and Tailwind conflict resolution |
| **Backend / Auth** | **Supabase** (PostgreSQL, Auth, Realtime) with **@supabase/ssr** and **@supabase/supabase-js** | Managed PostgreSQL, auth sessions, row‑level security, real‑time updates |
| **Code Execution** | **Piston v2 public API** (`https://emkc.org/api/v2/piston/execute`) | Language‑agnostic sandboxed execution (C++, Java, Python) |

---

## Core Security Rule
- **Hidden test cases** (`is_sample = false`) **must never be exposed to the client**.
- They are stored in a Supabase table `test_cases` with a boolean column `is_sample`.
- The only server side location that may read hidden test cases is the **Next.js API route** `POST /api/submit`.
- This route runs with **`SUPABASE_SERVICE_ROLE_KEY`** (service role) and therefore bypasses RLS, guaranteeing that the hidden cases are fetched securely.
- The client sends only the solution code and receives a **submission ID**. Results (pass/fail) are stored in a `submissions` table and streamed back to the UI via Supabase Realtime.

---

## Data Model (PostgreSQL)
```sql
-- Users (Supabase Auth) – uses built‑in auth tables.

CREATE TABLE problems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    difficulty text CHECK (difficulty IN ('Easy','Medium','Hard')),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE test_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
    input text NOT NULL,
    output text NOT NULL,
    is_sample boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    problem_id uuid REFERENCES problems(id) ON DELETE SET NULL,
    language text NOT NULL,
    code text NOT NULL,
    status text CHECK (status IN ('pending','running','finished','error')) DEFAULT 'pending',
    result jsonb,
    created_at timestamp with time zone DEFAULT now()
);
```

---

## API Routes
| Route | Method | Purpose | Security |
|-------|--------|---------|----------|
| `/api/problems` | GET | List public problems | Public (no auth required) |
| `/api/problems/[id]` | GET | Retrieve problem details (including **sample** test cases only) | Public |
| `/api/submit` | POST | Receive user code, fetch **hidden** test cases, call Piston, store result | **Service role key** – only this endpoint accesses hidden cases |
| `/api/submission/[id]` | GET | Get submission status/result (via Realtime) | Auth required – user can only see own submissions |

---

## Code Execution Flow
1. Client posts `{ problemId, language, code }` to `/api/submit`.
2. Server verifies auth, then **using the service role key** queries `test_cases` where `problem_id = $1` **and** `is_sample = false`.
3. The hidden test cases are sent to the **Piston API** along with the user code.
4. The response (stdout, stderr, exit code) is stored in `submissions.result` and the `status` is updated to `finished`.
5. Through Supabase Realtime, the UI receives the updated submission and displays pass/fail for each hidden case.

---

## Folder Structure (initial scaffold)
```
/ (root)
├─ app/                # Next.js App Router pages & API routes
│   ├─ layout.tsx
│   ├─ page.tsx        # Home / problem list UI
│   └─ api/
│       └─ submit/
│           └─ route.ts
├─ components/        # Re‑usable UI components (shadcn/ui wrappers, editor, panels)
├─ lib/               # Supabase client, utility functions, type definitions
├─ public/            # Static assets (logo, favicons)
├─ styles/
│   └─ globals.css   # Tailwind base imports
├─ .env.example
├─ .env.local         # ignored by git, holds real keys
├─ next.config.mjs
├─ tailwind.config.js
├─ postcss.config.js
├─ tsconfig.json
├─ package.json
└─ PLAN.md            # Architecture documentation (this file)
```

---

## Development Workflow
1. **Run locally**: `npm run dev` – starts Next.js dev server on `http://localhost:3000`.
2. **Supabase locally**: Use Supabase CLI or the hosted project; `.env.local` provides the URL and anon key. The service role key is only present in the Vercel environment variables.
3. **Testing**: Unit tests for utility functions; integration tests for API routes using `next-test-api-route-handler`.
4. **CI/CD**: Vercel automatically builds and deploys on push to `main`. Ensure env vars are set in Vercel dashboard.

---

## Future Milestones (high‑level)
- **Milestone 2** – Implement problem CRUD, UI for problem list, and sample test case display.
- **Milestone 3** – Full submission pipeline, real‑time result streaming, and scoreboard.
- **Milestone 4** – Contest management, rankings, and admin dashboard.
- **Milestone 5** – Dockerised runner for custom code execution (optional, replace Piston).

---

*Prepared by the Lead Full‑Stack Architect.*
