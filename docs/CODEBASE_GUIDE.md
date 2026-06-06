# Developer Codebase Guide

This guide helps you navigate the Next.js App Router architecture and outlines conventions for extending the platform.

## Directory Structure
```text
src/
├── app/                  # Next.js App Router
│   ├── (public)/         # SEO pages (Home, Search, Legal). No auth required.
│   ├── admin/            # Superadmin tools. Protected by middleware.
│   ├── api/              # Standalone REST endpoints.
│   ├── auth/             # Auth callbacks and sign-in pages.
│   ├── customer/         # Customer account views. Protected.
│   └── vendor/           # Fleet management portal. Protected.
├── components/           
│   ├── ui/               # shadcn baseline UI components (Buttons, Inputs).
│   └── ...               # Domain-specific components (VehicleCard).
└── lib/                  
    ├── data/             # Server-only data access (admin.ts, vendor.ts).
    ├── email/            # Resend transaction templates.
    ├── search/           # Typesense schema and wrappers.
    ├── security/         # Auth checks, CSRF, Turnstile validations.
    ├── validation/       # Zod schemas shared between client/server.
    └── types.ts          # Global TypeScript interfaces.
```

## Adding New Features

### 1. Adding a New Page
- Determine the scope: is it public, customer-only, or vendor-only?
- Create a new folder inside the respective Route Group (e.g., `src/app/vendor/analytics/page.tsx`).
- Default to exporting an `async function` (Server Component). Only add `"use client"` if React hooks (`useState`, `useEffect`) are absolutely necessary.

### 2. Adding Database Logic
- Do not query `supabase` directly inside UI components. 
- Create or update a function inside `src/lib/data/` utilizing the `createAdminClient()` (service role) or standard authenticated client.
- Always validate inputs using a Zod schema from `src/lib/validation/schemas.ts` before interacting with the database.

### 3. Adding Server Actions
- Server Actions should be placed in an `actions.ts` file alongside the page that uses them (Colocation pattern).
- Example: `src/app/vendor/vehicles/actions.ts`.
- Always call `requireUser()` inside the action to verify authentication on the server boundary.

## Anti-Patterns to Avoid
- **Avoid client-side fetching for initial render:** Do not use `useEffect` + `fetch` for dashboard data. Fetch it securely in the Server Component and pass it down as props.
- **Do not expose service-role keys:** Never import `createAdminClient` inside a file marked with `"use client"`.
- **Do not bypass Zod:** Never insert raw `FormData` into Supabase without parsing it through Zod first.
