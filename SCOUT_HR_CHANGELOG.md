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

### 2026-05-30 — Hide non-MVP modules from Frappe HR launcher grid

- **Branch:** `fix/hr-redirect-and-workspaces`
- **Status:** 🔄 In progress (editing locally, not yet pushed/deployed)
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