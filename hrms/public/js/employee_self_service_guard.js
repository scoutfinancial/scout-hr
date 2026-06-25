// Employee Self Service route guard (minimal, home-only)
// Sends a restricted employee from the bare desk home / app grid to their
// own workspace. Does NOT touch workspace, list, or form routes, so it can
// never interrupt the workspace's own render.
// Privileged roles (HR Manager, System Manager, Administrator) are exempt.

frappe.provide("scout_hr");

scout_hr.ess_guard = {
	home_route: "employee-self-service",
	redirected: false,

	is_privileged: function () {
		var roles = frappe.user_roles || [];
		return (
			frappe.session.user === "Administrator" ||
			roles.indexOf("HR Manager") !== -1 ||
			roles.indexOf("System Manager") !== -1
		);
	},

	boot_ready: function () {
		return (
			frappe.boot &&
			frappe.session &&
			frappe.session.user &&
			frappe.user_roles &&
			frappe.user_roles.length > 0
		);
	},

	is_home_or_grid: function () {
		var route = frappe.get_route() || [];
		var type = route[0];
		// Bare home (empty) or the desk app grid only.
		return (
			type === undefined ||
			type === "" ||
			type === "desk" ||
			type === "apps" ||
			type === "app"
		);
	},

	check: function () {
		if (this.redirected) {
			return;
		}
		if (!this.boot_ready()) {
			return;
		}
		if (this.is_privileged()) {
			return;
		}
		if (this.is_home_or_grid()) {
			this.redirected = true;
			frappe.set_route("Workspaces", this.home_route);
		}
	},

	start: function () {
		var self = this;
		var tries = 0;
		var timer = setInterval(function () {
			tries += 1;
			if (self.boot_ready()) {
				clearInterval(timer);
				self.check();
			} else if (tries > 40) {
				// Give up after ~10s; never block indefinitely.
				clearInterval(timer);
			}
		}, 250);
	},
};

$(document).ready(function () {
	scout_hr.ess_guard.start();
});
