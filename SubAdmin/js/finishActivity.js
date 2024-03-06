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

const tableBody = document.querySelector("#tableevents tbody");
let rowNumber = 1;

// Function to open the modal and display event details
function openEventModal(eventData) {
  const modal = document.getElementById("eventModalupcom");
  const eventDetailsContainer = document.getElementById("eventDetailsupcom");

  // Function to determine whether to show payment fields
  function shouldShowPaymentFields(category) {
    return category === "Fund Raising" || category === "Donation";
  }

  function generatePaymentFieldsHTML(eventData) {
    if (shouldShowPaymentFields(eventData.category)) {
      return `
                 <div id="payDiv">
                <p id="payRecipLabel"><strong>Payment Recipient:</strong>
                    <input class="form-control" id="payRecip" type="text" value="${
                      eventData.paymentRecipient || "N/A"
                    }" readonly>
                </p>
              <p  id="fundLabel">
  <strong>Fund Collected:</strong>
  <input class="form-control" id="fundCollectedField" type="text" value="₱ ${
    formatDecimal(eventData.fundcollected) || "N/A"
  }" readonly>
</p>
                <p id="payMethLabel"><strong>Payment Method:</strong>
                    <input class="form-control" id="payMeth" type="text" value="${
                      eventData.paymentMethod || "N/A"
                    }" readonly>
                </p>
                </div>
            `;
    }
    return "";
  }

  eventDetailsContainer.innerHTML = `
     <img src="${
       eventData.image || "../img/placeholderpic.jpg"
     }" alt="Event Image" class="eventpic" id="upcompostpic" />
<strong id="labelImage" style="display: none; margin-top:10px;">Choose an Image:</strong>
<input class="form-control" type="file" id="imagePost" name="image" accept="image/*" required style="display: none; margin-bottom:10px;">

        
         <p>
    <strong>Category:</strong>
    <select class="form-control" id="categoryField" name="categoryField" required disabled >
      <option value=""  disabled selected>
        Choose a Category
      </option>
      <option value="Tree Planting" ${
        eventData.category === "Tree Planting" ? "selected" : ""
      }>
        Tree Planting
      </option>
      <option value="Fund Raising" id="fund" ${
        eventData.category === "Fund Raising" ? "selected" : ""
      }>
        Fund Raising
      </option>
      <option value="Donation" id="donation" ${
        eventData.category === "Donation" ? "selected" : ""
      }>
        Donation
      </option>
      <option value="Clean Up Drive" ${
        eventData.category === "Clean Up Drive" ? "selected" : ""
      }>
        Clean Up Drive
      </option>
      <option value="Feeding Program" ${
        eventData.category === "Feeding Program" ? "selected" : ""
      }>
        Feeding Program
      </option>
      <option value="Relief Operation" ${
        eventData.category === "Relief Operation" ? "selected" : ""
      }>
        Relief Operation
      </option>
      <option value="Seminar Training" ${
        eventData.category === "Seminar Training" ? "selected" : ""
      }>
        Seminar Training
      </option>
      <option value="Teaching Literacy" ${
        eventData.category === "Teaching Literacy" ? "selected" : ""
      }>
        Teaching Literacy
      </option>
     
    </select>

  </p>
        <p><strong>Title:</strong>
        <input class="form-control" id="titleField" type="text" value="${
          eventData.titleEvent
            ? eventData.titleEvent.replace(/"/g, "&quot;")
            : "N/A"
        }" readonly>
    </p>
        
        <p><strong>Campus:</strong>
          <input class="form-control" id="campusField" type="text" value="${
            eventData.campus || "N/A"
          }" readonly>
        </p>
        <p><strong>Location:</strong>
          <input class="form-control" id="locationField" type="text" value="${
            eventData.location
              ? eventData.location.replace(/"/g, "&quot;")
              : "N/A"
          }" readonly>
        </p>
        <p><strong>Start Date:</strong>
          <input class="form-control" id="startDateField" type="text" value="${
            eventData.startDate || "N/A"
          }" readonly>
        </p>
        <p><strong>End Date:</strong>
          <input class="form-control" id="endDateField" type="text" value="${
            eventData.endDate || "N/A"
          }" readonly>
        </p>

        <p><strong>Introduction:</strong></p>
        <textarea class="form-control" rows="7" id="introductionField" style="margin-bottom:15px" readonly>${
          eventData.intro ? eventData.intro.replace(/"/g, "&quot;") : "N/A"
        }</textarea>
        <p><strong>Objectives:</strong></p>
        <textarea class="form-control" rows="7" id="objectiveField" style="margin-bottom:15px" readonly>${
          eventData.objective
            ? eventData.objective.replace(/"/g, "&quot;")
            : "N/A"
        }</textarea>
        <p><strong>Instruction:</strong></p>
        <textarea class="form-control" rows="7" id="instructionField" style="margin-bottom:15px" readonly>${
          eventData.instruction
            ? eventData.instruction.replace(/"/g, "&quot;")
            : "N/A"
        }</textarea>
      <p>
  <strong>Target Participant:</strong>
  <input
    class="form-control"
    id="targetField"
    type="text"
    value="${eventData.targetparty || "N/A"}"
    readonly
    pattern="[0-9]+"
    oninput="this.value = this.value.replace(/[^0-9]/g, '');"
  >
</p>    
        <p><strong>Facilitators Name:</strong>
          <input class="form-control" id="facilitatorField" type="text" value="${
            eventData.facilitatorsName
              ? eventData.facilitatorsName.replace(/"/g, "&quot;")
              : "N/A"
          }" readonly>
        </p>
        <p><strong>Facilitators Contractor Email:</strong>
          <input class="form-control" id="facilitatorNField" type="text" value="${
            eventData.facilitatorsContactorEmail
              ? eventData.facilitatorsContactorEmail.replace(/"/g, "&quot;")
              : "N/A"
          }" readonly>
        </p>
     <p>
  <strong>Active Points:</strong>
  <input
    class="form-control"
    id="activePtsField"
    type="text"
    value="${eventData.activepoints}"
    readonly
    pattern="[0-9]+"
    oninput="this.value = this.value.replace(/[^0-9]/g, '');"
  >
</p>

<p style="display: none;"  id="payRecipLabel">
    <strong>Payment Recipient:</strong>
    <input class="form-control" id="payRecip" type="text" value="${
      eventData.paymentRecipient
        ? eventData.paymentRecipient.replace(/"/g, "&quot;")
        : "N/A"
    }" readonly>
</p>
<p style="display: none;" id="payMethLabel">
    <strong>Payment Method:</strong>
    <input class="form-control" id="payMeth" type="text" value="${
      eventData.paymentMethod || "N/A"
    }" readonly>
</p>
<p style="display: none;" id="fundLabel">
  <strong>Fund Collected:</strong>
  <input class="form-control" id="fundCollectedField" type="text" value="₱ ${
    formatDecimal(eventData.fundcollected) || "N/A"
  }" readonly>
</p>
       ${generatePaymentFieldsHTML(eventData)}
      `;

  // Show the modal
  modal.style.display = "block";
}

