const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "babakan-clinic.firebaseapp.com",
    projectId: "babakan-clinic",
    storageBucket: "babakan-clinic.appspot.com",
    messagingSenderId: "188319180301",
        appId: "1:188319180301:web:383b8fc0dd0cdf06f95744"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
