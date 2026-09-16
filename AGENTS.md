# MOBI — Codex Project Context and Current Progress

> Last updated from the current ChatGPT working conversation: September 8, 2026.
>
> This file is the handoff/context note for Codex when working inside the MOBI repository.
> Treat the repository files as the source of truth. If this note and the actual code differ, inspect the code first and do not guess.

## 1. Project Summary

MOBI is a capstone project:

**AI-Adaptive Speech Training and Early Social Readiness System for Minimally Verbal Children with Autism**

MOBI is intended for use inside **Abled Minds Therapy Center (AMTC)**. It is not a complete clinic-management system.

Main roles:

- Center Admin
- Doctor
- Therapist
- Parent / Guardian — mobile only
- Learner / Child — mobile only
- Super Admin

The web application is also the public-facing MOBI website. Public visitors can view pages such as Home and About. Professional web access is for Doctor and Therapist accounts.

## 2. Repository / Local Environment

Repository root:

```text
C:\Users\User\Desktop\MOBI
```

Main apps:

```text
MOBI/
├── mobi-backend/
├── mobi-web/
└── mobi-mobile/
```

Development ports currently used:

```text
Web / Vite:     http://localhost:5173
Backend:        http://localhost:5050
```

Frontend API base currently used:

```ts
http://localhost:5050/api
```

Main stack:

- React + TypeScript + Vite
- Express + TypeScript
- Supabase PostgreSQL / Auth
- Resend SMTP through Supabase email delivery
- OpenAI-related services exist elsewhere in the backend, but are not the current task

Temporary AMTC Center ID currently used in several backend areas:

```text
d5ae1649-0343-46d4-b433-575c97e064e1
```

Do not expose, print, replace, or request secret API keys.

---

# 3. Important Working Rules for Codex

## Source of truth

Before editing:

1. Inspect the actual current file.
2. Inspect related service/controller/route/API files.
3. Check existing types and database field names.
4. Do not assume a file generated in an earlier chat was actually copied into the repository.
5. Do not invent database columns, routes, IDs, or response shapes.

## Coding style / workflow

The user prefers:

- fast progress, but verified
- direct fixes
- small, understandable changes
- preserving current UI/design unless a change is requested
- full-file replacements only when multiple coordinated edits are truly needed
- no unnecessary architecture rewrite
- no huge refactor merely for code style
- explain the result simply after editing
- test or at least run relevant TypeScript/build/backend checks after changes
- inspect `git diff` before declaring work complete

When a task touches code owned by another teammate, avoid changing it unless the user explicitly authorizes it.

## Current protected / on-hold areas

**DO NOT modify these unless the user explicitly asks:**

```text
Doctor Progress
Therapist Progress
Therapist Create Activity / activity step builder
```

`CreateActivity.tsx` and the authoring step components are assigned to another teammate and are intentionally on hold.

Do not modify Progress just because another feature links to a Progress route.

---

# 4. Authentication — Current Working State

## Professional web login

The public web navbar has a normal **Log In** entry.

The professional login flow now asks the user to select:

```text
Doctor
or
Therapist
```

Then:

```text
selected role
+ registered email
+ 8-digit OTP / access code
→ Supabase Auth verification
→ correct staff table
→ correct portal
```

This role selector should stay as the permanent professional login design.

Parent / Guardian accounts do **not** log in through the web portal. Their access belongs on mobile.

## Why explicit role selection was added

During Resend trial testing, one allowed test email was temporarily used in both:

```text
doctors
therapists
```

The old generic login tried to infer the role from email and failed when the same email existed in both tables.

The current login explicitly sends:

```ts
role: "doctor" | "therapist"
```

with both access-code request and OTP verification.

The backend then verifies only the selected role.

## Current login state stored in browser

After successful login:

```text
mobi_staff_role
mobi_staff_profile_id
```

For example:

```text
mobi_staff_role = therapist
mobi_staff_profile_id = REAL_THERAPIST_UUID
```

Do not hardcode Doctor or Therapist profile UUIDs in web pages.

Long-term stronger security should derive staff identity from the authenticated Supabase session instead of trusting localStorage. Do not redesign that now unless requested.

---

# 5. Doctor — Completed Work

## Doctor invitation / access

Completed:

- Doctor records are real Supabase database records.
- Center can send Doctor invitation/access code.
- OTP email delivery works through Supabase + Resend SMTP.
- 8-digit OTP login works.
- Doctor account can transition to active after successful login.
- Real Doctor identity is saved in the frontend session/localStorage.

Account statuses used:

```text
not_invited
invited
active
suspended
```

MOBI-side code validity target:

```text
10 minutes
```

## Doctor My Profile

