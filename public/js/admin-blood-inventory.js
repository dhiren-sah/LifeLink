const inventoryTableBody = document.getElementById("inventoryTableBody");
const inventoryModal = document.getElementById("inventoryModal");
const inventoryForm = document.getElementById("inventoryForm");
const searchInput = document.getElementById("searchInput");
const bloodGroupFilter = document.getElementById("bloodGroupFilter");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
let inventories = [];
let searchTimeout;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const formatDate = (date) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
const statusClass = (status) => status.toLowerCase().replaceAll(" ", "-");

const showToast = (message, type = "success") => {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    window.setTimeout(() => { toast.className = "toast hidden"; }, 3200);
};

const updateSummary = () => {
    document.getElementById("totalUnits").textContent = inventories.reduce((total, item) => total + item.availableUnits, 0);
    document.getElementById("availableGroups").textContent = inventories.filter((item) => item.status === "Available").length;
    document.getElementById("lowStockRecords").textContent = inventories.filter((item) => item.status === "Low Stock").length;
    document.getElementById("outOfStockRecords").textContent = inventories.filter((item) => item.status === "Out Of Stock").length;
};

const renderInventory = () => {
    const emptyState = document.getElementById("emptyState");
    document.getElementById("recordCount").textContent = `${inventories.length} record${inventories.length === 1 ? "" : "s"} found`;
    inventoryTableBody.innerHTML = inventories.map((item) => `<tr><td><span class="bank-name">${escapeHtml(item.bloodBankName)}</span></td><td>${escapeHtml(item.state)}</td><td>${escapeHtml(item.city)}</td><td><span class="blood-group">${item.bloodGroup}</span></td><td><span class="units">${item.availableUnits}</span></td><td><span class="status ${statusClass(item.status)}">${item.status}</span></td><td><span class="updated-at">${formatDate(item.lastUpdated)}</span></td><td><div class="action-buttons"><button class="icon-button edit-button" data-id="${item._id}" type="button" title="Edit inventory">✎</button><button class="icon-button delete-button" data-id="${item._id}" type="button" title="Delete inventory">⌫</button></div></td></tr>`).join("");
    emptyState.classList.toggle("hidden", inventories.length !== 0);
    updateSummary();
};

const loadInventory = async () => {
    const query = new URLSearchParams();
    if (searchInput.value.trim()) query.set("search", searchInput.value.trim());
    if (bloodGroupFilter.value) query.set("bloodGroup", bloodGroupFilter.value);
    try {
        const response = await fetch(`/admin/blood-inventory?${query}`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message);
        inventories = data.inventories;
        renderInventory();
    } catch (error) {
        inventories = [];
        renderInventory();
        showToast(error.message || "Unable to load inventory.", "error");
    }
};

const openModal = (inventory = null) => {
    inventoryForm.reset();
    document.getElementById("inventoryId").value = inventory?._id || "";
    document.getElementById("modalTitle").textContent = inventory ? "Edit Inventory" : "Add Inventory";
    document.getElementById("saveInventoryButton").textContent = inventory ? "Update Inventory" : "Save Inventory";
    if (inventory) ["bloodBankName", "phoneNumber", "state", "city", "address", "bloodGroup", "availableUnits"].forEach((field) => { document.getElementById(field).value = inventory[field]; });
    inventoryModal.classList.remove("hidden");
    document.getElementById("bloodBankName").focus();
};
const closeModal = () => inventoryModal.classList.add("hidden");

document.getElementById("addInventoryButton").addEventListener("click", () => openModal());
document.getElementById("closeModalButton").addEventListener("click", closeModal);
document.getElementById("cancelModalButton").addEventListener("click", closeModal);
inventoryModal.addEventListener("click", (event) => { if (event.target === inventoryModal) closeModal(); });
inventoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("inventoryId").value;
    const saveButton = document.getElementById("saveInventoryButton");
    const payload = Object.fromEntries(new FormData(inventoryForm).entries());
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    try {
        const response = await fetch(id ? `/admin/blood-inventory/${id}` : "/admin/blood-inventory", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message);
        closeModal(); showToast(data.message); loadInventory();
    } catch (error) { showToast(error.message || "Unable to save inventory.", "error");
    } finally { saveButton.disabled = false; saveButton.textContent = id ? "Update Inventory" : "Save Inventory"; }
});
inventoryTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const inventory = inventories.find((item) => item._id === button.dataset.id);
    if (button.classList.contains("edit-button")) return openModal(inventory);
    if (!window.confirm(`Delete the ${inventory.bloodGroup} inventory record for ${inventory.bloodBankName}?`)) return;
    try {
        const response = await fetch(`/admin/blood-inventory/${inventory._id}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message);
        showToast(data.message); loadInventory();
    } catch (error) { showToast(error.message || "Unable to delete inventory.", "error"); }
});
searchInput.addEventListener("input", () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(loadInventory, 250); });
bloodGroupFilter.addEventListener("change", loadInventory);
document.getElementById("menuButton").addEventListener("click", () => { const isOpen = sidebar.classList.toggle("open"); sidebarOverlay.classList.toggle("open", isOpen); });
sidebarOverlay.addEventListener("click", () => { sidebar.classList.remove("open"); sidebarOverlay.classList.remove("open"); });
loadInventory();
