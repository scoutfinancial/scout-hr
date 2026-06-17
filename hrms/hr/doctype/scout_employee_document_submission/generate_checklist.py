import frappe
from frappe import _


@frappe.whitelist()
def generate_checklist(employee, template):
    """
    Generate Scout Employee Document Submission records for an employee
    based on the documents listed in a Scout Onboarding Template.

    Skips any document type that already has a submission for this employee,
    so it's safe to run more than once.
    """
    if not employee:
        frappe.throw(_("Employee is required."))
    if not template:
        frappe.throw(_("Template is required."))

    # Load the template and its child table of documents
    template_doc = frappe.get_doc("Scout Onboarding Template", template)

    if not template_doc.documents:
        frappe.throw(_("This template has no documents listed."))

    # Pull employee details to stamp on each submission
    emp = frappe.get_doc("Employee", employee)

    created = 0
    skipped = 0

    for item in template_doc.documents:
        # Check if a submission already exists for this employee + document type
        exists = frappe.db.exists(
            "Scout Employee Document Submission",
            {"employee": employee, "document_type": item.document_type},
        )
        if exists:
            skipped += 1
            continue

        submission = frappe.new_doc("Scout Employee Document Submission")
        submission.employee = employee
        submission.employee_name = emp.employee_name
        submission.company = emp.company
        submission.document_type = item.document_type
        submission.status = "Pending"
        submission.insert(ignore_permissions=True)
        created += 1

    frappe.db.commit()

    return {"created": created, "skipped": skipped}