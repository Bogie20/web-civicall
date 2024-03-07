// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

/* =============================================== dropdown ================================================*/
function toggleDropdown() {
  var dropdownMenu = document.getElementById("dropdownMenu");

  // Toggle the display of the dropdown menu
  if (dropdownMenu.style.display === "none") {
    dropdownMenu.style.display = "block";
  } else {
    dropdownMenu.style.display = "none";
  }
}

// Close the dropdown when clicking outside of it
window.onclick = function (event) {
  if (
    !event.target.matches(".avatar") &&
    !event.target.closest(".dropdown-menu")
  ) {
    var dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.style.display = "none";
  }
};

/* =============================================== for logout ================================================*/
function showLogoutPopup() {
  var popupForm = document.getElementById("logoutForm");
  var popupTitle = document.getElementById("logoutTitle");
  popupTitle.textContent = "Log Out?";
  popupForm.style.display = "block";
}

function closeLogoutPopup() {
  var popupForm = document.getElementById("logoutForm");
  popupForm.style.display = "none";
}
