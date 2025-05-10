import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { PersianDate } from 'js-persian-date';

// پیکربندی Firebase (اطلاعات خودتان را جایگزین کنید)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// بررسی وضعیت ورود کاربر
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html"; // اگر کاربر وارد نشده باشد به صفحه ورود برگردانید
    } else {
        // کاربر وارد شده است، صفحه را بارگیری کنید
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('id'); // گرفتن ID بیمار از URL
        if (patientId) {
            displayPatientInfo(patientId);
        } else {
            console.error("شناسه بیمار در URL یافت نشد.");
            // مدیریت خطا: نمایش پیام مناسب به کاربر
        }
    }
});


// تابع برای واکشی اطلاعات بیمار از Firestore
async function fetchPatientData(patientId) {
    try {
        const patientDoc = await getDoc(doc(db, "patients", patientId));
        if (patientDoc.exists()) {
            return { id: patientDoc.id, ...patientDoc.data() };
        } else {
            console.error("بیمار با شناسه", patientId, "یافت نشد!");
            return null;
        }
    } catch (error) {
        console.error("خطا در واکشی اطلاعات بیمار:", error);
        return null;
    }
}

// تابع برای نمایش اطلاعات بیمار در صفحه
async function displayPatientInfo(patientId) {
    const patient = await fetchPatientData(patientId);
    if (patient) {
        document.getElementById("patient-name").textContent = patient.name;
        displayDrugType(patient.drugType);
        displayCalendar(patient.startDate, patient.deliverySchedule, patient.drugType);
        updateDateAndDay();
    }
}

// تابع برای نمایش نوع دارو با استفاده از رنگ و شکل
function displayDrugType(drugType) {
    const drugIndicator = document.getElementById("drug-indicator");
    switch (drugType) {
        case "opium":
            drugIndicator.style.backgroundColor = "black";
            break;
        case "methadone":
            drugIndicator.style.backgroundColor = "white";
            drugIndicator.style.border = "2px solid black";
            break;
        case "bup":
            drugIndicator.textContent = "💊";
            drugIndicator.style.backgroundColor = "yellow";
            drugIndicator.style.fontSize = "1.5em";
            break;
    }
}

// تابع برای نمایش تاریخ و روز جاری
function updateDateAndDay() {
    const persianDate = new PersianDate();
    document.getElementById("today-date").textContent = persianDate.format("DD MMMM YYYY");
    document.getElementById("today-day").textContent = persianDate.format("dddd");
}

// تابع برای نمایش تقویم
function displayCalendar(startDate, deliverySchedule, drugType) {
    const calendarDiv = document.getElementById("calendar");
    calendarDiv.innerHTML = ''; // پاک کردن تقویم قبلی

    const persianStartDate = new PersianDate(startDate);
    const currentMonth = persianStartDate.month();
    const currentYear = persianStartDate.year();

    const daysInMonth = persianStartDate.daysInMonth();
    persianStartDate.setDate(1); // تنظیم روز به اول ماه
    const firstDayOfWeek = persianStartDate.dayOfWeek(); // روز هفته اول ماه (0: شنبه, 6: جمعه)

    // ایجاد سلول‌های خالی برای روزهای قبل از شروع ماه
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement("div");
        calendarDiv.appendChild(emptyDay);
    }

    // ایجاد سلول‌ها برای هر روز ماه
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.textContent = day;

        // بررسی اگر روز جاری جزو روزهای تحویل دارو است
        if (deliverySchedule && deliverySchedule.includes(day)) {
            dayDiv.classList.add("delivery-day");
        }

        dayDiv.addEventListener("click", () => showDosePopup(day, drugType));
        calendarDiv.appendChild(dayDiv);
    }
}

// تابع برای نمایش پاپ‌آپ دوز دارو
function showDosePopup(day, drugType) {
    Swal.fire({
        title: `دوز داروی روز ${day}`,
        text: `دوز داروی ${drugType} در این روز را وارد کنید:`,
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'ذخیره',
        cancelButtonText: 'انصراف',
        preConfirm: (dose) => {
            if (dose) {
                // اینجا می توانید دوز دارو را ذخیره کنید (مثلاً در Firestore)
                console.log(`دوز داروی روز ${day}:`, dose);
                Swal.fire(`دوز داروی روز ${day} ذخیره شد!`, '', 'success');
            } else {
                Swal.fire('لطفاً دوز دارو را وارد کنید!', '', 'warning');
            }
        }
    });
}

// تابع برای مدیریت تحویل دارو
document.getElementById('deliver-button').addEventListener('click', () => {
    Swal.fire({
        title: 'انتخاب روزهای تحویل دارو',
        text: 'لطفاً روزهای تحویل دارو را انتخاب کنید:',
        showCancelButton: true,
        confirmButtonText: 'تأیید',
        cancelButtonText: 'انصراف',
        // اینجا می توانید یک فرم یا تقویم سفارشی برای انتخاب روزها اضافه کنید
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('دارو تحویل داده شد!', '', 'success');
            // اینجا می توانید اطلاعات تحویل را ذخیره کنید
        }
    });
});