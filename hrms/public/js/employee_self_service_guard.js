// Scout HR — hide privileged navigation menu items from non-Scout users.
// Layer 1: cosmetic only. Hides "Desktop", "Workspaces", and "Website"
// entries from the app menu unless the user is Scout team.
// No redirects, no route interception — safe, cannot loop.
frappe.provide("scout_hr");

scout_hr.nav_hider = {
    is_scout_team: function () {
        var roles = frappe.user_roles || [];
        return (
            frappe.session.user === "Administrator" ||
            roles.indexOf("System Manager") !== -1 ||
            roles.indexOf("Scout HR Manager") !== -1
        );
    },

    hidden_labels: ["Desktop", "Workspaces", "Website"],

    hide: function () {
        if (this.is_scout_team()) {
            return;
        }
        var self = this;
        $(".dropdown-menu a, .dropdown-menu .dropdown-item, .sidebar-menu a").each(function () {
            var text = ($(this).text() || "").trim();
            for (var i = 0; i < self.hidden_labels.length; i++) {
                if (text === self.hidden_labels[i]) {
                    $(this).closest("li, .dropdown-item").hide();
                    $(this).hide();
                }
            }
        });
    },
};

$(document).on("app_ready", function () {
    scout_hr.nav_hider.hide();
});

frappe.router.on("change", function () {
    setTimeout(function () {
        scout_hr.nav_hider.hide();
    }, 300);
});