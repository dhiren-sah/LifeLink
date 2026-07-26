const tableBody = document.getElementById("bloodTableBody");
const searchInput = document.getElementById("searchInput");
const bloodFilter = document.getElementById("bloodGroupFilter");
const refreshBtn = document.getElementById("refreshBtn");
const emptyState = document.getElementById("emptyState");

let bloodData = [];

async function loadBloodData() {
    try {
        const response = await fetch("/api/blood-availability");
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        bloodData = data.bloodAvailability;

        renderTable(bloodData);

    } catch (error) {
        console.error(error);

        tableBody.innerHTML = "";

        emptyState.style.display = "block";
    }
}

function renderTable(records) {

    tableBody.innerHTML = "";

    if (records.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    records.forEach((item, index) => {

        let statusClass = "";

        if (item.status === "Available") {

            statusClass = "available";

        } else if (item.status === "Low Stock") {

            statusClass = "low";

        } else {

            statusClass = "out";

        }

        tableBody.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${item.bloodGroup}</td>

            <td>${item.availableUnits}</td>

            <td>${new Date(item.lastUpdated).toLocaleDateString()}</td>

            <td>

                <span class="status ${statusClass}">
                    ${item.status}
                </span>

            </td>

        </tr>

        `;

    });

}

function filterTable() {

    const keyword = searchInput.value.toLowerCase();

    const group = bloodFilter.value;

    const filtered = bloodData.filter(item => {

        const matchSearch = item.bloodGroup
            .toLowerCase()
            .includes(keyword);

        const matchGroup =
            group === "" ||
            item.bloodGroup === group;

        return matchSearch && matchGroup;

    });

    renderTable(filtered);

}

searchInput.addEventListener("keyup", filterTable);

bloodFilter.addEventListener("change", filterTable);

refreshBtn.addEventListener("click", loadBloodData);

window.onload = loadBloodData;