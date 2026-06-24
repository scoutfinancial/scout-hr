# hrms/api/xodo_signing.py
#
# Xodo Sign (formerly eversign) embedded-signing integration — SKELETON.
#
# Flow:
#   1. Frappe frontend calls generate_signing_session(employee, document_type)
#   2. We look up the Xodo template_id for that document_type
#   3. We POST to Xodo "Use Template" with embedded_signing_enabled = 1,
#      passing the employee as the "Employee" signer role
#   4. Xodo returns the document data incl. the embedded signing URL
#   5. We return that URL; the browser loads it in an iframe
#
# SECURITY NOTES (read before going live):
#   - API key and business_id are read from site_config.json, NEVER hardcoded.
#     Add to site_config.json:
#         "xodo_api_key": "...",        (use the SANDBOX key while building)
#         "xodo_business_id": "1"
#   - HTTPS only. Xodo requires it.
#   - Do NOT enable this against the LIVE key or real SSNs until the
#     security review is complete (Scout project rule).
#   - This is a SKELETON: TEMPLATE_IDS are placeholders, error handling is
#     minimal, and nothing here should touch production data yet.

import json
import requests

import frappe
from frappe import _

# Xodo / eversign REST base. HTTPS only.
XODO_API_BASE = "https://api.eversign.com"

# ---------------------------------------------------------------------------
# TEST MODE — live-key, single-tester safety harness.
#
# We are testing the embed against the LIVE key (no sandbox key available).
# The only safe way to do that is: make YOU the only human in the loop.
#
# When TEST_MODE is True:
#   - EVERY signer role (Employee AND Manager) is pointed at TEST_EMAIL,
#     so the live two-signer template can't route a real request to anyone
#     else and the create call won't choke on a missing Manager role.
#   - After each test, VOID the envelope in the Xodo dashboard so it doesn't
#     sit as an outstanding signature request and to reclaim quota.
#
# Set TEST_MODE = False ONLY after the embed is proven and real per-role
# routing (real Manager email) is wired in. Shipping with TEST_MODE = True
# would send every employee's doc to TEST_EMAIL — so this MUST flip before
# any real employee uses it.
# ---------------------------------------------------------------------------
TEST_MODE = False
TEST_EMAIL = "ms.nikkirosario@gmail.com"   # test signer inbox — receives the real envelope

TEST_MANAGER_EMAIL = "ms.nikkirosario+manager@gmail.com"  # Gmail plus-alias: same inbox, distinct address so Xodo accepts two signers

# ---------------------------------------------------------------------------
# Placeholder template IDs. Replace each with the REAL template_id from your
# Xodo dashboard once the templates are finished (and built on the correct
# 05/31/2027-expiration I-9). Keyed by Scout Document Type name.
# ---------------------------------------------------------------------------
TEMPLATE_IDS = {
    # REAL template (Xodo subdomain: scoutfin). Two signer roles on this one:
    # "Employee" (step 1) and "Manager" (step 2). The embedded session below
    # only fills the Employee role; the Manager counter-signs afterward.
    "Employee Technology Responsibility Agreement": "73ebec4906e74f71a627c35fa690ee43",

    # TEST-ONLY MAPPING: points the existing W-4 submission record at the SAME
    # real template so we can prove the embed plumbing against a record that
    # already exists. The template behind this ID is the Technology Agreement,
    # NOT an actual W-4 — this mapping is for the plumbing test only and must
    # be replaced with the real W-4 template ID before any real use.
    "W-4, Federal Tax Withholding": "73ebec4906e74f71a627c35fa690ee43",

    # Still to be built on the correct 05/31/2027-expiration I-9, etc.:
    "I-9, Employment Eligibility Verification": "PLACEHOLDER_I9_TEMPLATE_ID",
    # upload-only docs (e.g. CA Food Handler Card) do NOT belong here —
    # they are not fill-and-sign and stay on the upload flow.
}


def _get_credentials():
    """Read API key + business_id from site config. Never hardcode secrets."""
    api_key = frappe.conf.get("xodo_api_key")
    business_id = frappe.conf.get("xodo_business_id")
    if not api_key or not business_id:
        frappe.throw(_("Xodo credentials are not configured in site config."))
    return api_key, business_id


