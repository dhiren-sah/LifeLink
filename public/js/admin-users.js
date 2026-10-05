document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const usersTableBody =
        document.getElementById("usersTableBody");

    const usersTotalCount =
        document.getElementById("usersTotalCount");

    const usersSearch =
        document.getElementById("usersSearch");

    const usersRefreshButton =
        document.getElementById("usersRefreshButton");

    const usersError =
        document.getElementById("usersError");

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

    let allUsers = [];


    // =====================================================
    // FETCH USERS
    // =====================================================

    async function loadUsers() {

        showLoading();

        hideError();

        try {

            const response = await fetch(
                "/api/admin/users",
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to fetch users."
                );

            }


            allUsers = Array.isArray(data.users)
                ? data.users
                : [];


            updateUserCount();

            renderUsers(allUsers);


        } catch (error) {

            console.error(
                "LOAD USERS ERROR:",
                error
            );

            showError(
                error.message ||
                "Unable to load users."
            );

            showEmptyState(
                "Unable to load users."
            );

        }

    }


    // =====================================================
    // LOADING STATE
    // =====================================================

    function showLoading() {

        usersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="users-loading"
                >

                    <div class="users-spinner"></div>

                    Loading users...

                </td>

            </tr>

        `;

    }


    // =====================================================
    // EMPTY STATE
    // =====================================================

    function showEmptyState(
        message = "No users found."
    ) {

        usersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="users-empty"
                >

                    <strong>
                        ${escapeHTML(message)}
                    </strong>

                    <span>
                        There are no users to display.
                    </span>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // ERROR
    // =====================================================

    function showError(message) {

        if (!usersError) {
            return;
        }

        usersError.textContent = message;

        usersError.hidden = false;

    }


    function hideError() {

        if (!usersError) {
            return;
        }

        usersError.textContent = "";

        usersError.hidden = true;

    }


    // =====================================================
    // UPDATE COUNT
    // =====================================================

    function updateUserCount() {

        if (!usersTotalCount) {
            return;
        }

        usersTotalCount.textContent =
            allUsers.length;

    }


    // =====================================================
    // RENDER USERS
    // =====================================================

    function renderUsers(users) {

        if (!Array.isArray(users) || users.length === 0) {

            showEmptyState(
                "No users found."
            );

            return;

        }


        usersTableBody.innerHTML = users
            .map((user) => createUserRow(user))
            .join("");


        attachUserActionEvents();

    }


    // =====================================================
    // CREATE USER ROW
    // =====================================================

    function createUserRow(user) {

        const userId =
            user._id || "";


        const fullName =
            user.fullName ||
            "Unknown User";


        const email =
            user.email ||
            "No email";


        const phone =
            user.phoneNumber ||
            "Not available";


        const bloodGroup =
            user.bloodGroup ||
            "N/A";


        const role =
            user.role ||
            "patient";


        const city =
            user.city ||
            "Not available";


        const registeredDate =
            formatDate(
                user.createdAt
            );


        const avatar =
            user.profilePhoto
                ? `
                    <img
                        src="${escapeAttribute(user.profilePhoto)}"
                        alt="${escapeAttribute(fullName)}"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    >

                    <span
                        class="user-avatar-fallback"
                        style="display:none;"
                    >
                        ${getInitial(fullName)}
                    </span>
                  `
                : `
                    <span class="user-avatar-fallback">
                        ${getInitial(fullName)}
                    </span>
                  `;


        return `

            <tr data-user-id="${escapeAttribute(userId)}">

                <!-- USER -->

                <td>

                    <div class="user-info">

                        <div class="user-avatar">

                            ${avatar}

                        </div>


                        <div>

                            <div class="user-name">

                                ${escapeHTML(fullName)}

                            </div>


                            <div class="user-email">

                                ${escapeHTML(email)}

                            </div>

                        </div>

                    </div>

                </td>


                <!-- PHONE -->

                <td>

                    ${escapeHTML(phone)}

                </td>


                <!-- BLOOD GROUP -->

                <td>

                    <span class="blood-group-badge">

                        ${escapeHTML(bloodGroup)}

                    </span>

                </td>


                <!-- ROLE -->

                <td>

                    <span
                        class="role-badge role-${escapeAttribute(role)}"
                    >

                        ${escapeHTML(role)}

                    </span>

                </td>


                <!-- CITY -->

                <td>

                    ${escapeHTML(city)}

                </td>


                <!-- REGISTERED -->

                <td>

                    ${escapeHTML(registeredDate)}

                </td>


                <!-- ACTIONS -->

                <td>

                    <div class="user-actions">

                        <button
                            type="button"
                            class="user-action-button edit-user-button"
                            data-action="edit"
                            data-user-id="${escapeAttribute(userId)}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="user-action-button delete-user-button"
                            data-action="delete"
                            data-user-id="${escapeAttribute(userId)}"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // ATTACH ACTION EVENTS
    // =====================================================

    function attachUserActionEvents() {

        const editButtons =
            document.querySelectorAll(
                '[data-action="edit"]'
            );


        const deleteButtons =
            document.querySelectorAll(
                '[data-action="delete"]'
            );


        editButtons.forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const userId =
                        button.dataset.userId;

                    openEditModal(userId);

                }
            );

        });


        deleteButtons.forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const userId =
                        button.dataset.userId;

                    deleteUser(userId);

                }
            );

        });

    }


    // =====================================================
    // SEARCH
    // =====================================================

    if (usersSearch) {

        usersSearch.addEventListener(
            "input",
            () => {

                const searchValue =
                    usersSearch.value
                        .trim()
                        .toLowerCase();


                if (!searchValue) {

                    renderUsers(allUsers);

                    return;

                }


                const filteredUsers =
                    allUsers.filter((user) => {

                        const name =
                            String(
                                user.fullName || ""
                            ).toLowerCase();


                        const email =
                            String(
                                user.email || ""
                            ).toLowerCase();


                        const phone =
                            String(
                                user.phoneNumber || ""
                            ).toLowerCase();


                        const bloodGroup =
                            String(
                                user.bloodGroup || ""
                            ).toLowerCase();


                        const role =
                            String(
                                user.role || ""
                            ).toLowerCase();


                        const city =
                            String(
                                user.city || ""
                            ).toLowerCase();


                        return (

                            name.includes(searchValue) ||

                            email.includes(searchValue) ||

                            phone.includes(searchValue) ||

                            bloodGroup.includes(searchValue) ||

                            role.includes(searchValue) ||

                            city.includes(searchValue)

                        );

                    });


                if (filteredUsers.length === 0) {

                    showEmptyState(
                        "No matching users found."
                    );

                    return;

                }


                renderUsers(filteredUsers);

            }
        );

    }


    // =====================================================
    // REFRESH
    // =====================================================

    if (usersRefreshButton) {

        usersRefreshButton.addEventListener(
            "click",
            () => {

                loadUsers();

            }
        );

    }


    // =====================================================
    // EDIT USER
    // =====================================================

    async function openEditModal(userId) {

        const user =
            allUsers.find(
                (item) =>
                    String(item._id) ===
                    String(userId)
            );


        if (!user) {

            alert(
                "User information not found."
            );

            return;

        }


        createEditModal(user);

    }


    // =====================================================
    // CREATE EDIT MODAL
    // =====================================================

    function createEditModal(user) {

        removeExistingModal();


        const modal =
            document.createElement("div");


        modal.id =
            "adminUserEditModal";


        modal.innerHTML = `

            <div
                class="admin-user-modal-overlay"
                id="adminUserModalOverlay"
            >

                <div
                    class="admin-user-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="adminUserModalTitle"
                >

                    <div class="admin-user-modal-header">

                        <div>

                            <h2 id="adminUserModalTitle">
                                Edit User
                            </h2>

                            <p>
                                Update user information.
                            </p>

                        </div>


                        <button
                            type="button"
                            class="admin-user-modal-close"
                            id="closeUserModal"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="editUserForm"
                        class="admin-user-edit-form"
                    >

                        <input
                            type="hidden"
                            id="editUserId"
                            value="${escapeAttribute(user._id || "")}"
                        >


                        <div class="admin-user-form-grid">

                            <div class="admin-user-form-group">

                                <label for="editFullName">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    id="editFullName"
                                    value="${escapeAttribute(user.fullName || "")}"
                                    required
                                >

                            </div>


                            <div class="admin-user-form-group">

                                <label for="editPhoneNumber">
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    id="editPhoneNumber"
                                    value="${escapeAttribute(user.phoneNumber || "")}"
                                    required
                                >

                            </div>


                            <div class="admin-user-form-group">

                                <label for="editEmail">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    id="editEmail"
                                    value="${escapeAttribute(user.email || "")}"
                                >

                            </div>


                            <div class="admin-user-form-group">

                                <label for="editBloodGroup">
                                    Blood Group
                                </label>

                                <select id="editBloodGroup">

                                    <option value="">
                                        Select Blood Group
                                    </option>

                                    <option value="A+">
                                        A+
                                    </option>

                                    <option value="A-">
                                        A-
                                    </option>

                                    <option value="B+">
                                        B+
                                    </option>

                                    <option value="B-">
                                        B-
                                    </option>

                                    <option value="O+">
                                        O+
                                    </option>

                                    <option value="O-">
                                        O-
                                    </option>

                                    <option value="AB+">
                                        AB+
                                    </option>

                                    <option value="AB-">
                                        AB-
                                    </option>

                                </select>

                            </div>


                            <div class="admin-user-form-group">

                                <label for="editRole">
                                    Role
                                </label>

                                <select id="editRole">

                                    <option value="patient">
                                        Patient
                                    </option>

                                    <option value="donor">
                                        Donor
                                    </option>

                                    <option value="admin">
                                        Admin
                                    </option>

                                </select>

                            </div>


                            <div class="admin-user-form-group">

                                <label for="editCity">
                                    City
                                </label>

                                <input
                                    type="text"
                                    id="editCity"
                                    value="${escapeAttribute(user.city || "")}"
                                >

                            </div>


                            <div class="admin-user-form-group">

                                <label for="editState">
                                    State
                                </label>

                                <input
                                    type="text"
                                    id="editState"
                                    value="${escapeAttribute(user.state || "")}"
                                >

                            </div>


                            <div class="admin-user-form-group">

                                <label for="editAddress">
                                    Address
                                </label>

                                <input
                                    type="text"
                                    id="editAddress"
                                    value="${escapeAttribute(user.address || "")}"
                                >

                            </div>

                        </div>


                        <div
                            class="admin-user-modal-message"
                            id="editUserMessage"
                        ></div>


                        <div class="admin-user-modal-footer">

                            <button
                                type="button"
                                class="admin-user-cancel-button"
                                id="cancelUserEdit"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                class="admin-user-save-button"
                                id="saveUserButton"
                            >
                                Save Changes
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        const bloodGroupSelect =
            document.getElementById(
                "editBloodGroup"
            );


        const roleSelect =
            document.getElementById(
                "editRole"
            );


        bloodGroupSelect.value =
            user.bloodGroup || "";


        roleSelect.value =
            user.role || "patient";


        addModalStyles();


        document
            .getElementById("closeUserModal")
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById("cancelUserEdit")
            .addEventListener(
                "click",
                removeExistingModal
            );


        document
            .getElementById("adminUserModalOverlay")
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.id ===
                        "adminUserModalOverlay"
                    ) {

                        removeExistingModal();

                    }

                }
            );


        document
            .getElementById("editUserForm")
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


        const userId =
            document.getElementById(
                "editUserId"
            ).value;


        const saveButton =
            document.getElementById(
                "saveUserButton"
            );


        const message =
            document.getElementById(
                "editUserMessage"
            );


        const updateData = {

            fullName:
                document.getElementById(
                    "editFullName"
                ).value.trim(),

            phoneNumber:
                document.getElementById(
                    "editPhoneNumber"
                ).value.trim(),

            email:
                document.getElementById(
                    "editEmail"
                ).value.trim(),

            bloodGroup:
                document.getElementById(
                    "editBloodGroup"
                ).value,

            role:
                document.getElementById(
                    "editRole"
                ).value,

            city:
                document.getElementById(
                    "editCity"
                ).value.trim(),

            state:
                document.getElementById(
                    "editState"
                ).value.trim(),

            address:
                document.getElementById(
                    "editAddress"
                ).value.trim()

        };


        if (!updateData.fullName) {

            message.textContent =
                "Full name is required.";

            return;

        }


        if (!updateData.phoneNumber) {

            message.textContent =
                "Phone number is required.";

            return;

        }


        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";


        message.textContent = "";


        try {

            const response =
                await fetch(
                    `/api/admin/users/${encodeURIComponent(userId)}`,
                    {
                        method: "PUT",

                        credentials: "same-origin",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                updateData
                            )
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
                    "Unable to update user."
                );

            }


            removeExistingModal();


            await loadUsers();


            showTemporaryMessage(
                "User updated successfully."
            );


        } catch (error) {

            console.error(
                "UPDATE USER ERROR:",
                error
            );


            message.textContent =
                error.message ||
                "Unable to update user.";


            saveButton.disabled = false;

            saveButton.textContent =
                "Save Changes";

        }

    }


    // =====================================================
    // DELETE USER
    // =====================================================

    async function deleteUser(userId) {

        const user =
            allUsers.find(
                (item) =>
                    String(item._id) ===
                    String(userId)
            );


        if (!user) {

            alert(
                "User information not found."
            );

            return;

        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${user.fullName || "this user"}"?\n\nThis action cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `/api/admin/users/${encodeURIComponent(userId)}`,
                    {
                        method: "DELETE",

                        credentials: "same-origin",

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
                    "Unable to delete user."
                );

            }


            await loadUsers();


            showTemporaryMessage(
                "User deleted successfully."
            );


        } catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to delete user."
            );

        }

    }


    // =====================================================
    // TEMPORARY SUCCESS MESSAGE
    // =====================================================

    function showTemporaryMessage(message) {

        const element =
            document.createElement("div");


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


        setTimeout(() => {

            element.remove();

        }, 2500);

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

                sidebarOverlay.hidden = true;

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
                !profileDropdown.contains(event.target) &&
                event.target !== profileMenuButton
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
                    credentials: "same-origin"
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
    // FORMAT DATE
    // =====================================================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "N/A";
        }


        const date =
            new Date(dateValue);


        if (Number.isNaN(date.getTime())) {
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

    function getInitial(name) {

        const cleanName =
            String(name || "").trim();


        if (!cleanName) {
            return "U";
        }


        return cleanName
            .charAt(0)
            .toUpperCase();

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // ESCAPE ATTRIBUTE
    // =====================================================

    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    // =====================================================
    // REMOVE MODAL
    // =====================================================

    function removeExistingModal() {

        const existingModal =
            document.getElementById(
                "adminUserEditModal"
            );


        if (existingModal) {

            existingModal.remove();

        }

    }


    // =====================================================
    // MODAL STYLES
    // =====================================================

    function addModalStyles() {

        if (
            document.getElementById(
                "adminUserModalStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement("style");


        style.id =
            "adminUserModalStyles";


        style.textContent = `

            .admin-user-modal-overlay {

                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.45);

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 20px;

                z-index: 99999;

            }


            .admin-user-modal {

                width: 100%;
                max-width: 760px;

                max-height: 90vh;
                overflow-y: auto;

                background: #fff;

                border-radius: 14px;

                box-shadow:
                    0 20px 60px
                    rgba(0, 0, 0, 0.2);

            }


            .admin-user-modal-header {

                display: flex;
                justify-content: space-between;
                align-items: flex-start;

                padding: 22px 24px;

                border-bottom:
                    1px solid #eee;

            }


            .admin-user-modal-header h2 {

                margin: 0 0 5px;

                font-size: 21px;

                color: #222;

            }


            .admin-user-modal-header p {

                margin: 0;

                color: #777;

                font-size: 13px;

            }


            .admin-user-modal-close {

                border: none;

                background: #f5f5f5;

                width: 34px;
                height: 34px;

                border-radius: 50%;

                font-size: 23px;

                cursor: pointer;

                color: #555;

            }


            .admin-user-modal-close:hover {

                background: #eee;

            }


            .admin-user-edit-form {

                padding: 24px;

            }


            .admin-user-form-grid {

                display: grid;

                grid-template-columns:
                    repeat(2, minmax(0, 1fr));

                gap: 18px;

            }


            .admin-user-form-group {

                display: flex;

                flex-direction: column;

                gap: 7px;

            }


            .admin-user-form-group label {

                font-size: 13px;

                font-weight: 600;

                color: #444;

            }


            .admin-user-form-group input,
            .admin-user-form-group select {

                width: 100%;

                box-sizing: border-box;

                padding: 11px 12px;

                border: 1px solid #ddd;

                border-radius: 7px;

                outline: none;

                font-size: 14px;

                background: #fff;

            }


            .admin-user-form-group input:focus,
            .admin-user-form-group select:focus {

                border-color: #d62839;

            }


            .admin-user-modal-message {

                color: #c62828;

                font-size: 13px;

                min-height: 20px;

                margin-top: 15px;

            }


            .admin-user-modal-footer {

                display: flex;

                justify-content: flex-end;

                gap: 10px;

                margin-top: 10px;

                padding-top: 20px;

                border-top: 1px solid #eee;

            }


            .admin-user-cancel-button,
            .admin-user-save-button {

                border: none;

                border-radius: 7px;

                padding: 11px 18px;

                cursor: pointer;

                font-weight: 600;

            }


            .admin-user-cancel-button {

                background: #f1f1f1;

                color: #555;

            }


            .admin-user-save-button {

                background: #d62839;

                color: #fff;

            }


            .admin-user-save-button:hover {

                background: #b91f2d;

            }


            .admin-user-save-button:disabled {

                opacity: 0.6;

                cursor: not-allowed;

            }


            @media (max-width: 650px) {

                .admin-user-form-grid {

                    grid-template-columns: 1fr;

                }

                .admin-user-modal {

                    max-height: 95vh;

                }

            }

        `;


        document.head.appendChild(style);

    }


    // =====================================================
    // START
    // =====================================================

    loadUsers();

});