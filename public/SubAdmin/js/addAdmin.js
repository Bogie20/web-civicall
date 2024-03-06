document.addEventListener("DOMContentLoaded", function () {
  const openModalBtn = document.getElementById("openModalBtn");
  const modal = document.getElementById("myModal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");
  const modalContentPlaceholder = document.getElementById(
    "modalContentPlaceholder"
  );

  openModalBtn.addEventListener("click", function () {
    modal.style.display = "block";
    if (modalContentPlaceholder) {
      modalContent.innerHTML = modalContentPlaceholder.innerHTML;
    }
  });

  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  function loadContentIntoModal() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "#", true); // Change 'group.html' to 'admin.html'
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        modalContent.innerHTML = xhr.responseText;
      }
    };
    xhr.send();
  }
});
