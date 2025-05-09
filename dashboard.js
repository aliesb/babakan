import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// پیکربندی Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA08vHjfTM18hyZUjTfNtBpt-oC0xmgKFE",
  authDomain: "babakan-clinic.firebaseapp.com",
  projectId: "babakan-clinic",
  storageBucket: "babakan-clinic.firebasestorage.app",
  messagingSenderId: "188319180301",
  appId: "1:188319180301:web:383b8fc0dd0cdf06f95744",
  measurementId: "G-QN4GJS4VYW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// بررسی وضعیت ورود
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// نمایش تاریخ
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById("today").textContent = today.toLocaleDateString('fa-IR', options);

// ذخیره یادداشت
window.saveNote = function () {
  const note = document.getElementById("notes").value;
  localStorage.setItem("clinicNote", note);
  Toastify({
    text: "یادداشت ذخیره شد",
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#14b8a6"
  }).showToast();
};

// بارگذاری یادداشت
document.getElementById("notes").value = localStorage.getItem("clinicNote") || "";

// جستجوی بیمار
window.searchPatient = async function (query) {
  const searchResults = document.getElementById("searchResults");
  if (!query) {
    searchResults.innerHTML = "";
    return;
  }
  try {
    // فرضاً API یا Firestore
    const snapshot = await getDocs(collection(db, "patients"));
    const patients = snapshot.docs
      .map(doc => doc.data())
      .filter(p => p.name.includes(query) || p.nationalId.includes(query));
    searchResults.innerHTML = patients.length
      ? patients.map(p => `<div class="p-2 bg-gray-600 rounded-md">${p.name} - ${p.nationalId}</div>`).join('')
      : '<div class="text-gray-400">نتیجه‌ای یافت نشد</div>';
  } catch (err) {
    Toastify({
      text: "خطا در جستجو: " + err.message,
      duration: 3000,
      backgroundColor: "#ef4444"
    }).showToast();
  }
};

// خروج
window.logoutUser = function () {
  signOut(auth).then(() => {
    localStorage.clear();
    window.location.href = "index.html";
  }).catch(err => {
    Toastify({
      text: "خطا در خروج: " + err.message,
      duration: 3000,
      backgroundColor: "#ef4444"
    }).showToast();
  });
};

// ویرایش موجودی
window.editStock = function (type) {
  const newStock = prompt(`مقدار جدید موجودی ${type} را وارد کنید:`);
  if (newStock) {
    document.getElementById(`stock${type.charAt(0).toUpperCase() + type.slice(1)}`).textContent = newStock;
    Toastify({
      text: `موجودی ${type} به‌روزرسانی شد`,
      duration: 3000,
      backgroundColor: "#14b8a6"
    }).showToast();
  }
};

// بارگذاری آمار
async function fetchDashboardStats() {
  document.getElementById("loading").classList.remove("hidden");
  try {
    // داده‌های نمونه (باید به Firestore متصل شود)
    const data = {
      totalPatients: 35,
      opium: 12,
      methadone: 15,
      bup: 8,
      stock: {
        methadone: '1200 ml',
        opium: '900 ml',
        bup: '350 قرص'
      },
      todayTasks: ["ویزیت علی رضایی", "تحویل دارو به نرگس احمدی"],
      alerts: ["نسخه علی احمدی منقضی شده است", "نرگس حسینی 3 روز دارو نگرفته"]
    };

    document.getElementById("totalPatients").textContent = data.totalPatients;
    document.getElementById("opiumCount").textContent = data.opium;
    document.getElementById("methadoneCount").textContent = data.methadone;
    document.getElementById("bupCount").textContent = data.bup;
    document.getElementById("stockMethadone").textContent = data.stock.methadone;
    document.getElementById("stockOpium").textContent = data.stock.opium;
    document.getElementById("stockBup").textContent = data.stock.bup;
    document.getElementById("todayTasks").innerHTML = data.todayTasks.map(task => `<div class="mb-2">🔹 ${task}</div>`).join('');
    document.getElementById("alerts").innerHTML = data.alerts.map(alert => `<div class="mb-2">🔴 ${alert}</div>`).join('');

    // نمودار
    const ctx = document.getElementById("patientChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["متادون", "اپیوم", "بوپرنورفین"],
        datasets: [{
          label: "تعداد بیماران",
          data: [data.methadone, data.opium, data.bup],
          backgroundColor: ["#3b82f6", "#f97316", "#22c55e"]
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (err) {
    document.getElementById("todayTasks").innerHTML = '<div class="text-red-500">خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.</div>';
    console.error("Error fetching stats:", err);
  } finally {
    document.getElementById("loading").classList.add("hidden");
  }
}

// منوی موبایل
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("active");
});

fetchDashboardStats();