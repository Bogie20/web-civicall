import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  push,
  remove,
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
const searchInput = document.getElementById("searchInput");
const campusSelect = document.getElementById("campusSelect");
const userTable = document.getElementById("userTable");
const noMatchMessage = document.getElementById("noMatchMessage");

// Event listener for search input
searchInput.addEventListener("input", () => {
  filterTable();
});

// Event listener for campus filter
campusSelect.addEventListener("change", () => {
  filterTable();
});

onAuthStateChanged(auth, (user) => {
  // You can handle authentication state changes here
  if (user) {
    console.log("User is logged in:", user);
    populateUserData();
  } else {
    console.log("User is logged out");
  }
});

// Function to fetch and populate user data
function populateUserData() {
  const usersRef = ref(db, "Users");
  get(usersRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        let usersArray = [];

        // Convert the object into an array and filter based on verification status and last login
        for (let uid in usersData) {
          const user = usersData[uid];
          if (user.verificationStatus && isWithinOneYear(user.lastLogin)) {
            usersArray.push(user);
          }
        }

        // Sort users based on activepts
        usersArray.sort((a, b) => b.activepts - a.activepts);

        // Clear existing table rows
        userTable.innerHTML = "";

        // Populate the table
        usersArray.forEach((user) => {
          const row = document.createElement("tr");
          row.innerHTML = `
       <td id="uid">${user.uid || "N/A"}</td>
<td id="srcode">${user.srcode || "N/A"}</td>
<td>
  <a href="#">
    <img src="${
      user.ImageProfile || "img/profilePic.jpg"
    }" style="object-fit: cover" class="eventpic" alt="Avatar" id="profilePic"/>
  </a>
</td>
<td id="nameid">${user.lastname || "N/A"}, ${user.firstname || "N/A"}, ${
            user.middlename || "N/A"
          }</td>
<td id="campusid">${user.campus || "N/A"}</td>
<td id="usertype">${user.userType || "N/A"}</td>
<td style="text-align: center;" id="currentEvent">${
            user.CurrentEngagement || "0"
          }</td>
<td style="text-align: center;" id="finish">${user.finishactivity || "0"}</td>
<td style="text-align: center;" id="activepts">${user.activepts || "0"}</td>

          `;
          userTable.appendChild(row);
        });

        // Filter table based on search input and campus selection
        filterTable();
      } else {
        console.log("No user data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

// Function to filter table based on search input and campus selection
function filterTable() {
  const rows = userTable.getElementsByTagName("tr");
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCampus = campusSelect.value.toLowerCase();

  let matchFound = false;

  for (let i = 0; i < rows.length; i++) {
    const campus = rows[i].querySelector("#campusid").textContent.toLowerCase();

    const campusFilterCondition =
      selectedCampus === "all campus" || campus.includes(selectedCampus);

    const uid = rows[i].querySelector("#uid").textContent.toLowerCase();
    const srcode = rows[i].querySelector("#srcode").textContent.toLowerCase();
    const name = rows[i].querySelector("#nameid").textContent.toLowerCase();
    const userType = rows[i]
      .querySelector("#usertype")
      .textContent.toLowerCase();
    const currentEvent = rows[i]
      .querySelector("#currentEvent")
      .textContent.toLowerCase();
    const finish = rows[i].querySelector("#finish").textContent.toLowerCase();
    const activepts = rows[i]
      .querySelector("#activepts")
      .textContent.toLowerCase();

    const searchTermFound =
      uid.includes(searchTerm) ||
      srcode.includes(searchTerm) ||
      name.includes(searchTerm) ||
      userType.includes(searchTerm) ||
      currentEvent.includes(searchTerm) ||
      finish.includes(searchTerm) ||
      activepts.includes(searchTerm);

    if (campusFilterCondition && searchTermFound) {
      rows[i].style.display = "";
      matchFound = true;
    } else {
      rows[i].style.display = "none";
    }
  }

  // Display no match message if no matching rows found
  noMatchMessage.style.display = matchFound ? "none" : "block";
}

// Function to check if the last login is within one year
function isWithinOneYear(lastLogin) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return new Date(lastLogin) > oneYearAgo;
}

// Call the function to populate user data
populateUserData();