Completed and backend-connected:

```text
logged-in Doctor
→ real Doctor UUID
→ real Doctor record
→ Doctor My Profile
```

No hardcoded Doctor profile ID should be used.

## Doctor My Patients

Completed and tested.

Real flow:

```text
logged-in Doctor UUID
→ learner_doctors
→ current assigned learners
→ real learner information
```

Known working endpoint from this work:

```text
GET /api/doctors/:doctorId/patients
```

The user previously confirmed this worked with the assigned learner **Jun Jin Jhon**.

## Doctor Collaboration — read side

Completed and tested as a real read-only foundation.

The Doctor collaboration screen now uses:

- only learners actually assigned to the logged-in Doctor
- real learner care-team information
- real collaboration notes
- no fake patient list

The user confirmed that it showed only the Doctor's real assigned learner.

### Still intentionally pending for Doctor Collaboration

Do not implement yet unless it becomes the current goal:

- Doctor writing collaboration notes / feedback
- Doctor collaboration notifications

These were postponed until Therapist and Center workflows are ready.

## Doctor Progress

**ON HOLD.**

Another teammate worked on this area. Do not modify it now.

---

# 6. Therapist — Completed Work

## Therapist account / invitation

Completed infrastructure:

- real `therapists` records
- invitation status
- access-code sent timestamp
- Supabase Auth link through `auth_user_id`
- Therapist invitation/access-code service
- Therapist OTP verification
- Therapist account activation
- Center Staff screen invitation controls

Expected Center Staff status flow:

```text
Not Invited
→ Send Invitation
→ Invited
→ Resend Access Code
→ successful Therapist login
→ Active
```

The user has successfully logged in as a Therapist.

## Therapist login

Completed and verified.

Real flow:

```text
Professional Portal
→ choose Therapist
→ email
→ 8-digit OTP
→ real Therapist record
→ set Supabase session
→ mobi_staff_role = therapist
→ mobi_staff_profile_id = REAL_THERAPIST_UUID
→ /therapist/dashboard
```

## Therapist Dashboard / Assigned Learners

Completed and backend-connected.

Old behavior:

```text
12 hardcoded fake learners
```

Current target/implemented behavior:

```text
logged-in Therapist UUID
→ learner_therapists
→ is_current = true
→ real learners only
```

Backend route added during this work:

```text
GET /api/therapists/:therapistId/learners
```

The Therapist dashboard should not contain fake users such as Lexi Rose, John Doe, etc.

The Therapist should not be able to enroll/unenroll learners from this dashboard.

Clicking a learner may still navigate to the existing Progress screen, but Progress itself is not being modified.

## Therapist My Profile

Completed and backend-connected.

Old profile was mock data such as:

```text
Anna Reyes
fake email
fake phone
fake password
```

Current behavior:

```text
logged-in Therapist UUID
→ GET real Therapist record
→ display real profile
→ Edit Profile
→ update real Therapist record
```

Editable profile fields include:

- first name
- middle name
- last name
- specialization
- phone number
- bio

Registered login email is displayed as account information instead of being casually changed from this page.

There is no visible fake password. Therapist web sign-in uses the 8-digit email access code.

---

# 7. Therapist Materials — Current Status

This is the main area that was being reviewed immediately before switching to Codex.

## What was found

### Activity Library

The existing Therapist Activity Library is only partially real.

It already calls the activity backend, but the current code originally contained temporary ownership logic like:

```ts
const currentUser = {
  id: "therapist-1",
  name: "Anna Reyes",
  role: "therapist",
};
```

Problems found:

- `Mine` was based on string comparison with `"Anna Reyes"`
- draft count was hardcoded
- Archive was TODO
- Delete was TODO
- ownership was based on `uploaded_by` display text instead of a Therapist UUID

### Draft Materials

Current/old page is mock:

- hardcoded drafts
- hardcoded `"Anna Reyes"`
- delete draft TODO

### Archived Materials

Current/old page is mock:

- hardcoded archived activities
- Restore TODO
- Delete TODO

## Materials backend batch discussed/prepared

A design/batch was prepared in chat for:

- real Therapist ownership field
- real Mine / All / Center views
- real Draft list
- Archive
- Restore
- safe Delete
- backend material routes
- activity API helpers

Proposed ownership model:

```text
created_by_role
created_by_therapist_id
archived_at
updated_at
```

Important rule:

```text
ownership must be based on created_by_therapist_id
NOT uploaded_by display-name matching
```

Proposed view behavior:

```text
Mine
→ logged-in Therapist's own non-draft materials

All
→ published activities

Center
→ published Center-created activities

Drafts
→ logged-in Therapist + status=draft

Archived
→ logged-in Therapist + archived_at is not null
```