function closeModalEventModal() {
  const modal = document.getElementById("eventModalupcom");
  modal.style.display = "none"; // Hide the modal

  // Reset buttons and fields to their original state
  resetButtonsAndFields();
}
function formatDecimal(value) {
  if (value !== undefined && value !== null) {
    // Use toFixed(2) to round to 2 decimal places
    return parseFloat(value).toFixed(2);
  }
  return null;
}
function resetButtonsAndFields() {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const terminateBtn = document.getElementById("terminate");

  const categoryField = document.getElementById("categoryField");
  categoryField.setAttribute("disabled", true);
  // Reset button text and remove event listeners
  editBtn.textContent = "Edit";
  editBtn.removeEventListener("click", enableEditing);
  editBtn.removeEventListener("click", cancelEditing);
  saveBtn.removeEventListener("click", saveChanges);

  // Hide save button
  saveBtn.style.display = "none";

  // Adjust terminate button position
  terminateBtn.style.right = "68%";

  editableFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (
      fieldId === "upcompostpic" ||
      fieldId === "startDateField" ||
      fieldId === "endDateField"
    ) {
      field.setAttribute("readonly", true);
    } else {
      field.readOnly = true;
    }
  });

  // Add event listener for the edit button
  editBtn.addEventListener("click", enableEditing);
}
// Add click event listener to the close button of "eventModalupcom"
const closeModalButtonEventModal =
  document.getElementById("closemodalbtnupcom");
closeModalButtonEventModal.addEventListener("click", closeModalEventModal);

document.addEventListener("click", function (event) {
  if (event.target && event.target.classList.contains("vieweventdet")) {
    const clickedRow = event.target.closest("tr");
    const eventId = clickedRow.getAttribute("data-event-id");

    // Remove the 'selected-event' class from all rows
    const allRows = document.querySelectorAll("tr.selected-event");
    allRows.forEach((row) => row.classList.remove("selected-event"));

    // Add the 'selected-event' class to the clicked row
    clickedRow.classList.add("selected-event");

    // Reference the specific event node in Firebase
    const eventRef = ref(db, `Upload_Engagement/${eventId}`);
    const participantsRef = ref(
      db,
      `Upload_Engagement/${eventId}/Participants`
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
    function updateNotificationBadge(count) {
      const notificationBadge = document.getElementById("notificationBadge");
      const formattedCount = formatNumber(count);
      notificationBadge.innerText = formattedCount;
    }

    // Listen for changes in the Participants child
    onValue(participantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const participantsCount = Object.keys(snapshot.val()).length;
        updateNotificationBadge(participantsCount);
      } else {
        // Handle the case where there are no participants
        updateNotificationBadge(0);
      }
    });
    get(eventRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const eventData = snapshot.val();
          openEventModal(eventData);

          // Remove previous event listener for termination button
          const terminateButton = document.getElementById("terminate");
          terminateButton.removeEventListener("click", onDeleteClick);

          // Add a new event listener for termination button
          terminateButton.addEventListener("click", onDeleteClick);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error("Error getting data:", error);
      });
  }
});

function onDeleteClick() {
  const confirmation = confirm("Are you sure to delete this Engagement?");
  if (confirmation) {
    // Find the clicked row
    const clickedRow = document.querySelector("tr.selected-event");

    if (clickedRow) {
      const eventId = clickedRow.getAttribute("data-event-id");
      const eventRef = ref(db, `Upload_Engagement/${eventId}`);

      // Remove the event from Firebase
      set(eventRef, null)
        .then(() => {
          alert("Engagement deleted successfully!");
          closeModalEventModal(); // Close the modal after deletion
        })
        .catch((error) => {
          console.error("Error deleting engagement:", error);
        });
    } else {
      console.error("Clicked row is null");
    }
  }
}

function hasEventEnded(endDate) {
  const currentDateTime = new Date();
  const eventEndDate = new Date(endDate);
  return eventEndDate < currentDateTime;
}
function handleCategoryChange() {
  const selectedCategory = categoryField.value;
  const payRecipField = document.getElementById("payRecip");
  const payMethField = document.getElementById("payMeth");
  const payRecipLabel = document.getElementById("payRecipLabel");
  const payMethLabel = document.getElementById("payMethLabel");
  const fundLabel = document.getElementById("fundLabel");
  const fundCollectedField = document.getElementById("fundCollectedField");
  const payDiv = document.getElementById("payDiv");
  // Check if the selected category is "Fund Raising" or "Donation"
  if (selectedCategory === "Fund Raising" || selectedCategory === "Donation") {
    // Show the payment fields and labels
    payRecipField.style.display = "block";
    payMethField.style.display = "block";
    payRecipLabel.style.display = "block";
    payMethLabel.style.display = "block";
    fundLabel.style.display = "block";
    fundCollectedField.style.display = "block";
    payDiv.style.display = "none";
  } else {
    // Hide the payment fields and labels
    payRecipField.style.display = "none";
    payMethField.style.display = "none";
    payRecipLabel.style.display = "none";
    payMethLabel.style.display = "none";
    fundLabel.style.display = "none";
    fundCollectedField.style.display = "none";
    payDiv.style.display = "block";
  }
}
const categoryFilterSelect = document.querySelector("#categoryFilter select");
const searchInput = document.querySelector("#searchfilter input");

