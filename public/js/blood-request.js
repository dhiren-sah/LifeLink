const userId = localStorage.getItem("bbmsUserId");

// =====================================
// Load User Profile
// =====================================

async function loadUser() {

    if (!userId) {
        window.location.href = "/login";
        return;
    }

    try {

        const response = await fetch(`/auth/profile?userId=${userId}`);

        if (!response.ok) {
            alert("Unable to load profile.");
            return;
        }

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            window.location.href = "/login";
            return;
        }

        document.getElementById("fullName").value = data.user.fullName;
        document.getElementById("phone").value = data.user.phoneNumber;
        document.getElementById("bloodGroup").value = data.user.bloodGroup;

    } catch (error) {

        console.error(error);
        alert("Unable to load profile.");

    }

}

loadUser();

// =====================================
// Submit Blood Request
// =====================================

const form = document.getElementById("bloodRequestForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const requestData = {

        user: userId,
        bloodGroup: document.getElementById("bloodGroup").value,
        units: Number(document.getElementById("units").value),
        hospital: document.getElementById("hospital").value.trim(),
        reason: document.getElementById("reason").value.trim(),
        urgency: document.getElementById("urgency").value,
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim()

    };

    try {

        const response = await fetch("/blood-request/create", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(requestData)

        });

        if (!response.ok) {

            const errorText = await response.text();
            console.error(errorText);

            alert("Request Failed.");
            return;

        }

        const data = await response.json();

        if (!data.success) {

            alert(data.message);
            return;

        }

        alert(data.message);

        form.reset();

        loadUser();

    } catch (error) {

        console.error(error);

        alert("Server Error.");

    }

});

// =====================================
// Logout
// =====================================

document.getElementById("logoutButton").addEventListener("click", () => {

    localStorage.removeItem("bbmsUserId");

    window.location.href = "/login";

});