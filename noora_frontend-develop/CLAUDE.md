# Frontend (Next.js 14 app router, TypeScript)

## Layout

- `src/app/dashboard/<area>/...`: pages. Page-local code sits in `_module/` or
  `_components/` next to `page.tsx` (e.g. `hr-management/training/_components/`).
- `src/features/<domain>/`: models, enums, services, utils per domain
  (activities, buyers, customer, projects, notifications, ...).
- `src/modules/`: older domains - `hrm` (HR models/services), `felo` (process
  engine task UI), `formBuilder`, `identity`, `inspection`.
- `src/lib/`: `api/` (client), `ui/` (older UI kit: Modal, Table, Panel, Head,
  Loader, Form), `utils`, `hooks`, `cache`.
- `src/theme/components/ui/`: shadcn/Radix components (button, dialog, form,
  input, textarea, select, date-input, table, tooltip...).

## Import aliases (tsconfig)

`@/*` is tried in order: `src/theme/*`, `src/lib/*`, `src/modules/*`,
`src/features/*`, `src/*`. So `@/components/ui/button` -> theme,
`@/api/client` -> lib, `@/hrm/...` -> modules, `@/activities/...` -> features,
`@/ui/...` -> lib/ui. `@/form/*` -> `src/lib/ui/Form/*`.

## Patterns

- API: `apiClient.get/post/put/patch/delete/query` from `@/api/client`; one
  exported function per file under `features/<x>/services` or
  `modules/<x>/services`, usually with a `parse*` util. Failures are thrown as
  `{ success: false, statusCode, message }` (check `err.statusCode`).
- Forms: react-hook-form + zod; shadcn `Form*` in newer code, `@/form/*` in older.
- Dialogs: shadcn `Dialog` (+ `useDialogs`), or `Modal` from `@/ui/Modal`.
- Toasts: `sonner`. Logged-in user: `useLoggedInUser()` -> `identity { id, groups }`.
- Dates: Persian calendar. `DateInput` (`@/components/ui/date-input`) gives
  strings like `1405/08/06 18:30` (format `YYYY/MM/DD HH:mm`); parse with
  `jalali-moment` (`moment(v, "jYYYY/jMM/jDD HH:mm")`).
- Icons: `react-icons` (fa, fa6, gi...). RTL layout; Tailwind classes.

## Build

- `next.config.js` ignores ESLint during builds; TypeScript errors fail the build.
- No local `node_modules`: verify by building the staging image (`docs/claude/ops.md`).
