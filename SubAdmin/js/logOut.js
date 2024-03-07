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
    const userRef = ref(db, `SubAdminAcc/${uid}`);

    get(userRef).then((snapshot) => {
      const userData = snapshot.val();

      // Extract the first letter of middlename and append a dot
      const middlenameInitial = userData.middlename
        ? userData.middlename.charAt(0) + "."
        : "";

      // Update the DOM elements with user data
      document.getElementById("profileImage").src =
        userData.ImageProfile || "../img/profile.png";
      document.getElementById("subName").textContent = `${
        userData.lastname || "N/A"
      }, ${userData.firstname || "N/A"} ${middlenameInitial}`;
    });

    console.log("User is logged in:", user);
  } else {
    console.log("User is logged out");
  }
});
document.getElementById("logOut").addEventListener("click", () => {
  // Sign out the current user
  auth
    .signOut()
    .then(() => {
      console.log("User logged out");

      // Redirect to the suplogin.html page after successful logout
      window.location.href = "login/sublogin.html";

      // Remove previous page from history
      history.replaceState(null, "", "login/sublogin.html");
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
});
