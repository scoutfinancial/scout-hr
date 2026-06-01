// Scout HR: force all users to the Human Resource dashboard on login.
// Fires once per browser session, then lets the user navigate freely.
frappe.after_ajax(() => {
	try {
		if (frappe.boot && frappe.session && frappe.session.user && frappe.session.user !== "Guest") {
			if (!sessionStorage.getItem("scout_landed")) {
				sessionStorage.setItem("scout_landed", "1");
				frappe.set_route("dashboard-view", "Human Resource");
			}
		}
	} catch (e) {
		// fail silently; never block desk load
		console.error("Scout redirect error:", e);
	}
});
