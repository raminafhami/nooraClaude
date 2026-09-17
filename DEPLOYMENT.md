# Noora ERP — customer deployment

Backend: NestJS 9 · Frontend: Next.js 14 · MongoDB · Redis · Elasticsearch 8.

## Requirements

| Component | Version |
|---|---|
| Docker Engine | 24+ (tested against the Compose v2 spec; 29.x used during preparation) |
| Docker Compose | v2.20+ (`docker compose`, not `docker-compose`) |
| Node.js (only if running outside Docker) | 20 or 22 (backend `engines`: Node ≥ 20; frontend built on node:18-alpine) |

Server sizing, derived from the images and JVM settings in `docker-compose.prod.yml`:

- **RAM: 8 GB minimum.** Elasticsearch alone is configured for a 1 GB heap (`ES_JAVA_OPTS`) and wants roughly double that in practice; the Next.js build peaks at 4 GB (`--max-old-space-size=4096`).
- **CPU: 4 cores** recommended (2 minimum; the frontend build is the bottleneck).
- **Disk: 30 GB+**, mostly Mongo data, Elasticsearch indices and uploaded documents.
- Building the frontend image on the server needs the RAM above. On a smaller box, build elsewhere and push the image.

## Layout

```
/opt/noora/
├── docker-compose.prod.yml
├── .env                      <- server secrets (never committed)
├── noora-flow-main/          <- backend repository
└── noora_frontend-develop/   <- frontend repository
```

## Ports

| Port | Service | Exposed to the host? |
|---|---|---|
| 3000 | Frontend (Next.js) | yes — `FRONTEND_PORT` |
| 4000 | Backend (NestJS) | yes — `BACKEND_PORT` |
| 27017 | MongoDB | no — internal network only |
| 6379 | Redis | no — internal network only |
| 9200 | Elasticsearch | no — internal network only |

Put a reverse proxy (nginx, Caddy, Traefik) with TLS in front of 3000 and 4000.
Only those two need to reach the outside world.

## Environment

Three example files list every variable by name, with no real values:

- `.env.example` (next to the compose file) — what the stack itself needs
- `noora-flow-main/.env.example` — the full backend set
- `noora_frontend-develop/.env.example` — the frontend set

Variables that decide whether the deployment works at all:

| Variable | Why it matters |
|---|---|
| `CUSTOMER_NAITCO_URL` | The login endpoint compares the request `Origin` against it. `normal`-type users may sign in **only** from this origin; all other user types **only** from a different one. A wrong value produces `Invalid login` with correct credentials. |
| `NEXT_PUBLIC_EXTERNAL_API_URL` | Browser → backend base URL. Inlined at build time. |
| `NEXT_PUBLIC_APP_URL` | Used by `/api/auth/logout` to build its redirect. Empty ⇒ the frontend build fails. |
| `NEXT_PUBLIC_INTERNAL_API_URL` | This app's own Next.js route handlers. Keep it `/api` (relative). `.env` files do not expand variables, so a value like `$NEXT_PUBLIC_APP_URL/api` is sent literally and breaks the public letter/certificate downloads. |
| `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE` | Shared by sign and verify. Changing them invalidates every issued token. |
| `ADMIN_PHONE`, `ADMIN_PASSWORD` | Read by the seeder. Never hardcoded. |
| `OTP_LOGIN_ENABLED`, `NEXT_PUBLIC_ENABLE_OTP_LOGIN` | Both `false` for this customer. |
| `MONGO_USER` / `MONGO_PASS` | Must match on the Mongo container and in the backend config. |

`NEXT_PUBLIC_*` values are compiled into the frontend bundle. Changing one requires
`docker compose -f docker-compose.prod.yml build frontend`, not just a restart.

## First deployment

```bash
cd /opt/noora
cp .env.example .env
cp noora-flow-main/.env.example noora-flow-main/.env.production   # if running the backend outside compose
# edit .env and fill in every empty value

# customer logo: replace the placeholder
# the customer logo already ships at noora_frontend-develop/public/images/customer-logo.png
# replace that file to change it

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Wait until `mongo`, `redis` and `elasticsearch` report `healthy`, then seed.

## Seeder

There is no migration system — Mongoose creates collections on demand. Seeding
is explicit:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

Outside Docker: `npm run build && npm run seed` (or `npm run seed:dev` from source).

The seeder is idempotent:

```
first run   → super-admin permission + group + admin user created
second run  → existing admin detected, nothing created, password untouched
```

It never overwrites the password of an existing admin. If the admin exists but
is missing the `super-admin` group, the group is added.

Setting `SEED_ADMIN_ON_STARTUP=true` seeds during application bootstrap instead.
Use it only with a single backend replica — several replicas seeding at once is
a race. The default is `false`, and a failure there is logged without taking the
application down.

Reference data (industries, activity project, inspection costs) has its own,
separate seeder, reachable at `GET /seeder` on the backend. It predates this
work and is unchanged.

## Admin

The seeder creates the administrator with phone/username **09120000000**,
`type: system`, `loginType: password`, member of the `super-admin` group, which
holds a `manage` / `all` permission.

The password is **not** in this repository or in this document. It is read from
`ADMIN_PASSWORD` in the server environment, hashed with bcrypt before storage.
Set it in `.env` before seeding and rotate it after the first sign-in.

## What can only be confirmed on a running server

Everything below was prepared and checked statically (builds, type checks,
lint, `docker compose config`), but **was not executed** in the environment
where it was written — container images could not be pulled there. None of it
should be treated as verified until it has run on the customer server:

- `docker compose build` / `up -d` and the health of all five services
- MongoDB, Redis and Elasticsearch connectivity from the backend
- `npm run seed`: admin creation, and that a second run creates no duplicate
- Admin sign-in, and `CUSTOMER_NAITCO_URL` matching the real frontend origin
- The dashboard header logo (needs an authenticated session)
- **The repeated-logout fix: code-level fix applied, runtime verification
  pending.** The cause found was two concurrent refresh calls redeeming the
  same rotated refresh token; the fix funnels both callers through one
  single-flight request. Step 5-6 of the login test is what confirms it.
- Public letter/certificate downloads through `NEXT_PUBLIC_INTERNAL_API_URL`
- Search features backed by Elasticsearch

## Update / redeploy

```bash
cd /opt/noora
git -C noora-flow-main pull
git -C noora_frontend-develop pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Backend-only or frontend-only: append the service name to `build` and `up -d`.
Data survives redeploys — it lives in named volumes (`noora-mongo-data`,
`noora-redis-data`, `noora-elastic-data`).

## Logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f mongo
docker compose -f docker-compose.prod.yml logs -f redis
docker compose -f docker-compose.prod.yml logs -f elasticsearch
docker compose -f docker-compose.prod.yml logs --tail=200        # everything
```

## Health checks

Check in this order — each service depends on the ones above it:
`mongo` → `redis` → `elasticsearch` → `backend` → `frontend`.
Seed only after the first three report `healthy`; the backend will not finish
starting while MongoDB is unreachable.

```bash
docker compose -f docker-compose.prod.yml ps        # healthy / unhealthy per service

# Frontend — expect 200
curl -sI http://localhost:3000/login | head -1

# Backend — expect an HTTP response (Swagger at /api_doc, basic auth)
curl -sI http://localhost:4000/ | head -1

# MongoDB
docker compose -f docker-compose.prod.yml exec mongo \
  mongo --quiet --eval 'db.runCommand({ping:1})'

# Redis — expect PONG
docker compose -f docker-compose.prod.yml exec redis redis-cli ping

# Elasticsearch — "yellow" is normal for a single node
docker compose -f docker-compose.prod.yml exec elasticsearch \
  curl -s -u elastic:"$ELASTIC_PASSWORD" http://localhost:9200/_cluster/health
```

The backend logs `Nest application successfully started` when it is up, and
repeats `Unable to connect to the database. Retrying (n)...` when Mongo is not
reachable.

## Testing login and the dashboard

After `up -d` and the seeder, in this order:

1. Open `https://<frontend-domain>/` — it must redirect to `/login`.
2. The login page shows the customer logo and a **single** form with
   "شماره همراه" and "رمز عبور". There must be no OTP tab; if one appears,
   `NEXT_PUBLIC_ENABLE_OTP_LOGIN` was not `false` at build time.
3. Sign in with `ADMIN_PHONE` and `ADMIN_PASSWORD` as set in `.env`.
   - `Invalid login` with correct credentials ⇒ `CUSTOMER_NAITCO_URL` (see the
     Environment table).
   - 401 or a network error ⇒ `NEXT_PUBLIC_EXTERNAL_API_URL` does not reach the
     backend from the browser.
4. The dashboard opens and its header shows the customer logo.
5. Navigate between a few dashboard pages, then reload the browser (F5). You
   must stay signed in — this is the check for the repeated-logout issue.
6. Keep the tab open for several minutes with some activity, so an access token
   refresh happens in the background, and confirm you are not signed out.
7. Sign out via the profile menu, then sign in again.
8. Restart the backend (`docker compose -f docker-compose.prod.yml restart
   backend`) and confirm data created before the restart is still there.

## Troubleshooting

**`Invalid login` with correct credentials.** `CUSTOMER_NAITCO_URL` does not
match the origin the browser sends. The login flow rejects `normal` users from
any other origin, and non-`normal` users from that origin. Align the value with
the real frontend URL.

**Backend restarts and logs `Unable to connect to the database`.** Mongo is not
up yet, or `MONGO_USER`/`MONGO_PASS` do not match what the Mongo container was
initialised with. Credentials are baked in on the **first** start of a fresh
volume — changing them later requires recreating `noora-mongo-data`.

**Frontend build fails with `TypeError: Invalid URL`.** `NEXT_PUBLIC_APP_URL` is
empty. `/api/auth/logout` builds a redirect from it during prerender.

**Logo does not appear.** The file at `public/images/customer-logo.png` is
missing, or `NEXT_PUBLIC_CUSTOMER_LOGO` points elsewhere. The build succeeds
either way — the reference is a public path, not a static import.

**OTP tab still visible.** `NEXT_PUBLIC_ENABLE_OTP_LOGIN` is a build-time value.
Rebuild the frontend image after changing it.

**Elasticsearch container exits immediately.** Almost always `vm.max_map_count`.
On the host: `sysctl -w vm.max_map_count=262144` (persist in
`/etc/sysctl.conf`). The backend does not verify the Elasticsearch connection at
boot, so the ERP starts without it — but search-backed screens will fail.

**Everything is healthy but the browser cannot reach the API.** Check
`NEXT_PUBLIC_EXTERNAL_API_URL` (it is compiled in) and that the backend port is
reachable from outside. The backend enables CORS for all origins, so CORS itself
is not a likely cause.
