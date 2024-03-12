import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  remove,
  push,
  update,
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

let currentUserUID;
onAuthStateChanged(auth, (user) => {
  // You can handle authentication state changes here
  if (user) {
    // Check if the authenticated user is a SuperAdminAcc
    const superAdminRef = ref(db, `SuperAdminAcc/${user.uid}`);
    get(superAdminRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("SuperAdminAcc is logged in:", user);
          currentUserUID = user.uid;
        } else {
          // If not a SuperAdminAcc, log out the user
          console.log("User is not a SuperAdminAcc. Logging out...");
          currentUserUID = null;
          auth.signOut();
        }
      })
      .catch((error) => {
        console.error("Error checking SuperAdminAcc:", error);
      });
  } else {
    console.log("User is logged out");
  }
});

let firstname = document.getElementById("firstname");
let middlename = document.getElementById("middlename");
let lastname = document.getElementById("lastname");
let password = document.getElementById("password");
let gender = document.getElementById("gender");
let campus = document.getElementById("campus");
let email = document.getElementById("email");
let submit = document.getElementById("createbtnacc"); // Update the submit button ID

submit.addEventListener("click", RegisterUser);

function RegisterUser(event) {
  event.preventDefault();
  const confirmed = window.confirm(
    "Are you sure you want to create this account?"
  );

  if (!confirmed) {
    // If the user cancels the confirmation, do nothing
    return;
  }
  const passwordValue = password.value;
  const confirmPasswordValue = confirmpassword.value;

  if (
    !firstname.value ||
    !middlename.value ||
    !lastname.value ||
    !password.value ||
    !confirmpassword.value ||
    !gender.value ||
    !campus.value ||
    !email.value
  ) {
    alert("Please fill in all the fields.");
    return;
  }

  if (
    !validateName(firstname.value) ||
    !validateName(middlename.value) ||
    !validateName(lastname.value)
  ) {
    alert(
      "Invalid name format. Only alphabets, commas, hyphens, periods, and spaces are allowed."
    );
    return;
  }
  if (!validatePassword(passwordValue)) {
    alert(
      "Invalid password format. Password must be alphanumeric or symbols and have a minimum length of 8 characters."
    );
    return;
  }
  if (passwordValue !== confirmPasswordValue) {
    alert("Passwords do not match. Please make sure the passwords match.");
    return;
  }
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      // User registered successfully
      const user = userCredential.user;

      // Store additional user data in the database
      saveUserData(user.uid);

      // Logout the current user
      auth
        .signOut()
        .then(() => {
          // Alert for successful registration and logout
          alert(
            "User registered successfully. You need to login again for authentication purposes."
          );

          // Redirect to login page
          window.location.href = "index.html";
        })
        .catch((error) => {
          // Handle errors in logout
          console.error("Error logging out:", error);
        });
    })
    .catch((error) => {
      // Handle errors here
      alert(error.message);
      console.error(error);
    });
}

