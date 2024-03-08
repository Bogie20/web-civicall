import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { update } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getDatabase,
  ref,
  get,
  push,
  set,
  onValue,
  onChildRemoved,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

import firebaseConfig from "./firebaseConfig.js";
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

document
  .getElementById("resetForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value;

    if (email) {
      // Reference to the SuperAdminAcc node
      const superAdminAccRef = ref(db, "SubAdminAcc");

      // Check if the email exists in the SuperAdminAcc node
      const emailExists = await new Promise((resolve) => {
        onValue(superAdminAccRef, (snapshot) => {
          const users = snapshot.val();

          // Check if the email exists in the SuperAdminAcc node
          const emailExists = Object.values(users).some(
            (user) => user.email.toLowerCase() === email.toLowerCase()
          );
          resolve(emailExists);
        });
      });

      if (emailExists) {
        // Email exists, proceed with sending a password reset email

        // Use Firebase Authentication to send a password reset email
        sendPasswordResetEmail(auth, email)
          .then(() => {
            alert("Password reset email sent. Please check your email.");

            // Update the Realtime Database with the user's email
            // Update the Realtime Database with the user's email
            const user = auth.currentUser;
            if (user) {
              const uid = user.uid;
              const dbRef = ref(db, `SubAdminAcc/${uid}`);
              update(dbRef, { email });
            } else {
              console.error("User not found.");
            }
          })
          .catch((error) => {
            console.error("Error sending password reset email:", error.message);
            alert("Error sending password reset email. Please try again.");
          });
      } else {
        // Email doesn't exist in the SuperAdminAcc node
        alert("Email not found. Please enter a valid email address.");
      }
    } else {
      alert("Please enter your email address.");
    }
  });
document
  .getElementById("emailInput")
  .addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      // Simulate a click on the buttonReset
      document.getElementById("buttonReset").click();
    }
  });
