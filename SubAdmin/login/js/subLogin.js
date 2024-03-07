import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

import firebaseConfig from "/js/firebaseConfig.js";

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Select the login button element
const loginBtn = document.getElementById("btnlogin");

loginBtn.addEventListener("click", async function () {
  const email = document.getElementById("usernamefield").value.toLowerCase(); // Convert to lowercase
  const password = document.getElementById("passwordfield").value;

  try {
    // Sign in the user using Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Retrieve the reference to the specific node using the user's UID
    const subAdminRef = ref(db, `SubAdminAcc/${user.uid}`);

    // Retrieve the data from the SubAdminAcc node with the provided UID
    const snapshot = await get(subAdminRef);

    // Check if the snapshot exists and compare the passwords
    if (snapshot.exists()) {
      const userData = snapshot.val();
      // Convert stored email to lowercase for comparison
      if (userData.email.toLowerCase() === email) {
        window.location.href = "../subdashboard.html";
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } else {
      alert("Admin Account not found.");
    }
  } catch (error) {
    console.error("Firebase authentication error:", error);
    alert("Login failed. Please check your credentials or try again later.");
  }
});
document
  .getElementById("usernamefield")
  .addEventListener("keydown", handleEnterKey);
document
  .getElementById("passwordfield")
  .addEventListener("keydown", handleEnterKey);

// Function to handle Enter key press
function handleEnterKey(event) {
  if (event.key === "Enter") {
    // Trigger the click event on the login button
    loginBtn.click();
  }
}
