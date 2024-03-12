import {
  onAuthStateChanged,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

onAuthStateChanged(auth, (user) => {
  // You can handle authentication state changes here
  if (user) {
    console.log("User is logged in:", user);
  } else {
    console.log("User is logged out");
  }
});

function submitForm() {
   const currentUsers = auth.currentUsers;
  if (!currentUsers) {
    // If user is not logged in, display alert and return
alert("Please log in to continue. Only logged-in admin can submit posts.");

    return;
  }

  // Get data from the form fields
  const titleEvent = document.getElementById("titlepost").value;
  const category = document.getElementById("category").value;
  const startDate = formatDate(document.getElementById("startdate").value);
  const endDate = formatDate(document.getElementById("enddate").value);
  const introduction = document.getElementById("introductionPost").value;
  const objective = document.getElementById("objectivePost").value;
  const instruction = document.getElementById("instructionPost").value;
  const location = document.getElementById("Locationpost").value;
  const recipient = document.getElementById("recipient").value;
  const paymentMethod = document.getElementById("paymentMethod").value;
  const targetCampus = document.getElementById("campusTarget").value;
  const activePoints = parseInt(document.getElementById("actpts").value);
  const targetParticipant = parseInt(
    document.getElementById("targparty").value
  );
  const facilitatorsName = document.getElementById("facname").value;
  const facilitatorsContactOrEmail =
    document.getElementById("facnamecon").value;

  // Get the current user's UID
  const currentUser = auth.currentUser;
  const uploadersUID = currentUser ? currentUser.uid : "";

  // Prepare data for upload
  const eventData = {
    uploadersUID: uploadersUID,
    titleEvent: titleEvent,
    category: category,
    startDate: startDate,
    endDate: endDate,
    location: location,
    intro: introduction,
    objective: objective,
    instruction: instruction,
    fundcollected: 0,
    paymentMethod: paymentMethod,
    paymentRecipient: recipient,
    verificationStatus: true,
    approveTimeStamp: generateTimestamp(),
    campus: targetCampus,
    targetparty: targetParticipant,
    activepoints: activePoints,
    facilitatorsName: facilitatorsName,
    facilitatorsContactorEmail: facilitatorsContactOrEmail,
  };

  // Get the file input element
  const fileInput = document.getElementById("filePost");

  if (!validateForm()) {
    // Display alert if validation fails
    alert("Please fill in all required fields.");
    return;
  }

  function formatDate(dateTime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(dateTime)
      .toLocaleString("en-US", options)
      .replace(/,/g, "");
  }
  // Check if a file is selected
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const timestamp = new Date().getTime();
    const storagePath = `Poster Civic Images/${timestamp}_${file.name}`; // Using timestamp as part of the file name
    const storageRefPath = storageRef(storage, storagePath);

    // Upload file to Firebase Storage
    uploadBytes(storageRefPath, file)
      .then((snapshot) => {
        console.log("File uploaded successfully");
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadURL) => {
        // Add the downloadURL to the "image" property in eventData
        eventData.image = downloadURL;

        // Upload data to the Firebase Realtime Database
        const newEventRef = push(ref(db, "Upload_Engagement"));
        set(newEventRef, eventData)
          .then(() => {
            console.log("Event data uploaded successfully");
            alert("Event data uploaded successfully");

            document.getElementById("campusTarget").value = "";
            document.getElementById("imagepost").setAttribute("hidden", "true");

            // Hide payment-related elements
            const paymentLabel = document.getElementById("paymentLabel");
            const paymentMethod = document.getElementById("paymentMethod");
            const recipientLabel = document.getElementById("recipientLabel");
            const recipient = document.getElementById("recipient");

            if (paymentLabel && paymentMethod && recipientLabel && recipient) {
              paymentLabel.style.display = "none";
              paymentMethod.style.display = "none";
              recipientLabel.style.display = "none";
              recipient.style.display = "none";
            }

            clearFormFields();
            clearCheckBoxes();
            // Dismiss the modal
            document.getElementById("postModalpo").style.display = "none";
          })
          .catch((error) => {
            console.error("Error uploading event data:", error);
            alert("Error uploading event data. Please try again.");
          });
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        alert("Error uploading file. Please try again.");
      });
  } else {
    const newEventRef = push(ref(db, "Upload_Engagement"));
    set(newEventRef, eventData)
      .then(() => {
        console.log("Event data uploaded successfully");
        alert("Event data uploaded successfully");

        clearCheckBoxes();
        clearFormFields();

        // Dismiss the modal
        document.getElementById("postModalpo").style.display = "none";
      })
      .catch((error) => {
        console.error("Error uploading event data:", error);
        alert("Error uploading event data. Please try again.");
      });
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const imagePreview = document.getElementById("imagepost"); // Declare imagePreview here

  document
    .getElementById("openPostModal")
    .addEventListener("click", function () {
      document.getElementById("postModalpo").style.display = "block";
      preselectUserCampus();
    });

  document.getElementById("postBtn").addEventListener("click", function () {
    if (confirm("Are you sure you want to submit the form?")) {
      submitForm();
    }
  });

  document
    .getElementById("cancelButton")
    .addEventListener("click", function () {
      document.getElementById("postModalpo").style.display = "none";
      clearFormFields();
      clearCampusSelection();
    });

  // Add event listener to close the modal
  document
    .getElementById("closeModalpo")
    .addEventListener("click", function () {
      document.getElementById("postModalpo").style.display = "none";
      clearFormFields();
      clearCampusSelection();
    });

  var modal = document.getElementById("myModalnm");

  // Get the Ok button inside the modal
  var okButton = document.getElementById("okButton");

  // When the Ok button is clicked, close the modal and update campusTarget
  okButton.addEventListener("click", function () {
    // Close the "myModalnm" modal
    modal.style.display = "none";

    // Get the form elements and campusTarget element
    var campusForm = document.getElementById("campusForm");
    var campusTarget = document.getElementById("campusTarget");

    // Get the selected campuses
    var selectedCampuses = [];
    var checkboxes = campusForm.querySelectorAll(".checkboxna:checked");
    checkboxes.forEach(function (checkbox) {
      selectedCampuses.push(checkbox.value);
    });

    // Update the campusTarget element with the selected campuses
    campusTarget.value = selectedCampuses.join(", ");
  });

  // Add event listener to campusTarget element
  var campusTargetInput = document.getElementById("campusTarget");
  campusTargetInput.addEventListener("click", function () {
    // Get the form elements in the "myModalnm" modal
    const campusForm = document.getElementById("campusForm");

    // Get the current selected campuses from campusTarget
    const currentSelectedCampuses = campusTarget.value.split(", ");

    // Update checkboxes based on the current selected campuses
    const checkboxes = campusForm.querySelectorAll(".checkboxna");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = currentSelectedCampuses.includes(checkbox.value);
    });

    // Open the "myModalnm" modal
    modal.style.display = "block";
  });

  var span = document.getElementsByClassName("closenm")[0];
  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
  function preselectUserCampus() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userUID = currentUser.uid;
      const userRef = ref(db, "SubAdminAcc/" + userUID);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const userCampus = userData.campus;

            // Get the form elements in the "myModalnm" modal
            const campusForm = document.getElementById("campusForm");

            // Get all checkboxes
            const checkboxes = campusForm.querySelectorAll(".checkboxna");

            // Check the checkbox corresponding to the user's campus
            checkboxes.forEach((checkbox) => {
              if (checkbox.value === userCampus) {
                checkbox.checked = true;
                checkbox.disabled = true; // Disable the checkbox
              }
            });

            // Update the campusTarget element with the selected campus
            const campusTarget = document.getElementById("campusTarget");
            campusTarget.value = userCampus;
          } else {
            console.error("User data not found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      console.error("Current user not found.");
    }
  }

  function selectAll() {
    var checkboxes = document.querySelectorAll(".checkboxna");
    checkboxes.forEach(function (checkbox) {
      checkbox.checked = true;
    });
  }

  function deselectAll() {
    var checkboxes = document.querySelectorAll(".checkboxna");
    var currentUserCampus = document.getElementById("campusTarget").value;
    checkboxes.forEach(function (checkbox) {
      if (checkbox.value !== currentUserCampus) {
        // Skip deselecting current user's campus
        checkbox.checked = false;
      }
    });
  }

  var selectAllBtn = document.getElementById("selectAllBtnn");
  var deselectAllBtn = document.getElementById("deselectAllBtnn");

  selectAllBtn.addEventListener("click", selectAll);
  deselectAllBtn.addEventListener("click", deselectAll);
  document
    .getElementById("cancelButton")
    .addEventListener("click", function () {
      document.getElementById("postModalpo").style.display = "none";
      clearCampusSelection();
    });

  // Add event listener to close the modal
  document
    .getElementById("closeModalpo")
    .addEventListener("click", function () {
      document.getElementById("postModalpo").style.display = "none";
      clearCampusSelection();
    });
  document.getElementById("filePost").addEventListener("change", function () {
    // Get the file input element
    const fileInput = document.getElementById("filePost");

    // Check if a file is selected
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e) {
        // Update the image source with the selected file's data
        imagePreview.src = e.target.result;

        // Show the image
        imagePreview.removeAttribute("hidden");
      };

      // Read the selected file as a data URL
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      // Hide the image if no file is selected
      imagePreview.setAttribute("hidden", "true");
    }
  });

  // Add event listener to campuspost element
  document.getElementById("category").addEventListener("change", function () {
    // Get the selected value from campuspost
    const selectedValue = this.value;

    // Get payment-related elements
    const paymentLabel = document.getElementById("paymentLabel");
    const paymentMethod = document.getElementById("paymentMethod");
    const recipientLabel = document.getElementById("recipientLabel");
    const recipient = document.getElementById("recipient");

    // Check the selected value and update visibility accordingly
    if (selectedValue === "Fund Raising" || selectedValue === "Donation") {
      // Show payment-related elements
      paymentLabel.style.display = "block";
      paymentMethod.style.display = "block";
      recipientLabel.style.display = "block";
      recipient.style.display = "block";
    } else {
      // Hide payment-related elements
      paymentLabel.style.display = "none";
      paymentMethod.style.display = "none";
      recipientLabel.style.display = "none";
      recipient.style.display = "none";
    }
  });

  var okButton = document.getElementById("okButton");

  // When the Ok button is clicked, close the modal and update campusTarget
  okButton.addEventListener("click", function () {
    // Close the "myModalnm" modal
    modal.style.display = "none";

    // Get the form elements and campusTarget element
    var campusForm = document.getElementById("campusForm");
    var campusTarget = document.getElementById("campusTarget");

    // Get the selected campuses
    var selectedCampuses = [];
    var checkboxes = campusForm.querySelectorAll(".checkboxna:checked");
    checkboxes.forEach(function (checkbox) {
      selectedCampuses.push(checkbox.value);
    });

    // Update the campusTarget element with the selected campuses
    campusTarget.value = selectedCampuses.join(", ");
  });
});
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

