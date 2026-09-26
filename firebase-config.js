import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtsyB9sGE3VdIvTRrdHwYnmw2785-nhgw",
  authDomain: "campus-sos-3a3f9.firebaseapp.com",
  projectId: "campus-sos-3a3f9",
  storageBucket: "campus-sos-3a3f9.firebasestorage.app",
  messagingSenderId: "183046921136",
  appId: "1:183046921136:web:b40e2f64e98f7fcdc2d475"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);