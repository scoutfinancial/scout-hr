// Scout HR — redirect users to their correct workspace on login.
// Module-level flag resets on every full page load (including after login)
// but persists through SPA navigation so users can browse freely.
let _scoutRedirected = false;

frappe.after_ajax(function () {
	try {
		if (_scoutRedirected) return;
		if (!frappe.session || frappe.session.user === "Guest") return;
		if (!frappe.boot || !frappe.boot.user || !frappe.boot.user.roles) return;

		const roles = frappe.boot.user.roles;
		let target = null;

		if (roles.includes("System Manager") || roles.includes("HR Manager")) {
			target = "dashboard-view/Human Resource";
		} else if (roles.includes("Employee Self Service")) {
			target = "employee-self-service";
		}

		if (!target) { _scoutRedirected = true; return; }

		// Already on the correct workspace — allow free navigation
		const route = frappe.get_route ? frappe.get_route() : [];
		if (route && route[0] === target) {
			_scoutRedirected = true;
			return;
		}

		_scoutRedirected = true;
		frappe.set_route(target);

	} catch (e) {
		console.error("Scout redirect error:", e);
	}
});