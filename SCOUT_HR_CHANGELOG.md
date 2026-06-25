# Scout HR — Custom App Change Log

A running record of all code-level changes made to the `scoutfinancial/scout-hr` repository (fork of `frappe/hrms`).

**Purpose:** Track what was changed, when, why, and how to reverse it — so we can audit, roll back, or re-apply changes when needed (e.g. after pulling upstream updates from `frappe/hrms`).

---

## How to Use This Log

- Add a new entry under **Change History** for every code change.
- Always record: date, branch, files touched, what changed, why, and how to revert.
- Keep entries newest-first.
- Reference the commit hash once pushed.

---

## Environment Reference

| Item | Value |
|------|-------|
| Repo | `scoutfinancial/scout-hr` (fork of `frappe/hrms`) |
| Default branch | `develop` |
| Site | `scout.v.frappe.cloud` |
| Bench | Scout HR |
| Frappe Framework | Version 16 |
| Workflow | Git-only (clone → edit → push → deploy via Frappe Cloud bench update) |

---

## Change History

### 2026-06-16 — Part 2: Onboarding template & document submission doctypes

- **Branch:** version-16
- **Status:** ✅ Deployed and verified
- **Commits:** 44015c121, b4c933b80
- **What changed:** Added three new doctypes to support employee onboarding document tracking:
  - `Scout Onboarding Template` (parent) — named template per company, holds a child table of required documents. Fields: template_name, company, is_active, description, documents (child table).
  - `Scout Onboarding Template Item` (child table, istable:1) — one row per required document. Fields: document_type (link to Scout Document Type), is_required.
  - `Scout Employee Document Submission` — tracks one document per employee. Fields: employee, employee_name (fetched), company (fetched), document_type, status (Pending/Submitted/Approved/Rejected), uploaded_file, submitted_date, reviewed_by, reviewed_date, hr_notes. Includes a `before_save` controller: auto-stamps reviewer + date on Approve/Reject, and auto-moves status to Submitted when a file is attached.
- **Files added:** 9 files across `hrms/hr/doctype/scout_onboarding_template/`, `scout_onboarding_template_item/`, and `scout_employee_document_submission/`.
- **Why:** Foundation for the employee-facing onboarding document checklist (Part 2 of the document portal). HR defines a template once; future work auto-generates a per-employee checklist from it.
- **Issue encountered & fixed:** Initial commit (44015c121) placed the submission files in the wrong folder and created a junk file with no extension. Fixed in b4c933b80 by moving files to the correct folder and recreating the controller. Verified committed content is correct.
- **Verified:** All three doctypes live. Created test template "Mae Malai Standard Onboarding" with 3 documents (I-9, W-4, Food Handler Card) — parent + child table relationship confirmed working.
- **How to revert:** Delete the three doctype folders, commit, push, redeploy. Then remove the doctype records + tables via bench if needed.
- **Permissions:** HR Manager has full CRUD + import on template and submission. Employee Self Service has read + write on submission (for future employee uploads).

---

### 2026-06-11 — Part 1: Scout Document Type doctype + Mae Malai documents

- **Branch:** version-16
- **Status:** ✅ Deployed and verified
- **Commits:** 898ab7ef1, 37a72afc1, 4d11763f9, aac5ea0b1
- **What changed:** Added `Scout Document Type` doctype — the master list of required onboarding documents per company. Fields: document_name, category (HR Paperwork / Employee Agreements / California State Forms / Required Training / Orientation), company, is_required, is_employee_upload, description, employee_instructions.
- **Files added:** `hrms/hr/doctype/scout_document_type/` (3 files).
- **Why:** First building block of the custom employee onboarding document portal. Replaces the unsuitable native Frappe Employee Onboarding (which is tied to recruitment).
- **Follow-up fixes:** Removed a stray `__init__.py` accidentally committed to repo root (37a72afc1). Added `allow_import: 1` (4d11763f9) and `import` permission for HR Manager (aac5ea0b1) to enable CSV bulk import.
- **Data loaded:** All 19 of Mae Malai's onboarding documents — I-9 created manually, remaining 18 bulk-imported via CSV (Data Import tool).
- **How to revert:** Delete the doctype folder, commit, push, redeploy.

