/* =========================================================
   BLOOD BANK — ADMIN DASHBOARD
   Dashboard UI + API Interactions
   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {

    initSidebar();

    initProfileMenu();

    initNotifications();

    initLogoutButtons();

    initDashboardRetry();

    initSearch();

    initCardActions();

    initKeyboardAccessibility();

    loadDashboardData();

});


/* =========================================================
   1. SIDEBAR
   ========================================================= */

function initSidebar() {

    const sidebar =
        document.getElementById("adminSidebar");

    const toggleButton =
        document.getElementById("sidebarToggle");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (!sidebar || !toggleButton) {
        return;
    }


    toggleButton.addEventListener("click", () => {

        const isOpen =
            sidebar.classList.toggle("open");

        toggleButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );


        if (overlay) {
            overlay.hidden = !isOpen;
        }

    });


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    window.addEventListener("resize", () => {

        if (window.innerWidth > 800) {

            sidebar.classList.remove("open");

            toggleButton.setAttribute(
                "aria-expanded",
                "true"
            );

            if (overlay) {
                overlay.hidden = true;
            }

        }

    });


    const navigationLinks =
        document.querySelectorAll(
            ".sidebar-nav-link"
        );


    navigationLinks.forEach((link) => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 800) {
                closeSidebar();
            }

        });

    });

}


/* =========================================================
   CLOSE SIDEBAR
   ========================================================= */

function closeSidebar() {

    const sidebar =
        document.getElementById("adminSidebar");

    const toggleButton =
        document.getElementById("sidebarToggle");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (sidebar) {
        sidebar.classList.remove("open");
    }


    if (toggleButton) {

        toggleButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if (overlay) {
        overlay.hidden = true;
    }

}


/* =========================================================
   2. PROFILE MENU
   ========================================================= */

function initProfileMenu() {

    const profileButton =
        document.getElementById(
            "profileMenuButton"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    if (
        !profileButton ||
        !profileDropdown
    ) {
        return;
    }


    profileButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            profileDropdown.hidden =
                !profileDropdown.hidden;

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !profileDropdown.contains(
                    event.target
                ) &&
                event.target !== profileButton
            ) {

                profileDropdown.hidden = true;

            }

        }
    );

}


/* =========================================================
   3. NOTIFICATIONS
   ========================================================= */

function initNotifications() {

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const notificationPanel =
        document.getElementById(
            "notificationPanel"
        );

    const closeButton =
        document.getElementById(
            "closeNotificationPanel"
        );


    if (
        !notificationButton ||
        !notificationPanel
    ) {
        return;
    }


    notificationButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            notificationPanel.hidden =
                !notificationPanel.hidden;

        }
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                notificationPanel.hidden = true;

            }
        );

    }


    document.addEventListener(
        "click",
        (event) => {

            if (
                !notificationPanel.contains(
                    event.target
                ) &&
                event.target !== notificationButton
            ) {

                notificationPanel.hidden = true;

            }

        }
    );

}


/* =========================================================
   4. LOGOUT
   ========================================================= */

function initLogoutButtons() {

    const sidebarLogout =
        document.getElementById(
            "sidebarLogoutButton"
        );

    const dropdownLogout =
        document.getElementById(
            "dropdownLogoutButton"
        );


    if (sidebarLogout) {

        sidebarLogout.addEventListener(
            "click",
            handleLogout
        );

    }


    if (dropdownLogout) {

        dropdownLogout.addEventListener(
            "click",
            handleLogout
        );

    }

}


async function handleLogout() {

    const confirmed =
        window.confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/auth/logout",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials: "same-origin"
                }
            );


        if (response.ok) {

            window.location.href =
                "/admin/login";

            return;

        }


        window.location.href =
            "/admin/login";


    } catch (error) {

        console.error(
            "Logout request failed:",
            error
        );

        window.location.href =
            "/admin/login";

    }

}


/* =========================================================
   5. LOAD DASHBOARD DATA
   ========================================================= */

async function loadDashboardData() {

    const errorBox =
        document.getElementById(
            "dashboardError"
        );

    const loading =
        document.getElementById(
            "dashboardLoading"
        );


    try {

        hideDashboardError();


        if (loading) {
            loading.hidden = false;
        }


        const response =
            await fetch(
                "/api/admin/dashboard",
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    credentials: "same-origin"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load dashboard data."
            );

        }


        updateDashboardCards(data);

        updateBloodInventory(data);

        updateRecentActivity(data);

        updatePendingRequests(data);

        updateNotifications(data);


    } catch (error) {

        console.error(
            "DASHBOARD LOAD ERROR:",
            error
        );


        if (errorBox) {

            errorBox.textContent =
                error.message ||
                "Unable to load dashboard data.";

            errorBox.hidden = false;

        }


    } finally {

        if (loading) {
            loading.hidden = true;
        }

    }

}


/* =========================================================
   6. DASHBOARD STATISTICS CARDS
   ========================================================= */

