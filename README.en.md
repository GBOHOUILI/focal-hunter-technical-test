```markdown
[🇫🇷 Français](./README.md) | 🇬🇧 English

# Focal Hunter — React Native & Node.js Technical Test

Full-stack application: product list, product detail, waitlist signup with simulated asynchronous notification (event-driven architecture via BullMQ/Redis).

## Stack

- **Mobile**: Expo (SDK 54), React Native, TypeScript, React Navigation, TanStack Query
- **API**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Worker**: Node.js, BullMQ, Redis
- **Monorepo**: pnpm workspaces (`apps/api`, `apps/worker`, `apps/mobile`, `packages/shared`)

## Repo architecture

```
apps/
  api/        → REST API (products, signups)
  worker/     → BullMQ consumer, processes notifications asynchronously
  mobile/     → Expo application
packages/
  shared/     → Drizzle schema, domain types, zod validation schemas shared between api and worker
```

The database schema lives in `packages/shared` (not in `apps/api`) so that both the API and the worker can reference it without depending on each other — two separate processes, one single source of truth for the shape of the data.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for Postgres and Redis)
- A phone with Expo Go (SDK 54), or an emulator

## Setup

### 1. Clone and install

```bash
git clone https://github.com/GBOHOUILI/focal-hunter-technical-test.git
cd focal-hunter-technical-test
pnpm install
```

### 2. Start Postgres and Redis

```bash
docker compose up -d
docker compose ps   # both must show "healthy"
```

> Exposed ports are intentionally non-standard (Postgres on `5433`, Redis on `6380`) to avoid conflicts with any instances already installed locally on the development machine. Adjust the `.env` files accordingly if needed.

### 3. Environment variables

Create `apps/api/.env`:
```
NODE_ENV=development
PORT=3002
DATABASE_URL=postgres://zte:zte@localhost:5433/zte
REDIS_URL=redis://localhost:6380
SIGNUP_NOTIFICATION_DELAY_MS=3600000
```

Create `apps/worker/.env`:
```
NODE_ENV=development
DATABASE_URL=postgres://zte:zte@localhost:5433/zte
REDIS_URL=redis://localhost:6380
```

Create `apps/mobile/.env` (replace with the host machine's local network IP, not `localhost` — required for testing on a physical phone):
```
EXPO_PUBLIC_API_URL=http://<LOCAL_MACHINE_IP>:3002
```

### 4. Migrations + demo data

```bash
cd apps/api
pnpm exec drizzle-kit migrate
pnpm db:seed
```

The seed creates 2 stores and 7 products, including one deliberately out of stock (to test that visual state on mobile).

### 5. Start all 3 processes (3 separate terminals)

```bash
# Terminal 1
cd apps/api && pnpm dev

# Terminal 2
cd apps/worker && pnpm dev

# Terminal 3
cd apps/mobile && npx expo start
```

Scan the QR code with Expo Go (the phone and the machine must be on the same WiFi network).

### 6. Tests

```bash
cd apps/api
pnpm test
```

## Database schema

Three tables (`packages/shared/src/schema.ts`):

- **`stores`** — shops (`id`, `name`, `createdAt`)
- **`products`** — products, linked to a store (`storeId` → FK `stores.id`, `ON DELETE CASCADE`)
  - `price` as `numeric(10,2)` with `mode: "number"` (never a float for money, but converted to a real `number` on the TypeScript side for ergonomics)
  - `CHECK` constraints: `stock >= 0`, `price > 0`
- **`signups`** — waitlist signups for a product, linked to a product (`productId` → FK `products.id`, `ON DELETE CASCADE`)
  - `status`: Postgres enum (`pending` / `sent` / `failed`), an exact mirror of the shared TypeScript `SignupStatus` type
  - Composite unique constraint `(productId, email)` — prevents the same email from signing up twice for the same product, enforced at the database level (not just in application code)

Migrations are versioned in `apps/api/drizzle/`.

## API

| Method | Route | Description |
|---|---|---|
| GET | `/products` | List of products (with store name) |
| GET | `/products/:id` | Product detail |
| POST | `/products/:id/signup` | Waitlist signup (`{ "email": string }`) |

Consistent error responses: `{ "error": { "code": string, "message": string, "details"?: unknown } }`.

## Event-driven architecture

The signup flow:

1. `POST /products/:id/signup` validates the email (zod), checks that the product exists, records the signup (`status: pending`)
2. **No email is sent during the HTTP request.** A job is placed on a BullMQ queue (Redis), with a configured delay (`SIGNUP_NOTIFICATION_DELAY_MS`, 1 hour by default)
3. A **separate worker** (independent process, `apps/worker`) continuously listens to this queue. Once the delay has elapsed, it processes the job: simulates sending the email (log), then updates the status in the database (`sent` or `failed`)

### Why a queue (BullMQ/Redis) rather than a cron job or `setInterval`

A cron job would need to periodically poll the database ("are there any signups to process?"), wasting resources even when there's nothing to do, and introducing latency equal to the polling interval. With BullMQ, Redis natively handles the delay countdown — the job becomes "ready" on its own, with no process needing to actively check anything.

### Why the API and worker are two separate processes (two distinct `apps/*` folders)

If the worker crashes (a bug while processing a job), the API keeps responding to HTTP requests normally — the two share no in-memory state. This also allows them to be deployed and scaled independently (for example, running several worker instances to absorb a spike in jobs, without touching the API).

### Processing resilience

Each job has `attempts: 3` with exponential backoff (increasing delay between retries). The `failed` status in the database is only set once all 3 attempts are exhausted — not on every individual failure — to accurately reflect the job's real state.

## Other notable decisions

- **`packages/shared`**: the Drizzle schema, domain types, and zod schemas (email validation) are centralized here. Avoids duplication and drift between the API and the worker.
- **Database constraints (`UNIQUE`, `CHECK`)** in addition to application-level validation: defense in depth — even a bug in application code cannot insert inconsistent data.
- **TypeScript 7** (native Go compiler, released July 2026): used for the API and worker. Requires `moduleResolution` set to `bundler`/`nodenext` depending on context (the old `node` mode was removed in this version).
- **esbuild vulnerability (transitive, via `tsx`/`drizzle-kit`)**: fixed via `pnpm.overrides` (`esbuild >= 0.25.0`) rather than upgrading the parent tools, to stay on stable versions compatible with the rest of the project.
- **Non-standard ports** (API `3002`, Postgres `5433`, Redis `6380`): chosen to avoid conflicts with other services already installed locally — see each app's `.env.example`.

## Tests

7 unit tests (Vitest) on `apps/api`:
- `products.service.spec.ts` — DTO mapping, handling of a non-existent product
- `signups.service.spec.ts` — invalid email, non-existent product, duplicate signup, happy path (including verification that the job is scheduled with the correct payload)
```
