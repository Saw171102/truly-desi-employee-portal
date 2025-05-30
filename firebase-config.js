// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCFWtSh0qWBjQFsMM9uHA2ORIu1ldGwfrU",
    authDomain: "truly-desi-employee.firebaseapp.com",
    projectId: "truly-desi-employee",
    storageBucket: "truly-desi-employee.firebasestorage.app",
    messagingSenderId: "1052772448477",
    appId: "1:1052772448477:web:78cd786bd7442bb81b0334",
    measurementId: "G-BD5C210N3N"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();