function validatePassword(password) {
  const regex = /^(?=.*[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
  return regex.test(password);
}
function validateName(name) {
  const regex = /^[A-Za-z,-.\s]+$/;
  return regex.test(name);
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

function saveUserData(userId) {
  const dbRef = ref(db);
  const userRef = ref(db, `Users/${userId}`);

  // Set the user data in the database including the verificationStatus as "true"
  set(userRef, {
    firstname: firstname.value,
    middlename: middlename.value,
    lastname: lastname.value,
    gender: gender.value,
    campus: campus.value,
    email: email.value,
    CurrentEngagement: 0,
    verificationStatus: true,
    verifiedTimeStamp: generateTimestamp(),
    uid: userId,
    ImageProfile: "",
    ContactEme: "",
    timestamp: generateTimestamp(),
    address: "",
    birthday: "",
    course: "",
    srcode: "",
    lastLogin: generateTimestamp(),
    yearandSection: "",
    userType: "",
    phoneno: "",
    nstp: "",
    activepts: 0,
    finishactivity: 0,
  })
    .then(() => {
      alert("User Added Successfully");
      // You can add any additional actions after user creation if needed
    })
    .catch((error) => {
      alert("Error: " + error);
      console.error(error);
    });
}

const UsersRef = ref(db, "Users");

const initializeDataTable = () => {
  if ($.fn.DataTable.isDataTable("#example")) {
    $("#example").DataTable().destroy();
  }

  const dataTable = $("#example").DataTable({
    columns: [
      { data: "userUID" },
      { data: "srcode" },
      { data: "fullname" },
      { data: "email" },
      { data: "gender" },
      { data: "yearandSection" },
      { data: "campus" },
      { data: "userType" },
      { data: "nstp" },
      { data: "Details" },
    ],
    // Add the following lines to specify sorting based on the lastname column
    columnDefs: [
      { targets: 2, type: "string" }, // Assuming the lastname column is at index 1
    ],
    order: [[2, "asc"]], // Order by lastname in ascending order
  });

  return dataTable;
};

const dataTable = initializeDataTable();

const populateDataTable = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is authenticated, populate the table
      onValue(UsersRef, (snapshot) => {
        const usersData = snapshot.val();

        dataTable.clear();

        if (usersData) {
          const currentTimestamp = generateTimestamp(); // Get the current timestamp

          Object.keys(usersData).forEach((userId) => {
            const user = usersData[userId];

            if (user.verificationStatus) {
              // Check if user has verificationStatus set to true
              const lastLoginTimestamp = new Date(user.lastLogin);

              // Check if lastLogin is within the last year
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

              if (lastLoginTimestamp > oneYearAgo) {
                // User's lastLogin is within the last year
                $("#example tbody").on("click", "button.view-button", function () {
                  const userId = dataTable
                    .row($(this).parents("tr"))
                    .data().userUID;
                  viewUserDetails(userId);
                });

                // Replace empty or undefined values with "N/A"
                const fullName = `${user.lastname || "N/A"}, ${
                  user.firstname || "N/A"
                }, ${user.middlename || "N/A"}`;
                const srcode = user.srcode || "N/A";
                const email = user.email || "N/A";
                const gender = user.gender || "N/A";
                const yearAndSection = user.yearandSection || "N/A";
                const campus = user.campus || "N/A";
                const userType = user.userType || "N/A";
                const nstp = user.nstp || "N/A";

                dataTable.row.add({
                  userUID: userId,
                  srcode: srcode,
                  fullname: fullName,
                  email: email,
                  gender: gender,
                  yearandSection: yearAndSection,
                  campus: campus,
                  userType: userType,
                  nstp: nstp,
                  Details:
                    '<button class="btn btn-danger view-button" data-toggle="modal" data-target="#exampleModalLong">View</button>',
                });
              }
            }
          });

          dataTable.draw();
        } else {
          console.log("No data available in Users collection.");
          dataTable.clear().draw();
        }
      });

      onChildRemoved(UsersRef, (removedSnapshot) => {
        const removedUserId = removedSnapshot.key;

        dataTable
          .rows((idx, data) => data.userUID === removedUserId)
          .remove()
          .draw();
      });
    } else {
      // User is not authenticated, clear the table
      dataTable.clear().draw();
    }
  });
};

