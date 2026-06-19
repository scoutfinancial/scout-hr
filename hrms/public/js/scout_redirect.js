// Scout HR — redirect users to their correct workspace ONCE per login.
// Uses sessionStorage so the redirect survives page reloads (incl. hard refresh)
// and only fires again after an actual logout / new session.
frappe.after_ajax(function () {
        try {
                if (!frappe.session || frappe.session.user === "Guest") return;
                if (!frappe.boot || !frappe.boot.user || !frappe.boot.user.roles) return;

                // Scope the flag to the current user so switching accounts re-triggers.
                const flagKey = "scout_redirected_" + frappe.session.user;
                if (sessionStorage.getItem(flagKey)) return;

                const roles = frappe.boot.user.roles;
                let target = null;
                if (roles.includes("System Manager") || roles.includes("HR Manager")) {
                        target = "dashboard-view/Human Resource";
                } else if (roles.includes("Employee Self Service")) {
                        target = "employee-self-service";
                }

                // No target role: mark done so we never check again this session.
                if (!target) {
                        sessionStorage.setItem(flagKey, "1");
                        return;
                }

                // Mark done FIRST, then route — so the post-route reload won't re-fire.
                sessionStorage.setItem(flagKey, "1");
                frappe.set_route(target);
        } catch (e) {
                console.error("Scout redirect error:", e);
        }
});
