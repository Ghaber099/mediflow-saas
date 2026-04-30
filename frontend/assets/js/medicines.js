let medicines = [
  {
    name: "Paracetamol 500mg",
    barcode: "111111111",
    category: "Pain Relief",
    batch: "P-101",
    stock: 120,
    reorder: 20,
    expiry: "2026-08-20",
    supplier: "Ahmed Khan",
    agency: "HealthLine Distributors",
    company: "GSK",
    costPrice: 5.5,
    price: 9.99
  },
  {
    name: "Amoxicillin",
    barcode: "222222222",
    category: "Antibiotic",
    batch: "A-202",
    stock: 18,
    reorder: 20,
    expiry: "2026-05-18",
    supplier: "Rana Medical Rep",
    agency: "MediSupply Canada",
    company: "Pfizer",
    costPrice: 8.25,
    price: 14.5
  }
];

let categories = [
  "Pain Relief",
  "Antibiotic",
  "Diabetes",
  "Cold & Flu",
  "Vitamins",
  "Allergy",
  "Heart & Blood Pressure",
  "Digestive Health",
  "Skin Care",
  "Eye & Ear",
  "First Aid",
  "Baby Care",
  "Medical Devices",
  "Controlled Medicine",
  "Other"
];

let bulkItems = [];
let editingBulkIndex = null;

const EXPIRY_WARNING_DAYS = 45;

const tableBody = document.getElementById("medicineTableBody");
const searchInput = document.getElementById("medicineSearch");
const categoryFilter = document.getElementById("categoryFilter");

const totalMedicines = document.getElementById("totalMedicines");
const lowStockCount = document.getElementById("lowStockCount");
const expiringCount = document.getElementById("expiringCount");
const categoryCount = document.getElementById("categoryCount");

const medicineModal = document.getElementById("medicineModal");
const openAddMedicine = document.getElementById("openAddMedicine");
const closeAddMedicine = document.getElementById("closeAddMedicine");
const medicineForm = document.getElementById("medicineForm");

const bulkModal = document.getElementById("bulkReceivingModal");
const openBulkReceiving = document.getElementById("openBulkReceiving");
const closeBulkReceiving = document.getElementById("closeBulkReceiving");

const barcodeScannerInput = document.getElementById("barcodeScannerInput");
const barcodeSearchBtn = document.getElementById("barcodeSearchBtn");
const scanResult = document.getElementById("scanResult");
const scanFocusBtn = document.getElementById("scanFocusBtn");

const medicineCategory = document.getElementById("medicineCategory");
const newCategoryInput = document.getElementById("newCategoryInput");

const bulkBarcode = document.getElementById("bulkBarcode");
const bulkMedicineName = document.getElementById("bulkMedicineName");
const bulkBatch = document.getElementById("bulkBatch");
const bulkQuantity = document.getElementById("bulkQuantity");
const bulkExpiry = document.getElementById("bulkExpiry");
const bulkCostPrice = document.getElementById("bulkCostPrice");
const bulkSellingPrice = document.getElementById("bulkSellingPrice");

const addBulkItem = document.getElementById("addBulkItem");
const clearBulkItems = document.getElementById("clearBulkItems");
const confirmBulkDelivery = document.getElementById("confirmBulkDelivery");
const bulkTableBody = document.getElementById("bulkTableBody");

const bulkTotalItems = document.getElementById("bulkTotalItems");
const bulkTotalQuantity = document.getElementById("bulkTotalQuantity");
const bulkTotalCost = document.getElementById("bulkTotalCost");

