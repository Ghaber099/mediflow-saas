const medicines = [
  {
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    batch: "P-101",
    stock: 120,
    expiry: "2026-08-20"
  },
  {
    name: "Amoxicillin",
    category: "Antibiotic",
    batch: "A-202",
    stock: 18,
    expiry: "2026-05-18"
  },
  {
    name: "Insulin",
    category: "Diabetes",
    batch: "I-404",
    stock: 8,
    expiry: "2026-05-10"
  },
  {
    name: "Cold Relief Syrup",
    category: "Cold & Flu",
    batch: "C-909",
    stock: 60,
    expiry: "2026-11-12"
  }
];

const LOW_STOCK_LIMIT = 20;
const EXPIRY_WARNING_DAYS = 45;

const tableBody = document.getElementById("medicineTableBody");
const searchInput = document.getElementById("medicineSearch");
const categoryFilter = document.getElementById("categoryFilter");

const totalMedicines = document.getElementById("totalMedicines");
const lowStockCount = document.getElementById("lowStockCount");
const expiringCount = document.getElementById("expiringCount");
const categoryCount = document.getElementById("categoryCount");

const modal = document.getElementById("medicineModal");
const openModalBtn = document.getElementById("openAddMedicine");
const closeModalBtn = document.getElementById("closeAddMedicine");
const form = document.getElementById("medicineForm");

function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const difference = expiry - today;
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function getMedicineStatus(medicine) {
  const daysLeft = getDaysUntilExpiry(medicine.expiry);

  if (daysLeft < 0) {
    return {
      text: "Expired",
      className: "status-expired"
    };
  }

  if (daysLeft <= EXPIRY_WARNING_DAYS) {
    return {
      text: "Expiring Soon",
      className: "status-expired"
    };
  }

  if (medicine.stock <= LOW_STOCK_LIMIT) {
    return {
      text: "Low Stock",
      className: "status-low"
    };
  }

  return {
    text: "Healthy",
    className: "status-ok"
  };
}

function renderMedicines() {
  const searchValue = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchValue) ||
      medicine.batch.toLowerCase().includes(searchValue) ||
      medicine.category.toLowerCase().includes(searchValue);

    const matchesCategory =
      selectedCategory === "all" || medicine.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  tableBody.innerHTML = "";

  filteredMedicines.forEach((medicine) => {
    const status = getMedicineStatus(medicine);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${medicine.name}</td>
      <td>${medicine.category}</td>
      <td>${medicine.batch}</td>
      <td>${medicine.stock}</td>
      <td>${medicine.expiry}</td>
      <td>
        <span class="status-pill ${status.className}">
          ${status.text}
        </span>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  const categories = new Set(medicines.map((medicine) => medicine.category));

  const lowStockItems = medicines.filter(
    (medicine) => medicine.stock <= LOW_STOCK_LIMIT
  );

  const expiringItems = medicines.filter((medicine) => {
    const daysLeft = getDaysUntilExpiry(medicine.expiry);
    return daysLeft <= EXPIRY_WARNING_DAYS;
  });

  totalMedicines.textContent = medicines.length;
  lowStockCount.textContent = lowStockItems.length;
  expiringCount.textContent = expiringItems.length;
  categoryCount.textContent = categories.size;
}

function openModal() {
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
  form.reset();
}

function addMedicine(event) {
  event.preventDefault();

  const newMedicine = {
    name: document.getElementById("medicineName").value.trim(),
    category: document.getElementById("medicineCategory").value,
    batch: document.getElementById("medicineBatch").value.trim(),
    stock: Number(document.getElementById("medicineStock").value),
    expiry: document.getElementById("medicineExpiry").value
  };

  medicines.push(newMedicine);

  closeModal();
  renderMedicines();
}

searchInput.addEventListener("input", renderMedicines);
categoryFilter.addEventListener("change", renderMedicines);

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
form.addEventListener("submit", addMedicine);

modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    closeModal();
  }
});

renderMedicines();