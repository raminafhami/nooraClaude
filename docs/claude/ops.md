# Server operations (prod + staging)

Server `94.184.41.228`, user `root` over SSH (password: ask the user; never
write it into the repo). From Windows: `plink -batch -pw <pw> root@host -m script.sh`
and `pscp -batch -pw <pw> local root@host:/path`. Put remote commands in a script
file - inline `$`/quotes get mangled by PowerShell. `pscp` cannot fetch remote
paths containing `[id]`.

## Production

- Tree: `/home/noora/nooraClaude` (same layout as this repo, not a git checkout
  in use - files are replaced by the deploy script). Compose file there.
- Containers: `noora-gateway` (nginx, domain apksystems.ir), `noora-backend`
  (image `noora-flow:latest`), `noora-frontend` (`noora-front:latest`),
  `noora-mongo` (4.4, replica set), `noora-redis`, `noora-elastic`.
- Uploaded files: volume `nooraclaude_backend-users-docs` -> `/app/users-docs`.
- Mongo shell (write the JS to a file, `docker cp` it in):
  `docker exec noora-mongo sh -c 'mongo --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin noora_flow /tmp/x.js'`
- Backups and all reusable scripts: `/root/backups/`. Full DB dump:
  `mongodump --gzip --archive=... --db noora_flow` inside `noora-mongo`, then `docker cp` out.

## Staging (persistent, internal network, copy of prod data)

- `/home/noora/fb-staging`, containers `noora-stg-{mongo,redis,backend,frontend,gateway}`,
  compose: `docker compose -p noora-stg -f docker-compose.staging.yml -f docker-compose.stg-gw.yml`.
- `/root/backups/stg-fresh.sh` (run detached via `setsid nohup ... &`, poll for
  `STG ENV READY|FAILED`): wipes staging, copies the prod tree, extracts
  `/root/backups/rv.tar` (the changed files) on top, builds both images (tagged
  `noora-flow:fb-candidate` / `noora-front:fb-candidate`), copies prod DB + uploads.
- `/root/backups/stg-rebuild.sh`: copies files from `/tmp/rv/<repo path>` into
  staging and rebuilds the services listed in `/root/backups/rebuild-which`.
- Staging Dockerfiles get `NPM_CONFIG_REGISTRY=https://registry.npmmirror.com/`
  (npmjs.org is unreachable from the server). A full build takes ~15-20 min.
- No Elasticsearch on staging: the staging backend may exit - `docker start noora-stg-backend`.

## Making rv.tar (locally)

1. Check the files' HEAD versions equal prod (md5 of `git show HEAD:f` vs
   `tr -d '\r' < /home/noora/nooraClaude/f | md5sum`).
2. `git ls-files -m -o --exclude-standard` -> `tar -cf rv.tar <files>` -> pscp to `/root/backups/`.

## Deploy (only when the user asks)

`/root/backups/deploy-v16.sh` (generic despite the name), wrapped by a
`run-vNN.sh` that runs it, then data scripts/checks, ending with `ALL DONE`;
start with `setsid nohup bash run-vNN.sh > run-vNN.log 2>&1 < /dev/null &` and poll the log.
It: tags current images `rollback-<TS>`, dumps the DB to
`pre-v16-deploy-<TS>/`, backs up the source files being replaced, extracts
`rv.tar` into the prod tree, retags `fb-candidate` -> `latest`,
`docker compose up -d --no-deps backend frontend`, waits for healthy (auto
rollback otherwise), runs `smoke.sh` (expect 13 PASS) and `after-check.sh`,
keeps the 2 newest rollback images. So: always build + test on staging first.

## Data changes on prod

Write a mongo script with `DRY` default true (`--eval 'var DRY=false'` applies);
run DRY, then apply on staging, then prod - each apply backs up first.
Examples: `cleanup-jobrule.js` (+ `jobrule-run.sh`), `merge-dups.js` (+ `merge-run.sh`,
compares a before/after fingerprint of what users see).

## Tests

Run Node scripts inside `noora-stg-backend` (has `jsonwebtoken`,
`puppeteer-core`, Chrome at `/usr/bin/google-chrome-stable`):
- Token: `jwt.sign({ id: '6aac25d22f3111100ff025c1', groups: ['super-admin'], type: 'system', ... }, process.env.JWT_SECRET, { audience: JWT_AUDIENCE, issuer: JWT_ISSUER })`
  (System Administrator). API base `http://localhost:4000/<route>`.
- Browser: launch with `--host-resolver-rules=MAP apksystems.ir noora-stg-gateway`,
  set cookie `token` on `apksystems.ir`, open `https://apksystems.ir/dashboard/...`.
- Existing scripts in `/root/backups/` (`jobrule-e2e.js`, `v17-e2e.js`, `v17-ui.js`,
  `rem2-e2e.js`, `ui-rem2.js`...) are good templates.
- Process end-to-end (IC): `/root/backups/ic/ic-e2e.js` drives a whole case through
  the UI (creates it from «درخواست جدید», fills each task via the react-hook-form
  `FormProvider` found from the `<form>` fiber, checks certificate/QR/uploads).
  `bash /root/backups/ic/run-e2e.sh [instanceId]` -> `e2e.log`, `shots/report.json`.
  Staging-only roles for it: admin in `ic-manager`+`ic-expert`, user
  `6aac31d5...` (تست تستی) in `inspection-coordinator`.

## System data

`node dist/seed` (inside the backend container) also seeds records the code
reads by key: financial categories (`inspection-certificate`, cost keys,
`insurance`, `overdue`), indicator `ic-certificate`, group
`inspection-coordinator`. Idempotent.

## Never

- `docker builder prune` / pruning the build cache.
- `pkill -f` patterns that can match the SSH/plink session.
- Deleting prod data or files without a backup and the user's OK.