function clearCampusSelection() {
  var campusForm = document.getElementById("campusForm");
  var campusTarget = document.getElementById("campusTarget");
  var checkboxes = campusForm.querySelectorAll(".checkboxna:checked");

  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  campusTarget.value = "";
}
function clearCheckBoxes() {
  // Get the form elements in the "myModalnm" modal
  const campusForm = document.getElementById("campusForm");

  // Clear all checkboxes
  const checkboxes = campusForm.querySelectorAll(".checkboxna:checked");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
}
function clearFormFields() {
  // Clear all form fields here
  document.getElementById("titlepost").value = "";
  document.getElementById("category").value = "";
  document.getElementById("startdate").value = "";
  document.getElementById("enddate").value = "";
  document.getElementById("introductionPost").value = "";
  document.getElementById("objectivePost").value = "";
  document.getElementById("instructionPost").value = "";
  document.getElementById("Locationpost").value = "";
  document.getElementById("campusTarget").value = "";
  document.getElementById("actpts").value = "";
  document.getElementById("targparty").value = "";
  document.getElementById("facname").value = "";
  document.getElementById("facnamecon").value = "";
  document.getElementById("filePost").value = "";
  document.getElementById("paymentMethod").value = "Select";
  document.getElementById("recipient").value = "";
  document.getElementById("paymentLabel").style.display = "none";
  document.getElementById("paymentMethod").style.display = "none";
  document.getElementById("recipient").style.display = "none";
  document.getElementById("recipientLabel").style.display = "none";
  document.getElementById("imagepost").setAttribute("hidden", "true");
}
function validateForm() {
  // List of required field IDs
  const requiredFields = [
    "titlepost",
    "category",
    "startdate",
    "enddate",
    "introductionPost",
    "objectivePost",
    "instructionPost",
    "Locationpost",
    "campusTarget",
    "actpts",
    "targparty",
    "filePost",
    "facname",
    "facnamecon",
  ];

  // Check if all required fields are filled in
  for (const fieldId of requiredFields) {
    const fieldElement = document.getElementById(fieldId);

    // Check if the element exists before accessing its value
    if (!fieldElement) {
      console.error(`Element with ID '${fieldId}' not found.`);
      return false;
    }

    const fieldValue = fieldElement.value.trim();
    if (fieldValue === "") {
      return false; // Return false if any required field is empty
    }
  }

  // Get the selected category value
  const selectedCategory = document.getElementById("category").value;

  // Additional validation for "Fund Raising" or "Donation" category
  if (selectedCategory === "Fund Raising" || selectedCategory === "Donation") {
    const paymentMethod = document.getElementById("paymentMethod");

    // Check if the element exists before accessing its value
    if (!paymentMethod) {
      console.error("Element with ID 'paymentMethod' not found.");
      return false;
    }

    const paymentMethodValue = paymentMethod.value.trim();
    const recipient = document.getElementById("recipient");

    // Check if the element exists before accessing its value
    if (!recipient) {
      console.error("Element with ID 'recipient' not found.");
      return false;
    }

    const recipientValue = recipient.value.trim();

    // Check if payment-related fields are filled in
    if (paymentMethodValue === "" || recipientValue === "") {
      alert("Please fill in all required fields for payment.");
      return false;
    }
  }

  // Get the date and time inputs
  const startdate = new Date(document.getElementById("startdate").value);
  const enddate = new Date(document.getElementById("enddate").value);

  const now = new Date();
  if (startdate && startdate <= now) {
    alert("Please select a start date and time in the future.");
    return false;
  }

  if (enddate && enddate <= startdate) {
    alert(
      "Please select an end date and time greater than the start date and time."
    );
    return false;
  }

  return true;
}