let eventListenersAdded = false;
let currentUserId;
function viewUserDetails(userId) {
  const userRef = ref(db, `Users/${userId}`);
  currentUserId = userId;
  get(userRef)
    .then((snapshot) => {
      const userData = snapshot.val();

      console.log("ImageProfile URL:", userData.ImageProfile);

      const modalBodyContent = document.getElementById("modalBodyContent");
      if (userData) {
        const imageSrc = userData.ImageProfile || "img/profile.png";
        modalBodyContent.innerHTML = `
        <div class="image-container"><img src="${imageSrc}" class="rounded-image"></div>
        <p><u><h5>Personal Information:</h5></u></p>
        <p><strong>Last Name:<input class="form-control" id="lastNamefield" type="text" value="${
          userData.lastname || "N/A"
        }" readonly></input></strong></p>
        <p><strong>First Name:<input class="form-control" id="firstNamefield" type="text" value="${
          userData.firstname || "N/A"
        }" readonly></input></strong></p>
        <p><strong>Middle Name:<input class="form-control" id="middleNamefield" type="text" value="${
          userData.middlename || "N/A"
        }" readonly></input></strong></p>
        <p><strong>Email:<input class="form-control" id="emailfield" type="text" value="${
          userData.email || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>User Type:<input class="form-control" id="userTypefield" type="text" value="${
          userData.userType || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Date of Birth:<input class="form-control" id="birthDayfield" type="text" value="${
          userData.birthday || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Gender:<input class="form-control" id="genderfield" type="text" value="${
          userData.gender || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Address:<input class="form-control" id="addressfield" type="text" value="${
          userData.address || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Personal Contact:<input class="form-control" id="personalConfield" type="text" value="${
          userData.phoneno || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Emergency Contact:<input class="form-control" id="emergencyConfield" type="text" value="${
          userData.ContactEme || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Current Engagement:<input class="form-control" id="currentEngfield" type="text" value="${
          userData.CurrentEngagement || "0"
        }" readonly ></input></strong></p>
        <p><strong>Finish Activity:<input class="form-control" id="finishActfield" type="text" value="${
          userData.finishactivity || "0"
        }" readonly ></input></strong></p>
        <p><strong>Active Points:<input class="form-control" id="activePtsfield" type="text" value="${
          userData.activepts || "0"
        }" readonly ></input></strong></p>
        <p><u><h5>Academic Information:</h5></u></p>
        <p><strong>Campus:<input class="form-control" id="campusfield" type="text" value="${
          userData.campus || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>SR-Code:<input class="form-control" id="srCodefield" type="text" value="${
          userData.srcode || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Course:<input class="form-control" id="coursefield" type="text" value="${
          userData.course || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>Year and Section:<input class="form-control" id="yearandSectfield" type="text" value="${
          userData.yearandSection || "N/A"
        }" readonly ></input></strong></p>
        <p><strong>NSTP Program:<input class="form-control" id="nstpfield" type="text" value="${
          userData.nstp || "N/A"
        }" readonly ></input></strong></p>
        <!-- Add more user details here as needed -->
    `;
      } else {
        modalBodyContent.innerHTML = `<p>No user details found.</p>`;
      }
      // Show the modal
      $("#exampleModalLong").modal("show");
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
    });
  const closeButton = document.getElementById("closemodalbtn");

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      // Remove the saveButton when the modal is closed
      const saveButton = document.getElementById("saveBtn");
      if (saveButton) {
        saveButton.remove();
        saveButtonAdded = false;
      }

      $("#exampleModalLong").modal("hide");
    });
  }
  const closeButtonpo = document.getElementById("closeModalpo");

  if (closeButtonpo) {
    closeButtonpo.addEventListener("click", () => {
      // Remove the saveButton when the modal is closed
      const saveButton = document.getElementById("saveBtn");
      if (saveButton) {
        saveButton.remove();
        saveButtonAdded = false;
      }

      $("#exampleModalLong").modal("hide");
    });
  }
  $("#exampleModalLong").modal({
    backdrop: "static", // Prevents modal from closing when clicking outside
    keyboard: false, // Disables the keyboard close functionality
  });
}
let terminationButtonClicked = false;
const terminationButton = document.getElementById("terminate");

// Add event listener only if it hasn't been added before
if (!terminationButtonClicked) {
  terminationButton.addEventListener("click", deleteUserData);
  terminationButtonClicked = true;
}

function deleteUserData() {
  const uidToDelete = currentUserId;

  if (confirm("Are you sure you want to delete the data of this Account?")) {
    // Delete user data from Realtime Database
    const userRef = ref(db, `Users/${uidToDelete}`);
    const userVerificationRef = ref(db, `User_Verification/${uidToDelete}`);

    // Remove the user data and corresponding child under User Verification
    Promise.all([remove(userRef), set(userVerificationRef, null)])
      .then(() => {
        // Close the modal after removing user data
        $("#exampleModalLong").modal("hide");

        // Show success alert
        alert("Account Data Deleted Successfully");
      })
      .catch((error) => {
        // Handle errors
        alert("Error deleting account data: " + error);
        console.error(error);
      });
  }
}