function updateDashboardCards(data) {

    const statistics =
        data.statistics ||
        data.stats ||
        data;


    setElementText(
        "totalUsers",
        statistics.totalUsers ?? 0
    );


    setElementText(
        "totalDonors",
        statistics.totalDonors ?? 0
    );


    setElementText(
        "availableBloodUnits",
        statistics.availableBloodUnits ??
        statistics.totalBloodUnits ??
        0
    );


    setElementText(
        "pendingRequests",
        statistics.pendingRequests ?? 0
    );


    setElementText(
        "totalDonations",
        statistics.totalDonations ?? 0
    );

}


/* =========================================================
   7. BLOOD INVENTORY
   ========================================================= */

/*
   IMPORTANT FIX:

   Previous code was only searching for elements like:

   inventory-Aplus
   inventory-Aminus
   inventory-Bplus
   ...

   But those elements do not exist in the HTML.

   This version CREATES the complete chart dynamically.
*/

function updateBloodInventory(data) {

    const inventory =
        data.bloodInventory ||
        data.inventory ||
        [];


    const chart =
        document.getElementById(
            "bloodInventoryChart"
        );


    if (!chart) {
        return;
    }


    if (!Array.isArray(inventory)) {

        chart.innerHTML = `
            <div class="chart-empty-state">
                Unable to load inventory.
            </div>
        `;

        return;

    }


    const bloodGroups = [
        "A+",
        "A-",
        "B+",
        "B-",
        "O+",
        "O-",
        "AB+",
        "AB-"
    ];


    function getGroup(item) {

        return String(
            item?.bloodGroup ??
            item?.group ??
            item?.type ??
            ""
        ).trim();

    }


    function getUnits(item) {

        return Number(
            item?.units ??
            item?.quantity ??
            item?.availableUnits ??
            item?.available ??
            0
        ) || 0;

    }


    const values =
        bloodGroups.map((group) => {

            const item =
                inventory.find(
                    (entry) =>
                        getGroup(entry)
                            .toUpperCase() ===
                        group.toUpperCase()
                );


            return {
                group,
                units: item
                    ? getUnits(item)
                    : 0
            };

        });


    const maxUnits =
        Math.max(
            100,
            ...values.map(
                (item) => item.units
            )
        );


    /*
       Remove:

       Loading inventory...

       and old chart elements.
    */

    chart.innerHTML = "";


    /*
       Chart container styling
    */

    chart.style.display = "grid";

    chart.style.gridTemplateColumns =
        "repeat(8, minmax(45px, 1fr))";

    chart.style.alignItems = "end";

    chart.style.gap = "14px";

    chart.style.padding =
        "24px 18px 18px";

    chart.style.minHeight =
        "280px";

    chart.style.boxSizing =
        "border-box";


    /*
       Create each blood group bar
    */

    values.forEach(
        ({ group, units }) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.style.display =
                "flex";

            wrapper.style.flexDirection =
                "column";

            wrapper.style.alignItems =
                "center";

            wrapper.style.justifyContent =
                "flex-end";

            wrapper.style.height =
                "100%";

            wrapper.style.minWidth =
                "0";


            /*
               Number above bar
            */

            const value =
                document.createElement(
                    "span"
                );


            value.textContent =
                String(units);


            value.style.fontSize =
                "12px";

            value.style.fontWeight =
                "700";

            value.style.color =
                "#333";

            value.style.marginBottom =
                "7px";


            /*
               Bar background
            */

            const barArea =
                document.createElement(
                    "div"
                );


            barArea.style.height =
                "190px";

            barArea.style.width =
                "100%";

            barArea.style.maxWidth =
                "42px";

            barArea.style.display =
                "flex";

            barArea.style.alignItems =
                "flex-end";

            barArea.style.justifyContent =
                "center";

            barArea.style.background =
                "linear-gradient(to top, #f5f6f8, #fafbfc)";

            barArea.style.borderRadius =
                "8px 8px 4px 4px";

            barArea.style.overflow =
                "hidden";


            /*
               Actual red bar
            */

            const bar =
                document.createElement(
                    "div"
                );


            const percentage =
                Math.max(
                    0,
                    Math.min(
                        (units / maxUnits) * 100,
                        100
                    )
                );


            bar.style.width =
                "100%";


            bar.style.height =
                `${Math.max(
                    percentage,
                    units > 0 ? 4 : 0
                )}%`;


            bar.style.minHeight =
                units > 0
                    ? "5px"
                    : "0";


            bar.style.background =
                "linear-gradient(to top, #dc2430, #ef5360)";


            bar.style.borderRadius =
                "7px 7px 3px 3px";


            bar.style.transition =
                "height 0.4s ease";


            bar.title =
                `${group}: ${units} units`;


            barArea.appendChild(bar);


            /*
               Blood group label
            */

            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                group;


            label.style.fontSize =
                "12px";

            label.style.fontWeight =
                "600";

            label.style.color =
                "#555";

            label.style.marginTop =
                "9px";


            /*
               Assemble chart item
            */

            wrapper.appendChild(value);

            wrapper.appendChild(barArea);

            wrapper.appendChild(label);


            chart.appendChild(wrapper);

        }
    );

}


