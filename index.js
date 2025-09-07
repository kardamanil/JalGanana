import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDSqffmlg33rpMc6a2JUddg9pYQFvR8aXU",
  authDomain: "labcalc-cee5c.firebaseapp.com",
  projectId: "labcalc-cee5c",
  storageBucket: "labcalc-cee5c.firebasestorage.app",
  messagingSenderId: "1030109019271",
  appId: "1:1030109019271:web:e66f263a8a1c003b41cc22",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