### IMPORTANT: Treat this batch as NOT VERIFIED

The conversation prepared files and SQL for this Materials work, but the user did not confirm that the complete batch was copied, migrated, compiled, and tested before switching to Codex.

Therefore:

**Codex must inspect the repository first and determine what was actually applied.**

Do not assume that the prepared SQL migration or replacement files are already in the project.

## Create Activity is intentionally on hold

The Therapist `CreateActivity.tsx` is another teammate's area and still contains mock/incomplete parts.

Known mock/incomplete behavior includes:

- hardcoded Therapist name
- Save Draft TODO
- mock learner-assignment component
- activity step authoring work

The user explicitly decided:

```text
DO NOT TOUCH CREATE ACTIVITY FOR NOW
```

Materials backend work should be designed so it can support real Create Activity later without rewriting the teammate's authoring UI now.

---

# 8. Center Admin — What Is Already Connected

The Center side has already received substantial real backend integration during this work.

## Learners

Completed foundations include:

- real learners from Supabase
- learner list/profile backend work
- Center learner management foundation
- real Doctor assignment to learner
- real Therapist assignment to learner

Relationship tables used:

```text
learner_doctors
learner_therapists
```

## Doctors

Center-side Doctor management is connected for:

- real Doctor records
- Add Doctor
- View Doctor
- Edit Doctor
- Remove Doctor
- Doctor invitation/access-code sending
- account status display

## Therapists / Staff

Center Staff management is connected for:

- real Therapist records
- Add Staff / Therapist
- View Staff
- Edit Staff
- Remove Staff / Therapist
- Therapist invitation/access-code sending
- account status display
- learner ↔ Therapist assignment

## Collaboration

Real collaboration-note storage exists.

The Doctor read-side already consumes real collaboration information.

Current collaboration write behavior was still centered around Center-created notes during the earlier implementation.

Role-aware Doctor/Therapist collaboration writing is still pending.

## Center Activity backend

An existing activity backend already supports at least:

- create activity
- create activity steps
- list activities
- get one activity
- activity learner assignments

Do not replace or broadly redesign this working foundation merely to support Therapist Materials.

Extend it carefully.

## Center areas still pending

Not completed in this working sequence:

```text
Center Scheduling backend
Center Notifications backend
```

These are major next phases after the current Therapist work.

---

# 9. Collaboration — Current Architecture

Database table used:

```text
collaboration_notes
```

Relevant sender roles:

```text
center
doctor
therapist
```

The real read-side exists.

Earlier write behavior used Center identity.

Future goal:

```text
Doctor writes
→ sender_role = doctor
→ sender_doctor_id = logged-in Doctor UUID

Therapist writes
→ sender_role = therapist
→ sender_therapist_id = logged-in Therapist UUID

Center writes
→ sender_role = center
```

Do this only after the current Therapist/Center workflow priorities are complete.

---

# 10. Current Priority / Next Goals

## Current checkpoint

Verified:

```text
DOCTOR
✅ OTP login
✅ real identity/profile
✅ My Patients
✅ Collaboration read-only
⏸ Progress
⏳ Collaboration writes later
⏳ Notifications later

THERAPIST
✅ invitation / OTP login
✅ real identity
✅ real assigned learners dashboard
✅ real My Profile
🔄 Materials backend/library cleanup is the current unfinished area
⏸ Create Activity authoring
⏸ Progress

CENTER
✅ real learner foundations
✅ Doctor management
✅ Therapist/Staff management
✅ learner ↔ Doctor assignment
✅ learner ↔ Therapist assignment
✅ professional invitation/access-code flows
✅ real collaboration-note foundation
⏳ Scheduling backend
⏳ Notifications backend
```

## Recommended next sequence

Continue in this order unless the user changes priorities:

```text
1. Inspect current repository after ChatGPT → Codex handoff

2. Therapist Materials
   - determine which prepared changes are actually present
   - real Mine / All / Center
   - real ownership by Therapist UUID
   - real draft count/list if backend supports it
   - Archive / Restore / safe Delete
   - DO NOT change CreateActivity.tsx

3. Center Scheduling backend

4. Therapist Schedule
   - show only assigned sessions

5. Center Notifications backend

6. Therapist Notifications

7. Doctor Notifications

8. Role-aware Collaboration writes
   - Therapist notes/reports
   - Doctor clinical feedback/recommendations

9. Progress only when the user explicitly returns to it
```

---

# 11. Database Tables Mentioned in This Work

Relevant tables include:

```text
learners
doctors
therapists

learner_doctors
learner_therapists

collaboration_notes

activities
activity_steps
learner_activity_assignments

learner_transactional_profiles
```

