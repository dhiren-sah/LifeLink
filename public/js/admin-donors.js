document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const donorsTableBody =
        document.getElementById("donorsTableBody");

    const donorsTotalCount =
        document.getElementById("donorsTotalCount");

    const donorsSearch =
        document.getElementById("donorsSearch");

    const donorsRefreshButton =
        document.getElementById("donorsRefreshButton");

    const donorsError =
        document.getElementById("donorsError");

    const sidebarToggle =
        document.getElementById("sidebarToggle");

    const adminSidebar =
        document.getElementById("adminSidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const sidebarLogoutButton =
        document.getElementById("sidebarLogoutButton");

    const dropdownLogoutButton =
        document.getElementById("dropdownLogoutButton");

    const profileMenuButton =
        document.getElementById("profileMenuButton");

    const profileDropdown =
        document.getElementById("profileDropdown");

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotificationPanel =
        document.getElementById("closeNotificationPanel");


    // =====================================================
    // STATE
    // =====================================================

    let allDonors = [];


    // =====================================================
    // LOAD DONORS
    // =====================================================

    async function loadDonors() {

        showLoading();

        hideError();

        try {

            const response =
                await fetch(
                    "/api/admin/donors",
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
                    "Unable to fetch donors."
                );

            }


            allDonors =
                Array.isArray(data.donors)
                    ? data.donors
                    : [];


            updateDonorCount();

            renderDonors(
                allDonors
            );


        } catch (error) {

            console.error(
                "LOAD DONORS ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to load donors."
            );


            showEmptyState(
                "Unable to load donors."
            );

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {

        donorsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="donors-loading"
                >

                    <div class="donors-spinner"></div>

                    Loading donors...

                </td>

            </tr>

        `;

    }


    // =====================================================
    // EMPTY
    // =====================================================

    function showEmptyState(
        message = "No donors found."
    ) {

        donorsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="donors-empty"
                >

                    <strong>
                        ${escapeHTML(message)}
                    </strong>

                    <span>
                        There are no donors to display.
                    </span>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // ERROR
    // =====================================================

    function showError(message) {

        if (!donorsError) {
            return;
        }


        donorsError.textContent =
            message;


        donorsError.hidden =
            false;

    }


    function hideError() {

        if (!donorsError) {
            return;
        }


        donorsError.textContent =
            "";


        donorsError.hidden =
            true;

    }


    // =====================================================
    // COUNT
    // =====================================================

    function updateDonorCount() {

        if (!donorsTotalCount) {
            return;
        }


        donorsTotalCount.textContent =
            allDonors.length;

    }


    // =====================================================
    // RENDER DONORS
    // =====================================================

    function renderDonors(donors) {

        if (
            !Array.isArray(donors) ||
            donors.length === 0
        ) {

            showEmptyState(
                "No donors found."
            );

            return;

        }


        donorsTableBody.innerHTML =
            donors
                .map(
                    (donor) =>
                        createDonorRow(
                            donor
                        )
                )
                .join("");


        attachDonorActionEvents();

    }


    // =====================================================
    // CREATE DONOR ROW
    // =====================================================

    function createDonorRow(donor) {

        const donorId =
            donor._id || "";


        const user =
            donor.user || {};


        const fullName =
            user.fullName ||
            "Unknown Donor";


        const email =
            user.email ||
            "No email";


        const phone =
            user.phoneNumber ||
            "Not available";


        const bloodGroup =
            user.bloodGroup ||
            "N/A";


        const city =
            user.city ||
            "Not available";


        const donationCount =
            Number(
                user.donationCount || 0
            );


        const status =
            donor.status ||
            "Available";


        const registeredDate =
            formatDate(
                donor.createdAt
            );


        let avatarHTML = "";


        if (user.profilePhoto) {

            avatarHTML = `

                <img
                    src="${escapeAttribute(
                        user.profilePhoto
                    )}"
                    alt="${escapeAttribute(
                        fullName
                    )}"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <span
                    class="donor-avatar-fallback"
                    style="display:none;"
                >
                    ${getInitial(fullName)}
                </span>

            `;

        } else {

            avatarHTML = `

                <span class="donor-avatar-fallback">

                    ${getInitial(fullName)}

                </span>

            `;

        }


        return `

            <tr
                data-donor-id="${escapeAttribute(
                    donorId
                )}"
            >

                <!-- DONOR -->

                <td>

                    <div class="donor-info">

                        <div class="donor-avatar">

                            ${avatarHTML}

                        </div>


                        <div>

                            <div class="donor-name">

                                ${escapeHTML(
                                    fullName
                                )}

                            </div>


                            <div class="donor-email">

                                ${escapeHTML(
                                    email
                                )}

                            </div>

                        </div>

                    </div>

                </td>


                <!-- PHONE -->

                <td>

                    ${escapeHTML(
                        phone
                    )}

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


                <!-- CITY -->

                <td>

                    ${escapeHTML(
                        city
                    )}

                </td>


                <!-- DONATION COUNT -->

                <td>

                    <span
                        class="donation-count"
                    >

                        ${donationCount}

                    </span>

                </td>


                <!-- STATUS -->

                <td>

                    <span
                        class="donor-status-badge"
                    >

                        <span
                            class="donor-status-dot"
                        ></span>

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </td>


                <!-- REGISTERED -->

                <td>

                    ${escapeHTML(
                        registeredDate
                    )}

                </td>


                <!-- ACTIONS -->

                <td>

                    <div class="donor-actions">

                        <button
                            type="button"
                            class="donor-action-button view-donor-button"
                            data-action="view"
                            data-donor-id="${escapeAttribute(
                                donorId
                            )}"
                        >
                            View
                        </button>


                        <button
                            type="button"
                            class="donor-action-button edit-donor-button"
                            data-action="edit"
                            data-donor-id="${escapeAttribute(
                                donorId
                            )}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="donor-action-button delete-donor-button"
                            data-action="delete"
                            data-donor-id="${escapeAttribute(
                                donorId
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // ACTION EVENTS
    // =====================================================

    function attachDonorActionEvents() {

        const viewButtons =
            document.querySelectorAll(
                '[data-action="view"]'
            );


        const editButtons =
            document.querySelectorAll(
                '[data-action="edit"]'
            );


        const deleteButtons =
            document.querySelectorAll(
                '[data-action="delete"]'
            );


        viewButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        viewDonor(
                            button.dataset.donorId
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

                        editDonor(
                            button.dataset.donorId
                        );

                    }
                );

            }
        );


        deleteButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteDonor(
                            button.dataset.donorId
                        );

                    }
                );

            }
        );

    }


    // =====================================================
    // SEARCH
    // =====================================================

    if (donorsSearch) {

        donorsSearch.addEventListener(
            "input",
            () => {

                const searchValue =
                    donorsSearch.value
                        .trim()
                        .toLowerCase();


                if (!searchValue) {

                    renderDonors(
                        allDonors
                    );

                    return;

                }


                const filteredDonors =
                    allDonors.filter(
                        (donor) => {

                            const user =
                                donor.user || {};


                            const name =
                                String(
                                    user.fullName ||
                                    ""
                                ).toLowerCase();


                            const email =
                                String(
                                    user.email ||
                                    ""
                                ).toLowerCase();


                            const phone =
                                String(
                                    user.phoneNumber ||
                                    ""
                                ).toLowerCase();


                            const bloodGroup =
                                String(
                                    user.bloodGroup ||
                                    ""
                                ).toLowerCase();


                            const city =
                                String(
                                    user.city ||
                                    ""
                                ).toLowerCase();


                            const status =
                                String(
                                    donor.status ||
                                    ""
                                ).toLowerCase();


                            return (

                                name.includes(
                                    searchValue
                                ) ||

                                email.includes(
                                    searchValue
                                ) ||

                                phone.includes(
                                    searchValue
                                ) ||

                                bloodGroup.includes(
                                    searchValue
                                ) ||

                                city.includes(
                                    searchValue
                                ) ||

                                status.includes(
                                    searchValue
                                )

                            );

                        }
                    );


                if (
                    filteredDonors.length ===
                    0
                ) {

                    showEmptyState(
                        "No matching donors found."
                    );

                    return;

                }


                renderDonors(
                    filteredDonors
                );

            }
        );

    }


    // =====================================================
    // REFRESH
    // =====================================================

    if (donorsRefreshButton) {

        donorsRefreshButton.addEventListener(
            "click",
            () => {

                loadDonors();

            }
        );

    }


    // =====================================================
    // VIEW DONOR
    // =====================================================

    async function viewDonor(donorId) {

        try {

            const response =
                await fetch(
                    `/api/admin/donors/${encodeURIComponent(
                        donorId
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
                    "Unable to fetch donor."
                );

            }


            createViewModal(
                data.donor
            );


        } catch (error) {

            console.error(
                "VIEW DONOR ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to fetch donor."
            );

        }

    }


    // =====================================================
    // VIEW MODAL
    // =====================================================

    function createViewModal(donor) {

        removeExistingModal();


        const user =
            donor.user || {};


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "adminDonorViewModal";


        modal.innerHTML = `

            <div
                class="donor-modal-overlay"
                id="donorViewOverlay"
            >

                <div
                    class="donor-modal"
                    role="dialog"
                    aria-modal="true"
                >

                    <div
                        class="donor-modal-header"
                    >

                        <div>

                            <h2>
                                Donor Details
                            </h2>

                            <p>
                                Complete donor information
                            </p>

                        </div>


                        <button
                            type="button"
                            class="donor-modal-close"
                            id="closeDonorModal"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        class="donor-modal-body"
                    >

                        <div
                            class="donor-detail-grid"
                        >

                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Full Name
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        user.fullName ||
                                        "N/A"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Phone Number
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        user.phoneNumber ||
                                        "N/A"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Email
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        user.email ||
                                        "No email"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Blood Group
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        user.bloodGroup ||
                                        "N/A"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Donation Count
                                </span>

                                <strong>
                                    ${Number(
                                        user.donationCount ||
                                        0
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Donor Status
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        donor.status ||
                                        "N/A"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    City
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        user.city ||
                                        "N/A"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    State
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        user.state ||
                                        "N/A"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Address
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        user.address ||
                                        "N/A"
                                    )}
                                </strong>

                            </div>


                            <div
                                class="donor-detail-item"
                            >

                                <span>
                                    Registered
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        formatDate(
                                            donor.createdAt
                                        )
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div
                        class="donor-modal-footer"
                    >

                        <button
                            type="button"
                            class="donor-close-button"
                            id="closeDonorModalBottom"
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
                "closeDonorModal"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "closeDonorModalBottom"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "donorViewOverlay"
            )
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.id ===
                        "donorViewOverlay"
                    ) {

                        removeExistingModal();

                    }

                }
            );

    }


    // =====================================================
    // EDIT DONOR
    // =====================================================

    function editDonor(donorId) {

        const donor =
            allDonors.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        donorId
                    )
            );


        if (!donor) {

            alert(
                "Donor information not found."
            );

            return;

        }


        createEditModal(
            donor
        );

    }


    // =====================================================
    // EDIT MODAL
    // =====================================================

    function createEditModal(donor) {

        removeExistingModal();


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "adminDonorEditModal";


        modal.innerHTML = `

            <div
                class="donor-modal-overlay"
                id="donorEditOverlay"
            >

                <div
                    class="donor-modal"
                    role="dialog"
                    aria-modal="true"
                >

                    <div
                        class="donor-modal-header"
                    >

                        <div>

                            <h2>
                                Edit Donor
                            </h2>

                            <p>
                                Update donor status.
                            </p>

                        </div>


                        <button
                            type="button"
                            class="donor-modal-close"
                            id="closeDonorEditModal"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="editDonorForm"
                    >

                        <div
                            class="donor-modal-body"
                        >

                            <div
                                class="donor-detail-grid"
                            >

                                <div
                                    class="donor-detail-item"
                                >

                                    <span>
                                        Donor
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            donor.user?.fullName ||
                                            "Unknown"
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="donor-detail-item"
                                >

                                    <span>
                                        Blood Group
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            donor.user?.bloodGroup ||
                                            "N/A"
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="donor-detail-item"
                                >

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            donor.user?.phoneNumber ||
                                            "N/A"
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="donor-detail-item"
                                >

                                    <span>
                                        Current Status
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            donor.status ||
                                            "Available"
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div
                                style="
                                    margin-top:20px;
                                "
                            >

                                <label
                                    for="editDonorStatus"
                                    style="
                                        display:block;
                                        margin-bottom:7px;
                                        font-size:13px;
                                        font-weight:600;
                                        color:#444;
                                    "
                                >
                                    Donor Status
                                </label>


                                <select
                                    id="editDonorStatus"
                                    style="
                                        width:100%;
                                        box-sizing:border-box;
                                        padding:11px 12px;
                                        border:1px solid #ddd;
                                        border-radius:7px;
                                        outline:none;
                                        font-size:14px;
                                        background:#fff;
                                    "
                                >

                                    <option
                                        value="Available"
                                    >
                                        Available
                                    </option>

                                </select>

                            </div>


                            <div
                                id="editDonorMessage"
                                style="
                                    color:#c62828;
                                    font-size:13px;
                                    min-height:20px;
                                    margin-top:15px;
                                "
                            ></div>

                        </div>


                        <div
                            class="donor-modal-footer"
                        >

                            <button
                                type="button"
                                class="donor-close-button"
                                id="cancelDonorEdit"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                id="saveDonorButton"
                                style="
                                    border:none;
                                    background:#d62839;
                                    color:#fff;
                                    padding:10px 18px;
                                    border-radius:7px;
                                    cursor:pointer;
                                    font-weight:600;
                                    margin-left:10px;
                                "
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
                "closeDonorEditModal"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "cancelDonorEdit"
            )
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById(
                "donorEditOverlay"
            )
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.id ===
                        "donorEditOverlay"
                    ) {

                        removeExistingModal();

                    }

                }
            );


        document
            .getElementById(
                "editDonorForm"
            )
            .addEventListener(
                "submit",
                handleEditSubmit
            );

    }


    // =====================================================
    // EDIT SUBMIT
    // =====================================================

    async function handleEditSubmit(event) {

        event.preventDefault();


        const donorId =
            allDonors.find(
                (item) =>
                    item.user &&
                    String(item._id) ===
                    String(
                        document
                            .querySelector(
                                "#adminDonorEditModal .donor-modal"
                            )
                            ?.getAttribute(
                                "data-donor-id"
                            )
                    )
            )?._id;


        const modal =
            document.getElementById(
                "adminDonorEditModal"
            );


        if (!modal) {
            return;
        }


        const donor =
            allDonors.find(
                (item) =>
                    item.user &&
                    modal
                        .querySelector(
                            ".donor-modal"
                        )
                        ?.getAttribute(
                            "data-donor-id"
                        ) ===
                        String(item._id)
            );


        /*
        -----------------------------------------------------
        Fallback:
        Find donor from the currently visible edit modal.
        -----------------------------------------------------
        */

        let selectedDonor =
            donor;


        if (!selectedDonor) {

            const nameElement =
                modal.querySelector(
                    ".donor-detail-item strong"
                );


            const donorName =
                nameElement
                    ?.textContent
                    ?.trim();


            selectedDonor =
                allDonors.find(
                    (item) =>
                        (
                            item.user?.fullName ||
                            ""
                        ).trim() ===
                        donorName
                );

        }


        if (!selectedDonor) {

            showError(
                "Unable to identify donor."
            );

            removeExistingModal();

            return;

        }


        const saveButton =
            document.getElementById(
                "saveDonorButton"
            );


        const message =
            document.getElementById(
                "editDonorMessage"
            );


        const status =
            document.getElementById(
                "editDonorStatus"
            ).value;


        saveButton.disabled =
            true;


        saveButton.textContent =
            "Saving...";


        message.textContent =
            "";


        try {

            const response =
                await fetch(
                    `/api/admin/donors/${encodeURIComponent(
                        selectedDonor._id
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
                    "Unable to update donor."
                );

            }


            removeExistingModal();


            await loadDonors();


            showTemporaryMessage(
                "Donor updated successfully."
            );


        } catch (error) {

            console.error(
                "UPDATE DONOR ERROR:",
                error
            );


            message.textContent =
                error.message ||
                "Unable to update donor.";


            saveButton.disabled =
                false;


            saveButton.textContent =
                "Save Changes";

        }

    }


    // =====================================================
    // DELETE DONOR
    // =====================================================

    async function deleteDonor(
        donorId
    ) {

        const donor =
            allDonors.find(
                (item) =>
                    String(item._id) ===
                    String(donorId)
            );


        if (!donor) {

            alert(
                "Donor information not found."
            );

            return;

        }


        const donorName =
            donor.user?.fullName ||
            "this donor";


        const confirmed =
            window.confirm(
                `Are you sure you want to remove "${donorName}" from the donor list?\n\nThe user's account will NOT be deleted.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `/api/admin/donors/${encodeURIComponent(
                        donorId
                    )}`,
                    {
                        method: "DELETE",

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
                    "Unable to delete donor."
                );

            }


            await loadDonors();


            showTemporaryMessage(
                "Donor removed successfully."
            );


        } catch (error) {

            console.error(
                "DELETE DONOR ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to delete donor."
            );

        }

    }


    // =====================================================
    // TEMPORARY SUCCESS MESSAGE
    // =====================================================

    function showTemporaryMessage(
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
            "14px";


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
                year: "numeric"
            }
        );

    }


    // =====================================================
    // INITIAL
    // =====================================================

    function getInitial(
        name
    ) {

        const cleanName =
            String(
                name || ""
            ).trim();


        if (!cleanName) {
            return "D";
        }


        return cleanName
            .charAt(0)
            .toUpperCase();

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
                "adminDonorViewModal"
            );


        const editModal =
            document.getElementById(
                "adminDonorEditModal"
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

    loadDonors();

});