function getDaysUntilExpiry(date) {
  const today = new Date();
  const expiry = new Date(date);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function getStatus(medicine) {
  const daysLeft = getDaysUntilExpiry(medicine.expiry);

  if (daysLeft < 0) return ["Expired", "status-expired"];
  if (daysLeft <= EXPIRY_WARNING_DAYS) return ["Expiring", "status-expiring"];
  if (medicine.stock <= medicine.reorder) return ["Low Stock", "status-low"];

  return ["Healthy", "status-ok"];
}

function formatMoney(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function getProfitClass(cost, sell) {
  const profit = Number(sell || 0) - Number(cost || 0);
  return profit >= 0 ? "profit-positive" : "profit-negative";
}

function renderCategories() {
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  medicineCategory.innerHTML = "";

  categories.forEach((category) => {
    categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    medicineCategory.innerHTML += `<option value="${category}">${category}</option>`;
  });
}

function renderMedicines() {
  const search = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(search) ||
      medicine.barcode.toLowerCase().includes(search) ||
      medicine.batch.toLowerCase().includes(search) ||
      medicine.category.toLowerCase().includes(search) ||
      (medicine.supplier || "").toLowerCase().includes(search) ||
      (medicine.agency || "").toLowerCase().includes(search) ||
      (medicine.company || "").toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "all" || medicine.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  tableBody.innerHTML = "";

  filtered.forEach((medicine) => {
    const [statusText, statusClass] = getStatus(medicine);
    const profit = Number(medicine.price || 0) - Number(medicine.costPrice || 0);
    const profitClass = getProfitClass(medicine.costPrice, medicine.price);

    tableBody.innerHTML += `
      <tr>
        <td class="medicine-name">${medicine.name}</td>
        <td><span class="barcode-code">${medicine.barcode || "-"}</span></td>
        <td>${medicine.category}</td>
        <td>${medicine.batch}</td>
        <td>${medicine.stock}</td>
        <td>${medicine.expiry}</td>
        <td>${medicine.supplier || "-"}</td>
        <td>${medicine.agency || "-"}</td>
        <td>${medicine.company || "-"}</td>
        <td>${formatMoney(medicine.costPrice)}</td>
        <td>${formatMoney(medicine.price)}</td>
        <td class="${profitClass}">${formatMoney(profit)}</td>
        <td><span class="status-pill ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  });

  updateStats();
}

function updateStats() {
  totalMedicines.textContent = medicines.length;
  lowStockCount.textContent = medicines.filter((m) => m.stock <= m.reorder).length;
  expiringCount.textContent = medicines.filter((m) => getDaysUntilExpiry(m.expiry) <= EXPIRY_WARNING_DAYS).length;
  categoryCount.textContent = new Set(medicines.map((m) => m.category)).size;
}

function openSingleModal(barcode = "") {
  medicineModal.classList.add("active");
  document.getElementById("medicineBarcode").value = barcode;
}

function closeSingleModal() {
  medicineModal.classList.remove("active");
  medicineForm.reset();
}

function openBulkModal() {
  bulkModal.classList.add("active");
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("deliveryDate").value = today;
  setTimeout(() => bulkBarcode.focus(), 100);
}

function closeBulkModal() {
  bulkModal.classList.remove("active");
}

function handleQuickBarcode(code) {
  const cleanCode = code.trim();
  if (!cleanCode) return;

  const found = medicines.find((m) => m.barcode === cleanCode);

  if (found) {
    scanResult.textContent = `Found: ${found.name} | Stock: ${found.stock} | Expiry: ${found.expiry}`;
    scanResult.style.color = "#15803d";
    searchInput.value = cleanCode;
    renderMedicines();
  } else {
    scanResult.textContent = "Not found → opening single add form...";
    scanResult.style.color = "#d97706";
    openSingleModal(cleanCode);
  }
}

medicineForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let selectedCategory = medicineCategory.value;
  const newCategory = newCategoryInput.value.trim();

  if (newCategory) {
    selectedCategory = newCategory;
    if (!categories.includes(newCategory)) {
      categories.push(newCategory);
    }
  }

  const costPrice = Number(document.getElementById("medicineCostPrice").value || 0);
  const price = Number(document.getElementById("medicinePrice").value || 0);

  if (price < costPrice) {
    const confirmLoss = confirm("Selling price is lower than cost price. This will create a loss. Continue?");
    if (!confirmLoss) return;
  }

  const newMedicine = {
    name: document.getElementById("medicineName").value.trim(),
    barcode: document.getElementById("medicineBarcode").value.trim(),
    category: selectedCategory,
    batch: document.getElementById("medicineBatch").value.trim(),
    stock: Number(document.getElementById("medicineStock").value),
    reorder: Number(document.getElementById("medicineReorderLevel").value),
    expiry: document.getElementById("medicineExpiry").value,
    supplier: document.getElementById("medicineSupplier").value.trim(),
    agency: document.getElementById("medicineAgency").value.trim(),
    company: document.getElementById("medicineCompany").value.trim(),
    costPrice,
    price
  };

  medicines.push(newMedicine);

  renderCategories();
  renderMedicines();
  closeSingleModal();
});

function autofillBulkFromBarcode(code) {
  const cleanCode = code.trim();
  const found = medicines.find((m) => m.barcode === cleanCode);

  if (found) {
    bulkMedicineName.value = found.name;
    bulkCostPrice.value = found.costPrice || "";
    bulkSellingPrice.value = found.price || "";
  } else {
    bulkMedicineName.value = "";
    bulkCostPrice.value = "";
    bulkSellingPrice.value = "";
  }
}

function resetBulkInputFields() {
  bulkBarcode.value = "";
  bulkMedicineName.value = "";
  bulkBatch.value = "";
  bulkQuantity.value = 1;
  bulkExpiry.value = "";
  bulkCostPrice.value = "";
  bulkSellingPrice.value = "";
  editingBulkIndex = null;
  addBulkItem.textContent = "Add to Delivery Table";
  bulkBarcode.focus();
}

function addOrUpdateBulkItem() {
  const barcode = bulkBarcode.value.trim();
  const name = bulkMedicineName.value.trim();
  const batch = bulkBatch.value.trim();
  const quantity = Number(bulkQuantity.value);
  const expiry = bulkExpiry.value;
  const costPrice = Number(bulkCostPrice.value || 0);
  const sellingPrice = Number(bulkSellingPrice.value || 0);

  if (!barcode || !name || !batch || !quantity || !expiry) {
    alert("Please scan barcode and fill medicine name, batch, quantity, and expiry.");
    return;
  }

  if (sellingPrice < costPrice) {
    const confirmLoss = confirm("Selling price is lower than cost price. This item will lose money. Continue?");
    if (!confirmLoss) return;
  }

  const item = {
    barcode,
    name,
    batch,
    quantity,
    expiry,
    costPrice,
    sellingPrice
  };

  if (editingBulkIndex !== null) {
    bulkItems[editingBulkIndex] = item;
  } else {
    bulkItems.push(item);
  }

  renderBulkTable();
  resetBulkInputFields();
}

function renderBulkTable() {
  bulkTableBody.innerHTML = "";

  if (bulkItems.length === 0) {
    bulkTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-row">No delivery items added yet.</td>
      </tr>
    `;
  }

  bulkItems.forEach((item, index) => {
    const unitProfit = Number(item.sellingPrice || 0) - Number(item.costPrice || 0);
    const profitClass = getProfitClass(item.costPrice, item.sellingPrice);

    bulkTableBody.innerHTML += `
      <tr>
        <td><span class="barcode-code">${item.barcode}</span></td>
        <td class="medicine-name">${item.name}</td>
        <td>${item.batch}</td>
        <td>${item.quantity}</td>
        <td>${item.expiry}</td>
        <td>${formatMoney(item.costPrice)}</td>
        <td>${formatMoney(item.sellingPrice)}</td>
        <td class="${profitClass}">${formatMoney(unitProfit)}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editBulkItem(${index})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteBulkItem(${index})">Delete</button>
        </td>
      </tr>
    `;
  });

  updateBulkSummary();
}

function updateBulkSummary() {
  const totalItems = bulkItems.length;
  const totalQty = bulkItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalCost = bulkItems.reduce((sum, item) => {
    return sum + Number(item.costPrice || 0) * Number(item.quantity || 0);
  }, 0);

  bulkTotalItems.textContent = totalItems;
  bulkTotalQuantity.textContent = totalQty;
  bulkTotalCost.textContent = formatMoney(totalCost);
}

window.editBulkItem = function(index) {
  const item = bulkItems[index];

  bulkBarcode.value = item.barcode;
  bulkMedicineName.value = item.name;
  bulkBatch.value = item.batch;
  bulkQuantity.value = item.quantity;
  bulkExpiry.value = item.expiry;
  bulkCostPrice.value = item.costPrice;
  bulkSellingPrice.value = item.sellingPrice;

  editingBulkIndex = index;
  addBulkItem.textContent = "Update Delivery Item";
};

window.deleteBulkItem = function(index) {
  if (!confirm("Delete this item from delivery table?")) return;

  bulkItems.splice(index, 1);
  renderBulkTable();
};

function clearBulkTable() {
  if (bulkItems.length === 0) return;
  if (!confirm("Clear all delivery items?")) return;

  bulkItems = [];
  renderBulkTable();
}

function confirmDelivery() {
  if (bulkItems.length === 0) {
    alert("No delivery items to confirm.");
    return;
  }

  const invoice = document.getElementById("deliveryInvoice").value.trim();
  const supplier = document.getElementById("deliverySupplier").value.trim();
  const agency = document.getElementById("deliveryAgency").value.trim();
  const company = document.getElementById("deliveryCompany").value.trim();

  if (!invoice || !supplier || !agency || !company) {
    alert("Please fill invoice number, supplier/medical rep, agency, and company before confirming.");
    return;
  }

  bulkItems.forEach((item) => {
    const existing = medicines.find(
      (medicine) =>
        medicine.barcode === item.barcode &&
        medicine.batch === item.batch &&
        medicine.expiry === item.expiry
    );

    if (existing) {
      existing.stock += Number(item.quantity);
      existing.supplier = supplier;
      existing.agency = agency;
      existing.company = company;
      existing.costPrice = item.costPrice;
      existing.price = item.sellingPrice;
    } else {
      medicines.push({
        name: item.name,
        barcode: item.barcode,
        category: "Other",
        batch: item.batch,
        stock: Number(item.quantity),
        reorder: 20,
        expiry: item.expiry,
        supplier,
        agency,
        company,
        costPrice: item.costPrice,
        price: item.sellingPrice
      });
    }
  });

  bulkItems = [];
  renderBulkTable();
  renderMedicines();
  closeBulkModal();

  alert("Delivery confirmed. Stock updated successfully.");
}

searchInput.addEventListener("input", renderMedicines);
categoryFilter.addEventListener("change", renderMedicines);

openAddMedicine.addEventListener("click", () => openSingleModal());
closeAddMedicine.addEventListener("click", closeSingleModal);

openBulkReceiving.addEventListener("click", openBulkModal);
closeBulkReceiving.addEventListener("click", closeBulkModal);

scanFocusBtn.addEventListener("click", () => barcodeScannerInput.focus());

barcodeSearchBtn.addEventListener("click", () => {
  handleQuickBarcode(barcodeScannerInput.value);
  barcodeScannerInput.value = "";
});

barcodeScannerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleQuickBarcode(barcodeScannerInput.value);
    barcodeScannerInput.value = "";
  }
});

bulkBarcode.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    autofillBulkFromBarcode(bulkBarcode.value);

    if (!bulkMedicineName.value) {
      bulkMedicineName.focus();
    } else {
      bulkBatch.focus();
    }
  }
});

bulkBarcode.addEventListener("input", () => {
  autofillBulkFromBarcode(bulkBarcode.value);
});

addBulkItem.addEventListener("click", addOrUpdateBulkItem);
clearBulkItems.addEventListener("click", clearBulkTable);
confirmBulkDelivery.addEventListener("click", confirmDelivery);

medicineModal.addEventListener("click", (event) => {
  if (event.target === medicineModal) closeSingleModal();
});

bulkModal.addEventListener("click", (event) => {
  if (event.target === bulkModal) closeBulkModal();
});

renderCategories();
renderMedicines();
renderBulkTable();