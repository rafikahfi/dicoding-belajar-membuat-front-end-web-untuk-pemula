/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()

let transactions = [];
let editTransactionId = null;

function generateId() {
  return +new Date();
}

// fungsi untuk Format Uang
// Suggestion dari Reviewer Dicoding
function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM

const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */

function renderTransactions(listToRender = transactions) {
  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  for (const transaction of listToRender) {
    const transactionItem = document.createElement("div");
    transactionItem.classList.add("tracker-transaction-item");
    transactionItem.setAttribute("data-testid", "transactionItem");

    const icon = document.createElement("div");
    icon.classList.add("tracker-transaction-item__icon");
    if (transaction.type === "income") {
      icon.classList.add("tracker-transaction-item__icon--income");
      icon.innerText = "+";
    } else {
      icon.classList.add("tracker-transaction-item__icon--expense");
      icon.innerText = "-";
    }
    icon.setAttribute("aria-hidden", "true");

    const detailContainer = document.createElement("div");
    detailContainer.classList.add("tracker-transaction-item__detail");

    const title = document.createElement("h4");
    title.classList.add("tracker-transaction-item__title");
    title.setAttribute("data-testid", "transactionItemTitle");
    title.innerText = transaction.title;

    const date = document.createElement("div");
    date.classList.add("tracker-transaction-item__date");
    date.setAttribute("data-testid", "transactionItemDate");
    date.innerText = transaction.date;

    const type = document.createElement("p");
    type.setAttribute("data-testid", "transactionItemType");
    type.style.display = "none";
    type.innerText = transaction.type;

    detailContainer.append(title, date, type);

    const rightContainer = document.createElement("div");
    rightContainer.classList.add("tracker-transaction-item__right");

    const amount = document.createElement("div");
    amount.classList.add("tracker-transaction-item__amount");
    if (transaction.type === "income") {
      amount.classList.add("tracker-transaction-item__amount--income");
    } else {
      amount.classList.add("tracker-transaction-item__amount--expense");
    }
    amount.setAttribute("data-testid", "transactionItemAmount");
    amount.innerText = formatCurrency(transaction.amount);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("tracker-transaction-item__actions");

    const typeBtn = document.createElement("button");
    typeBtn.classList.add("tracker-transaction-item__btn");
    typeBtn.setAttribute("data-testid", "transactionItemEditTypeButton");
    typeBtn.innerText = "Ubah";
    typeBtn.addEventListener("click", function () {
      toggleTransactionType(transaction);
    });

    const editBtn = document.createElement("button");
    editBtn.classList.add("tracker-transaction-item__btn");
    editBtn.setAttribute("data-testid", "transactionItemEditButton");
    editBtn.innerText = "Edit";
    editBtn.addEventListener("click", function () {
      editTransaction(transaction);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("tracker-transaction-item__btn");
    deleteBtn.setAttribute("data-testid", "transactionItemDeleteButton");
    deleteBtn.innerText = "Hapus";
    deleteBtn.addEventListener("click", function () {
      deleteTransaction(transaction);
    });

    btnContainer.append(typeBtn, editBtn, deleteBtn);
    rightContainer.append(amount, btnContainer);

    transactionItem.append(icon, detailContainer, rightContainer);

    if (transaction.type === "income") {
      incomeList.append(transactionItem);
    } else {
      expenseList.append(transactionItem);
    }
  }
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array

const transactionForm = document.getElementById("transactionForm");

transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleValue = document.getElementById("transactionFormTitleInput").value;
  const amountValue = document.getElementById("transactionFormAmountInput").value;
  const dateValue = document.getElementById("transactionFormDateInput").value;
  const typeValue = document.getElementById("transactionFormTypeSelect").value;

  if (!validateInput(titleValue, amountValue)) {
    return;
  }

  if (editTransactionId === null) {
    const newTransaction = {
      id: generateId(),
      title: titleValue,
      amount: Number(amountValue),
      date: dateValue,
      type: typeValue,
    };

    transactions.push(newTransaction);
  } else {
    updateTransaction(editTransactionId, {
      title: titleValue,
      amount: Number(amountValue),
      date: dateValue,
      type: typeValue,
    });

    editTransactionId = null;

    const submitBtn = transactionForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerText = "Simpan";
    }
  }

  saveData();
  dispatchTransactionUpdate();
  transactionForm.reset();
});

