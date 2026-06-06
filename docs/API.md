# API Documentation

This outlines the structure of the Next.js API Routes and Server Actions handling the backend logic for Hire Car.

## Public Endpoints (REST)

### `GET /api/health`
Checks the database connection and returns the system status.
- **Auth Required**: No
- **Response Shape**: `{ status: "healthy", timestamp: string }`

### `GET /api/search`
Queries Typesense for vehicles, with a fallback to Supabase Postgres.
- **Auth Required**: No
- **Query Params**: `q`, `city`, `state`, `category`, `make`, `minPrice`, `maxPrice`, `seats`, `transmission`, `fuel`, `page`, `perPage`, `sortBy`.
- **Response Shape**: `{ vehicles: Vehicle[], total: number, page: number }`
- **Rate Limit**: 30 requests per minute per IP.

### `POST /api/leads/quick`
Submits a quick enquiry for a vehicle. Validates via Cloudflare Turnstile.
- **Auth Required**: No
- **Body**: `{ vehicleId, name, email, phone, dates, message, turnstileToken }`
- **Response**: `{ success: true, leadId: string }`

## Secure Endpoints (REST)

### `POST /api/search/reindex`
Triggers a complete wipe and re-sync of the Typesense index from Postgres.
- **Auth Required**: Yes (`Authorization: Bearer <cron_secret>`)
- **Response**: `{ message: "Indexing complete" }`

### `POST /api/stripe/webhook`
Receives payment lifecycle events from Stripe.
- **Auth Required**: Yes (`Stripe-Signature` Header)

## Server Actions (RPC)
The majority of application logic happens via Server Actions (`"use server"`) imported directly by Client Components.

**Common Actions:**
- `createBranch(data: FormData)`: Creates a new physical branch for a vendor.
- `upsertVehicle(data: FormData)`: Inserts or updates a vehicle listing.
- `updateLeadStatus(leadId, status)`: Marks a lead as approved, rejected, or completed.
- `processOnboarding(data: FormData)`: Upgrades a standard user to a Vendor tenant.

**Action Security Notes:**
All Server Actions must call `requireUser()` (and optionally `ensureUserCanManageOrganization(orgId)`) immediately before executing database logic to prevent IDOR (Insecure Direct Object Reference) vulnerabilities.