categoryFilterSelect.addEventListener("change", function () {
  let selectedCategory = this.value === "All Category" ? "" : this.value;
  const searchTerm = searchInput.value.trim();
  handleFilterChange(searchTerm, selectedCategory);
});

searchInput.addEventListener("input", function () {
  const searchTerm = this.value.trim();
  const selectedCategory =
    categoryFilterSelect.value === "All Category"
      ? ""
      : categoryFilterSelect.value;
  handleFilterChange(searchTerm, selectedCategory);
});

function handleFilterChange(searchTerm, selectedCategory) {
  const currentUser = auth.currentUser;

  if (currentUser) {
    const currentUserUID = currentUser.uid;
    const currentUserRef = ref(db, `SubAdminAcc/${currentUserUID}`);
    get(currentUserRef)
      .then((userSnapshot) => {
        const currentUserCampus = userSnapshot.val().campus;
        displayEventData(searchTerm, currentUserCampus, selectedCategory);
      })
      .catch((error) => {
        console.error("Error fetching current user's data:", error);
      });
  } else {
    console.log("User is logged out");
    displayEventData(searchTerm, "", selectedCategory);
  }
}

function displayEventData(
  searchTerm = "",
  currentUserCampus = "",
  selectedCategory = ""
) {
  const uploadEngagementRef = ref(db, "Upload_Engagement");

  onValue(uploadEngagementRef, (snapshot) => {
    tableBody.innerHTML = "";
    rowNumber = 1;

    const events = [];

    snapshot.forEach((childSnapshot) => {
      const uploadData = childSnapshot.val();
      if (
        uploadData.hasOwnProperty("verificationStatus") &&
        uploadData.verificationStatus === true &&
        uploadData.campus && // Ensure campus field exists
        uploadData.campus.includes(currentUserCampus) // Check if current user's campus is included in the event's campus
      ) {
        const {
          campus,
          category,
          startDate,
          endDate,
          titleEvent,
          image,
          location,
          // Add other fields you want to retrieve from Firebase
        } = uploadData;

        // Check if the event has already ended
        if (hasEventEnded(endDate)) {
          // Check if the selected category is present in the category field
          if (
            selectedCategory === "" ||
            category.toLowerCase().includes(selectedCategory.toLowerCase())
          ) {
            events.push({
              id: childSnapshot.key,
              startDate: new Date(startDate),
              data: uploadData,
            });
          }
        }
      }
    });

    events.sort((a, b) => b.startDate - a.startDate);

    // Filter events based on the search term in any field
    const filteredEvents = events.filter((event) =>
      Object.values(event.data).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Insert filtered events into the table
    if (filteredEvents.length > 0) {
      filteredEvents.forEach((event) => {
        const {
          campus,
          category,
          startDate,
          endDate,
          titleEvent,
          image,
          location,
        } = event.data;

        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
          <td>${rowNumber}</td>
          <td style="width: 120px; height: 80px; overflow: hidden;">
            <img src="${
              image || "../img/placeholderpic.jpg"
            }" class="eventpic" alt="Event Image" style="width: 100%; height: 100%; object-fit: cover;">
          </td>
          <td>${titleEvent || "N/A"}</td>
          <td>${category || "N/A"}</td>
          <td>${location || "N/A"}</td>
          <td style="line-height: 1.5;">${campus || "N/A"}</td>
          <td>${startDate.toLocaleString() || "N/A"} -- ${endDate || "N/A"}</td>
          <td>
            <button type="button" class="vieweventdet" title="View Details" data-toggle="tooltip">View</button>
          </td>
        `;
        newRow.setAttribute("data-event-id", event.id); // Set the event ID as an attribute in the table row
        rowNumber++;
      });
    } else {
      // Add default row when there are no events to display
      const defaultRow = tableBody.insertRow();
      defaultRow.id = "defaultRow";
      defaultRow.innerHTML = `
        <td id="numid">0</td>
        <td>
          <a href="#">
            <img src="../img/cleaning.jpg" class="eventpic" alt="Avatar" id="eventpicimg" />
          </a>
        <td colspan="7" style="text-align: center;">
          Currently, no concluded civic engagements are available.
        </td>
      `;
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Get the current user's UID
    const currentUserUID = user.uid;

    // Reference to the current user's data in SubAdminAcc
    const currentUserRef = ref(db, `SubAdminAcc/${currentUserUID}`);

    // Fetch the current user's data
    get(currentUserRef)
      .then((userSnapshot) => {
        // Extract the current user's campus from the snapshot
        const currentUserCampus = userSnapshot.val().campus;

        // Call displayEventData function with the current user's campus
        displayEventData("", currentUserCampus);
      })
      .catch((error) => {
        console.error("Error fetching current user's data:", error);
      });
  } else {
    console.log("User is logged out");
  }
});

const editableFields = [
  "upcompostpic",
  "titleField",
  "categoryField",
  "campusField",
  "locationField",
  "payMeth",
  "payRecip",
  "startDateField",
  "endDateField",
  "introductionField",
  "objectiveField",
  "instructionField",
  "targetField",
  "facilitatorField",
  "facilitatorNField",
  "activePtsField",
];
let eventRef;
function handleImageSelection() {
  const imagePost = document.getElementById("imagePost");
  const upcompostpic = document.getElementById("upcompostpic");

  const selectedImage = imagePost.files[0];
  const imageURL = URL.createObjectURL(selectedImage);

  // Update the image source in upcompostpic
  upcompostpic.src = imageURL;
}
const originalValues = {};
function enableEditing() {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const campusField = document.getElementById("campusField");
  const terminateBtn = document.getElementById("terminate");
  const categoryField = document.getElementById("categoryField");

  saveBtn.style.display = "inline-block";
  terminateBtn.style.right = "58%";
  // Enable editing for each field
  editableFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);

    if (fieldId === "upcompostpic") {
      // Enable selecting an image
      field.removeAttribute("readonly");
    } else if (fieldId === "startDateField" || fieldId === "endDateField") {
      // Enable editing with type="datetime-local"
      field.removeAttribute("readonly");
      const dateValue = field.value;
      const formattedDate = reverseFormatDateTime(dateValue);
      field.value = formattedDate;
    } else {
      // Enable editing for other fields
      field.readOnly = false;
    }
  });
  editableFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    originalValues[fieldId] = field.value;
  });
  // Remove the current event listener for the edit button
  editBtn.removeEventListener("click", enableEditing);

  // Add a new event listener for the save button
  saveBtn.addEventListener("click", saveChanges);

  // Change edit button text and add click event listener for cancel
  editBtn.textContent = "Cancel";
  editBtn.addEventListener("click", cancelEditing);

  const labelImage = document.getElementById("labelImage");
  const imagePost = document.getElementById("imagePost");

  // Show labelImage and imagePost
  labelImage.style.display = "block";
  imagePost.style.display = "block";

  imagePost.addEventListener("change", handleImageSelection);
  campusField.removeAttribute("disabled");
  campusField.readOnly = false;
  campusField.addEventListener("click", showCampusModal);
  categoryField.addEventListener("change", handleCategoryChange);
  categoryField.removeAttribute("disabled");
  // Call the handleCategoryChange function initially to set the initial state
  handleCategoryChange();
}

function setInitialCampusSelection() {
  const campusField = document.getElementById("campusField");
  const campusForm = document.getElementById("campusForm");

  // Split the campusField value into an array of selected campuses
  const selectedCampuses = campusField.value.split(", ");

  // Check the checkboxes based on the selected campuses
  Array.from(campusForm.elements).forEach((checkbox) => {
    checkbox.checked = selectedCampuses.includes(checkbox.value);
  });
}

function showCampusModal() {
  // Display the campus modal
  const campusModal = document.getElementById("myModalnm");
  campusModal.style.display = "block";

  // Set the initial state of checkboxes based on the current value in campusField
  setInitialCampusSelection();

  // Disable keyboard input for the campusField
  const campusField = document.getElementById("campusField");
  campusField.readOnly = true;

  // Add event listener for the "Ok" button in the campus modal
  const okButton = document.getElementById("okButton");
  okButton.addEventListener("click", updateCampusField);
}

function updateCampusField() {
  const campusForm = document.getElementById("campusForm");
  const selectedCampuses = Array.from(campusForm.elements)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  // Update the #campusField with selected campuses separated by commas
  const campusField = document.getElementById("campusField");
  campusField.value = selectedCampuses.join(", ");

  // Close the campus modal
  const campusModal = document.getElementById("myModalnm");
  campusModal.style.display = "none";
}
function cancelEditing() {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const terminateBtn = document.getElementById("terminate");

  saveBtn.style.display = "none";
  terminateBtn.style.right = "68%";

  // Remove the current event listener for the cancel button
  editBtn.removeEventListener("click", cancelEditing);

  // Add a new event listener for the edit button
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", enableEditing);

  // Disable editing for each field and revert to original values
  editableFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (
      fieldId === "upcompostpic" ||
      fieldId === "startDateField" ||
      fieldId === "endDateField"
    ) {
      field.setAttribute("readonly", true);
    } else {
      field.readOnly = true;
    }

    // Revert to the original value
    field.value = originalValues[fieldId];
  });

  const labelImage = document.getElementById("labelImage");
  const imagePost = document.getElementById("imagePost");

  // Show labelImage and imagePost
  labelImage.style.display = "none";
  imagePost.style.display = "none";

  // Disable editing for categoryField and campusField
  const categoryField = document.getElementById("categoryField");
  const campusField = document.getElementById("campusField");
  categoryField.setAttribute("disabled", true);
  campusField.setAttribute("disabled", true);
}

function saveChanges() {
  const confirmation = confirm("Are you sure to save the changes?");
  const imagePost = document.getElementById("imagePost");
  const upcompostpic = document.getElementById("upcompostpic");

  // Check if a new image is selected
  if (imagePost.files.length > 0) {
    const file = imagePost.files[0];
    const timestamp = new Date().getTime();
    const storagePath = `Poster Civic Images/${timestamp}_${file.name}`;
    const storageRefPath = storageRef(storages, storagePath);

    // Upload the new image to Firebase Storage
    uploadBytes(storageRefPath, file).then((snapshot) => {
      // Get the download URL of the uploaded image
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        // Update the image URL in Firebase Realtime Database
        update(eventRef, {
          image: downloadURL,
        });

        // Update the image source in upcompostpic
        upcompostpic.src = downloadURL;
      });
    });
  }

  if (confirmation) {
    // Validation for startDate and endDate
    const startDateInput = document.getElementById("startDateField");
    const endDateInput = document.getElementById("endDateField");

    // Check if the entered date values are valid
    if (
      isNaN(new Date(startDateInput.value).getTime()) ||
      isNaN(new Date(endDateInput.value).getTime())
    ) {
      alert("Please enter valid date and time.");
      return;
    }

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    const now = new Date();

    if (endDate <= startDate) {
      alert(
        "Please select an end date and time greater than the start date and time."
      );
      return;
    }

    const eventId = document
      .querySelector("tr.selected-event")
      .getAttribute("data-event-id");
    eventRef = ref(db, `Upload_Engagement/${eventId}`); // Update eventRef

    // Update the values in Firebase
    update(eventRef, {
      titleEvent: document.getElementById("titleField").value,
      category: document.getElementById("categoryField").value,
      campus: document.getElementById("campusField").value,
      location: document.getElementById("locationField").value,
      startDate: reverseFormatDateTime(startDateInput.value),
      endDate: reverseFormatDateTime(endDateInput.value),
      intro: document.getElementById("introductionField").value,
      paymentMethod: document.getElementById("payMeth").value,
      paymentRecipient: document.getElementById("payRecip").value,
      objective: document.getElementById("objectiveField").value,
      instruction: document.getElementById("instructionField").value,
      targetparty: parseInt(document.getElementById("targetField").value, 10),
      facilitatorsName: document.getElementById("facilitatorField").value,
      facilitatorsContactorEmail:
        document.getElementById("facilitatorNField").value,
      activepoints: parseInt(
        document.getElementById("activePtsField").value,
        10
      ),
    })
      .then(() => {
        alert("Changes saved successfully!");
        closeModalEventModal(); // Close the modal after saving changes
      })
      .catch((error) => {
        console.error("Error saving changes:", error);
      });
  }
}
document
  .getElementById("closeModaldetail")
  .addEventListener("click", function () {
    document.getElementById("eventModalupcom").style.display = "none";
    resetButtonsAndFields();
  });
function reverseFormatDateTime(dateTimeString) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  };

  const reverseFormattedDate = new Date(dateTimeString)
    .toLocaleDateString("en-US", options)
    .replace(/,/g, ""); // Remove commas from the formatted date string

  return reverseFormattedDate;
}

const editBtn = document.getElementById("editBtn");
editBtn.addEventListener("click", enableEditing);
displayEventData();

function selectAll() {
  var checkboxes = document.querySelectorAll(".checkboxna");
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = true;
  });
}

function deselectAll() {
  var checkboxes = document.querySelectorAll(".checkboxna");
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });
}

var selectAllBtn = document.getElementById("selectAllBtnn");
var deselectAllBtn = document.getElementById("deselectAllBtnn");

selectAllBtn.addEventListener("click", selectAll);
deselectAllBtn.addEventListener("click", deselectAll);

var okButton = document.getElementById("okButton");

var span = document.getElementById("closeCampusModal");
var modal = document.getElementById("myModalnm");

span.onclick = function () {
  modal.style.display = "none";
};

okButton.addEventListener("click", function () {
  modal.style.display = "none";

  var campusForm = document.getElementById("campusForm");
  var campusTarget = document.getElementById("campusTarget");

  var selectedCampuses = [];
  var checkboxes = campusForm.querySelectorAll(".checkboxna:checked");
  checkboxes.forEach(function (checkbox) {
    selectedCampuses.push(checkbox.value);
  });

  // Update the campusTarget element with the selected campuses
  campusTarget.value = selectedCampuses.join(", ");
});
function initRealtimeListener(uid, eventId) {
  const participantRef = ref(
    db,
    `Upload_Engagement/${eventId}/Participants/${uid}`
  );

  onValue(participantRef, (snapshot) => {
    const participantData = snapshot.val();

    // Check if the participant has already joined and attended
    const isAlreadyAttended =
      participantData.joined && participantData.attendedStamp;

    // Update the button style based on real-time changes
    const button = document.querySelector(
      `#atdbtn[data-uid="${uid}"][data-event-id="${eventId}"]`
    );
    if (button) {
      button.classList.remove("btn-success", "btn-danger");
      button.classList.add(isAlreadyAttended ? "btn-danger" : "btn-success");
      button.textContent = isAlreadyAttended ? "Cancel" : "Confirm";
    }
  });
}
function updateOverallRating(eventId) {
  const ratingsRef = ref(db, `Upload_Engagement/${eventId}/Ratings`);

  return get(ratingsRef).then((ratingsSnapshot) => {
    let totalRating = 0;
    let numberOfRatings = 0;

    if (ratingsSnapshot.exists()) {
      ratingsSnapshot.forEach((rating) => {
        const ratingData = rating.val();
        // Check if the UID has a valid rating
        if (ratingData.message) {
          // Add the rating to the total
          totalRating += getStarRatingValue(ratingData.message);
          numberOfRatings++;
        }
      });
    }

    // Calculate the overall average rating
    const overallAverage =
      numberOfRatings > 0 ? totalRating / numberOfRatings : 0;

    // Update the element with the overall average rating
    const overallOutputElement = document.getElementById("overallOutput");
    overallOutputElement.innerText = overallAverage.toFixed(1); // Display with one decimal place
  });
}
// Helper function to convert star rating messages to numerical values
function getStarRatingValue(message) {
  switch (message.toLowerCase()) {
    case "very dissatisfied":
      return 0.0;
    case "dissatisfied":
      return 1.0;
    case "ok":
      return 2.0;
    case "average":
      return 3.0;
    case "satisfied":
      return 4.0;
    case "very satisfied":
      return 5.0;
    default:
      return 0.0; // Treat unknown messages as 0.0 rating
  }
}

function getStarRating(message) {
  switch (message.toLowerCase()) {
    case "very dissatisfied":
      return "&#9734;&#9734;&#9734;&#9734;&#9734;"; // 5 empty stars
    case "dissatisfied":
      return "&#9733;&#9734;&#9734;&#9734;&#9734;"; // 1 gold star
    case "ok":
      return "&#9733;&#9733;&#9734;&#9734;&#9734;"; // 2 gold stars
    case "average":
      return "&#9733;&#9733;&#9733;&#9734;&#9734;"; // 3 gold stars
    case "satisfied":
      return "&#9733;&#9733;&#9733;&#9733;&#9734;"; // 4 gold stars
    case "very satisfied":
      return "&#9733;&#9733;&#9733;&#9733;&#9733;"; // 5 gold stars
    default:
      return ""; // No stars for unknown messages
  }
}
function updateStarRatingPercentages(eventId) {
  const ratingsRef = ref(db, `Upload_Engagement/${eventId}/Ratings`);

  return get(ratingsRef).then((ratingsSnapshot) => {
    let totalRatings = 0;
    let starCounts = {
      "very satisfied": 0,
      satisfied: 0,
      average: 0,
      ok: 0,
      dissatisfied: 0,
      "very dissatisfied": 0,
    };

    if (ratingsSnapshot.exists()) {
      ratingsSnapshot.forEach((rating) => {
        const ratingData = rating.val();
        // Check if the UID has a valid rating
        if (ratingData.message) {
          const starRating = getStarRatingValue(ratingData.message);
          starCounts[ratingData.message.toLowerCase()] += 1;
          totalRatings += 1; // Count each UID's rating
        }
      });
    }

    // Calculate percentages
    const fiveStarPercentage =
      totalRatings === 0
        ? 0
        : (starCounts["very satisfied"] / totalRatings) * 100;
    const fourStarPercentage =
      totalRatings === 0 ? 0 : (starCounts["satisfied"] / totalRatings) * 100;
    const threeStarPercentage =
      totalRatings === 0 ? 0 : (starCounts["average"] / totalRatings) * 100;
    const twoStarPercentage =
      totalRatings === 0 ? 0 : (starCounts["ok"] / totalRatings) * 100;
    const oneStarPercentage =
      totalRatings === 0
        ? 0
        : (starCounts["dissatisfied"] / totalRatings) * 100;
    const zeroStarPercentage =
      totalRatings === 0
        ? 0
        : (starCounts["very dissatisfied"] / totalRatings) * 100;

    // Update the element with the calculated percentages
    document.getElementById(
      "fiveStar"
    ).innerText = `${fiveStarPercentage.toFixed(1)}%`;
    document.getElementById(
      "fourStar"
    ).innerText = `${fourStarPercentage.toFixed(1)}%`;
    document.getElementById(
      "threeStar"
    ).innerText = `${threeStarPercentage.toFixed(1)}%`;
    document.getElementById("twoStar").innerText = `${twoStarPercentage.toFixed(
      1
    )}%`;
    document.getElementById("oneStar").innerText = `${oneStarPercentage.toFixed(
      1
    )}%`;
    document.getElementById(
      "zeroStar"
    ).innerText = `${zeroStarPercentage.toFixed(1)}%`;
  });
}

function updateStarRatingWidths(eventId) {
  const ratingsRef = ref(db, `Upload_Engagement/${eventId}/Ratings`);

  return get(ratingsRef).then((ratingsSnapshot) => {
    let totalRatings = 0;
    let starCounts = {
      "very satisfied": 0,
      satisfied: 0,
      average: 0,
      ok: 0,
      dissatisfied: 0,
      "very dissatisfied": 0,
    };

    if (ratingsSnapshot.exists()) {
      ratingsSnapshot.forEach((rating) => {
        const ratingData = rating.val();
        // Check if the UID has a valid rating
        if (ratingData.message) {
          const starRating = getStarRatingValue(ratingData.message);
          starCounts[ratingData.message.toLowerCase()] += 1;
          totalRatings += 1; // Count each UID's rating
        }
      });
    }

    // Calculate percentages
    const fiveStarPercentage =
      (starCounts["very satisfied"] / totalRatings) * 100;
    const fourStarPercentage = (starCounts["satisfied"] / totalRatings) * 100;
    const threeStarPercentage = (starCounts["average"] / totalRatings) * 100;
    const twoStarPercentage = (starCounts["ok"] / totalRatings) * 100;
    const oneStarPercentage = (starCounts["dissatisfied"] / totalRatings) * 100;
    const zeroStarPercentage =
      (starCounts["very dissatisfied"] / totalRatings) * 100;

    // Update the width of each element
    document.getElementById(
      "widthFive"
    ).style.width = `${fiveStarPercentage.toFixed(2)}%`;
    document.getElementById(
      "widthFour"
    ).style.width = `${fourStarPercentage.toFixed(2)}%`;
    document.getElementById(
      "widthThree"
    ).style.width = `${threeStarPercentage.toFixed(2)}%`;
    document.getElementById(
      "widthTwo"
    ).style.width = `${twoStarPercentage.toFixed(2)}%`;
    document.getElementById(
      "widthOne"
    ).style.width = `${oneStarPercentage.toFixed(2)}%`;
    document.getElementById(
      "widthZero"
    ).style.width = `${zeroStarPercentage.toFixed(2)}%`;
  });
}

function tableParticipants(eventId) {
  const participantsTable = document
    .getElementById("tableParticipants")
    .getElementsByTagName("tbody")[0];
  updateTotalRatingElement(eventId);
  updateOverallRating(eventId);
  updateStarRatingPercentages(eventId);

  updateStarRatingWidths(eventId);
  const participantsRef = ref(db, `Upload_Engagement/${eventId}/Participants`);
  const eventCategoryRef = ref(db, `Upload_Engagement/${eventId}/category`);

  // Fetch both participants and event category data
  Promise.all([get(participantsRef), get(eventCategoryRef)])
    .then(([participantsSnapshot, categorySnapshot]) => {
      // Clear the table before updating it
      participantsTable.innerHTML = "";

      let totalAttendCount = 0;
      let totalNotAttendCount = 0;

      // Rest of your code...
      if (participantsSnapshot.exists()) {
        participantsSnapshot.forEach((participantSnapshot) => {
          const uid = participantSnapshot.key;
          const participantData = participantSnapshot.val();
          const isAlreadyAttended =
            participantData.joined && participantData.attendedStamp;
          const userRef = ref(db, `Users/${uid}`);
          const ratingsRef = ref(
            db,
            `Upload_Engagement/${eventId}/Ratings/${uid}`
          );
          Promise.all([get(userRef), get(ratingsRef)]).then(
            ([userSnapshot, ratingsSnapshot]) => {
              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                const ratingMessage = ratingsSnapshot.exists()
                  ? ratingsSnapshot.val().message
                  : "";
                const starRating = getStarRating(ratingMessage);

                // Create a new row for each participant
                const newRow = participantsTable.insertRow();
                newRow.innerHTML = `
    <td>${uid}</td>
    <td>${userData.srcode}</td>
 <td>
  <a href="#" style="display: block; overflow: hidden; height: 80px; width: 80px; border-radius: 50%;">
    <img src="${
      userData.ImageProfile || "../img/profilePic.jpg"
    }" class="profilePic" alt="Avatar" id="profilePic" style="width: 100%; height: 100%; object-fit: cover;"/>
  </a>
</td>

    <td>${userData.lastname}, ${userData.firstname}, ${userData.middlename}</td>
    <td>${userData.campus}</td>
    ${
      categorySnapshot.val() === "Fund Raising" ||
      categorySnapshot.val() === "Donation"
        ? `<td>
                    <a href="#" id="proof" style="color: #dc3545; text-decoration: underline;">View the Image</a>
                </td>`
        : ""
    }


                    <td style="color: #FFD700; font-size: 17px;" >${starRating} <span style="color: black;"> ${ratingMessage}</span></td> 
                    <td>
                        <button class="btn ${
                          isAlreadyAttended ? "btn-danger" : "btn-success"
                        }" id="atdbtn" data-uid="${uid}" data-event-id="${eventId}">
                            ${isAlreadyAttended ? "Cancel" : "Confirm"}
                        </button>
                    </td>
                `;
                initRealtimeListener(uid, eventId);

                // Add event listener for "proof" link
                const proofLink = newRow.querySelector("#proof");
                proofLink.addEventListener("click", function (event) {
                  event.preventDefault(); // Prevent the default behavior of the link (opening in the same tab)

                  const transparencyImageRef = ref(
                    db,
                    `Upload_Engagement/${eventId}/TransparencyImage/${uid}`
                  );
                  get(transparencyImageRef)
                    .then((imageSnapshot) => {
                      if (imageSnapshot.exists()) {
                        const imageUri = imageSnapshot.val().imageUri;

                        // Open the imageUri link in a new tab
                        window.open(imageUri, "_blank");
                      } else {
                        console.error("Image data not found for UID:", uid);
                      }
                    })
                    .catch((error) => {
                      console.error("Error fetching image data:", error);
                    });
                });
              }
            }
          );
          if (isAlreadyAttended) {
            totalAttendCount++;
          } else {
            totalNotAttendCount++;
          }
        });
      } else {
        const noParticipantsRow = participantsTable.insertRow();
        noParticipantsRow.innerHTML = `
          <td colspan="${
            categorySnapshot.val() === "Fund Raising" ||
            categorySnapshot.val() === "Donation"
              ? 8
              : 7
          }" class="center-text">
            Currently, there are no participants at the moment.
          </td>
        `;
      }
      const totalAttendElement = document.getElementById("totalAttend");
      totalAttendElement.innerText = totalAttendCount;

      // Update the total not attend count in the respective element
      const totalNotAttendElement = document.getElementById("totalNotAttend");
      totalNotAttendElement.innerText = totalNotAttendCount;
      // Hide the "Proof" column header if the category is neither "Fund Raising" nor "Donation"
      const proofHead = document.getElementById("proofHead");
      proofHead.style.display =
        categorySnapshot.val() === "Fund Raising" ||
        categorySnapshot.val() === "Donation"
          ? ""
          : "none";

      const attendedFilterDropdown = document
        .getElementById("attendedFilter")
        .querySelector("select");
      attendedFilterDropdown.addEventListener("change", function () {
        updateTableFilters();
      });

      // Event listener for the search input
      const inputSearch = document.getElementById("inputSearch");
      inputSearch.addEventListener("input", function () {
        updateTableFilters();
      });

      function updateTableFilters() {
        const selectedAttendedValue =
          attendedFilterDropdown.value.toLowerCase();
        const searchText = inputSearch.value.toLowerCase();
        const rows = participantsTable.getElementsByTagName("tr");

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const cancelButton = row.querySelector("#atdbtn");
          const cells = row.getElementsByTagName("td");
          let rowText = "";

          for (let j = 0; j < cells.length; j++) {
            rowText += cells[j].innerText.toLowerCase() + " ";
          }

          // Check if the row matches both filters
          const matchesAttendedFilter =
            selectedAttendedValue === "engaged"
              ? cancelButton.classList.contains("btn-danger")
              : selectedAttendedValue === "not-engaged"
              ? cancelButton.classList.contains("btn-success")
              : true;

          const matchesSearchFilter = rowText.includes(searchText);

          row.style.display =
            matchesAttendedFilter && matchesSearchFilter ? "" : "none";
        }

        // Show or hide the "No Data" message based on filter matches
        const noDataMessageRow = document.getElementById("noDataMessage");
        noDataMessageRow.style.display = Array.from(rows).every(
          (row) => row.style.display === "none"
        )
          ? ""
          : "none";
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
function getTotalRating(eventId) {
  const ratingsRef = ref(db, `Upload_Engagement/${eventId}/Ratings`);

  return get(ratingsRef).then((ratingsSnapshot) => {
    let totalRatings = 0;

    if (ratingsSnapshot.exists()) {
      ratingsSnapshot.forEach((rating) => {
        const ratingData = rating.val();
        // Check if the UID has a valid rating
        if (ratingData.message) {
          totalRatings += 1; // Count each UID's rating
        }
      });
    }

    return totalRatings;
  });
}

function updateTotalRatingElement(eventId) {
  const totalRatingElement = document.getElementById("totalRating");

  getTotalRating(eventId)
    .then((totalRating) => {
      totalRatingElement.innerText = totalRating;
    })
    .catch((error) => {
      console.error("Error calculating total rating:", error);
    });
}

document.addEventListener("click", function (event) {
  if (event.target && event.target.id === "atdbtn") {
    const uid = event.target.getAttribute("data-uid");
    const eventId = event.target.getAttribute("data-event-id");
    const participantRef = ref(
      db,
      `Upload_Engagement/${eventId}/Participants/${uid}`
    );

    get(participantRef)
      .then((participantSnapshot) => {
        const participantData = participantSnapshot.val();

        if (participantData.joined && participantData.attendedStamp) {
          // If already attended, cancel the attendance
          cancelAttendance(uid, eventId);
        } else {
          // Confirm the attendance
          confirmAttendance(uid, eventId);
        }
      })
      .catch((error) => {
        console.error("Error fetching participant data:", error);
        alert("Error confirming/canceling attendance. Please try again.");
      });
  }
});

// Using event delegation for the 'proof' link
document.addEventListener("click", function (event) {
  if (event.target && event.target.id === "proof") {
    event.preventDefault();

    const row = event.target.closest("tr");
    const uid = row.querySelector("[data-uid]").getAttribute("data-uid");
    const eventId = row
      .querySelector("[data-event-id]")
      .getAttribute("data-event-id");

    const transparencyImageRef = ref(
      db,
      `Upload_Engagement/${eventId}/TransparencyImage/${uid}`
    );

    get(transparencyImageRef)
      .then((imageSnapshot) => {
        if (imageSnapshot.exists()) {
          const imageUri = imageSnapshot.val().imageUri;

          // Open the imageUri link in a new tab
          window.open(imageUri, "_blank");
        } else {
          console.error("Image data not found for UID:", uid);
        }
      })
      .catch((error) => {
        console.error("Error fetching image data:", error);
      });
  }
});

function confirmAttendance(uid, eventId) {
  const confirmAttendance = confirm(
    "Are you sure to confirm the user's attendance?"
  );

  if (confirmAttendance) {
    const participantRef = ref(
      db,
      `Upload_Engagement/${eventId}/Participants/${uid}`
    );
    const transparencyImageRef = ref(
      db,
      `Upload_Engagement/${eventId}/TransparencyImage/${uid}`
    );
    const eventRef = ref(db, `Upload_Engagement/${eventId}`);

    // Get the event category
    const eventCategoryRef = ref(db, `Upload_Engagement/${eventId}/category`);

    // Use Promise.all to fetch both participants, event category, and TransparencyImage data
    Promise.all([
      get(participantRef),
      get(transparencyImageRef),
      get(eventCategoryRef),
      get(eventRef),
    ])
      .then(
        ([
          participantSnapshot,
          transparencyImageSnapshot,
          categorySnapshot,
          eventSnapshot,
        ]) => {
          const participantData = participantSnapshot.val();
          const transparencyImageData = transparencyImageSnapshot.val();

          if (!participantData.joined || !participantData.attendedStamp) {
            // If not already attended, confirm the attendance
            const timestamp = generateTimestamp();

            // Update participant data
            const updates = {
              joined: true,
              attendedStamp: timestamp,
            };
            update(participantRef, updates);

            // Update fundcollected if category is "Fund Raising" or "Donation"
            if (
              categorySnapshot.val() === "Fund Raising" ||
              categorySnapshot.val() === "Donation"
            ) {
              const newFundCollected =
                eventSnapshot.val().fundcollected +
                transparencyImageData.amount;

              update(eventRef, { fundcollected: newFundCollected });

              // Also update TransparencyImage contributionStatus
              update(transparencyImageRef, { contributionStatus: true });
            }

            alert("Attendance confirmed successfully!");
          } else {
            alert("User has already confirmed attendance.");
          }
        }
      )
      .catch((error) => {
        console.error("Error confirming attendance:", error);
        alert("Error confirming attendance. Please try again.");
      });
  }
}

function cancelAttendance(uid, eventId) {
  const cancelAttendance = confirm(
    "Are you sure to cancel the user's attendance?"
  );

  if (cancelAttendance) {
    const participantRef = ref(
      db,
      `Upload_Engagement/${eventId}/Participants/${uid}`
    );
    const transparencyImageRef = ref(
      db,
      `Upload_Engagement/${eventId}/TransparencyImage/${uid}`
    );
    const eventRef = ref(db, `Upload_Engagement/${eventId}`);

    Promise.all([get(participantRef), get(transparencyImageRef), get(eventRef)])
      .then(
        ([participantSnapshot, transparencyImageSnapshot, eventSnapshot]) => {
          const participantData = participantSnapshot.val();
          const transparencyImageData = transparencyImageSnapshot.val();

          if (participantData.joined && participantData.attendedStamp) {
            // If already attended, cancel the attendance
            const updates = { joined: false, attendedStamp: null };

            // Update participant data
            update(participantRef, updates);

            // Update fundcollected if category is "Fund Raising" or "Donation"
            if (
              eventSnapshot.val().category === "Fund Raising" ||
              eventSnapshot.val().category === "Donation"
            ) {
              const newFundCollected =
                eventSnapshot.val().fundcollected -
                transparencyImageData.amount;

              update(eventRef, { fundcollected: newFundCollected });

              // Also update TransparencyImage contributionStatus
              update(transparencyImageRef, { contributionStatus: false });
            }

            alert("Attendance canceled successfully!");
          } else {
            alert("User has not confirmed attendance yet.");
          }
        }
      )
      .catch((error) => {
        console.error("Error canceling attendance:", error);
        alert("Error canceling attendance. Please try again.");
      });
  }
}

const modalAttendeeIcon = document.getElementById("modalAttendee");
modalAttendeeIcon.addEventListener("click", function () {
  // Display the modal with id "myModalat"
  const modalAt = document.getElementById("myModalat");
  modalAt.style.display = "block";

  // Get the eventId from the selected row
  const eventId = document
    .querySelector("tr.selected-event")
    .getAttribute("data-event-id");

  // Call the tableParticipants function to populate the table
  tableParticipants(eventId);

  // Handle the close button inside the modal
  const closeAt = document.getElementsByClassName("closeat")[0];
  closeAt.addEventListener("click", function () {
    modalAt.style.display = "none";
  });

  // Handle clicks outside the modal to close it
  window.addEventListener("click", function (event) {
    if (event.target == modalAt) {
      modalAt.style.display = "none";
    }
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
