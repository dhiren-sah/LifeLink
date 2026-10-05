document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const requestTableBody =
        document.getElementById(
            "requestTableBody"
        );

    const requestSearch =
        document.getElementById(
            "requestSearch"
        );

    const requestRefreshButton =
        document.getElementById(
            "requestRefreshButton"
        );

    const requestError =
        document.getElementById(
            "requestError"
        );

    const totalRequests =
        document.getElementById(
            "totalRequests"
        );

    const pendingRequests =
        document.getElementById(
            "pendingRequests"
        );

    const approvedRequests =
        document.getElementById(
            "approvedRequests"
        );

    const completedRequests =
        document.getElementById(
            "completedRequests"
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

    let allRequests = [];


    // =====================================================
    // LOAD REQUESTS
    // =====================================================

    async function loadRequests() {

        showLoading();

        hideError();

        try {

            const response =
                await fetch(
                    "/api/admin/blood-requests",
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
                    "Unable to fetch blood requests."
                );

            }


            allRequests =
                Array.isArray(
                    data.requests
                )
                    ? data.requests
                    : [];


            updateStatistics();

            renderRequests(
                allRequests
            );


        } catch (error) {

            console.error(
                "LOAD BLOOD REQUESTS ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to load blood requests."
            );


            showEmptyState(
                "Unable to load blood requests."
            );

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {

        requestTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="request-loading"
                >

                    <div
                        class="request-spinner"
                    ></div>

                    <strong>
                        Loading blood requests...
                    </strong>

                    Please wait.

                </td>

            </tr>

        `;

    }


    // =====================================================
    // EMPTY
    // =====================================================

    function showEmptyState(
        message = "No blood requests found."
    ) {

        requestTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="request-empty"
                >

                    <strong>
                        ${escapeHTML(message)}
                    </strong>

                    There are no blood requests to display.

                </td>

            </tr>

        `;

    }


    // =====================================================
    // ERROR
    // =====================================================

    function showError(message) {

        if (!requestError) {
            return;
        }


        requestError.textContent =
            message;


        requestError.hidden =
            false;

    }


    function hideError() {

        if (!requestError) {
            return;
        }


        requestError.textContent =
            "";


        requestError.hidden =
            true;

    }


    // =====================================================
    // STATISTICS
    // =====================================================

    function updateStatistics() {

        const total =
            allRequests.length;


        const pending =
            allRequests.filter(
                (request) =>
                    normalizeStatus(
                        request.status
                    ) ===
                    "Pending"
            ).length;


        const approved =
            allRequests.filter(
                (request) =>
                    normalizeStatus(
                        request.status
                    ) ===
                    "Approved"
            ).length;


        const completed =
            allRequests.filter(
                (request) =>
                    normalizeStatus(
                        request.status
                    ) ===
                    "Completed"
            ).length;


        totalRequests.textContent =
            total;


        pendingRequests.textContent =
            pending;


        approvedRequests.textContent =
            approved;


        completedRequests.textContent =
            completed;

    }


    // =====================================================
    // RENDER REQUESTS
    // =====================================================

    function renderRequests(
        requests
    ) {

        if (
            !Array.isArray(
                requests
            ) ||
            requests.length === 0
        ) {

            showEmptyState();

            return;

        }


        requestTableBody.innerHTML =
            requests
                .map(
                    (request) =>
                        createRequestRow(
                            request
                        )
                )
                .join("");


        attachActionEvents();

    }


    // =====================================================
    // CREATE REQUEST ROW
    // =====================================================

    function createRequestRow(
        request
    ) {

        const requestId =
            request._id || "";


        const user =
            request.user || {};


        const requesterName =
            user.fullName ||
            request.fullName ||
            request.patientName ||
            "Unknown User";


        const phone =
            user.phoneNumber ||
            request.phoneNumber ||
            "No phone";


        const bloodGroup =
            request.bloodGroup ||
            request.requiredBloodGroup ||
            user.bloodGroup ||
            "N/A";


        const units =
            request.unitsRequired ??
            request.requiredUnits ??
            request.units ??
            request.quantity ??
            0;


        const city =
            request.city ||
            user.city ||
            "N/A";


        const state =
            request.state ||
            user.state ||
            "";


        const location =
            state
                ? `${city}, ${state}`
                : city;


        const status =
            normalizeStatus(
                request.status
            );


        const requestedDate =
            formatDate(
                request.createdAt ||
                request.requestDate ||
                request.date
            );


        const statusClass =
            getStatusClass(
                status
            );


        return `

            <tr
                data-request-id="${escapeAttribute(
                    requestId
                )}"
            >

                <!-- REQUESTER -->

                <td>

                    <div
                        class="requester-name"
                    >

                        ${escapeHTML(
                            requesterName
                        )}

                    </div>


                    <div
                        class="requester-phone"
                    >

                        ${escapeHTML(
                            phone
                        )}

                    </div>

                </td>


                <!-- BLOOD GROUP -->

                <td>

                    <span
                        class="blood-group-badge"
                    >

                        ${escapeHTML(
                            bloodGroup
                        )}

                    </span>

                </td>


                <!-- UNITS -->

                <td>

                    <span
                        class="units"
                    >
                        ${escapeHTML(
                            units
                        )}
                    </span>

                </td>


                <!-- LOCATION -->

                <td>

                    ${escapeHTML(
                        location
                    )}

                </td>


                <!-- STATUS -->

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


                <!-- REQUESTED -->

                <td>

                    ${escapeHTML(
                        requestedDate
                    )}

                </td>


                <!-- ACTIONS -->

                <td>

                    <div
                        class="action-buttons"
                    >

                        <button
                            type="button"
                            class="action-button view-request-button"
                            data-request-id="${escapeAttribute(
                                requestId
                            )}"
                        >
                            View
                        </button>


                        <button
                            type="button"
                            class="action-button edit-request-button"
                            data-request-id="${escapeAttribute(
                                requestId
                            )}"
                        >
                            Edit
                        </button>

                    </div>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // NORMALIZE STATUS
    // =====================================================

    function normalizeStatus(
        status
    ) {

        const value =
            String(
                status ||
                "Pending"
            )
                .trim()
                .toLowerCase();


        if (
            value ===
            "approved"
        ) {

            return "Approved";

        }


        if (
            value ===
            "rejected"
        ) {

            return "Rejected";

        }


        if (
            value ===
            "completed"
        ) {

            return "Completed";

        }


        return "Pending";

    }


    // =====================================================
    // STATUS CLASS
    // =====================================================

    function getStatusClass(
        status
    ) {

        if (
            status ===
            "Approved"
        ) {

            return "status-approved";

        }


        if (
            status ===
            "Completed"
        ) {

            return "status-completed";

        }


        if (
            status ===
            "Rejected"
        ) {

            return "status-rejected";

        }


        return "status-pending";

    }


    // =====================================================
    // ACTION EVENTS
    // =====================================================

    function attachActionEvents() {

        const viewButtons =
            document.querySelectorAll(
                ".view-request-button"
            );


        const editButtons =
            document.querySelectorAll(
                ".edit-request-button"
            );


        viewButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        viewRequest(
                            button.dataset
                                .requestId
                        );

                    }
                );

            }
        );


        editButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editRequest(
                            button.dataset
                                .requestId
                        );

                    }
                );

            }
        );

    }


    // =====================================================
    // SEARCH
    // =====================================================

    if (requestSearch) {

        requestSearch.addEventListener(
            "input",
            () => {

                const value =
                    requestSearch.value
                        .trim()
                        .toLowerCase();


                if (!value) {

                    renderRequests(
                        allRequests
                    );

                    return;

                }


                const filtered =
                    allRequests.filter(
                        (request) => {

                            const user =
                                request.user ||
                                {};


                            const name =
                                String(
                                    user.fullName ||
                                    request.fullName ||
                                    request.patientName ||
                                    ""
                                ).toLowerCase();


                            const phone =
                                String(
                                    user.phoneNumber ||
                                    request.phoneNumber ||
                                    ""
                                ).toLowerCase();


                            const bloodGroup =
                                String(
                                    request.bloodGroup ||
                                    request.requiredBloodGroup ||
                                    user.bloodGroup ||
                                    ""
                                ).toLowerCase();


                            const city =
                                String(
                                    request.city ||
                                    user.city ||
                                    ""
                                ).toLowerCase();


                            const state =
                                String(
                                    request.state ||
                                    user.state ||
                                    ""
                                ).toLowerCase();


                            const status =
                                String(
                                    request.status ||
                                    ""
                                ).toLowerCase();


                            return (

                                name.includes(
                                    value
                                ) ||

                                phone.includes(
                                    value
                                ) ||

                                bloodGroup.includes(
                                    value
                                ) ||

                                city.includes(
                                    value
                                ) ||

                                state.includes(
                                    value
                                ) ||

                                status.includes(
                                    value
                                )

                            );

                        }
                    );


                if (
                    filtered.length ===
                    0
                ) {

                    showEmptyState(
                        "No matching blood requests found."
                    );

                    return;

                }


                renderRequests(
                    filtered
                );

            }
        );

    }


    // =====================================================
    // REFRESH
    // =====================================================

    if (
        requestRefreshButton
    ) {

        requestRefreshButton.addEventListener(
            "click",
            loadRequests
        );

    }


    // =====================================================
    // VIEW REQUEST
    // =====================================================

    async function viewRequest(
        requestId
    ) {

        try {

            const response =
                await fetch(
                    `/api/admin/blood-requests/${encodeURIComponent(
                        requestId
                    )}`,
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
                    "Unable to fetch blood request."
                );

            }


            createViewModal(
                data.request
            );


        } catch (error) {

            console.error(
                "VIEW REQUEST ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to fetch blood request."
            );

        }

    }


    // =====================================================
    // VIEW MODAL
    // =====================================================

    function createViewModal(
        request
    ) {

        removeExistingModal();


        const user =
            request.user ||
            {};


        const requesterName =
            user.fullName ||
            request.fullName ||
            request.patientName ||
            "Unknown";


        const phone =
            user.phoneNumber ||
            request.phoneNumber ||
            "N/A";


        const email =
            user.email ||
            request.email ||
            "No email";


        const bloodGroup =
            request.bloodGroup ||
            request.requiredBloodGroup ||
            user.bloodGroup ||
            "N/A";


        const units =
            request.unitsRequired ??
            request.requiredUnits ??
            request.units ??
            request.quantity ??
            0;


        const city =
            request.city ||
            user.city ||
            "N/A";


        const state =
            request.state ||
            user.state ||
            "N/A";


        const address =
            request.address ||
            user.address ||
            "N/A";


        const status =
            normalizeStatus(
                request.status
            );


        const requestedDate =
            formatDate(
                request.createdAt ||
                request.requestDate ||
                request.date
            );


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "adminBloodRequestModal";


        modal.innerHTML = `

            <div
                class="request-modal-overlay"
                id="requestModalOverlay"
            >

                <div
                    class="request-modal"
                    role="dialog"
                    aria-modal="true"
                >

                    <div
                        class="request-modal-header"
                    >

                        <div>

                            <h2>
                                Blood Request Details
                            </h2>

                            <p>
                                Request information
                            </p>

                        </div>


                        <button
                            type="button"
                            class="modal-close"
                            id="closeRequestModal"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        class="request-modal-body"
                    >

                        <div
                            class="detail-grid"
                        >

                            <div
                                class="detail-item"
                            >

                                <span>
                                    Requester
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        requesterName
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item"
                            >

                                <span>
                                    Phone
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        phone
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item"
                            >

                                <span>
                                    Email
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        email
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item"
                            >

                                <span>
                                    Blood Group
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        bloodGroup
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item"
                            >

                                <span>
                                    Units Required
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        units
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item"
                            >

                                <span>
                                    Status
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        status
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item"
                            >

                                <span>
                                    City
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        city
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item"
                            >

                                <span>
                                    State
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        state
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item full-width"
                            >

                                <span>
                                    Address
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        address
                                    )}
                                </strong>

                            </div>


                            <div
                                class="detail-item full-width"
                            >

                                <span>
                                    Requested On
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        requestedDate
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div
                        class="request-modal-footer"
                    >

                        <button
                            type="button"
                            class="modal-cancel"
                            id="closeRequestModalBottom"
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "closeRequestModal"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "closeRequestModalBottom"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "requestModalOverlay"
            )
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.id ===
                        "requestModalOverlay"
                    ) {

                        removeExistingModal();

                    }

                }
            );

    }


    // =====================================================
    // EDIT REQUEST
    // =====================================================

    function editRequest(
        requestId
    ) {

        const request =
            allRequests.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        requestId
                    )
            );


        if (!request) {

            showError(
                "Blood request not found."
            );

            return;

        }


        createEditModal(
            request
        );

    }


    // =====================================================
    // EDIT MODAL
    // =====================================================

    function createEditModal(
        request
    ) {

        removeExistingModal();


        const user =
            request.user ||
            {};


        const requesterName =
            user.fullName ||
            request.fullName ||
            request.patientName ||
            "Unknown";


        const status =
            normalizeStatus(
                request.status
            );


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "adminBloodRequestEditModal";


        modal.innerHTML = `

            <div
                class="request-modal-overlay"
                id="requestEditOverlay"
            >

                <div
                    class="request-modal"
                    role="dialog"
                    aria-modal="true"
                    data-request-id="${escapeAttribute(
                        request._id
                    )}"
                >

                    <div
                        class="request-modal-header"
                    >

                        <div>

                            <h2>
                                Update Blood Request
                            </h2>

                            <p>
                                Change request status.
                            </p>

                        </div>


                        <button
                            type="button"
                            class="modal-close"
                            id="closeRequestEditModal"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="editRequestForm"
                    >

                        <div
                            class="request-modal-body"
                        >

                            <div
                                class="detail-grid"
                            >

                                <div
                                    class="detail-item"
                                >

                                    <span>
                                        Requester
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            requesterName
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="detail-item"
                                >

                                    <span>
                                        Blood Group
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            request.bloodGroup ||
                                            request.requiredBloodGroup ||
                                            user.bloodGroup ||
                                            "N/A"
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div
                                class="status-select-group"
                            >

                                <label
                                    for="editRequestStatus"
                                >
                                    Request Status
                                </label>


                                <select
                                    id="editRequestStatus"
                                    required
                                >

                                    <option
                                        value="Pending"
                                        ${
                                            status ===
                                            "Pending"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Pending
                                    </option>


                                    <option
                                        value="Approved"
                                        ${
                                            status ===
                                            "Approved"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Approved
                                    </option>


                                    <option
                                        value="Rejected"
                                        ${
                                            status ===
                                            "Rejected"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Rejected
                                    </option>


                                    <option
                                        value="Completed"
                                        ${
                                            status ===
                                            "Completed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Completed
                                    </option>

                                </select>

                            </div>


                            <div
                                id="requestEditMessage"
                                style="
                                    min-height:20px;
                                    margin-top:12px;
                                    color:#d62839;
                                    font-size:12px;
                                "
                            ></div>

                        </div>


                        <div
                            class="request-modal-footer"
                        >

                            <button
                                type="button"
                                class="modal-cancel"
                                id="cancelRequestEdit"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                class="modal-save"
                                id="saveRequestButton"
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


        document
            .getElementById(
                "closeRequestEditModal"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "cancelRequestEdit"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "requestEditOverlay"
            )
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.id ===
                        "requestEditOverlay"
                    ) {

                        removeExistingModal();

                    }

                }
            );


        document
            .getElementById(
                "editRequestForm"
            )
            .addEventListener(
                "submit",
                handleRequestUpdate
            );

    }


    // =====================================================
    // UPDATE REQUEST
    // =====================================================

    async function handleRequestUpdate(
        event
    ) {

        event.preventDefault();


        const modal =
            document.getElementById(
                "adminBloodRequestEditModal"
            );


        if (!modal) {
            return;
        }


        const modalWindow =
            modal.querySelector(
                ".request-modal"
            );


        const requestId =
            modalWindow.dataset
                .requestId;


        const status =
            document.getElementById(
                "editRequestStatus"
            ).value;


        const message =
            document.getElementById(
                "requestEditMessage"
            );


        const saveButton =
            document.getElementById(
                "saveRequestButton"
            );


        saveButton.disabled =
            true;


        saveButton.textContent =
            "Saving...";


        message.textContent =
            "";


        try {

            const response =
                await fetch(
                    `/api/admin/blood-requests/${encodeURIComponent(
                        requestId
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
                    "Unable to update blood request."
                );

            }


            removeExistingModal();


            await loadRequests();


            showSuccessMessage(
                "Blood request updated successfully."
            );


        } catch (error) {

            console.error(
                "UPDATE BLOOD REQUEST ERROR:",
                error
            );


            message.textContent =
                error.message ||
                "Unable to update blood request.";


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

        const viewModal =
            document.getElementById(
                "adminBloodRequestModal"
            );


        const editModal =
            document.getElementById(
                "adminBloodRequestEditModal"
            );


        if (viewModal) {

            viewModal.remove();

        }


        if (editModal) {

            editModal.remove();

        }

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadRequests();

});