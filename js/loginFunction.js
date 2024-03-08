import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

import firebaseConfig from "/js/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const loginBtn = document.getElementById("btnlogin");

loginBtn.addEventListener("click", async function () {
  const email = document.getElementById("usernamefield").value;
  const password = document.getElementById("passwordfield").value;

  try {
    // Sign in the user using Firebase Authentication
    const adminCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const admin = adminCredential.user;

    // Retrieve the reference to the specific node using the user's UID
    const supAdminRef = ref(db, `SuperAdminAcc/${admin.uid}`);

    // Retrieve the data from the SubAdminAcc node with the provided UID
    const snapshot = await get(supAdminRef);

    // Check if the snapshot exists and compare the passwords
    if (snapshot.exists()) {
      const adminData = snapshot.val();
      // Assuming 'email' is stored and is used for comparison
      if (adminData.email === email) {
        // Authentication successful, redirect to the dashboard
        window.location.href = "supdashboard.html";
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } else {
      alert("Admin Account not found.");
    }
  } catch (error) {
    console.error("Firebase authentication error:", error);
    alert("Login failed. Please check your credentials or try again later.");
  }
});
document
  .getElementById("usernamefield")
  .addEventListener("keydown", handleEnterKey);
document
  .getElementById("passwordfield")
  .addEventListener("keydown", handleEnterKey);

// Function to handle Enter key press
function handleEnterKey(event) {
  if (event.key === "Enter") {
    // Trigger the click event on the login button
    loginBtn.click();
  }
}
let firstname = document.getElementById("firstname");
let middlename = document.getElementById("middlename");
let lastname = document.getElementById("lastname");
let password = document.getElementById("password");
let gender = document.getElementById("gender");
let email = document.getElementById("email");
let submit = document.getElementById("subbtn");

submit.addEventListener("click", RegisterUser);

// Add an event listener for keydown on input fields
[
  firstname,
  middlename,
  lastname,
  gender,
  email,
  password,
  confirmpassword,
].forEach((inputField) => {
  inputField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      // Trigger the click event on the submit button
      submit.click();
    }
  });
});

function RegisterUser(event) {
  event.preventDefault();

  const confirmed = window.confirm(
    "Are you sure you want to create this account?"
  );

  if (!confirmed) {
    // If the user cancels the confirmation, do nothing
    return;
  }
  // Get the values of the input fields
  const firstnameValue = firstname.value.trim();
  const middlenameValue = middlename.value.trim();
  const lastnameValue = lastname.value.trim();
  const genderValue = gender.value;
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const confirmPasswordValue = confirmpassword.value.trim();

  // Check if any field is empty
  if (
    !firstnameValue ||
    !middlenameValue ||
    !lastnameValue ||
    !genderValue ||
    !emailValue ||
    !passwordValue ||
    !confirmPasswordValue
  ) {
    alert("Please input all the fields");
    return;
  }
  if (
    !validateName(firstnameValue) ||
    !validateName(middlenameValue) ||
    !validateName(lastnameValue)
  ) {
    alert("Please input valid names without numbers or special characters.");
    return;
  }

  const passwordRegex =
    /^(?=.*[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

  if (!passwordRegex.test(passwordValue)) {
    alert(
      "Password must be alpha-numeric and have a minimum length of 8 characters."
    );
    return;
  }

  // Check if the password and confirm password match
  if (passwordValue !== confirmPasswordValue) {
    alert("Passwords do not match. Please re-type your password.");
    return;
  }
  function validateName(name) {
    const nameRegex = /^[A-Za-z.'-, ]+$/;
    return nameRegex.test(name);
  }
  // Continue with user registration
  createUserWithEmailAndPassword(auth, emailValue, passwordValue)
    .then((userCredential) => {
      // User registered successfully
      const user = userCredential.user;

      // Store additional user data in the database
      saveUserData(user.uid);
    })
    .catch((error) => {
      // Handle errors here
      alert(error.message);
      console.error(error);
    });
}

function saveUserData(userId) {
  const dbRef = ref(db);

  // Create a reference to the specific user's data using their unique ID
  const userRef = ref(db, `SuperAdminAcc/${userId}`);

  // Set the user data in the database including the role as "admin"
  set(userRef, {
    firstname: firstname.value,
    middlename: middlename.value,
    lastname: lastname.value,
    gender: gender.value,
    email: email.value,
    role: "superadmin",
    birthday: "",
    ImageProfile: "",
    contactNumber: "",
    position: "",
  })
    .then(() => {
      alert("Admin Added Successfully");
      const secondModal = document.getElementById("mySecondModal");
      secondModal.style.display = "none";
    })
    .catch((error) => {
      alert("Error: " + error);
      console.error(error);
    });
}
// Get the modal elements
const modal = document.getElementById("myModalsupreg");
const openModalBtn = document.getElementById("openModalBtnsupreg");
const closeModalBtn = document.getElementById("closeModalsupreg");
const proceedBtn = document.getElementById("proceedBtn");
const secondModal = document.getElementById("mySecondModal");

// Open the modal
openModalBtn.addEventListener("click", () => {
  modal.style.display = "block";
});
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
  clearInputFields();
});

// Function to clear input fields
function clearInputFields() {
  document.getElementById("textNumberFieldCode").value = "";
}

// Close the modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    clearInputFields();
  }
});
const textNumberField = document.getElementById("textNumberFieldCode");

textNumberField.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    // Trigger the click event on the proceedBtn
    proceedBtn.click();
  }
});
// Functionality when clicking the Proceed button in the first modal
proceedBtn.addEventListener("click", async () => {
  const textNumberValue = document.getElementById("textNumberFieldCode").value;
  clearInputFields();
  try {
    // Fetch the correct code from Firebase
    const codeSnapshot = await get(ref(db, "security/code"));
    const correctCode = codeSnapshot.val();

    // Check if the entered value matches the correct code
    if (textNumberValue === correctCode) {
      // Hide the first modal
      modal.style.display = "none";

      // Show the second modal
      secondModal.style.display = "block";

      // Add functionality to close the second modal
      const closeSecondModalBtn = document.getElementById("closeSecondModal");
      // Close the second modal
      closeSecondModalBtn.addEventListener("click", () => {
        secondModal.style.display = "none";
        clearSecondModalFields();
      });

      // Function to clear input fields in the second modal
      function clearSecondModalFields() {
        document.getElementById("firstname").value = "";
        document.getElementById("middlename").value = "";
        document.getElementById("lastname").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirmpassword").value = "";
      }

      // Close the second modal if clicking outside the modal content
      window.addEventListener("click", (event) => {
        if (event.target === secondModal) {
          secondModal.style.display = "none";
          clearSecondModalFields();
        }
      });
    } else {
      // Optionally, provide feedback for an incorrect input value
      alert("Incorrect input. Please enter the correct code.");
    }
  } catch (error) {
    console.error("Firebase error:", error);
    alert("An error occurred. Please try again later.");
  }
});
