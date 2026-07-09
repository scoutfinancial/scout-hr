# hrms/api/xodo_signing.py
#
# Xodo Sign (formerly eversign) embedded-signing integration.
#
# Flow:
#   1. Frappe frontend calls generate_signing_session(employee, document_type)
#   2. We look up the eversign template_id AND its signer roles for that doc
#   3. We POST to eversign "Use Template" with embedded_signing_enabled = 1,
#      supplying every role the template requires (names must match exactly)
#   4. eversign returns the document data incl. the embedded signing URL
#   5. We return the EMPLOYEE-role URL; the browser loads it in an iframe
#
# SECURITY NOTES (read before going live):
#   - API key and business_id are read from site_config.json, NEVER hardcoded.
#   - HTTPS only. eversign requires it.
#   - Do NOT enable this against real SSNs until the security review and API
#     key rotation are complete (Scout project rule). The tax/immigration
#     forms (I-9, W-4, DE-4, W-9) collect sensitive identifiers.

import json
import requests

import frappe
from frappe import _

# eversign REST base. HTTPS only.
XODO_API_BASE = "https://api.eversign.com"

# ---------------------------------------------------------------------------
# TEST MODE — live-key, single-tester safety harness.
#
# When TEST_MODE is True, EVERY signer role is pointed at a test inbox so a
# real request can't route to anyone else. Set it to False only after the
# embed is proven and real second-signer routing is wired. After each test,
# VOID the envelope in the eversign dashboard.
# ---------------------------------------------------------------------------
TEST_MODE = False
TEST_EMAIL = "ms.nikkirosario@gmail.com"                  # employee-role test inbox
TEST_MANAGER_EMAIL = "ms.nikkirosario+manager@gmail.com"  # 2nd-signer test alias (same inbox, distinct address)

# ---------------------------------------------------------------------------
# Real eversign template IDs (subdomain: scoutfin). Keyed by the EXACT Scout
# Document Type name in Frappe — the lookup matches on this string, so any
# typo means "no template configured" at runtime.
# ---------------------------------------------------------------------------
TEMPLATE_IDS = {
    "Employee Information Sheet":                "d4a2a30efe45472e8f0b21fbd9522b10",
    "Notice to Employee Form":                   "6e00a11b19a9484b90668aeadd704db1",
    "I-9, Employment Eligibility Verification":  "320bac6b23d54c629c5014c128813442",
    "Direct Deposit Authorization":              "66f6a5794f4c4f92a19af423ef853550",
    "DE-4, California State Tax Withholding":     "eb4697e84552411cbcd323245af11a08",
    "W-4, Federal Tax Withholding":              "dd7aeb46d6bf4b8ea5989183073bf44c",
    "W-9":                                       "b205f67e4b7f4bdfb989895684769945",
}

# ---------------------------------------------------------------------------
# Signer roles per template. eversign rejects the request unless every role
# name here matches the template EXACTLY (this is what caused the earlier
# "Missing Required Signer with Role: Contractor" rejection).
#
# For each document:
#   "employee_role" = the role the EMPLOYEE fills and signs in the browser
#   "second_role"   = the role the Scout/HR side counter-signs (or None if
#                     the template has only one signer)
# ---------------------------------------------------------------------------
SIGNER_ROLES = {
    "Employee Information Sheet":                {"employee_role": "New Hire",   "second_role": "Employer"},
    "Notice to Employee Form":                   {"employee_role": "New Hire",   "second_role": "Employer"},
    "I-9, Employment Eligibility Verification":  {"employee_role": "New Hire",   "second_role": "Employer"},
    "Direct Deposit Authorization":              {"employee_role": "New Hire",   "second_role": "Employer"},
    "DE-4, California State Tax Withholding":     {"employee_role": "New Hire",   "second_role": "Employer"},
    "W-4, Federal Tax Withholding":              {"employee_role": "New Hire",   "second_role": "Employer"},
    "W-9":                                       {"employee_role": "Contractor", "second_role": "Employer"},
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

    Frappe enforces (via the existing User Permission) that the logged-in
    employee can only act on their own record, so no one can generate a
    session for someone else.
    """
    api_key, business_id = _get_credentials()

    template_id = TEMPLATE_IDS.get(document_type)
    if not template_id or template_id.startswith("PLACEHOLDER"):
        frappe.throw(_("No signing template is configured for {0}.").format(document_type))

    roles = SIGNER_ROLES.get(document_type)
    if not roles:
        frappe.throw(_("No signer roles are configured for {0}.").format(document_type))

    employee_role = roles["employee_role"]
    second_role = roles.get("second_role")

    # Pull the employee's identity for the employee signer role.
    emp = frappe.get_doc("Employee", employee)
    signer_name = emp.employee_name
    signer_email = emp.company_email or emp.personal_email
    if not signer_email:
        frappe.throw(_("Employee {0} has no email address for signing.").format(employee))

    # ---- Build signers using this template's REAL role names --------------
    if TEST_MODE:
        signers = [{"role": employee_role, "name": "Test Employee", "email": TEST_EMAIL}]
        if second_role:
            signers.append({"role": second_role, "name": "Test Signer", "email": TEST_MANAGER_EMAIL})
    else:
        signers = [{"role": employee_role, "name": signer_name, "email": signer_email}]
        if second_role:
            second_email = _resolve_manager_email(emp)
            signers.append({"role": second_role, "name": "HR / Employer", "email": second_email})

    payload = {
        "template_id": template_id,
        "embedded_signing_enabled": 1,   # REQUIRED for iframe embedding
        "title": document_type,
        "signers": signers,
    }

    # eversign authenticates via GET params on the URL, NOT the JSON body.
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

    # If eversign returned an application-level error, surface it clearly.
    if isinstance(data, dict) and data.get("success") is False:
        frappe.log_error(json.dumps(data)[:1000], "Xodo returned an error")
        err = (data.get("error") or {}).get("type") or "Unknown error"
        frappe.throw(_("Signing service error: {0}").format(err))

    # Hand the iframe the EMPLOYEE role's embedded URL specifically.
    url = _extract_embedded_url(data, employee_role)
    if not url:
        frappe.log_error(json.dumps(data)[:1000], "Xodo: no embedded URL in response")
        frappe.throw(_("Signing session was created but no embed URL was returned."))

    return {
        "embedded_signing_url": url,
        "document_hash": data.get("document_hash"),
    }


def _extract_embedded_url(data: dict, employee_role: str):
    """Find the EMBEDDED signing URL for the employee's role in the response.

    Match on the employee role name first (New Hire, Contractor, etc.), then
    fall back to the first available URL, then the top level.
    """
    signers = data.get("signers") or []
    for signer in signers:
        if signer.get("role") == employee_role and signer.get("embedded_signing_url"):
            return signer["embedded_signing_url"]
    for signer in signers:
        if signer.get("embedded_signing_url"):
            return signer["embedded_signing_url"]
    return data.get("embedded_signing_url")


def _resolve_manager_email(emp) -> str:
    """Resolve the second-signer (Employer/HR) email for PRODUCTION.

    Reads a fixed HR signing address from the employee's Company record.
    """
    company_hr_email = frappe.db.get_value("Company", emp.company, "custom_hr_signing_email")
    if not company_hr_email:
        frappe.throw(_(
            "No HR Signing Email is set for company {0}. Set it on the Company "
            "record (HR & Payroll tab) before signing."
        ).format(emp.company))
    return company_hr_email
    