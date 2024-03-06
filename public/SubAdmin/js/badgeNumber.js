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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const usersRef = ref(db, "Users");

const notificationBadgeArchive = document.getElementById(
  "notificationBadgeArchive"
);
const notificationBadge = document.getElementById("notificationBadge");

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
}

function countArchivedUsers(snapshot, currentUserCampus) {
  let archivedUsersCount = 0;

  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  snapshot.forEach((userSnapshot) => {
    const user = userSnapshot.val();
    const verificationStatus = user.verificationStatus;
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    const userCampus = user.campus;

    if (
      verificationStatus &&
      lastLogin &&
      lastLogin <= oneYearAgo &&
      userCampus === currentUserCampus
    ) {
      archivedUsersCount++;
    }
  });

  notificationBadgeArchive.textContent = formatNumber(archivedUsersCount);
}

function updateNotificationBadge(snapshot, currentUserCampus) {
  let badgeCount = 0;

  snapshot.forEach((userSnapshot) => {
    const user = userSnapshot.val();
    const uid = userSnapshot.key;
    const verificationStatus = user.verificationStatus;
    const userCampus = user.campus;

    if (!verificationStatus && userCampus === currentUserCampus) {
      const userVerificationRef = ref(db, "User_Verification/" + uid);
      get(userVerificationRef).then((verificationSnapshot) => {
        if (verificationSnapshot.exists()) {
          badgeCount++;
        }

        notificationBadge.textContent = formatNumber(badgeCount);
      });
    }
  });
}

function populateDataTable(currentUserCampus) {
  onValue(usersRef, (snapshot) => {
    countArchivedUsers(snapshot, currentUserCampus);
    updateNotificationBadge(snapshot, currentUserCampus);
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
    const userRef = ref(db, `SubAdminAcc/${user.uid}`);
    onValue(userRef, (snapshot) => {
      const currentUserData = snapshot.val();
      if (currentUserData) {
        const currentUserCampus = currentUserData.campus;
        populateDataTable(currentUserCampus);
      }
    });
  } else {
    console.log("User is logged out");
  }
});
