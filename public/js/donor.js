const donorTableBody = document.getElementById("donorTableBody");
const searchInput = document.getElementById("searchInput");

let donors = [];

// ==============================
// Render Donors
// ==============================

const renderDonors = (list) => {

    if (!list.length) {

        donorTableBody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align:center;">
                    No donors available.
                </td>
            </tr>
        `;

        return;

    }

    donorTableBody.innerHTML = "";

    list.forEach(donor => {

        donorTableBody.innerHTML += `
            <tr>
                <td>${donor.user.fullName}</td>
                <td>${donor.status}</td>
            </tr>
        `;

    });

};

// ==============================
// Load Donors
// ==============================

const loadDonors = async () => {

    try {

        const response = await fetch("/api/donors", {
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load donors.");
        }

        donors = data.donors;

        renderDonors(donors);

    } catch (error) {

        console.error(error);

        donorTableBody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align:center;color:red;">
                    Failed to load donors.
                </td>
            </tr>
        `;

    }

};

// ==============================
// Search
// ==============================

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    const filtered = donors.filter(donor =>
        donor.user.fullName
            .toLowerCase()
            .includes(keyword)
    );

    renderDonors(filtered);

});

// ==============================
// Start
// ==============================

loadDonors();