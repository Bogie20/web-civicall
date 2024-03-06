import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  push,
  set,
  onValue,
  onChildRemoved,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Close modified modal on clicking the close button or outside the modal
document.getElementById("closeModalrr").addEventListener("click", function () {
  document.getElementById("myModalrr").style.display = "none";
});

document;

// JavaScript to handle modal display
const addgrBtn = document.getElementById("addgrBtn");
const modal = document.getElementById("myModalm");

addgrBtn.addEventListener("click", function () {
  modal.style.display = "block";
});

let counter = 1; // Initialize a counter for unique IDs

// Function to add a new row of input fields
function addRow() {
  var inputRow = document.getElementById("inputrow");
  var newRow = document.createElement("div");
  newRow.className = "row"; // Assign the "row" class

  var newColEmail = document.createElement("div");
  newColEmail.className = "col";
  var emailLabel = document.createElement("label");
  emailLabel.setAttribute("for", "emailInput" + counter);
  emailLabel.innerText = "Email:";
  emailLabel.classList.add("emailLabel"); // Add class for email label styling
  var emailInput = document.createElement("input");
  emailInput.setAttribute("type", "email");
  emailInput.setAttribute("name", "email" + counter);
  emailInput.setAttribute("placeholder", "Enter the email");
  emailInput.id = "emailInput" + counter; // Unique ID for email input
  emailInput.classList.add("emailInput"); // Add class for styling

  // Increment counter for the next set of inputs
  counter++;

  // Append elements to their respective parents
  newColEmail.appendChild(emailLabel);
  newColEmail.appendChild(emailInput);

  // Append columns to the new row
  newRow.appendChild(newColEmail);

  // Append the new row to the container
  inputRow.appendChild(newRow);

  // Update the total number of rows displayed
  updateTotalRows();
}

// Function to update the total number of rows displayed
function updateTotalRows() {
  var totalRowsElement = document.getElementById("totalRows");
  var inputRow = document.getElementById("inputrow");
  totalRowsElement.innerText = inputRow.children.length;
}

// Add an event listener to the "Add row" button
document.getElementById("addrow").addEventListener("click", function (event) {
  event.preventDefault();
  addRow();
});

document.getElementById("subac").addEventListener("click", function (event) {
  event.preventDefault();

  // Check if at least one email is provided
  var inputRow = document.getElementById("inputrow");
  var emailInputs = inputRow.getElementsByClassName("emailInput");
  var hasEmail = Array.from(emailInputs).some(function (emailInput) {
    return emailInput.value.trim() !== "";
  });

  if (!hasEmail) {
    alert("Put an Email First");
    return; // Stop further processing
  }

  // Confirmation alert
  if (confirm("Are you sure you want to register these users?")) {
    // Get the current user's campus from onAuthStateChanged
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `SubAdminAcc/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const currentUserData = snapshot.val();
          if (currentUserData) {
            const currentUserCampus = currentUserData.campus;
            registerUsers(currentUserCampus); // Pass currentUserCampus to registerUsers
          }
        });
      }
    });
  }
});

function registerUsers(currentUserCampus) {
  var inputRow = document.getElementById("inputrow");
  var emailInputs = inputRow.getElementsByClassName("emailInput");

  // Fetch default password from the Realtime Database
  var defaultPassRef = ref(db, "defaultPass/pass");
  get(defaultPassRef).then((snapshot) => {
    if (snapshot.exists()) {
      var defaultPassword = snapshot.val();
      // Iterate through each email input
      Array.from(emailInputs).forEach(function (emailInput) {
        var email = emailInput.value.trim();

        if (email !== "") {
          // Register the user with the fetched default password
          registerUser(email, defaultPassword, currentUserCampus);
        }
      });
      removeAddedRows();
    } else {
      alert("Error fetching default password.");
    }
  });
}

function registerUser(email, password, currentUserCampus) {
  // Check if the email already exists
  checkIfEmailExists(email).then(function (emailExists) {
    if (!emailExists) {
      // Email does not exist, proceed with registration
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // User registered successfully
          var user = userCredential.user;
          alert("User with email " + email + " registered successfully!");
          // Log out the current user
          auth
            .signOut()
            .then(() => {
              // Redirect to the login page after logout
              alert(
                "User registered successfully. You need to login again for authentication purposes."
              );
              window.location.href = "login/index.html";
            })
            .catch((error) => {
              console.log("Error logging out:", error);
            });
          saveUserData(user.uid, email, currentUserCampus); // Pass currentUserCampus to saveUserData
        })
        .catch((error) => {
          // Handle errors during registration
          alert("Error registering user: " + error.message);
        });
    } else {
      // Email already exists, show alert
      alert("Email " + email + " already exists!");
    }
  });
}

function checkIfEmailExists(email) {
  // Check if the email already exists in the database
  var usersRef = ref(db, "Users");
  return get(usersRef).then((snapshot) => {
    if (snapshot.exists()) {
      var users = snapshot.val();
      return Object.values(users).some((user) => user.email === email);
    }
    return false;
  });
}
function generateTimestamp() {
  const currentDate = new Date();
  const options = {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return currentDate.toLocaleString("en-US", options).replace(",", "");
}
function saveUserData(uid, email, currentUserCampus) {
  // Save additional user data to the database
  var usersRef = ref(db, "Users/" + uid);
  set(usersRef, {
    CurrentEngagement: 0,
    ImageProfile: "",
    activepts: 0,
    address: "",
    birthday: "",
    campus: currentUserCampus, // Set campus to currentUserCampus
    course: "",
    nstp: "",
    ContactEme: "",
    yearandSection: "",
    email: email,
    firstname: "",
    finishactivity: 0,
    gender: "",
    lastname: "",
    lastLogin: generateTimestamp(),
    middlename: "",
    phoneno: "",
    timestamp: generateTimestamp(),
    uid: uid,
    userType: "",
    srcode: "",
    verifiedTimeStamp: generateTimestamp(),
    verificationStatus: true,
  });
}

// Function to remove added rows, reset form, and close modal
function removeAddedRows() {
  var inputRow = document.getElementById("inputrow");
  // Remove all added rows in the inputRow container
  while (inputRow.firstChild) {
    inputRow.removeChild(inputRow.firstChild);
  }

  var form = document.getElementById("formadd");
  form.reset(); // Reset the form
  resetTotalRows();
  // Close the specific modal
  closeSpecificModal(); // Function to close a specific modal
}

// Function to close a specific modal by updating display property
function closeSpecificModal() {
  var modal = document.getElementById("myModalm");
  modal.style.display = "none";
}
// Close the modal when the Close button is clicked
document.getElementById("closeButtonrr").addEventListener("click", function () {
  var modal = document.getElementById("myModalrr");
  modal.style.display = "none";
});

document
  .getElementById("precoedButtonrr")
  .addEventListener("click", function () {
    // Display a confirmation dialog when clicking the Proceed button
    if (confirm("Are you sure?")) {
      // If 'Yes' is clicked, show success message
      alert("Success");
      resetTotalRows();
      // Close all open modals
      closeAllModals();
    }
  });
document.getElementById("closeModalEx").addEventListener("click", function () {
  closeSpecificModal();
  resetTotalRows();
  removeAddedRows();
});
// Function to close all open modals
function closeAllModals() {
  var modals = document.querySelectorAll(".modalrr");
  modals.forEach(function (modal) {
    modal.style.display = "none";
  });
}
function resetTotalRows() {
  var totalRowsElement = document.getElementById("totalRows");
  totalRowsElement.innerText = "0";
}
