// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlxqDqfxJOGDP3V6bvqAJs4di9Z8Jd6XM",
  authDomain: "pas-kanban-board.firebaseapp.com",
  projectId: "pas-kanban-board",
  storageBucket: "pas-kanban-board.firebasestorage.app",
  messagingSenderId: "44165777866",
  appId: "1:44165777866:web:e8b123419960435479e733",
  measurementId: "G-BR1BEYV06T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