Do not assume additional columns exist without checking Supabase/schema/migrations/current code.

### Therapist account fields used

The Therapist implementation uses fields including:

```text
id
center_id
auth_user_id
email
first_name
middle_name
last_name
specialization
phone_number
profile_picture_url
bio
account_status
access_code_sent_at
last_login_at
created_at
updated_at
```

---

# 12. Backend Structure Relevant to This Handoff

Approximate current structure:

```text
mobi-backend/src/
├── config/
│   └── supabase.ts
│
├── controllers/
│   ├── doctor/
│   │   └── doctorController.ts
│   ├── therapist/
│   │   └── therapistController.ts
│   ├── activityController.ts
│   └── staffAuthController.ts
│
├── routes/
│   ├── doctor/
│   │   └── doctorRoutes.ts
│   ├── therapist/
│   │   └── therapistRoutes.ts
│   ├── activityRoutes.ts
│   └── staffAuthRoutes.ts
│
└── services/
    ├── auth/
    │   └── staffAuthService.ts
    ├── doctor/
    ├── therapist/
    ├── learner/
    ├── collaboration/
    └── activityService.ts
```

Inspect the actual tree before relying on this structure.

---

# 13. Frontend Structure Relevant to This Handoff

Approximate current structure:

```text
mobi-web/src/
├── pages/
│   ├── Login.tsx
│   ├── center/
│   ├── doctor/
│   └── therapist/
│       ├── dashboard/
│       │   └── Learner.tsx
│       ├── profile/
│       │   └── TherapistProfile.tsx
│       └── materials/
│           ├── ActivityLibrary.tsx
│           ├── DraftMaterials.tsx
│           ├── ArchivedMaterials.tsx
│           └── CreateActivity.tsx   <-- DO NOT TOUCH FOR NOW
│
├── services/
│   ├── api.ts
│   ├── activityApi.ts
│   ├── auth/
│   │   └── staffAuthApi.ts
│   ├── doctor/
│   └── therapist/
│       └── therapistApi.ts
│
└── layouts/
    └── TherapistLayout.tsx
```

---

# 14. Testing Habits

For backend changes:

```powershell
cd C:\Users\User\Desktop\MOBI\mobi-backend
npm run dev
```

Expected backend:

```text
http://localhost:5050
```

For web:

```powershell
cd C:\Users\User\Desktop\MOBI\mobi-web
npm run dev
```

Expected web:

```text
http://localhost:5173
```

When changing a flow:

1. Verify backend starts without TypeScript/runtime errors.
2. Verify the exact endpoint.
3. Verify React page.
4. Refresh to ensure changes persisted in Supabase.
5. Inspect browser console and backend terminal if anything fails.
6. Check `git diff`.
7. Do not claim a feature works until it was actually tested.

---

# 15. Known Temporary / Testing Conditions

During Resend trial testing, an allowed test email may temporarily exist in both Doctor and Therapist records.

This is intentional for testing and is why the Professional Portal has explicit role selection.

Do not automatically delete one of those staff rows merely because the email is duplicated.

In a real deployment, staff should normally have their own actual email accounts.

---

# 16. Important Product / UX Decisions

Keep these decisions unless the user asks to change them:

- Web public pages: Home and About.
- Web login is a **Professional Portal**.
- Professional login roles: Doctor and Therapist only.
- Parent / Guardian access is mobile-only.
- Therapist does not enroll or unenroll learners.
- Therapist can work only with assigned learners.
- Therapist-created activities should ultimately be reviewed by Center before publishing.
- Therapist should not directly publish activity content.
- MOBI should not reveal the correct answer to the child in the learner UI.
- MOBI should support therapist control rather than make final clinical decisions.
- Doctor role is primarily monitoring/progress/feedback, not diagnosis or consultation inside MOBI.

---

# 17. Before Starting the Next Codex Task

When Codex starts a new task in this repository, do the following first:

```text
1. Read this AGENTS.md.
2. Inspect git status.
3. Inspect the exact current target files.
4. Identify whether the requested feature is already partially implemented.
5. Preserve working Doctor/Therapist auth behavior.
6. Do not modify Progress or Create Activity unless explicitly authorized.
7. Reuse existing service/controller/route patterns instead of creating duplicates.
8. Make the smallest coherent change.
9. Run the relevant checks.
10. Summarize:
   - files changed
   - what now works
   - what was intentionally not touched
   - any remaining test needed
```

## Current instruction to continue from this handoff

**Resume from Therapist Materials, but first inspect the actual repository to see which Materials changes were applied. Do not modify `CreateActivity.tsx` or Progress.**
