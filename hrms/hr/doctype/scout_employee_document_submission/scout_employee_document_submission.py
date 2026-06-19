# Copyright (c) 2026, Scout Financial and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from frappe.utils import nowdate


class ScoutEmployeeDocumentSubmission(Document):
	def before_save(self):
		# When status changes to Approved or Rejected, stamp the reviewer and date
		if self.status in ("Approved", "Rejected"):
			if not self.reviewed_by:
				self.reviewed_by = frappe.session.user
			if not self.reviewed_date:
				self.reviewed_date = nowdate()
		# When a file is attached and status is still Pending, move to Submitted
		if self.uploaded_file and self.status == "Pending":
			self.status = "Submitted"
			if not self.submitted_date:
				self.submitted_date = nowdate()

	def on_update(self):
		# Recalculate the employee's onboarding progress after any change
		update_employee_onboarding_progress(self.employee)

	def on_trash(self):
		# Recalculate after a submission is deleted
		update_employee_onboarding_progress(self.employee)


def update_employee_onboarding_progress(employee):
	"""Write an 'approved/total' progress string onto the Employee record."""
	if not employee:
		return

	total = frappe.db.count(
		"Scout Employee Document Submission", {"employee": employee}
	)
	approved = frappe.db.count(
		"Scout Employee Document Submission",
		{"employee": employee, "status": "Approved"},
	)

	progress = f"{approved}/{total}" if total else ""

	# Write directly to the field without triggering a full Employee save cycle
	frappe.db.set_value(
		"Employee", employee, "custom_onboarding_progress", progress
	)
