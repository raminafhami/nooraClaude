# HR domain rules

## Data

- `expertise`: items of three types - `certificate` (UI: آموزش), `skill`
  (مهارت ها), `knowledge` (دانش فنی). **Unique by type + normalized title**
  (Arabic ي/ك, ZWNJ, spaces ignored): POST/PUT `/expertise` return 409 on a
  duplicate; job-description forms reuse the existing item
  (`noora_frontend-develop/src/modules/hrm/expertises/services/findOrCreateExpertise.ts`).
  Old duplicates were merged on 1405/08/06 (`/root/backups/merge-dups.js`).
- `jobdescriptions`: `requirements.expertises` = expertise ids; `duties`,
  `authorities` = strings.
- `personnels`: `userId`, `jobs` = job-description ids.
- `personnelexpertises` (the person's checklist row): `userId`, `expertiseId`,
  `status` `unqualified` (ندارد) | `learning` (در حال آموزش) | `qualified` (دارد),
  `data.certificateId`, `data.extraCertificateIds` (more certificates kept when
  duplicate items were merged).
- `personnelcertificates`: uploaded certificate records (`path` = file under
  `/app/users-docs/<userId>/certificates/`).

## Core rule (user, 1405/08/05)

A person's training page and «مستندات پرسنل» show **only** items of the job
descriptions they hold right now - no exceptions.
Enforced by `noora-flow-main/src/modules/job-description/job-expertise-sync.service.ts`
`syncUser`: adds missing required items as ندارد, deletes every other row
(an earned status/certificate first moves to a same-titled required row),
deletes certificates no row points to (record + file).
Triggered by: personnel jobs change, job description update/delete, expertise delete.
Read side also filters (personnel GET with `populate=expertises`;
`GET personnel-expertise/certificates`), because the add-job modal's «ارسال»
uploads a certificate before the job is saved.

## Certificates API

- `POST personnel-expertise/certificate` (multipart): attaches to the existing
  row and makes it دارد.
- `DELETE personnel-expertise/:id/certificate`: deletes record + file; the row
  takes its next extra certificate, else becomes ندارد.

## Pages

- `/dashboard/hr-management/training`: per person - آموزش ها / مهارت ها / دانش فنی
  with ✓ / yellow hourglass / ✗. Skills/knowledge toggle with the edit icon
  (✗ or hourglass -> ✓). Each training item has a folder icon opening its own
  certificate dialog (name prefilled). «نمایش همه» also shows ✓ items.
- `/dashboard/hr-management/personnel/<userId>?section=jobs`: assign jobs
  (modal: per item دارد / در حال آموزش / ندارد, certificate «ارسال»/«حذف»).
  `?section=documents`: «مستندات پرسنل».
- `/dashboard/hr-management/jobs/add`, `jobs/<id>/edit`: pencil next to an
  expertise edits the expertise everywhere; pencil next to a duty/authority edits
  that line (`jobs/_components/EditTextItemAction.tsx`).
- `/dashboard/hr-management/expertises`: توانمندی‌ها list (duplicates refused).
