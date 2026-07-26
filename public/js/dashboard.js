const userId = localStorage.getItem("bbmsUserId");

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const donorButton = document.getElementById("donorButton");

let isDonor = false;

// ============================
// Format Member Since
// ============================

const formatMemberSince = (dateString) => {
    if (!dateString) return "--";

    return new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric"
    }).format(new Date(dateString));
};

// ============================
// Safe Text Setter
// ============================

const setText = (id, value) => {
    const element = document.getElementById(id);

    if (!element) {
        console.warn(`Element not found: ${id}`);
        return;
    }

    element.textContent = value ?? "--";
};

// ============================
// Sidebar
// ============================

const closeSidebar = () => {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
};

menuButton.addEventListener("click", () => {

    const isOpen = sidebar.classList.toggle("open");

    sidebarOverlay.classList.toggle("open", isOpen);

    menuButton.setAttribute("aria-expanded", String(isOpen));

});

sidebarOverlay.addEventListener("click", closeSidebar);




// ============================
// Populate Profile
// ============================

const populateProfile = (user) => {

    setText(
        "welcomeName",
        user.fullName ? user.fullName.split(" ")[0] : "Member"
    );

    setText("profileTitle", user.fullName);

    setText(
        "profileEmail",
        user.email || user.phoneNumber
    );

    setText("bloodGroup", user.bloodGroup);

    setText("fullName", user.fullName);

    setText("phoneNumber", user.phoneNumber);

    setText(
        "emailAddress",
        user.email || "Not provided"
    );

    setText(
        "memberSince",
        formatMemberSince(user.createdAt)
    );

    setText(
        "donationCount",
        user.donationCount || 0
    );

    // Donor Status
    isDonor = user.isDonor || false;

    if (donorButton) {
        donorButton.textContent = isDonor
            ? "Cancel Donor"
            : "Want to Donate";
    }

};


// ============================
// Load Profile
// ============================

const loadProfile = async () => {

    if (!userId) {
        alert("User not logged in.");
        window.location.href = "/login";
        return;
    }

    try {

        const response = await fetch(
            `/auth/profile?userId=${encodeURIComponent(userId)}`,
            {
                credentials: "same-origin"
            }
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load profile.");
        }

        populateProfile(data.user);

        updateDonorButton();

    } catch (error) {

        console.error(error);

        alert(error.message || "Server Error.");

    }

};

// ============================
// Donor Feature
// ============================

const updateDonorButton = () => {

    if (!donorButton) return;

    donorButton.textContent = isDonor
        ? "Cancel Donor"
        : "Want to Donate";

};

const handleDonorAction = async () => {

    const confirmed = confirm(
        isDonor
            ? "Do you want to cancel donor status?"
            : "Do you want to become a donor?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            isDonor
                ? "/api/donors/cancel"
                : "/api/donors/become",
            {
                method: isDonor ? "DELETE" : "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Operation failed.");
        }

        alert(data.message);

        isDonor = !isDonor;

        updateDonorButton();

    } catch (error) {

        console.error(error);

        alert(error.message || "Server Error.");

    }

};

if (donorButton) {

    donorButton.addEventListener(
        "click",
        handleDonorAction
    );

}

// ============================
// Logout
// ============================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await fetch("/auth/logout", {
                method: "POST",
                credentials: "same-origin"
            });

        } catch (error) {

            console.error(error);

        }

        localStorage.removeItem("bbmsUserId");

        window.location.href = "/login";

    });

}

// ============================
// Start
// ============================

loadProfile();