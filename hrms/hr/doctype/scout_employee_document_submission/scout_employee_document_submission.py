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