/**
 * TODO [Skilled]:
 * Tambahkan validasi input sebelum menyimpan data:
 *  - Tampilkan alert() dan hentikan proses jika judul kosong
 *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
 */

function validateInput(title, amount) {
  if (title.trim() === "") {
    alert("Judul transaksi tidak boleh kosong");
    return false;
  }

  if (Number(amount) < 1) {
    alert("Nominal transaksi harus lebih dari atau sama dengan 1!");
    return false;
  }

  return true;
}

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */

function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else if (transaction.type === "expense") {
      totalExpense += transaction.amount;
    }
  }

  const balance = totalIncome - totalExpense;

  const balanceElement = document.querySelector(".tracker-summary__balance-amount");
  const incomeElement = document.querySelector(".tracker-summary__stat-amount--income");
  const expenseElement = document.querySelector(".tracker-summary__stat-amount--expense");

  if (balanceElement) {
    balanceElement.innerText = formatCurrency(balance);
  }

  if (incomeElement) {
    incomeElement.innerText = formatCurrency(totalIncome);
  }

  if (expenseElement) {
    expenseElement.innerText = formatCurrency(totalExpense);
  }
}

/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */

const STORAGE_KEY = "TRACKER_APP_DATA";

function saveData() {
  const dataString = JSON.stringify(transactions);
  localStorage.setItem(STORAGE_KEY, dataString);
}

function loadDataFromStorage() {
  const dataString = localStorage.getItem(STORAGE_KEY);

  if (dataString !== null) {
    transactions = JSON.parse(dataString);
  }

  dispatchTransactionUpdate();
}

document.addEventListener("DOMContentLoaded", function () {
  loadDataFromStorage();
});

function deleteTransaction(transaction) {
  transactions = transactions.filter(function (t) {
    return t.id !== transaction.id;
  });

  saveData();
  dispatchTransactionUpdate();
}

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */

function editTransaction(transaction) {
  document.getElementById("transactionFormTitleInput").value = transaction.title;
  document.getElementById("transactionFormAmountInput").value = transaction.amount;
  document.getElementById("transactionFormDateInput").value = transaction.date;
  document.getElementById("transactionFormTypeSelect").value = transaction.type;

  editTransactionId = transaction.id;

  const submitBtn = transactionForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.innerText = "Update";
  }
}

function updateTransaction(id, updatedData) {
  for (const t of transactions) {
    if (t.id === id) {
      t.title = updatedData.title;
      t.amount = updatedData.amount;
      t.date = updatedData.date;
      t.type = updatedData.type;
      break;
    }
  }
}

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */

function dispatchTransactionUpdate() {
  const updateEvent = new Event("transaction:updated");
  document.dispatchEvent(updateEvent);
}

document.addEventListener("transaction:updated", function () {
  renderTransactions();
  updateDashboard();
});

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */

function toggleTransactionType(transaction) {
  if (transaction.type === "income") {
    transaction.type = "expense";
  } else {
    transaction.type = "income";
  }

  saveData();
  dispatchTransactionUpdate();
}

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */

const searchTransactionForm = document.getElementById("searchTransactionForm");
const searchInput = document.getElementById("searchTransactionFormTitleInput");

searchInput.addEventListener("input", function (e) {
  const keyword = e.target.value;
  if (keyword.trim() === "") {
    resetSearch();
  } else {
    filterTransactions(keyword);
  }
});

function filterTransactions(keyword) {
  const lowerCaseKeyword = keyword.toLowerCase();
  const filtered = transactions.filter(function (transactions) {
    const titleLowerCase = transactions.title.toLowerCase();
    return titleLowerCase.includes(lowerCaseKeyword);
  });

  renderTransactions(filtered);
}

searchTransactionForm.addEventListener("submit", function (e) {
  e.preventDefault();
});

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */

function resetSearch() {
  renderTransactions();
}
