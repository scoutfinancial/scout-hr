// Employee Self Service route guard
// Keeps restricted employees confined to their own workspace + allowed doctypes.
// Privileged roles (HR Manager, System Manager, Administrator) are never affected.

frappe.provide("scout_hr");

scout_hr.ess_guard = {
	// Workspace an employee is sent to when they stray.
	home_route: "employee-self-service",

	// Doctypes an employee is allowed to open (list or form).
	allowed_doctypes: [
		"Employee",
		"Scout Employee Document Submission",
		"Leave Application",
	],

	is_privileged: function () {
		var roles = frappe.user_roles || [];
		return (
			frappe.session.user === "Administrator" ||
			roles.indexOf("HR Manager") !== -1 ||
			roles.indexOf("System Manager") !== -1
		);
	},

	slugify: function (name) {
		return (name || "").toLowerCase().replace(/\s+/g, "-");
	},

	check: function () {
		if (this.is_privileged()) {
			return;
		}

		var route = frappe.get_route() || [];
		var type = route[0];

		// Allow the employee's own workspace.
		if (type === "Workspaces") {
			if (this.slugify(route[1]) !== this.home_route) {
				this.redirect();
			}
			return;
		}

		// Allow list/form views only for whitelisted doctypes.
		if (type === "List" || type === "Form") {
			if (this.allowed_doctypes.indexOf(route[1]) === -1) {
				this.redirect();
			}
			return;
		}

		// Anything else (desk home, reports, other pages) is blocked.
		if (type === "" || type === "desk" || type === "app" || type === undefined) {
			this.redirect();
			return;
		}

		this.redirect();
	},

	redirect: function () {
		frappe.set_route("Workspaces", this.home_route);
	},
};

$(document).on("app_ready", function () {
	scout_hr.ess_guard.check();
});

frappe.router.on("change", function () {
	scout_hr.ess_guard.check();
});