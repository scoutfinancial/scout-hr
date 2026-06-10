// Scout HR: redirect users to the correct workspace on first login.
// Fires once per browser session, then lets the user navigate freely.
frappe.after_ajax(() => {
	try {
		if (frappe.boot && frappe.session && frappe.session.user && frappe.session.user !== "Guest") {
			if (!sessionStorage.getItem("scout_landed")) {
				sessionStorage.setItem("scout_landed", "1");
				const roles = frappe.boot.user.roles || [];
				if (roles.includes("System Manager") || roles.includes("HR Manager")) {
					window.location.href = "/app/people";
				} else if (roles.includes("Employee Self Service")) {
					window.location.href = "/app/employee-self-service";
				}
			}
		}
	} catch (e) {
		// fail silently; never block desk load
		console.error("Scout redirect error:", e);
	}
});