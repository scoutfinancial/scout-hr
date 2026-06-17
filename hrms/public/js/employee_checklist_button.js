frappe.ui.form.on("Employee", {
    refresh: function (frm) {
        // Only show the button for saved (existing) employee records
        if (frm.is_new()) {
            return;
        }

        frm.add_custom_button(
            __("Generate Onboarding Checklist"),
            function () {
                // Dialog to pick which onboarding template to use
                let d = new frappe.ui.Dialog({
                    title: __("Generate Onboarding Checklist"),
                    fields: [
                        {
                            label: __("Onboarding Template"),
                            fieldname: "template",
                            fieldtype: "Link",
                            options: "Scout Onboarding Template",
                            reqd: 1,
                            get_query: function () {
                                return {
                                    filters: {
                                        company: frm.doc.company,
                                        is_active: 1,
                                    },
                                };
                            },
                        },
                    ],
                    primary_action_label: __("Generate"),
                    primary_action: function (values) {
                        frappe.call({
                            method:
                                "hrms.hr.doctype.scout_employee_document_submission.generate_checklist.generate_checklist",
                            args: {
                                employee: frm.doc.name,
                                template: values.template,
                            },
                            freeze: true,
                            freeze_message: __("Generating checklist..."),
                            callback: function (r) {
                                if (r.message) {
                                    frappe.msgprint(
                                        __(
                                            "Checklist generated: {0} created, {1} skipped (already existed).",
                                            [r.message.created, r.message.skipped]
                                        )
                                    );
                                }
                                d.hide();
                            },
                        });
                    },
                });
                d.show();
            },
            __("Scout HR")
        );
    },
});
