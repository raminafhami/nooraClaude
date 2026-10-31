# Backend (NestJS 9 + Mongoose)

## Layout

- `src/modules/<name>/`: `<name>.module.ts`, `.controller.ts`, `.service.ts`,
  `schemas/`, `dto/`, `repository/`. One folder per feature; registered in `src/app.module.ts`.
- `src/shared/crud/`: base classes most modules extend:
  `service/crud.service.ts` (`findAll` -> `{data, count}`, `findById`,
  `findByIdAndUpdate`, ...) and `repositories/base-repository.impl.ts`.
  `dto/get-query.dto.ts`: list query = `page`, `size`, `filters` (JSON string,
  Mongo filter), `sort`, `populate`, `projection`.
- `src/common/const/enums.ts` (ReminderMethod, ActivityType, ProjectType...),
  `src/common/providers/custom-error` (`throw new CustomError(status, 'message')`).
- `src/i18n/fa/common.json`: Persian labels (`i18nService.translate('common.<key>', {lang:'fa'})`).
- Responses are wrapped: `{ statusCode, message, result }`; errors `{ statusCode, message }`.

## Auth / permissions

- `@CheckPermissions({ action: PermissionAction.X, subject: Subjects.Y })` on every
  route (`src/modules/iam/authentication/...`). Permissions live in the
  `permissions` collection, attached to groups in `usergroups` (`name` is the key,
  e.g. `super-admin`, `ceo`, `admins`, `personnel`).
- `@ActiveUser() user: ActiveUserData` -> `{ id, groups: string[] (group names), ... }`.
- Admin check pattern used in controllers: groups include
  `system-admin|super-admin|admins|ceo` (nobody is in `system-admin`).

## Module guide (where to look)

| Area | Modules |
|---|---|
| HR | `personnel`, `job-description` (+ `job-expertise-sync.service.ts`), `expertise`, `personnel-expertise`, `working-time-regulations`, `personnel-attendance`, `personnel-request` - rules in `docs/claude/hr.md` |
| CRM | `users` (buyers are `users/services/buyer.service.ts`, customers are users), `project-task` (activities = tasks of the `activity` project) |
| Tasks/projects | `project`, `project-task`, `project-task-label` |
| Process engine | `process-definitions`, `process-instances`, `tasks` (user tasks), `dispatcher-category`, `indicator` (counters) |
| Forms | `form-builder` (see `docs/FORM_BUILDER.md`), `form` |
| Notifications | `notifications` (`create` + `sendNotification` -> stored message + socket push; `link` opens a page) |
| Queues | `queue` (Bull: `reminder` -> `reminder.processor.ts`: SMS / web-notification; `indexing`; `welcome-message`; `warehouse`) |
| Search | `search`, `indexing` (Elasticsearch; absent on staging, which can crash the staging backend - just restart it) |
| Files | `files`, `user-files`, `company-files` (uploads under `/app/<dir>` volumes) |

## Gotchas

- `Mixed` fields (e.g. `personnelexpertises.data.certificateId`) may hold a string
  or an ObjectId - compare with `String(...)`.
- Populated virtuals + `toJSON` transforms reshape output (see
  `personnel.schema.ts` `flattenExpertises`).
- Activity reminders: `project-task.controller.ts` (`createActivity`,
  `updateActivity`) -> `queue.service.ts addReminder` (skips missing/past reminders).
