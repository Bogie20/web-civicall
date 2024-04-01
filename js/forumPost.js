import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {
  getDatabase,
  ref as databaseRef,
  push,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Get references to DOM elements
const fileInput = document.getElementById("fileInput");
const imagepost = document.getElementById("imagepost");
const campusTarget = document.getElementById("campusTarget");
const modal = document.getElementById("myModalnm");
const selectAllBtn = document.getElementById("selectAllBtnn");
const deselectAllBtn = document.getElementById("deselectAllBtnn");
const okButton = document.getElementById("okButton");
const checkboxes = document.querySelectorAll(".checkboxna");
const closeButton = document.querySelector(".closenm");

// Event listener for when the paperclip button is clicked
document.getElementById("filena").addEventListener("click", function () {
  // Trigger click event on the file input
  fileInput.click();
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
// Event listener for when a file is selected
fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];
  const reader = new FileReader();

  // Check if the selected file is an image
  if (file.type && file.type.indexOf("image") === -1) {
    alert("Please select an image file.");
    return;
  }

  reader.onload = function (e) {
    // Set the src attribute of the image to the selected file
    imagepost.src = e.target.result;
    // Show the image
    imagepost.style.display = "block";
  };

  reader.readAsDataURL(file);
});

// Event listener for when the campusTarget input is clicked
campusTarget.addEventListener("click", function () {
  modal.style.display = "block";
});

// Event listener for when the Ok button is clicked
okButton.addEventListener("click", function () {
  let selectedCampuses = [];
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedCampuses.push(checkbox.value);
    }
  });
  campusTarget.value = selectedCampuses.join(", ");
  modal.style.display = "none";
});

// Event listener for when the Select All button is clicked
selectAllBtn.addEventListener("click", function () {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });
});

// Event listener for when the Deselect All button is clicked
deselectAllBtn.addEventListener("click", function () {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
});

// Event listener for when the close button is clicked
closeButton.addEventListener("click", function () {
  modal.style.display = "none";
});

onAuthStateChanged(auth, (user) => {
  // You can handle authentication state changes here
  if (user) {
    console.log("User is logged in:", user);
  } else {
    console.log("User is logged out");
  }
});

// Function to post content to the forum
function postToForum() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Please log in to continue. Only logged-in users can submit posts.");
    return;
  }

  // Check if the user is a superadmin
  const currentUserUID = currentUser.uid;
  const userRef = databaseRef(db, `SuperAdminAcc/${currentUserUID}`);
  get(userRef).then((snapshot) => {
    const userData = snapshot.val();
    if (!userData || userData.role !== "superadmin") {
      alert("Only superadmins can submit posts.");
      return;
    }

    // Confirm with the user before posting
    if (!confirm("Are you sure to post this in Forum?")) {
      return; // If user cancels, exit the function
    }

    // Get input values
    const campus = document.getElementById("campusTarget").value;
    const category = document.getElementById("categoryFilter").value;
    const forumText = document.getElementById("forumText").value;
    const file = fileInput.files[0];

    // Validate inputs
    if (!campus || !category || !forumText) {
      alert("Please fill in all fields.");
      return;
    }

    // Upload image to storage if a file is provided
    let postImage = ""; // Initialize postImage variable
    if (file) {
      const fileRef = storageRef(
        getStorage(app),
        "Forum_Post_Images/" + Date.now() + "_forumImage"
      );
      uploadBytes(fileRef, file)
        .then((snapshot) => {
          // Get download URL of the uploaded image
          getDownloadURL(snapshot.ref)
            .then((downloadURL) => {
              postImage = downloadURL; // Set postImage URL
              // Call function to save post data to the database
              savePostData(campus, category, forumText, postImage);
            })
            .catch((error) => {
              console.error("Error getting download URL: ", error);
              alert("Error uploading image. Please try again.");
            });
        })
        .catch((error) => {
          console.error("Error uploading image: ", error);
          alert("Error uploading image. Please try again.");
        });
    } else {
      // Call function to save post data to the database without an image
      savePostData(campus, category, forumText, postImage);
    }
  }).catch((error) => {
    console.error("Error checking user role: ", error);
    alert("Error checking user role. Please try again.");
  });
}


// Function to save post data to the database
function savePostData(campus, category, forumText, postImage) {
  // Get current user's UID
  const currentUser = auth.currentUser;
  const currentUserUID = currentUser ? currentUser.uid : "";

  // Create a new post object
  const newPost = {
    campus: campus,
    category: category,
    postImage: postImage,
    postText: forumText,
    uploadersUID: currentUserUID,
    postTime: generateTimestamp(),
    commentCount: 0,
    downReactCount: 0,
    hidden: false,
    upReactCount: 0,
  };

  // Push the new post to the database under 'Forum_Post'
  const postRef = databaseRef(db, "Forum_Post");
  const newPostRef = push(postRef); // Use push method on reference
  set(newPostRef, newPost)
    .then(() => {
      // Reset form fields after successful posting
      document.getElementById("campusTarget").value = "";
      document.getElementById("categoryFilter").value = "";
      document.getElementById("forumText").value = "";
      fileInput.value = null;
      imagepost.style.display = "none";
      imagepost.src = ""; // Reset image source

      // Alert for successful posting
      alert("Post successful!");
    })
    .catch((error) => {
      console.error("Error adding post: ", error);
      alert("Error adding post. Please try again.");
    });
}

// Event listener for when the Post button is clicked
document
  .querySelector(".btn-primary[type='submit']")
  .addEventListener("click", postToForum);
