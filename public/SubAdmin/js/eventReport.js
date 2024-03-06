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
const storages = getStorage(app);
const eventTable = document.getElementById("eventTable");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");

// Event listener for search input
searchInput.addEventListener("input", () => {
  filterTable();
});

// Event listener for category filter
categorySelect.addEventListener("change", () => {
  filterTable();
});

// Function to fetch and populate data based on the current user's campus
function populateEventData(currentUserCampus) {
  const eventsRef = ref(db, "Upload_Engagement");
  get(eventsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const eventsData = snapshot.val();
        let eventsArray = [];

        // Convert the object into an array for sorting
        for (let key in eventsData) {
          // Check if verificationStatus is true
          if (
            eventsData[key].verificationStatus === true &&
            eventsData[key].campus &&
            eventsData[key].campus.includes(currentUserCampus)
          ) {
            eventsArray.push(eventsData[key]);
          }
        }

        // Sort events based on startDate and endDate
        eventsArray.sort((a, b) => {
          const aStartDate = new Date(a.startDate).getTime();
          const bStartDate = new Date(b.startDate).getTime();
          const aEndDate = new Date(a.endDate).getTime();
          const bEndDate = new Date(b.endDate).getTime();

          // Sort in descending order of startDate
          return bStartDate - aStartDate || bEndDate - aEndDate;
        });

        // Clear existing table rows
        eventTable.innerHTML = "";

        // Populate the table
        eventsArray.forEach((event, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td id="number">${index + 1}</td>
            <td>
              <a href="#"><img src="${
                event.image
              }" style="object-fit: cover" class="eventpic" alt="Event Poster"/></a>
            </td>
            <td style="line-height: 1.8; min-width: 250px;" id="title">${
              event.titleEvent
            }</td>
                <td style="line-height: 1.8; min-width: 120px;" id="category">${
                  event.category
                }</td>
            <td style="line-height: 1.8; min-width: 350px;" id="campus">${
              event.campus
            }</td>
            <td style="min-width: 150px;" id="schedule">${event.startDate} -- ${
            event.endDate
          }</td>
            <td id="status">${getStatus(event.startDate, event.endDate)}</td>
            <td  style="text-align: center;" id="currentParty">${
              Object.keys(event.Participants || {}).length
            }</td>
            <td  style="text-align: center;" id="totalConfirmed">${getConfirmedParticipants(
              event.Participants
            )}</td>
          `;
          eventTable.appendChild(row);
        });

        // Filter table based on search input and campus selection
        filterTable();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Function to handle filtering of the table
function filterTable() {
  const rows = eventTable.getElementsByTagName("tr");
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categorySelect.value.toLowerCase();

  for (let i = 0; i < rows.length; i++) {
    const title = rows[i].querySelector("#title").textContent.toLowerCase();
    const category = rows[i]
      .querySelector("#category")
      .textContent.toLowerCase();
    const campus = rows[i].querySelector("#campus").textContent.toLowerCase();
    const schedule = rows[i]
      .querySelector("#schedule")
      .textContent.toLowerCase();
    const status = rows[i].querySelector("#status").textContent.toLowerCase();
    const currentParty = rows[i]
      .querySelector("#currentParty")
      .textContent.toLowerCase();
    const totalConfirmed = rows[i]
      .querySelector("#totalConfirmed")
      .textContent.toLowerCase();

    const categoryFilterCondition =
      selectedCategory === "all category" ||
      category.includes(selectedCategory);

    if (
      (title.includes(searchTerm) ||
        category.includes(searchTerm) ||
        campus.includes(searchTerm) ||
        schedule.includes(searchTerm) ||
        status.includes(searchTerm) ||
        currentParty.includes(searchTerm) ||
        totalConfirmed.includes(searchTerm)) &&
      categoryFilterCondition
    ) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

// Listener for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    const currentUserUID = user.uid;
    const currentUserRef = ref(db, `SubAdminAcc/${currentUserUID}`);
    get(currentUserRef)
      .then((userSnapshot) => {
        const currentUserCampus = userSnapshot.val().campus;
        populateEventData(currentUserCampus);
      })
      .catch((error) => {
        console.error("Error fetching current user's data:", error);
      });
  } else {
    console.log("User is logged out");
  }
});

// Function to determine event status
function getStatus(startDate, endDate) {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (start > now) {
    return "Upcoming";
  } else if (start <= now && end >= now) {
    return "Ongoing";
  } else {
    return "Finished";
  }
}

// Function to get the number of confirmed participants
function getConfirmedParticipants(participants) {
  let count = 0;
  for (let uid in participants) {
    if (participants[uid].joined === true) {
      count++;
    }
  }
  return count;
}

// Call the function to populate data
populateEventData();
