import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
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
  EmailAuthProvider,
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

const changePasswordForm = document.getElementById("changePasswordForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const openModalButton = document.getElementById("openModalButton");

changePasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate new password
  if (
    newPassword.length < 8 ||
    !/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/=-]+$/.test(newPassword)
  ) {
    alert(
      "New password must be at least 8 characters long and can only contain alphanumeric characters or symbols."
    );
    return;
  }

  // Confirm new password
  if (newPassword !== confirmPassword) {
    alert("New password and confirm password do not match.");
    return;
  }

  // Confirm user's intention to change password
  const userConfirmation = confirm(
    "Are you sure you want to change your password?"
  );
  if (!userConfirmation) {
    return;
  }

  try {
    // Reauthenticate user with current password
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);

    // Update password
    await updatePassword(auth.currentUser, newPassword);

    // Success alert
    alert("Password changed successfully!");
  } catch (error) {
    // Error alert
    alert("Failed to change password. " + error.message);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const currentPasswordInput = document.getElementById("currentPassword");
  const togglePasswordIcon = document.getElementById("togglePassword");
  const currentIcon = document.getElementById("currenticon");

  // Add an event listener to the togglePassword span
  togglePasswordIcon.addEventListener("click", function () {
    // Toggle the password visibility
    if (currentPasswordInput.type === "password") {
      currentPasswordInput.type = "text";
      // Update the icon to show an open eye when the password is visible
      currentIcon.classList.remove("fas", "fa-eye");
      currentIcon.classList.add("fas", "fa-eye-slash");
    } else {
      currentPasswordInput.type = "password";
      // Update the icon to show a closed eye when the password is hidden
      currentIcon.classList.remove("fas", "fa-eye-slash");
      currentIcon.classList.add("fas", "fa-eye");
    }
  });
  const newPasswordInput = document.getElementById("newPassword");
  const toggleNewPasswordIcon = document.getElementById("toggleNewPassword");
  const newIcon = document.getElementById("newicon");

  // Add an event listener to the togglePassword span
  toggleNewPasswordIcon.addEventListener("click", function () {
    // Toggle the password visibility
    if (newPasswordInput.type === "password") {
      newPasswordInput.type = "text";
      // Update the icon to show an open eye when the password is visible
      newIcon.classList.remove("fas", "fa-eye");
      newIcon.classList.add("fas", "fa-eye-slash");
    } else {
      newPasswordInput.type = "password";
      // Update the icon to show a closed eye when the password is hidden
      newIcon.classList.remove("fas", "fa-eye-slash");
      newIcon.classList.add("fas", "fa-eye");
    }
  });
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const toggleConfirmPasswordIcon = document.getElementById(
    "toggleConfirmPassword"
  );
  const confirmIcon = document.getElementById("confirmicon");

  // Add an event listener to the togglePassword span
  toggleConfirmPasswordIcon.addEventListener("click", function () {
    // Toggle the password visibility
    if (confirmPasswordInput.type === "password") {
      confirmPasswordInput.type = "text";
      // Update the icon to show an open eye when the password is visible
      confirmIcon.classList.remove("fas", "fa-eye");
      confirmIcon.classList.add("fas", "fa-eye-slash");
    } else {
      confirmPasswordInput.type = "password";
      // Update the icon to show a closed eye when the password is hidden
      confirmIcon.classList.remove("fas", "fa-eye-slash");
      confirmIcon.classList.add("fas", "fa-eye");
    }
  });
});
