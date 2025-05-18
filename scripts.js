import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, Timestamp, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { toDateObject } from './date-converter.js'; // فرض بر این است که این فایل در کنار فایل HTML شما قرار دارد.

const firebaseConfig = {
    apiKey: "AIzaSyA08vHjfTM18hyZUjTfNtBpt-oC0xmgKFE",
        authDomain: "babakan-clinic.firebaseapp.com",
        projectId: "babakan-clinic",
        storageBucket: "babakan-clinic.firebasestorage.app",
        messagingSenderId: "188319180301",
        appId: "1:188319180301:web:383b8fc0dd0cdf06f95744"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "login.html";
    }
});

function logout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    }).catch(error => {
        console.error("Logout error:", error);
        alert("Failed to logout. Please try again.");
    });
}

async function submitPatient(event) {
    event.preventDefault();

    const fileNumber = document.getElementById('fileNumber').value;
    const fullName = document.getElementById('fullName').value;
    const nationalId = document.getElementById('nationalId').value;
    const phone = document.getElementById('phone').value;
    const birthdateInput = document.getElementById('birthdate').value;
    const treatmentType = document.getElementById('treatmentType').value;
    const dose = document.getElementById('dose').value;
    const startDate = document.getElementById('startDate').value;
    const deliveryDay = document.getElementById('deliveryDay').value;
    const notes = document.getElementById('notes').value;

    let birthYear = '';
    if (birthdateInput) {
        const gregorianDate = new Date(birthdateInput);
        const jalaliDate = new Date(gregorianDate).toLocaleDateString('fa-IR');
        birthYear = jalaliDate.split('/')[0];
    }

    const formData = {
        file_number: fileNumber,
        name: fullName,
        national_id: nationalId,
        phone: phone,
        birthdate: birthYear,
        treatment_type: treatmentType,
        dose: dose,
        start_date: startDate,
        deliveryDay: deliveryDay,
        notes: notes,
        createdAt: Timestamp.now()
    };

    console.log("Form data:", formData);

    try {
        const docRef = await addDoc(collection(db, "patients"), formData);
        console.log("Patient inserted successfully with ID: ", docRef.id);
        alert("✅ مددجو با موفقیت ثبت شد.");
        document.getElementById('patientForm').reset();

    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred: " + error.message);
    }
}

function displayCurrentDate() {
    const today = new Date();
    const jalaliDate = today.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const dayName = jalaliDate.split(' ')[0];
    const formattedDate = jalaliDate.replace(dayName, '').trim();

    document.getElementById('today-date').textContent = formattedDate;
    document.getElementById('today-day').textContent = dayName;
}

displayCurrentDate();

const searchBox = document.getElementById('search-box');
const searchResultsContainer = document.getElementById('search-results');
let allPatients = [];

async function fetchPatients() {
    try {
        const patientsSnapshot = await getDocs(collection(db, "patients"));
        allPatients = patientsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Failed to fetch patients. Please try again.");
    }
}

function findMatches(searchTerm, patients) {
    if (!searchTerm) return [];
    const regex = new RegExp(searchTerm, 'i');
    return patients.filter(patient => {
        return regex.test(patient.name) || regex.test(patient.file_number);
    });
}

function displayMatches() {
    const matchArray = findMatches(this.value, allPatients);
    const resultsHTML = matchArray.map(patient => {
        return `
                <li data-id="${patient.id}">
                    ${patient.name} - ${patient.file_number}
                </li>
            `;
    }).join('');
    searchResultsContainer.innerHTML = resultsHTML || `<li class="no-results">بیماری یافت نشد.</li>`;
    searchResultsContainer.style.display = this.value ? 'block' : 'none';
}

searchResultsContainer.addEventListener('click', (event) => {
    const patientId = event.target.dataset.id;
    if (patientId) {
        // جهت تست:
        console.log(`Selected patient ID: ${patientId}`);
        // alert(`Selected patient ID: ${patientId}`); // می توانید بجای لاگ، از یک مودال یا تغییر مسیر استفاده کنید.
        window.location.href = `patient-profile.html?id=${patientId}`;
    }
    searchResultsContainer.style.display = 'none';
    searchBox.value = '';
});

searchBox.addEventListener('input', displayMatches);

window.addEventListener('load', async () => {
    await fetchPatients();
});
</script>
<script>
    function toDateObject(dateString) {
        const parts = dateString.split('/').map(Number);
        if (parts.length !== 3) {
            return null;
        }
        const [year, month, day] = parts;
        if (isNaN(year) || isNaN(month) || isNaN(day))
          return null;
        const gregorianDate = new Date(year, month - 1, day);
        return gregorianDate;
    }
    window.toDateObject = toDateObject;
</script>
