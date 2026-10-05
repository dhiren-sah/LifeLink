document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const inventoryTableBody =
        document.getElementById(
            "inventoryTableBody"
        );

    const inventorySearch =
        document.getElementById(
            "inventorySearch"
        );

    const inventoryRefreshButton =
        document.getElementById(
            "inventoryRefreshButton"
        );

    const inventoryError =
        document.getElementById(
            "inventoryError"
        );

    const totalUnits =
        document.getElementById(
            "totalUnits"
        );

    const availableGroups =
        document.getElementById(
            "availableGroups"
        );

    const lowStockGroups =
        document.getElementById(
            "lowStockGroups"
        );

    const outOfStockGroups =
        document.getElementById(
            "outOfStockGroups"
        );

    const sidebarToggle =
        document.getElementById(
            "sidebarToggle"
        );

    const adminSidebar =
        document.getElementById(
            "adminSidebar"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const sidebarLogoutButton =
        document.getElementById(
            "sidebarLogoutButton"
        );

    const dropdownLogoutButton =
        document.getElementById(
            "dropdownLogoutButton"
        );

    const profileMenuButton =
        document.getElementById(
            "profileMenuButton"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const notificationPanel =
        document.getElementById(
            "notificationPanel"
        );

    const closeNotificationPanel =
        document.getElementById(
            "closeNotificationPanel"
        );


    // =====================================================
    // STATE
    // =====================================================

    let allInventory = [];


    // =====================================================
    // LOAD INVENTORY
    // =====================================================

    async function loadInventory() {

        showLoading();

        hideError();

        try {

            const response =
                await fetch(
                    "/api/admin/blood-inventory",
                    {
                        method: "GET",

                        credentials:
                            "same-origin",

                        headers: {
                            "Accept":
                                "application/json"
                        }
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
                    "Unable to fetch blood inventory."
                );

            }


            allInventory =
                Array.isArray(
                    data.inventory
                )
                    ? data.inventory
                    : [];


            updateStatistics();

            renderInventory(
                allInventory
            );


        } catch (error) {

            console.error(
                "LOAD INVENTORY ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to load blood inventory."
            );


            showEmptyState(
                "Unable to load blood inventory."
            );

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {

        inventoryTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="inventory-loading"
                >

                    <div
                        class="inventory-spinner"
                    ></div>

                    <strong>
                        Loading inventory...
                    </strong>

                    Please wait.

                </td>

            </tr>

        `;

    }


    // =====================================================
    // EMPTY STATE
    // =====================================================

    function showEmptyState(
        message = "No inventory records found."
    ) {

        inventoryTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="inventory-empty"
                >

                    <strong>
                        ${escapeHTML(message)}
                    </strong>

                    No blood inventory records are available.

                </td>

            </tr>

        `;

    }


    // =====================================================
    // ERROR
    // =====================================================

    function showError(message) {

        if (!inventoryError) {
            return;
        }


        inventoryError.textContent =
            message;


        inventoryError.hidden =
            false;

    }


    function hideError() {

        if (!inventoryError) {
            return;
        }


        inventoryError.textContent =
            "";


        inventoryError.hidden =
            true;

    }


    // =====================================================
    // STATISTICS
    // =====================================================

    function updateStatistics() {

        let total =
            0;

        let available =
            0;

        let lowStock =
            0;

        let outOfStock =
            0;


        allInventory.forEach(
            (item) => {

                const units =
                    Number(
                        item.availableUnits ||
                        0
                    );


                total +=
                    units;


                const status =
                    getStatus(
                        item
                    );


                if (
                    status ===
                    "Available"
                ) {

                    available++;

                } else if (
                    status ===
                    "Low Stock"
                ) {

                    lowStock++;

                } else if (
                    status ===
                    "Out of Stock"
                ) {

                    outOfStock++;

                }

            }
        );


        totalUnits.textContent =
            total;


        availableGroups.textContent =
            available;


        lowStockGroups.textContent =
            lowStock;


        outOfStockGroups.textContent =
            outOfStock;

    }


    // =====================================================
    // RENDER INVENTORY
    // =====================================================

    function renderInventory(
        inventory
    ) {

        if (
            !Array.isArray(
                inventory
            ) ||
            inventory.length === 0
        ) {

            showEmptyState();

            return;

        }


        inventoryTableBody.innerHTML =
            inventory
                .map(
                    (item) =>
                        createInventoryRow(
                            item
                        )
                )
                .join("");


        attachActionEvents();

    }


    // =====================================================
    // CREATE TABLE ROW
    // =====================================================

    function createInventoryRow(
        item
    ) {

        const inventoryId =
            item._id || "";


        const bloodGroup =
            item.bloodGroup ||
            "N/A";


        const units =
            Number(
                item.availableUnits ||
                0
            );


        const status =
            getStatus(
                item
            );


        const lastUpdated =
            formatDate(
                item.lastUpdated ||
                item.updatedAt ||
                item.createdAt
            );


        const statusClass =
            getStatusClass(
                status
            );


        return `

            <tr
                data-inventory-id="${escapeAttribute(
                    inventoryId
                )}"
            >

                <td>

                    <span
                        class="blood-group"
                    >
                        ${escapeHTML(
                            bloodGroup
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="units-value"
                    >
                        ${units}
                    </span>

                    units

                </td>


                <td>

                    <span
                        class="status-badge ${statusClass}"
                    >

                        <span
                            class="status-dot"
                        ></span>

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHTML(
                        lastUpdated
                    )}

                </td>


                <td>

                    <button
                        type="button"
                        class="action-button edit-inventory-button"
                        data-inventory-id="${escapeAttribute(
                            inventoryId
                        )}"
                    >
                        Edit
                    </button>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // STATUS
    // =====================================================

    function getStatus(item) {

        const units =
            Number(
                item.availableUnits ||
                0
            );


        if (
            item.status ===
                "Out of Stock" ||
            units === 0
        ) {

            return "Out of Stock";

        }


        if (
            item.status ===
                "Low Stock"
        ) {

            return "Low Stock";

        }


        if (
            item.status ===
                "Available"
        ) {

            return "Available";

        }


        if (
            units <= 10
        ) {

            return "Low Stock";

        }


        return "Available";

    }


    function getStatusClass(
        status
    ) {

        if (
            status ===
            "Out of Stock"
        ) {

            return "status-out";

        }


        if (
            status ===
            "Low Stock"
        ) {

            return "status-low";

        }


        return "status-available";

    }


    // =====================================================
    // ACTION EVENTS
    // =====================================================

    function attachActionEvents() {

        const editButtons =
            document.querySelectorAll(
                ".edit-inventory-button"
            );


        editButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editInventory(
                            button.dataset
                                .inventoryId
                        );

                    }
                );

            }
        );

    }


    // =====================================================
    // SEARCH
    // =====================================================

    if (inventorySearch) {

        inventorySearch.addEventListener(
            "input",
            () => {

                const searchValue =
                    inventorySearch.value
                        .trim()
                        .toLowerCase();


                if (!searchValue) {

                    renderInventory(
                        allInventory
                    );

                    return;

                }


                const filteredInventory =
                    allInventory.filter(
                        (item) => {

                            const bloodGroup =
                                String(
                                    item.bloodGroup ||
                                    ""
                                ).toLowerCase();


                            const status =
                                String(
                                    getStatus(
                                        item
                                    )
                                ).toLowerCase();


                            const units =
                                String(
                                    item.availableUnits ||
                                    0
                                );


                            return (
                                bloodGroup.includes(
                                    searchValue
                                ) ||

                                status.includes(
                                    searchValue
                                ) ||

                                units.includes(
                                    searchValue
                                )
                            );

                        }
                    );


                if (
                    filteredInventory.length ===
                    0
                ) {

                    showEmptyState(
                        "No matching inventory found."
                    );

                    return;

                }


                renderInventory(
                    filteredInventory
                );

            }
        );

    }


    // =====================================================
    // REFRESH
    // =====================================================

    if (
        inventoryRefreshButton
    ) {

        inventoryRefreshButton.addEventListener(
            "click",
            loadInventory
        );

    }


    // =====================================================
    // EDIT INVENTORY
    // =====================================================

    function editInventory(
        inventoryId
    ) {

        const inventoryItem =
            allInventory.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        inventoryId
                    )
            );


        if (!inventoryItem) {

            showError(
                "Inventory record not found."
            );

            return;

        }


        createEditModal(
            inventoryItem
        );

    }


    // =====================================================
    // CREATE EDIT MODAL
    // =====================================================

    function createEditModal(
        inventoryItem
    ) {

        removeExistingModal();


        const bloodGroup =
            inventoryItem.bloodGroup ||
            "N/A";


        const units =
            Number(
                inventoryItem.availableUnits ||
                0
            );


        const status =
            getStatus(
                inventoryItem
            );


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "adminInventoryEditModal";


        modal.innerHTML = `

            <div
                class="inventory-modal-overlay"
                id="inventoryEditOverlay"
            >

                <div
                    class="inventory-modal"
                    role="dialog"
                    aria-modal="true"
                >

                    <div
                        class="inventory-modal-header"
                    >

                        <div>

                            <h2>
                                Edit Blood Inventory
                            </h2>

                            <p>
                                Update available units and status.
                            </p>

                        </div>


                        <button
                            type="button"
                            class="modal-close"
                            id="closeInventoryModal"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="editInventoryForm"
                    >

                        <div
                            class="inventory-modal-body"
                        >

                            <div
                                class="inventory-form-group"
                            >

                                <label>
                                    Blood Group
                                </label>

                                <input
                                    type="text"
                                    value="${escapeAttribute(
                                        bloodGroup
                                    )}"
                                    readonly
                                >

                            </div>


                            <div
                                class="inventory-form-group"
                            >

                                <label
                                    for="editInventoryUnits"
                                >
                                    Available Units
                                </label>

                                <input
                                    type="number"
                                    id="editInventoryUnits"
                                    min="0"
                                    step="1"
                                    value="${units}"
                                    required
                                >

                            </div>


                            <div
                                class="inventory-form-group"
                            >

                                <label
                                    for="editInventoryStatus"
                                >
                                    Status
                                </label>

                                <select
                                    id="editInventoryStatus"
                                    required
                                >

                                    <option
                                        value="Available"
                                        ${
                                            status ===
                                            "Available"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Available
                                    </option>

                                    <option
                                        value="Low Stock"
                                        ${
                                            status ===
                                            "Low Stock"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Low Stock
                                    </option>

                                    <option
                                        value="Out of Stock"
                                        ${
                                            status ===
                                            "Out of Stock"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Out of Stock
                                    </option>

                                </select>

                            </div>


                            <div
                                id="inventoryEditMessage"
                                style="
                                    min-height:20px;
                                    color:#d62839;
                                    font-size:12px;
                                "
                            ></div>

                        </div>


                        <div
                            class="inventory-modal-footer"
                        >

                            <button
                                type="button"
                                class="modal-cancel"
                                id="cancelInventoryEdit"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                class="modal-save"
                                id="saveInventoryButton"
                            >
                                Save Changes
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const modalWindow =
            modal.querySelector(
                ".inventory-modal"
            );


        modalWindow.dataset.inventoryId =
            inventoryItem._id;


        document
            .getElementById(
                "closeInventoryModal"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "cancelInventoryEdit"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "inventoryEditOverlay"
            )
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.id ===
                        "inventoryEditOverlay"
                    ) {

                        removeExistingModal();

                    }

                }
            );


        document
            .getElementById(
                "editInventoryForm"
            )
            .addEventListener(
                "submit",
                handleInventoryUpdate
            );

    }


    // =====================================================
    // UPDATE INVENTORY
    // =====================================================

    async function handleInventoryUpdate(
        event
    ) {

        event.preventDefault();


        const modal =
            document.getElementById(
                "adminInventoryEditModal"
            );


        if (!modal) {
            return;
        }


        const modalWindow =
            modal.querySelector(
                ".inventory-modal"
            );


        const inventoryId =
            modalWindow.dataset
                .inventoryId;


        const unitsInput =
            document.getElementById(
                "editInventoryUnits"
            );


        const statusInput =
            document.getElementById(
                "editInventoryStatus"
            );


        const message =
            document.getElementById(
                "inventoryEditMessage"
            );


        const saveButton =
            document.getElementById(
                "saveInventoryButton"
            );


        const availableUnits =
            Number(
                unitsInput.value
            );


        const status =
            statusInput.value;


        if (
            !Number.isInteger(
                availableUnits
            ) ||
            availableUnits < 0
        ) {

            message.textContent =
                "Available units must be a non-negative whole number.";

            return;

        }


        saveButton.disabled =
            true;


        saveButton.textContent =
            "Saving...";


        message.textContent =
            "";


        try {

            const response =
                await fetch(
                    `/api/admin/blood-inventory/${encodeURIComponent(
                        inventoryId
                    )}`,
                    {
                        method: "PUT",

                        credentials:
                            "same-origin",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                availableUnits,
                                status
                            })

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
                    "Unable to update inventory."
                );

            }


            removeExistingModal();


            await loadInventory();


            showSuccessMessage(
                "Blood inventory updated successfully."
            );


        } catch (error) {

            console.error(
                "UPDATE INVENTORY ERROR:",
                error
            );


            message.textContent =
                error.message ||
                "Unable to update inventory.";


            saveButton.disabled =
                false;


            saveButton.textContent =
                "Save Changes";

        }

    }


    // =====================================================
    // SUCCESS MESSAGE
    // =====================================================

    function showSuccessMessage(
        message
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.textContent =
            message;


        element.style.position =
            "fixed";


        element.style.right =
            "25px";


        element.style.bottom =
            "25px";


        element.style.background =
            "#16834b";


        element.style.color =
            "#fff";


        element.style.padding =
            "13px 20px";


        element.style.borderRadius =
            "8px";


        element.style.fontSize =
            "13px";


        element.style.fontWeight =
            "600";


        element.style.zIndex =
            "99999";


        element.style.boxShadow =
            "0 5px 20px rgba(0,0,0,0.15)";


        document.body.appendChild(
            element
        );


        setTimeout(
            () => {

                element.remove();

            },
            2500
        );

    }


    // =====================================================
    // SIDEBAR
    // =====================================================

    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            () => {

                if (!adminSidebar) {
                    return;
                }


                adminSidebar.classList.toggle(
                    "sidebar-open"
                );


                if (sidebarOverlay) {

                    sidebarOverlay.hidden =
                        !adminSidebar.classList.contains(
                            "sidebar-open"
                        );

                }

            }
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            () => {

                if (adminSidebar) {

                    adminSidebar.classList.remove(
                        "sidebar-open"
                    );

                }


                sidebarOverlay.hidden =
                    true;

            }
        );

    }


    // =====================================================
    // PROFILE DROPDOWN
    // =====================================================

    if (profileMenuButton) {

        profileMenuButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                if (!profileDropdown) {
                    return;
                }


                profileDropdown.hidden =
                    !profileDropdown.hidden;

            }
        );

    }


    document.addEventListener(
        "click",
        (event) => {

            if (
                profileDropdown &&
                !profileDropdown.hidden &&
                !profileDropdown.contains(
                    event.target
                ) &&
                event.target !==
                    profileMenuButton
            ) {

                profileDropdown.hidden =
                    true;

            }

        }
    );


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                if (!notificationPanel) {
                    return;
                }


                notificationPanel.hidden =
                    !notificationPanel.hidden;

            }
        );

    }


    if (closeNotificationPanel) {

        closeNotificationPanel.addEventListener(
            "click",
            () => {

                if (notificationPanel) {

                    notificationPanel.hidden =
                        true;

                }

            }
        );

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    async function logout() {

        try {

            await fetch(
                "/auth/logout",
                {
                    method: "POST",

                    credentials:
                        "same-origin"
                }
            );

        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

        }


        window.location.href =
            "/admin/login";

    }


    if (sidebarLogoutButton) {

        sidebarLogoutButton.addEventListener(
            "click",
            logout
        );

    }


    if (dropdownLogoutButton) {

        dropdownLogoutButton.addEventListener(
            "click",
            logout
        );

    }


    // =====================================================
    // DATE FORMAT
    // =====================================================

    function formatDate(
        dateValue
    ) {

        if (!dateValue) {
            return "N/A";
        }


        const date =
            new Date(
                dateValue
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "N/A";

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // =====================================================
    // ESCAPE ATTRIBUTE
    // =====================================================

    function escapeAttribute(
        value
    ) {

        return escapeHTML(
            value
        );

    }


    // =====================================================
    // REMOVE MODAL
    // =====================================================

    function removeExistingModal() {

        const modal =
            document.getElementById(
                "adminInventoryEditModal"
            );


        if (modal) {

            modal.remove();

        }

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadInventory();

});