import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  onChildRemoved,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  // You can handle authentication state changes here
  if (user) {
    console.log("User is logged in:", user);
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
let submit = document.getElementById("subbtn");

submit.addEventListener("click", RegisterAdmin);

document
  .getElementById("MainForm")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      // Prevent the default behavior (form submission) to avoid a page reload
      event.preventDefault();

      // Trigger the click event of the submit button
      document.getElementById("subbtn").click();
    }
  });
function RegisterAdmin(event) {
  event.preventDefault();
  if (!areAllFieldsFilled()) {
    alert("Please fill out all the fields.");
    return;
  }
  const firstNameValue = firstname.value;
  if (!isValidName(firstNameValue)) {
    alert("Invalid first name. Please enter a valid name.");
    return;
  }

  // Validate middle name
  const middleNameValue = middlename.value;
  if (!isValidName(middleNameValue)) {
    alert("Invalid middle name. Please enter a valid name.");
    return;
  }

  // Validate last name
  const lastNameValue = lastname.value;
  if (!isValidName(lastNameValue)) {
    alert("Invalid last name. Please enter a valid name.");
    return;
  }
  // Get the password and confirmation password input values
  const passwordValue = password.value;
  const confirmPasswordValue = confirmpassword.value;

  const passwordRegex =
    /^(?=.*[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

  // Check if the password meets the criteria
  if (!passwordRegex.test(passwordValue)) {
    alert(
      "Password must be alphanumeric and have a minimum length of 8 characters."
    );
    return;
  }

  // Check if the confirmation password matches the password
  if (passwordValue !== confirmPasswordValue) {
    alert("Confirmation password does not match the password.");
    return;
  }

  function isValidName(name) {
    // Allow letters, spaces, dot (.), comma (,), and hyphen (-)
    const nameRegex = /^[A-Za-z.,-\s]+$/;
    return nameRegex.test(name);
  }
  createUserWithEmailAndPassword(auth, email.value, passwordValue)
    .then((userCredential) => {
      // User registered successfully
      const user = userCredential.user;

      // Store additional user data in the database
      saveUserData(user.uid);

      // Clear form fields
      resetFormFields();

      // Logout the current user
      auth
        .signOut()
        .then(() => {
          // Alert for successful account creation and logout
          alert(
            "Account created successfully. You need to login again for authentication purposes."
          );

          // Redirect to login page
          window.location.href = "login/suplogin.html";
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

function areAllFieldsFilled() {
  // Define an array of field elements
  const fieldElements = [
    firstname,
    middlename,
    lastname,
    password,
    gender,
    campus,
    email,
    confirmpassword, // Assuming confirmpassword is declared somewhere
  ];

  // Check if any field is empty
  return fieldElements.every((field) => field.value.trim() !== "");
}

function resetFormFields() {
  document.getElementById("MainForm").reset();
}

function generateTimestamp() {
  const currentDate = new Date();
  return currentDate.toISOString();
}
function saveUserData(userId) {
  const dbRef = ref(db);

  // Create a reference to the specific user's data using their unique ID
  const userRef = ref(db, `SubAdminAcc/${userId}`);

  // Set the user data in the database including the role as "admin"
  set(userRef, {
    firstname: firstname.value,
    middlename: middlename.value,
    lastname: lastname.value,
    gender: gender.value,
    campus: campus.value,
    email: email.value,
    role: "subadmin",
    birthday: "",
    contactNumber: "",
    position: "",
    ImageProfile: "",
  })
    .then(() => {
      alert("Admin Added Successfully");
    })
    .catch((error) => {
      alert("Error: " + error);
      console.error(error);
    });
}

const UsersRef = ref(db, "SubAdminAcc");

const initializeDataTable = () => {
  if ($.fn.DataTable.isDataTable("#example")) {
    $("#example").DataTable().destroy();
  }

  const dataTable = $("#example").DataTable({
    columns: [
      { data: "userUID" },
      { data: "email" },
      { data: "fullname" },
      { data: "campus" },
      { data: "Details" },
    ],
    order: [[2, "asc"]],
  });

  return dataTable;
};

const dataTable = initializeDataTable();

const populateDataTable = () => {
  onAuthStateChanged(auth, (user) => {
    // Check if the user is authenticated
    if (user) {
      onValue(UsersRef, (snapshot) => {
        const usersData = snapshot.val();
  
        dataTable.clear();
  
        if (usersData) {
          Object.keys(usersData).forEach((userId) => {
            const user = usersData[userId];
            $("#example tbody").on("click", "button.view-button", function () {
              const userId = dataTable.row($(this).parents("tr")).data().userUID;
              viewUserDetails(userId);
            });
            dataTable.row.add({
              userUID: userId,
              email: user.email,
              fullname: `${user.lastname}, ${user.firstname}, ${user.middlename}`,
              campus: user.campus,
              Details:
                '<button class="btn btn-danger view-button" data-toggle="modal" data-target="#exampleModalLong">View</button>',
            });
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
  const userRef = ref(db, `SubAdminAcc/${userId}`);
  currentUserId = userId;
  get(userRef)
    .then((snapshot) => {
      const userData = snapshot.val();

      console.log("ImageProfile URL:", userData.ImageProfile);

      const modalBodyContent = document.getElementById("modalBodyContent");

      if (userData) {
        modalBodyContent.innerHTML = `
              <div class="image-container">
  <img src="${
    userData.ImageProfile || "img/profile.png"
  }" class="rounded-image">
</div>

          <p><u><h5>Information:</h5></u></p>
         <p><strong>Last Name:<input class="form-control" id="lastNamefield" type="text" value="${
           userData.lastname || "N/A"
         }" readonly></input></strong></p>
        <p><strong>First Name:<input class="form-control" id="firstNamefield" type="text" value="${
          userData.firstname || "N/A"
        }" readonly></input></strong></p>
        <p><strong>Middle Name:<input class="form-control" id="middleNamefield" type="text" value="${
          userData.middlename || "N/A"
        }" readonly></input></strong></p>
                   <p><strong>Email:<input class="form-control" id ="emailfield" type="text" value="${
                     userData.email || "N/A"
                   }" readonly></input></strong></p>
                        <p><strong>Campus:<input class="form-control" id ="campusfield" type="text" value="${
                          userData.campus || "N/A"
                        }" readonly></input></strong></p>
          <p><strong>Gender:<input class="form-control" id ="genderfield" type="text" value="${
            userData.gender || "N/A"
          }" readonly></input></strong></p>
          <p><strong>Birthday:<input class="form-control" id ="birthDayfield" type="text" value="${
            userData.birthday || "N/A"
          }" readonly></input></strong></p>
          <p><strong>Position:<input class="form-control" id ="positionfield" type="text" value="${
            userData.position || "N/A"
          }" readonly></input></strong></p>
          <p><strong>Contact Number:<input class="form-control" id ="contactNumfield" type="text" value="${
            userData.contactNumber || "N/A"
          }" readonly></input></strong></p>

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
      $("#exampleModalLong").modal("hide");
    });
  }
  const closeButtonex = document.getElementById("closeModalpo");

  if (closeButtonex) {
    closeButtonex.addEventListener("click", () => {
      $("#exampleModalLong").modal("hide");
    });
  }
  // Remove outside click close modal functionality
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
    const userRef = ref(db, `SubAdminAcc/${uidToDelete}`);

    // Remove the user data and corresponding child under User Verification
    Promise.all([remove(userRef)])
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

eventListenersAdded = true;
const editButton = document.getElementById("editBtn");
if (editButton) {
  editButton.addEventListener("click", toggleEditMode);
}

function toggleEditMode() {
  const inputFields = document.querySelectorAll(".form-control");
  const excludedFields = ["emailfield"];
  const saveButton = document.getElementById("saveBtn");

  inputFields.forEach((field) => {
    const fieldId = field.id;

    // Check if the field is not in the excludedFields array
    if (!excludedFields.includes(fieldId)) {
      field.readOnly = !field.readOnly;
    }
  });

  if (!saveButton) {
    // Add "Save" button if not already added
    const saveButton = document.createElement("button");
    saveButton.id = "saveBtn";
    saveButton.className = "btn btn-primary";
    saveButton.innerText = "Save";
    saveButton.addEventListener("click", saveChanges);
    document.getElementById("modalBodyContent").appendChild(saveButton);
  } else {
    saveButton.style.display =
      saveButton.style.display === "none" ? "block" : "none";
  }
}
// Function to save changes to the Users node
function saveChanges() {
  const userIdToUpdate = currentUserId;
  const userRefToUpdate = ref(db, `SubAdminAcc/${userIdToUpdate}`);

  const updatedUserData = {
    firstname: document.getElementById("firstNamefield").value,
    middlename: document.getElementById("middleNamefield").value,
    lastname: document.getElementById("lastNamefield").value,
    birthday: document.getElementById("birthDayfield").value,
    gender: document.getElementById("genderfield").value,
    contactNumber: document.getElementById("contactNumfield").value,
    campus: document.getElementById("campusfield").value,
    position: document.getElementById("positionfield").value,
  };

  // Update the user data in the database
  update(userRefToUpdate, updatedUserData)
    .then(() => {
      alert("Changes saved successfully!");
      // Remove the "Save" button after saving changes
      const saveButton = document.getElementById("saveBtn");
      if (saveButton) {
        saveButton.parentNode.removeChild(saveButton);
      }
    })
    .catch((error) => {
      alert("Error saving changes: " + error);
      console.error(error);
    });
}
populateDataTable();
