import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js"; // Import Firebase Storage module
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
let currentUserUID;
onAuthStateChanged(auth, (user) => {
  // You can handle authentication state changes here
  if (user) {
    console.log("User is logged in:", user);
    currentUserUID = user.uid;
  } else {
    console.log("User is logged out");
  }
});
document.addEventListener("DOMContentLoaded", function () {
  // Get the modal and the button
  const modal = document.getElementById("myModalat");
  const btn = document.getElementById("valBtn");

  // When the button is clicked, show the modal
  btn.addEventListener("click", function () {
    modal.style.display = "block";
  });

  // When the user clicks on the close button, close the modal
  const closeBtn = document.querySelector(".closeat");
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside the modal, close it
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
    const inputSearch = document.getElementById("inputSearch");

    // Add event listener for input event
    inputSearch.addEventListener("input", function () {
      // Get the value of the input field
      const searchText = inputSearch.value.toLowerCase();

      // Get all table rows except the header row
      const rows = document.querySelectorAll("#tableParticipants tbody tr");

      // Loop through each row
      rows.forEach((row) => {
        // Get the text content of each row and convert it to lowercase
        const rowText = row.textContent.toLowerCase();

        // If the row contains the search text, display it, otherwise hide it
        if (rowText.includes(searchText)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  });
});
// Function to populate the tableParticipants
// Function to populate the tableParticipants
function populateTable() {
  const table = document
    .getElementById("tableParticipants")
    .getElementsByTagName("tbody")[0];
  const reportedProblemsRef = ref(db, "ReportedProblems");

  onValue(reportedProblemsRef, (snapshot) => {
    // Clear existing rows
    table.innerHTML = "";

    // Check if there are no problem reports
    if (!snapshot.exists()) {
      const noDataMessageRow = table.insertRow();
      const messageCell = noDataMessageRow.insertCell();
      messageCell.colSpan = "7"; // Span the entire row
      const message = "No problem reports as of the moment.";
      messageCell.innerHTML = `<div style="text-align: center; font-size: larger; color: #dc3545;">${message}</div>`;
    } else {
      snapshot.forEach((childSnapshot) => {
        const uid = childSnapshot.key;
        const problems = childSnapshot.val(); // Get all problems under this UID

        // Loop through each problem
        for (const postId in problems) {
          if (Object.hasOwnProperty.call(problems, postId)) {
            const problem = problems[postId];

            // Retrieve related user data from Users node
            const userRef = ref(db, "Users/" + uid);
            get(userRef).then((userSnapshot) => {
              const user = userSnapshot.val();

              // Create a new row
              const row = table.insertRow();

              // Populate columns
              row.insertCell(0).innerText = uid;
              row.insertCell(
                1
              ).innerText = `${user.lastname}, ${user.firstname} ${user.middlename}`;
              row.insertCell(2).innerText = user.campus;
              row.insertCell(3).innerText = problem.issue;
              // Splitting the message into lines of maximum 40 characters
              const messageLines = problem.message.match(/.{1,40}/g) || [];

              // Joining the lines with a line break
              const formattedMessage = messageLines.join("\n");

              // Setting the inner text with the formatted message
              row.insertCell(4).innerText = formattedMessage;

              const proofCell = row.insertCell(5);
              proofCell.innerHTML = `<a href="${problem.imageUrl}" target="_blank" style="color: #dc3545; text-decoration: underline">View the file</a>`;

              // Add delete button in column 6
              const deleteCell = row.insertCell(6);
              const deleteButton = document.createElement("button");
              deleteButton.className = "btn btn-danger";
              deleteButton.innerText = "Delete";
              deleteButton.addEventListener("click", () => {
                // Show confirmation dialog
                const confirmation = confirm(
                  "Are you sure you want to delete this problem report?"
                );

                // If user confirms deletion
                if (confirmation) {
                  // Delete data from Firebase Realtime Database
                  const problemRef = ref(
                    db,
                    `ReportedProblems/${uid}/${postId}`
                  );
                  set(problemRef, null) // Set to null to delete the data
                    .then(() => {
                      // Alert for successful deletion
                      alert("Problem report deleted successfully.");
                    })
                    .catch((error) => {
                      console.error("Error deleting problem report:", error);
                    });
                }
              });
              deleteCell.appendChild(deleteButton);
            });
          }
        }
      });
    }
  });
}

// Call the populateTable function when DOM content is loaded
document.addEventListener("DOMContentLoaded", populateTable);
