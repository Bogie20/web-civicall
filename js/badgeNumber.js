import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.js";
const auth = getAuth(app);
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
  // You can handle authentication state changes here
  if (user) {
    console.log("User is logged in:", user);
  } else {
    console.log("User is logged out");
  }
});
// Reference to the Users node
const usersRef = ref(db, "Users");

const notificationBadgeArchive = document.getElementById(
  "notificationBadgeArchive"
);
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
}
function countArchivedUsers(snapshot) {
  let archivedUsersCount = 0;

  // Current date and time
  const currentDate = new Date();

  // One year ago from the current date
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  // Loop through the users
  snapshot.forEach((userSnapshot) => {
    const verificationStatus = userSnapshot.child("verificationStatus").val();
    const lastLogin = userSnapshot.child("lastLogin").val();
    const lastLoginDate = new Date(lastLogin);
    if (verificationStatus === true && lastLoginDate <= oneYearAgo) {
      archivedUsersCount++;
    }
  });

  notificationBadgeArchive.textContent = formatNumber(archivedUsersCount);
}
onValue(usersRef, countArchivedUsers);
const notificationBadge = document.getElementById("notificationBadge");

// Listen for changes in the Users node
onValue(usersRef, (snapshot) => {
  // Reset badge count
  let badgeCount = 0;

  // Iterate through each user
  snapshot.forEach((userSnapshot) => {
    const user = userSnapshot.val();
    const uid = userSnapshot.key;

    // Check if verificationStatus is false
    if (user.verificationStatus === false) {
      // Check if UID exists in User Verification node
      const userVerificationRef = ref(db, "User_Verification/" + uid);
      get(userVerificationRef).then((verificationSnapshot) => {
        if (verificationSnapshot.exists()) {
          // Increment badge count
          badgeCount++;
        }

        notificationBadge.textContent = formatNumber(badgeCount);
      });
    }
  });
});
