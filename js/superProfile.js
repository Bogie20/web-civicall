import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
let isEditing = false;

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, `SuperAdminAcc/${uid}`);

    // Function to show the "Save" button
    const showSaveButton = () => {
      const saveBtn = document.getElementById("saveBtn");
      if (isEditing) {
        saveBtn.style.display = "block";
      } else {
        saveBtn.style.display = "none";
      }
    };

    // Function to handle save button click
    const handleSaveButtonClick = () => {
      const confirmation = confirm("Are you sure to save the changes?");
      if (confirmation) {
        // Gather all updated data
        const updatedData = {
          firstname: document.getElementById("firstname").value,
          lastname: document.getElementById("lastname").value,
          middlename: document.getElementById("middlename").value,
          contactNumber: document.getElementById("accountcontact").value,
          gender: document.getElementById("accountgender").value,
          birthday: document.getElementById("accountbday").value,
          position: document.getElementById("accountposition").value,
        };
        // Push updated data to Firebase
        update(userRef, updatedData);
        console.log("Changes saved!");
        showSuccessAlert();
        isEditing = false; // Reset isEditing flag
        showSaveButton(); // Hide the "Save" button
      } else {
        console.log("Changes not saved.");
      }
    };

    // Function to show success alert
    const showSuccessAlert = () => {
      alert("Changes saved successfully!");
    };

    // Function to handle image change
    const handleImageChange = (file) => {
      const confirmation = confirm(
        "Are you sure to change the profile picture?"
      );
      if (confirmation) {
        const storageRefVar = storageRef(storage, `profileSuperImages/${uid}`);
        uploadBytes(storageRefVar, file).then(() => {
          getDownloadURL(storageRefVar).then((downloadURL) => {
            update(userRef, { ImageProfile: downloadURL });
            alert("Profile picture changed successfully!");
            document.getElementById("profileSuperImage").src = downloadURL;
          });
        });
      }
    };

    get(userRef).then((snapshot) => {
      const userData = snapshot.val();

      // Update the DOM elements with user data
      document.getElementById("profileImage").src =
        userData.ImageProfile || "../img/profile.png";
      document.getElementById("firstname").value = userData.firstname || "";
      document.getElementById("lastname").value = userData.lastname || "";
      document.getElementById("middlename").value = userData.middlename || "";
      document.getElementById("accountcontact").value =
        userData.contactNumber || "";
      document.getElementById("accountemail").value = userData.email || "";
      document.getElementById("accountgender").value = userData.gender || "";
      document.getElementById("accountbday").value = userData.birthday || "";
      document.getElementById("accountposition").value =
        userData.position || "";

      // Event listener for editing the firstname
      document.getElementById("firstname").addEventListener("input", () => {
        isEditing = true;
        showSaveButton();
      });

      // Event listener for editing the lastname
      document.getElementById("lastname").addEventListener("input", () => {
        isEditing = true;
        showSaveButton();
      });

      // Event listener for editing the middlename
      document.getElementById("middlename").addEventListener("input", () => {
        isEditing = true;
        showSaveButton();
      });

      // Event listener for editing the contactNumber
      document
        .getElementById("accountcontact")
        .addEventListener("input", () => {
          isEditing = true;
          showSaveButton();
        });

      // Event listener for editing the gender
      document.getElementById("accountgender").addEventListener("input", () => {
        isEditing = true;
        showSaveButton();
      });

      // Event listener for editing the birthday
      document.getElementById("accountbday").addEventListener("input", () => {
        isEditing = true;
        showSaveButton();
      });

      // Event listener for editing the position
      document
        .getElementById("accountposition")
        .addEventListener("input", () => {
          isEditing = true;
          showSaveButton();
        });

      // Event listener for uploading a new profile image
      document.getElementById("file").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          handleImageChange(file);
        }
      });

      // Event listener for save button click
      document
        .getElementById("saveBtn")
        .addEventListener("click", handleSaveButtonClick);
    });

    console.log("User is logged in:", user);
  } else {
    console.log("User is logged out");
  }
});
