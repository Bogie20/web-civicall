import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  update,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

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

      const userRef = ref(db, `Users/${uid}`);
      onValue(userRef, (userSnapshot) => {
        const user = userSnapshot.val();

        $("#profileImage").attr("src", user.ImageProfile || "img/profile.png");
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

        // Show the modal
        $("#exampleModalLonggg").modal("show");

        // Adding click event for approval button
        $("#approval")
          .off("click")
          .on("click", function () {
            // Display confirmation dialog
            if (confirm("Are you sure you want to verify this account?")) {
              // Update verificationStatus to true
              update(ref(db, `Users/${uid}`), {
                verificationStatus: true,
                verifiedTimeStamp: generateTimestamp(),
              });

              // Display success alert
              alert("Successfully verified the account.");

              // Close the modal
              $("#exampleModalLonggg").modal("hide");

              // Unbind the click event to prevent multiple bindings
              $(this).off("click");
            }
          });
        $("#declining")
          .off("click")
          .on("click", function () {
            // Set the UID as a data attribute in the decline confirmation modal
            $("#confirmDecline").data("uid", uid);
            $("#declineConfirmationModal").modal("show");
          });

        $("#confirmDecline")
          .off("click")
          .on("click", function () {
            // Get the UID from the confirmDecline button's data-uid attribute
            const uid = $(this).data("uid");

            // Get the rejection reason from the input field
            const rejectionReason = $("#declineReasonInput").val();

            // Check if the rejection reason is not empty
            if (rejectionReason.trim() !== "") {
              // Update the Users node with the rejection reason
              update(ref(db, `Users/${uid}`), {
                rejectReason: rejectionReason,
                verificationStatus: false,
                rejectTimestamp: generateTimestamp(),
              });

              // Delete the corresponding child under User Verification
              const userVerificationRef = ref(db, `User_Verification/${uid}`);
              set(userVerificationRef, null); // This will delete the child with UID

              // Display success alert or perform any other actions
              alert("Successfully rejected the account.");

              // Close the decline confirmation modal
              $("#declineConfirmationModal").modal("hide");
              $("#exampleModalLonggg").modal("hide");
            } else {
              // Display an error message if the rejection reason is empty
              alert("Please provide a reason for rejection.");
            }
          });

        const userRef2 = ref(db, `User_Verification/${uid}`);
        onValue(userRef2, (userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData) {
            // Get the first child key (type of verification)
            const verificationType = Object.keys(userData)[0];

            // Get the corresponding data for the verification type
            const verificationData = userData[verificationType];

            // Display the verification type in the "credential" input
            $("#credential").val(verificationType);
          } else {
            // Handle the case where there is no verification data
            $("#credential").val("No verification data available");
          }
          if (userData) {
            const verificationType = Object.keys(userData)[0];
            const verificationData = userData[verificationType];

            if (verificationData) {
              // Check if the 4th child exists and has imageUri or fileUri
              const fileData = verificationData.image || verificationData.file;
              if (fileData) {
                const fileUri = fileData.imageUri || fileData.fileUri;

                // Display the link to view the file
                $("#proof")
                  .attr("href", fileUri)
                  .text("View the file")
                  .attr("target", "_blank");
              } else {
                // Handle the case where there is no file data
                $("#proof")
                  .attr("href", "#")
                  .text("No file available")
                  .removeAttr("target");
              }
            } else {
              // Handle the case where there is no verification data
              $("#proof")
                .attr("href", "#")
                .text("No Credential data available")
                .removeAttr("target");
            }

            // Show the modal
            $("#exampleModalLonggg").modal("show");
          } else {
            // Handle the case where the UID does not exist in "User Verification"
            $("#proof")
              .attr("href", "#")
              .text("No Credential Available")
              .removeAttr("target");

            // Show the modal
            $("#exampleModalLonggg").modal("show");
          }
        });
      });
    });

    function displayNA(value) {
      return value ? value : "N/A";
    }

    onValue(usersRef, (snapshot) => {
      const usersToDisplay = [];
      const verificationPromises = [];

      snapshot.forEach((userSnapshot) => {
        const user = userSnapshot.val();

        if (user && user.verificationStatus === false) {
          const uid = user.uid || "";
          const userVerificationRef = ref(db, `User_Verification/${uid}`);

          const verificationPromise = new Promise((resolve) => {
            onValue(userVerificationRef, (verificationSnapshot) => {
              resolve(verificationSnapshot.exists());
            });
          });

          verificationPromises.push(verificationPromise);

          verificationPromise.then((exists) => {
            if (exists) {
              const name = displayNA(
                `${user.lastname}, ${user.firstname}, ${user.middlename}`
              );
              const srcode = displayNA(user.srcode);
              const email = displayNA(user.email);
              const gender = displayNA(user.gender);
              const yearandSect = displayNA(user.yearandSection);
              const campus = displayNA(user.campus);
              const userType = displayNA(user.userType);
              const nstp = displayNA(user.nstp);

              usersToDisplay.push([
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
              ]);
            }
          });
        }
      });

      Promise.all(verificationPromises).then(() => {
        table.clear().draw();

        usersToDisplay.sort((a, b) => a[1].localeCompare(b[1]));

        usersToDisplay.forEach((userRow) => {
          table.row.add(userRow).draw();
        });
      });
    });
  } else {
    console.error("jQuery or DataTables plugin is not available.");
  }
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