const revokeButton = document.getElementById("revokeBtn");

if (revokeButton) {
  revokeButton.addEventListener("click", revokeUserVerification);
}

function revokeUserVerification() {
  const uidToRevoke = currentUserId;

  const confirmation = window.confirm(
    "Are you sure to revoke this User's Account?"
  );

  if (confirmation) {
    const userRefToRevoke = ref(db, `Users/${uidToRevoke}`);
    const userVerificationRefToRevoke = ref(
      db,
      `User_Verification/${uidToRevoke}`
    );

    // Set verificationStatus to false and delete the corresponding child under User Verification
    Promise.all([
      update(userRefToRevoke, {
        verificationStatus: false,
        verifiedTimeStamp: "", // You can set this to an appropriate value if needed
      }),
      set(userVerificationRefToRevoke, null),
    ])
      .then(() => {
        // Close the modal after revoking verification
        $("#exampleModalLong").modal("hide");

        // Show success alert
        alert("Verification status revoked successfully!");
      })
      .catch((error) => {
        // Handle errors
        alert("Error revoking verification status: " + error);
        console.error(error);
      });
  } else {
    // If the user cancels the confirmation, do nothing
    return;
  }
}

// Set the flag to true to indicate that event listeners have been added
eventListenersAdded = true;
const editButton = document.getElementById("editBtn");
if (editButton) {
  editButton.addEventListener("click", toggleEditMode);
}
let saveButtonAdded = false;
function toggleEditMode() {
  const inputFields = document.querySelectorAll(".form-control");
  const excludedFields = [
    "emailfield",
    "currentEngfield",
    "finishActfield",
    "activePtsfield",
    // Add more field IDs to exclude as needed
  ];
  const saveButton = document.getElementById("saveBtn");

  inputFields.forEach((field) => {
    const fieldId = field.id;

    // Check if the field is not in the excludedFields array
    if (!excludedFields.includes(fieldId)) {
      field.readOnly = !field.readOnly;
    }
  });

  if (!saveButtonAdded) {
    // Add "Save" button if not already added
    const saveButton = document.createElement("button");
    saveButton.id = "saveBtn";
    saveButton.className = "btn btn-primary";
    saveButton.innerText = "Save";
    saveButton.addEventListener("click", saveChanges);
    document.getElementById("modalBodyContent").appendChild(saveButton);
    saveButtonAdded = true;
  } else {
    saveButton.style.display =
      saveButton.style.display === "none" ? "block" : "none";
  }
}
// Function to save changes to the Users node
function saveChanges() {
  const userIdToUpdate = currentUserId;
  const userRefToUpdate = ref(db, `Users/${userIdToUpdate}`);

  const updatedUserData = {
    firstname: document.getElementById("firstNamefield").value,
    middlename: document.getElementById("middleNamefield").value,
    lastname: document.getElementById("lastNamefield").value,
    userType: document.getElementById("userTypefield").value,
    birthday: document.getElementById("birthDayfield").value,
    gender: document.getElementById("genderfield").value,
    address: document.getElementById("addressfield").value,
    phoneno: document.getElementById("personalConfield").value,
    ContactEme: document.getElementById("emergencyConfield").value,
    campus: document.getElementById("campusfield").value,
    srcode: document.getElementById("srCodefield").value,
    course: document.getElementById("coursefield").value,
    yearandSection: document.getElementById("yearandSectfield").value,
    nstp: document.getElementById("nstpfield").value,
    // Add more fields as needed
  };

  // Update the user data in the database
  update(userRefToUpdate, updatedUserData)
    .then(() => {
      alert("Changes saved successfully!");
      toggleEditMode(); // Call toggleEditMode to reset the form fields
    })
    .catch((error) => {
      alert("Error saving changes: " + error);
      console.error(error);
    });
}

populateDataTable();
