import {
  onAuthStateChanged,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, `SuperAdminAcc/${uid}`);

    get(userRef).then((snapshot) => {
      const userData = snapshot.val();

      // Extract the first letter of middlename and append a dot
      const middlenameInitial = userData.middlename
        ? userData.middlename.charAt(0) + "."
        : "";

      // Update the DOM elements with user data
      document.getElementById("profileImage").src =
        userData.ImageProfile || "img/profile.png";
      document.getElementById("superName").textContent = `${
        userData.lastname || "N/A"
      }, ${userData.firstname || "N/A"} ${middlenameInitial}`;
    });

    console.log("User is logged in:", user);
  } else {
    console.log("User is logged out");
  }
});

// Function to handle popstate event
const handlePopState = () => {
  // If the current location is index.html, push state again to prevent navigation
  if (window.location.pathname === '/index.html') {
    window.history.pushState(null, '', '/index.html');
  }
};

// Add event listener for popstate event
window.addEventListener('popstate', handlePopState);

// Function to remove popstate event listener
const removePopstateListener = () => {
  window.removeEventListener('popstate', handlePopState);
};

document.getElementById("logOut").addEventListener("click", () => {
  // Sign out the current user
  auth
    .signOut()
    .then(() => {
      console.log("User logged out");

      // Remove popstate event listener
      removePopstateListener();

      // Redirect to index.html
      window.location.href = "index.html";

      // Remove previous page from history
      history.replaceState(null, "", "index.html");
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
});
