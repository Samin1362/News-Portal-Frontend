// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLDpRl5QCM5GoBFS7DKkws6GHGHQgSp8Q",
  authDomain: "news-portal-firebase-project.firebaseapp.com",
  projectId: "news-portal-firebase-project",
  storageBucket: "news-portal-firebase-project.firebasestorage.app",
  messagingSenderId: "85289317344",
  appId: "1:85289317344:web:d9c8ded103af2eca3e7185"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);