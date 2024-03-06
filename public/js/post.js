document.addEventListener("DOMContentLoaded", function () {
  var openPostModalButton = document.getElementById("openPostModal");
  var modalContainer = document.getElementById("modalContainer");
  var modalContent = modalContainer.querySelector(".modal-content");

  openPostModalButton.addEventListener("click", function () {
    // Fetch the content from post.html using AJAX
    fetch("post.html")
      .then((response) => response.text())
      .then((data) => {
        modalContent.innerHTML = data; // Place the content in the modal container
        modalContainer.style.display = "block"; // Display the modal container
      })
      .catch((error) => console.error("Error fetching content:", error));
  });

  // Close the modal when the "Cancel" button is clicked
  document.addEventListener("click", function (event) {
    if (event.target.id === "cancelButton") {
      modalContainer.style.display = "none";
    }
  });
});