/* =========================================================
   8. RECENT ACTIVITY
   ========================================================= */

function updateRecentActivity(data) {

    const activities =
        data.recentActivity ||
        data.activities ||
        [];


    const container =
        document.getElementById(
            "recentActivityList"
        );


    if (!container) {
        return;
    }


    if (!Array.isArray(activities)) {
        return;
    }


    if (activities.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No recent activity.
            </div>
        `;

        return;

    }


    container.innerHTML =
        activities
            .map((activity) => {

                const title =
                    escapeHTML(
                        activity.title ||
                        activity.action ||
                        "Activity"
                    );


                const description =
                    escapeHTML(
                        activity.description ||
                        activity.name ||
                        ""
                    );


                const time =
                    escapeHTML(
                        activity.time ||
                        formatDate(
                            activity.createdAt
                        )
                    );


                return `
                    <div class="activity-item">

                        <div class="activity-content">

                            <strong>
                                ${title}
                            </strong>

                            <span>
                                ${description}
                            </span>

                        </div>

                        <time>
                            ${time}
                        </time>

                    </div>
                `;

            })
            .join("");

}


/* =========================================================
   9. PENDING REQUESTS
   ========================================================= */

function updatePendingRequests(data) {

    const requests =
        data.pendingRequestsList ||
        data.pendingRequestsData ||
        data.requests ||
        [];


    const tableBody =
        document.getElementById(
            "pendingRequestsTable"
        );


    if (!tableBody) {
        return;
    }


    if (!Array.isArray(requests)) {
        return;
    }


    if (requests.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    No pending blood requests.
                </td>

            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        requests
            .slice(0, 5)
            .map(
                (request, index) => {

                    const user =
                        request.user || {};


                    const patientName =
                        request.patientName ||
                        user.fullName ||
                        "Unknown";


                    const bloodGroup =
                        request.bloodGroup ||
                        "-";


                    const units =
                        request.units ??
                        request.quantity ??
                        0;


                    const hospital =
                        request.hospital ||
                        "-";


                    const date =
                        formatDate(
                            request.createdAt ||
                            request.date
                        );


                    const status =
                        request.status ||
                        "Pending";


                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    patientName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    bloodGroup
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(units)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    hospital
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    date
                                )}
                            </td>

                            <td>

                                <span class="status-badge">
                                    ${escapeHTML(
                                        status
                                    )}
                                </span>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   10. NOTIFICATIONS
   ========================================================= */

function updateNotifications(data) {

    const notifications =
        data.notifications ||
        [];


    const badge =
        document.querySelector(
            ".notification-badge"
        );


    if (!badge) {
        return;
    }


    const count =
        Array.isArray(notifications)
            ? notifications.length
            : Number(
                data.notificationCount || 0
            );


    badge.textContent =
        count;


    badge.hidden =
        count === 0;

}


/* =========================================================
   11. DASHBOARD RETRY
   ========================================================= */

function initDashboardRetry() {

    const retryButton =
        document.getElementById(
            "retryDashboardButton"
        );


    if (!retryButton) {
        return;
    }


    retryButton.addEventListener(
        "click",
        async () => {

            hideDashboardError();

            retryButton.disabled = true;


            const originalText =
                retryButton.textContent;


            retryButton.textContent =
                "Retrying...";


            await loadDashboardData();


            retryButton.disabled =
                false;


            retryButton.textContent =
                originalText;

        }
    );

}


function hideDashboardError() {

    const errorBox =
        document.getElementById(
            "dashboardError"
        );


    if (errorBox) {
        errorBox.hidden = true;
    }

}


/* =========================================================
   12. GLOBAL SEARCH
   ========================================================= */

function initSearch() {

    const searchInput =
        document.getElementById(
            "adminSearch"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Enter") {
                return;
            }


            const query =
                searchInput.value.trim();


            if (!query) {
                return;
            }


            console.info(
                "Admin search:",
                query
            );

        }
    );

}


/* =========================================================
   13. CARD ACTIONS
   ========================================================= */

function initCardActions() {

    document.addEventListener(
        "click",
        (event) => {

            const action =
                event.target.closest(
                    ".card-action"
                );


            if (!action) {
                return;
            }


            const href =
                action.getAttribute(
                    "href"
                );


            if (href) {
                return;
            }


            event.preventDefault();


            console.info(
                "Dashboard action clicked."
            );

        }
    );

}


/* =========================================================
   14. KEYBOARD ACCESSIBILITY
   ========================================================= */

function initKeyboardAccessibility() {

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }


            const profileDropdown =
                document.getElementById(
                    "profileDropdown"
                );


            const notificationPanel =
                document.getElementById(
                    "notificationPanel"
                );


            if (profileDropdown) {
                profileDropdown.hidden = true;
            }


            if (notificationPanel) {
                notificationPanel.hidden = true;
            }


            closeSidebar();

        }
    );

}


/* =========================================================
   15. HELPER — SET ELEMENT TEXT
   ========================================================= */

function setElementText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ?? 0;

}


/* =========================================================
   16. HELPER — DATE FORMAT
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return "-";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   17. HELPER — ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}