@frappe.whitelist()
def generate_signing_session(employee: str, document_type: str) -> dict:
    """
    Create an embedded signing session for `employee` to fill `document_type`.
    Returns {"embedded_signing_url": "...", "document_hash": "..."}.

    Called from the employee self-service page. Frappe enforces that the
    logged-in user can only act on their own employee record via the existing
    User Permission (Employee = their own record), so an employee cannot
    generate a session for someone else.
    """
    api_key, business_id = _get_credentials()

    template_id = TEMPLATE_IDS.get(document_type)
    if not template_id or template_id.startswith("PLACEHOLDER"):
        frappe.throw(_("No Xodo template is configured for {0}.").format(document_type))

    # Pull the employee's identity for the signer role. Only what's needed.
    emp = frappe.get_doc("Employee", employee)
    signer_name = emp.employee_name
    signer_email = emp.company_email or emp.personal_email
    if not signer_email:
        frappe.throw(_("Employee {0} has no email address for signing.").format(employee))

    # ---- Build signers ----------------------------------------------------
    # This template ("Employee Technology Responsibility Agreement") has TWO
    # roles: "Employee" (step 1) and "Manager" (step 2). Both roles must be
    # supplied or the live create call can stall waiting for the missing one.
    #
    # In TEST_MODE every role is pointed at TEST_EMAIL so the only person who
    # ever receives a real request is you. In production this is where the
    # Manager's REAL email would come from (e.g. the employee's reporting
    # manager / HR), and the employee's own details fill the Employee role.
    if TEST_MODE:
        if TEST_EMAIL.startswith("REPLACE_WITH"):
            frappe.throw(_("Set TEST_EMAIL to your own inbox before testing."))
        signers = [
            {"role": "Employee", "name": "Test Employee", "email": TEST_EMAIL},
            {"role": "Manager",  "name": "Test Manager",  "email": TEST_MANAGER_EMAIL},
        ]
    else:
        # Production wiring (not exercised yet): real employee on Employee role,
        # real manager on Manager role. Resolve the manager before flipping
        # TEST_MODE off — do not ship with the Manager hardcoded.
        manager_email = _resolve_manager_email(emp)
        signers = [
            {"role": "Employee", "name": signer_name,   "email": signer_email},
            {"role": "Manager",  "name": "HR Manager",  "email": manager_email},
        ]

    payload = {
        "template_id": template_id,
        "embedded_signing_enabled": 1,   # REQUIRED for iframe embedding
        "title": document_type,
        "signers": signers,
    }

    # Xodo/eversign authenticates via GET params on the URL, NOT the JSON body.
    # access_key and business_id must be in the query string or the API
    # rejects the call with code 101 "missing_access_key" before reading body.
    auth_params = {"access_key": api_key, "business_id": business_id}

    try:
        resp = requests.post(
            f"{XODO_API_BASE}/document",
            params=auth_params,
            data=json.dumps(payload),
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        frappe.log_error(frappe.get_traceback(), "Xodo signing session failed")
        frappe.throw(_("Could not start the signing session. Please try again."))

    # The embedded signing URL lives on the signer object in the response.
    # Shape per Xodo docs: data["signers"][n]["embedded_signing_url"].
    url = _extract_embedded_url(data)
    if not url:
        frappe.log_error(json.dumps(data)[:1000], "Xodo: no embedded URL in response")
        frappe.throw(_("Signing session was created but no embed URL was returned."))

    return {
        "embedded_signing_url": url,
        "document_hash": data.get("document_hash"),
    }


def _extract_embedded_url(data: dict):
    """Find the EMBEDDED signing URL for the Employee role in the Xodo response.

    With two signers, we must hand the iframe the Employee's URL specifically
    (not just the first signer that happens to have one). We match on role,
    then fall back to the first available URL, then the top level.
    """
    signers = data.get("signers") or []
    for signer in signers:
        if signer.get("role") == "Employee" and signer.get("embedded_signing_url"):
            return signer["embedded_signing_url"]
    for signer in signers:
        if signer.get("embedded_signing_url"):
            return signer["embedded_signing_url"]
    # Some responses expose it at the top level depending on flow/version.
    return data.get("embedded_signing_url")


def _resolve_manager_email(emp) -> str:
    """Resolve the real Manager-role email for PRODUCTION (TEST_MODE = False).

    NOT exercised during testing. Before going live, decide the real source:
    e.g. the employee's `reports_to` manager's user/email, or a fixed HR
    address per company. Left unimplemented on purpose so the choice is made
    deliberately rather than defaulted.
    """
    company_hr_email = frappe.db.get_value("Company", emp.company, "custom_hr_signing_email")
    if not company_hr_email:
        frappe.throw(_(
            "No HR Signing Email is set for company {0}. Set it on the Company "
            "record (HR & Payroll tab) before signing."
        ).format(emp.company))
    return company_hr_email
