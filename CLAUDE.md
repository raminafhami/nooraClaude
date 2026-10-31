# Noora ERP (apksystems.ir)

Persian-language ERP: HR, CRM (buyers/customers), inspection, secretariat,
financial, process engine, tasks/projects, form builder.

**Talk to the user in Persian.** These docs are English to save tokens.

## Repo map

| Path | What |
|---|---|
| `noora-flow-main/` | Backend - NestJS 9, MongoDB (Mongoose), Redis + Bull queues, Elasticsearch. See its `CLAUDE.md`. |
| `noora_frontend-develop/` | Frontend - Next.js 14 app router, React Hook Form + zod, shadcn/Radix UI. See its `CLAUDE.md`. |
| `docs/claude/ops.md` | Server, staging, deploy, backups, test scripts. **Read before touching the server.** |
| `docs/claude/hr.md` | HR domain rules (jobs, expertises, training checklist, certificates). Read for HR work. |
| `docs/FORM_BUILDER.md` | Form builder status (Persian). |
| `DEPLOYMENT.md` | Generic customer install guide (not how this server is run). |
| `docker-compose.yml`, `nginx.conf` | The server's stack (containers `noora-{gateway,backend,frontend,mongo,redis,elastic}`). |

## Finding things fast (don't read the whole project)

- Page URL `/dashboard/<x>/...` -> `noora_frontend-develop/src/app/dashboard/<x>/...`
- Backend route `/<x>` -> `noora-flow-main/src/modules/<x>/<x>.controller.ts`
  (frontend calls it via `apiClient` with the same path; browser hits `/backend/<x>`).
- Grep a Persian UI label to find its component; grep the API path to find both sides.
- Mongo collection = lowercase plural of the schema class (`PersonnelExpertise` -> `personnelexpertises`).

## Working rules (from the user)

- Do not deploy, push or commit unless the user asks. "دیپلوی کن" = deploy.
- Never delete or rewrite production data without approval; back up first (`docs/claude/ops.md`).
- Never prune the Docker build cache on the server.
- Test on staging (copy of prod data) before prod; report results honestly.
- Persian UI text; keep the surrounding code style (tabs vs 2-space differs per file).

## Local environment limits

- Windows; no `node_modules` locally, so `tsc`/`npm` can't run here. Type errors
  surface only in the staging Docker build (`docs/claude/ops.md`).
- Prefer PowerShell for `plink`/`pscp`; put remote commands in a script file and
  run `plink -m file` (inline quoting of `$` and `"` breaks).