---

### 2026-06-11 — Workspace role restrictions, ESS workspace & login redirect

- **Branch:** version-16
- **Status:** ✅ Deployed and verified
- **Commits:** f6b8e1305, 2081ac20c, 60c83348d, 89dee471e, ef67a2abe, e18ab0738
- **What changed:**
  - Restricted all 7 HR management workspaces to `HR Manager` role only (People, Payroll, Leaves, Expenses, Performance, Recruitment, Tenure) by adding a `roles` entry to each workspace JSON. Previously visible to all users.
  - Created a new minimal `Employee Self Service` workspace (`hrms/hr/workspace/employee_self_service/`) visible only to the Employee Self Service role. Shows three cards: My Leaves (Leave Application), My Payslips (Salary Slip), My Profile (Employee record — edit details + attach files).
  - Updated `scout_redirect.js` to route by role on login: HR Manager / System Manager → dashboard-view/Human Resource; Employee Self Service → /desk/employee-self-service. Changed from sessionStorage to a module-level flag so it fires fresh on every login.
- **Why:** Employees were seeing the full HR dashboard and could navigate into management workspaces. Now data AND display are both scoped by role.
- **Verified:** Anuchit (HR Manager) lands on HR dashboard with full access. Ananya (Employee) lands on ESS workspace, sees only her 3 cards, cannot reach any management workspace.
- **Known open item:** Login URL still shows a `redirect-to` parameter pointing to the last visited page. Does not affect where users land (redirect script overrides it) but to be cleaned up later.
- **How to revert:** Remove the `roles` entries from the 7 workspace JSONs, delete the ESS workspace folder, revert scout_redirect.js. Commit, push, redeploy.

### 2026-05-30 — Hide non-MVP modules from Frappe HR launcher grid

- **Branch:** version-16 (production branch tracked by the bench)
- **Status:** ✅ Applied to version-16 — ready to deploy
- **Files changed:**
  - `hrms/desktop_icon/payroll.json`
  - `hrms/desktop_icon/expenses.json`
  - `hrms/desktop_icon/performance.json`
  - `hrms/desktop_icon/recruitment.json`
  - `hrms/desktop_icon/tax_&_benefits.json`
  - `hrms/desktop_icon/tenure.json`
  - `hrms/desktop_icon/shift_&_attendance.json`
- **Change:** Set `"hidden": 0` → `"hidden": 1` in each file.
- **Why:** Keep the MVP simple. Hide modules not needed for the initial launch (HR Setup, Leaves, People remain visible). Reversible — modules can be re-enabled later when there's time to test them.
- **Modules kept visible:** HR Setup, Leaves, People.
- **How to revert:** Set `"hidden"` back to `0` in each file, commit, push, and redeploy. (Nothing is deleted — data and functionality remain intact.)
- **Deploy step required:** After push, run bench update / migrate on Frappe Cloud for the change to take effect.
- - **Commit hash:** f9141d7ed
-   **Status:** ✅ Pushed to branch (not yet deployed)
---

### 2026-05-30 — [PLANNED] Fix login redirect to People workspace

- **Branch:** `fix/hr-redirect-and-workspaces`
- **Status:** 📋 Planned — not started
- **Problem:** After login, users land on their last visited page instead of the People workspace. UI-level fixes (role Home Page, Default Workspace, Default App, Client Script, Server Script) all failed because Frappe v16 restores the last visited route from the browser session.
- **Planned approach:** Add JS to the `hrms.bundle.js` (loaded via `app_include_js` in `hooks.py`) OR a boot/session hook that checks the user's role on login and redirects HR users to the People workspace.
- **Files likely involved:** `hrms/hooks.py`, `hrms/public/js/` bundle source.
- **How to revert:** Remove the added JS/hook, commit, push, redeploy.
- **Commit hash:** _(to be added)_

