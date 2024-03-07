import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
let currentUserUID;
document.addEventListener("DOMContentLoaded", function () {
  if (typeof $ !== "undefined" && typeof $.fn.dataTable !== "undefined") {
    const tableElement = $("#example");
    const usersRef = ref(db, "Users");

    const table = tableElement.DataTable({
      columns: [
        { title: "UID" },
        { title: "Sr-Code" },
        { title: "Name" },
        { title: "Email" },
        { title: "Gender" },
        { title: "Year & Section" },
        { title: "Campus" },
        { title: "User Type" },
        { title: "NSTP" },
        { title: "Details" },
      ],
      // Specify the initial order based on the second column (Name)
      order: [[2, "asc"]],
    });

    tableElement.on("click", ".view-button", function () {
      const uid = $(this).data("uid");
      currentUserUID = uid;
      const userRef = ref(db, `Users/${uid}`);
      onValue(userRef, (userSnapshot) => {
        const user = userSnapshot.val();

        // Check if user exists and has ImageProfile property
        const imageUrl =
          user && user.ImageProfile ? user.ImageProfile : "img/profile.png";

        $("#profileImage").attr("src", imageUrl);
        $("#fullName").val(
          displayNA(`${user.lastname}, ${user.firstname}, ${user.middlename}`)
        );
        $("#email").val(displayNA(user.email));
        $("#gender").val(displayNA(user.gender));
        $("#birthDay").val(displayNA(user.birthday));
        $("#address").val(displayNA(user.address));
        $("#userType").val(displayNA(user.userType));
        $("#campus").val(displayNA(user.campus));
        $("#numberMobile").val(displayNA(user.phoneno));
        $("#srCode").val(displayNA(user.srcode));
        $("#userCourse").val(displayNA(user.course));
        $("#yearandSect").val(displayNA(user.yearandSection));
        $("#nstp").val(displayNA(user.nstp));
        $("#lastLogin").val(displayNA(user.lastLogin));

        // Show the modal
        $("#exampleModalLonggg").modal("show");
      });
    });
    function displayNA(value) {
      return value ? value : "N/A";
    }
    onValue(usersRef, (snapshot) => {
      table.clear().draw();

      const currentDate = new Date();

      snapshot.forEach((userSnapshot) => {
        const user = userSnapshot.val();

        // Check if verificationStatus is true and lastLogin is 1 year ago or earlier
        if (
          user &&
          user.verificationStatus === true &&
          isLastLoginOneYearAgoOrEarlier(user.lastLogin, currentDate)
        ) {
          const uid = user.uid || "";
          const srcode = displayNA(user.srcode);
          const name = displayNA(
            user.firstname && user.lastname
              ? `${user.firstname} ${user.lastname}`
              : ""
          );

          const email = displayNA(user.email);
          const gender = displayNA(user.gender);
          const yearandSect = displayNA(user.yearandSection);
          const campus = displayNA(user.campus);
          const userType = displayNA(user.userType);
          const nstp = displayNA(user.nstp);

          table.row
            .add([
              uid,
              srcode,
              name,
              email,
              gender,
              yearandSect,
              campus,
              userType,
              nstp,
              `<button class="btn btn-primary view-button" data-uid="${uid}">View</button>`,
            ])
            .draw();
        }
      });
    });

    function isLastLoginOneYearAgoOrEarlier(lastLogin, currentDate) {
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const lastLoginDate = new Date(lastLogin);

      return lastLoginDate <= oneYearAgo;
    }
  } else {
    console.error("jQuery or DataTables plugin is not available.");
  }
  const terminateButton = document.getElementById("terminate");
  terminateButton.addEventListener("click", function () {
    const uidToDelete = currentUserUID;

    if (confirm("Are you sure you want to delete the data of this Account?")) {
      // Delete user data from Realtime Database
      const userRef = ref(db, `Users/${uidToDelete}`);
      remove(userRef);

      // Delete the corresponding child under User Verification
      const userVerificationRef = ref(db, `User_Verification/${uidToDelete}`);
      remove(userVerificationRef);

      // Close the modal after removing user data
      $("#exampleModalLonggg").modal("hide");

      // Show success alert
      alert("Account Data Deleted Successfully");
    }
  });
});