---

## Notes & Decisions

- **2026-05-30:** Chose Git-only workflow (no local bench) because dev machine is Windows and Frappe doesn't run natively on Windows. Testing happens on Frappe Cloud rather than locally.
- **2026-05-30:** Confirmed the green-icon launcher grid is driven by `Desktop Icon` DocType fixtures in `hrms/desktop_icon/`, NOT standard Frappe workspaces. This is why the UI "Is Hidden" toggle on workspaces did not remove icons from the grid.
- The left-sidebar contents (when inside a module) are driven separately by `hrms/workspace_sidebar/` fixtures.
---
### 2026-06-26 — Employee Self Service: /me login trap fixed + permission popups resolved
- **Branch:** version-16
- **Status:** ✅ Live (DB changes + reverted deploy)
- **Context:** After Ananya (HR-EMP-00007) was set to the Employee Self Service user type, login dropped her on the `/me` account page and "Home" looped back to it. She could only reach her workspace by typing the URL. Two permission popups also fired on list views.

- **Fix 1 — /me login trap (RESOLVED):**
  - Root cause: `/me` is a non-Desk web page; login lands ESS users there because the user type has no resolved desk home. Ruled out (and reverted) several non-fixes first: per-user `default_workspace` (blank for ALL users site-wide, not the cause), User Type table (no home column), System Settings / Website Settings `home_page` (both empty).
  - Working fix: set `home_page` on the **Employee Self Service ROLE** (same mechanism HR User already uses: `home_page = /desk/dashboard-view/Human%20Resource`).
  - SQL: `UPDATE tabRole SET home_page = '/app/employee-self-service' WHERE name = 'Employee Self Service';`
  - Verified: Ananya now lands on her Employee Self Service workspace on login. Safe — only one real user holds this role; privileged users do not.
  - **Note:** This corrects the 2026-05-30 [PLANNED] entry's claim that role Home Page "failed." It failed for HR users (last-route restore), but WORKS for the ESS role/user type.

- **Fix 2 — "Insufficient Permission for List Filter" popup (RESOLVED):**
  - Root cause: becoming an ESS user strips the Desk User role; `List Filter` grants read only to Desk User.
  - Fix: inserted DocPerm row `essf-listfilter-02` (role Employee Self Service, read on List Filter), then rebuilt cache via Customize Form → List Filter → Update.

- **Fix 3 — "Insufficient Permission for Kanban Board" popup (RESOLVED):**
  - Same root cause/pattern as List Filter.
  - Fix: inserted DocPerm row `essf-kanban-01` (role Employee Self Service, read on Kanban Board), then rebuilt cache via Customize Form → Kanban Board → Update.

- **ESS route guard — attempted again, reverted:**
  - Rewrote `hrms/public/js/employee_self_service_guard.js` as a minimal, boot-gated, home-only redirect (commit `b1244e15b`). Did NOT fire — `app_include_js` only loads inside Desk; the `/me` page is outside Desk, so the guard never ran there.
  - Reverted with `git revert` (commit `8286ff80d`), redeployed. Guard is OFF again. The role `home_page` fix (Fix 1) solved the trap instead — no guard needed for the /me case.

- **Working rule adopted:** if a fix does not work, REVERT it immediately before trying the next thing, so edits never stack on top of dead ends.

- **Still open:** `/desk` app grid + workspace switcher still reachable by ESS employees (the guard's original purpose — deferred). Watch for further Desk-User-only helper doctypes throwing the same popup; fix reactively with the same DocPerm + Customize Form pattern.

- **Commit hashes:** `b1244e15b` (guard rewrite, reverted), `8286ff80d` (revert)
