import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";

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

function updateFeedbackTable() {
  const table = document
    .getElementById("tableevents")
    .getElementsByTagName("tbody")[0];
  const feedbackRef = ref(db, "Feedback");
  const overallOutput = document.getElementById("overallOutput");
  const totalRatingElement = document.getElementById("totalRating");
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  onValue(feedbackRef, (snapshot) => {
    table.innerHTML = "";
    let totalRating = 0;
    let totalFeedbacks = 0;
    let countZeroStar = 0;
    let countOneStar = 0;
    let countTwoStar = 0;
    let countThreeStar = 0;
    let countFourStar = 0;
    let countFiveStar = 0;

    if (!snapshot.exists()) {
      const defaultRow = table.insertRow();
      defaultRow.innerHTML = `
        <td id="numid">0</td>
        <td>
          <a href="#">
            <img src="img/profilePic.jpg" class="eventpic" alt="Avatar" id="eventpicimg" />
          </a>
        </td>
        <td colspan="5" style="text-align: center;">
          No Feedback is currently available.
        </td>
      `;
    } else {
      const promises = [];
      const rowsData = [];

      snapshot.forEach((childSnapshot) => {
        const feedbackData = childSnapshot.val();
        const uid = childSnapshot.key;

        // Check lastLogin timestamp
        const userRef = ref(db, `Users/${uid}`);
        const userPromise = get(userRef).then((userSnapshot) => {
          const userData = userSnapshot.val();

          if (userData && userData.lastLogin) {
            const lastLoginTimestamp = new Date(userData.lastLogin);

            // Check if last login was more than 1 year ago
            if (lastLoginTimestamp < oneYearAgo) {
              // Skip processing this user's feedback
              return;
            }
          }

          totalRating += parseFloat(feedbackData.rating);
          totalFeedbacks++;

          // Add data to rowsData array for sorting
          rowsData.push({
            uid,
            userData,
            feedbackData,
          });
        });

        promises.push(userPromise);
      });

      Promise.all(promises).then(() => {
        // Sort rowsData alphabetically based on lastname, firstname, middlename
        rowsData.sort((a, b) => {
          const aName = `${a.userData.lastname} ${a.userData.firstname} ${a.userData.middlename}`;
          const bName = `${b.userData.lastname} ${b.userData.firstname} ${b.userData.middlename}`;
          return aName.localeCompare(bName);
        });

        rowsData.forEach(({ uid, userData, feedbackData }) => {
          const newRow = table.insertRow();
          const numCell = newRow.insertCell(0);
          const profilePicCell = newRow.insertCell(1);
          const nameCell = newRow.insertCell(2);
          const campusCell = newRow.insertCell(3);
          const datetimeCell = newRow.insertCell(4);
          const feedbackCell = newRow.insertCell(5);
          const ratingCell = newRow.insertCell(6);

          function splitTextIntoLines(text, maxLength) {
            const regex = new RegExp(`.{1,${maxLength}}`, "g");
            return text.match(regex).join("\n");
          }

          numCell.textContent = uid;
          profilePicCell.innerHTML = `<a href="#" style="display: block; overflow: hidden; height: 80px; width: 80px; border-radius: 50%;">
  <img src="${
    userData.ImageProfile || "img/profilePic.jpg"
  }" class="eventpic" alt="Avatar" id="profilePic" style="width: 100%; height: 100%; object-fit: cover;"/>
</a>`;

          // Check if user data is available
          if (userData) {
            nameCell.textContent = `${userData.lastname}, ${userData.firstname}, ${userData.middlename}`;
            campusCell.textContent = userData.campus;
          } else {
            nameCell.textContent = "N/A";
            campusCell.textContent = "N/A";
          }

          datetimeCell.textContent = feedbackData.DateandTime;
          feedbackCell.textContent = splitTextIntoLines(
            feedbackData.comments,
            50
          );

          const starRating = getStarRating(feedbackData.ratingEquivalent);
          ratingCell.innerHTML = `${feedbackData.ratingEquivalent} ${starRating}`;

          // Increment the count based on the rating value
          const rating = parseInt(feedbackData.rating, 10);
          switch (rating) {
            case 0:
              countZeroStar++;
              break;
            case 1:
              countOneStar++;
              break;
            case 2:
              countTwoStar++;
              break;
            case 3:
              countThreeStar++;
              break;
            case 4:
              countFourStar++;
              break;
            case 5:
              countFiveStar++;
              break;
          }
        });

        const averageRating =
          totalFeedbacks > 0 ? (totalRating / totalFeedbacks).toFixed(1) : 0.0;
        overallOutput.textContent = `${averageRating}`;
        totalRatingElement.textContent = `${totalFeedbacks}`;
        updatePercentageAverage("zeroStar", countZeroStar, totalFeedbacks);
        updatePercentageAverage("oneStar", countOneStar, totalFeedbacks);
        updatePercentageAverage("twoStar", countTwoStar, totalFeedbacks);
        updatePercentageAverage("threeStar", countThreeStar, totalFeedbacks);
        updatePercentageAverage("fourStar", countFourStar, totalFeedbacks);
        updatePercentageAverage("fiveStar", countFiveStar, totalFeedbacks);

        // Update the width percentages
        updateWidthPercentage("widthZero", countZeroStar, totalFeedbacks);
        updateWidthPercentage("widthOne", countOneStar, totalFeedbacks);
        updateWidthPercentage("widthTwo", countTwoStar, totalFeedbacks);
        updateWidthPercentage("widthThree", countThreeStar, totalFeedbacks);
        updateWidthPercentage("widthFour", countFourStar, totalFeedbacks);
        updateWidthPercentage("widthFive", countFiveStar, totalFeedbacks);
      });
    }
  });

  function updatePercentageAverage(elementId, count, totalFeedbacks) {
    const percentage =
      totalFeedbacks > 0 ? ((count / totalFeedbacks) * 100).toFixed(1) : 0.0;
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = `${percentage}%`;
    }
  }
  function updateWidthPercentage(elementId, count, totalFeedbacks) {
    const percentage =
      totalFeedbacks > 0 ? ((count / totalFeedbacks) * 100).toFixed(1) : 0.0;
    const element = document.getElementById(elementId);
    if (element) {
      element.style.width = `${percentage}%`;
    }
  }
  function applySearchFilter() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    let matchFound = false; // Flag to check if any row matches the search input

    // Filter the table rows based on the search input
    const rows = table.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      let rowContainsSearch = false;

      for (let j = 0; j < cells.length; j++) {
        const cellText = cells[j].textContent.toLowerCase();
        if (cellText.includes(input)) {
          rowContainsSearch = true;
          matchFound = true;
          break;
        }
      }

      // Show or hide the row based on the search result
      rows[i].style.display = rowContainsSearch ? "" : "none";
    }

    // Display a message if no match is found
    const noMatchMessage = document.getElementById("noMatchMessage");
    if (!matchFound) {
      noMatchMessage.style.display = "block";
    } else {
      noMatchMessage.style.display = "none";
    }
  }

  // Attach event listener to the search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", applySearchFilter);
}

function getStarRating(message) {
  const goldColor = "#f2c300"; // Set your desired gold color
  const starSize = "1.2em"; // Set your desired star size

  switch (message.toLowerCase()) {
    case "very dissatisfied":
      return `<span style="color: ${goldColor}; font-size: ${starSize}">&#9734;&#9734;&#9734;&#9734;&#9734;</span>`; // 5 empty stars
    case "dissatisfied":
      return `<span style="color: ${goldColor}; font-size: ${starSize}">&#9733;&#9734;&#9734;&#9734;&#9734;</span>`; // 1 gold star
    case "ok":
      return `<span style="color: ${goldColor}; font-size: ${starSize}">&#9733;&#9733;&#9734;&#9734;&#9734;</span>`; // 2 gold stars
    case "average":
      return `<span style="color: ${goldColor}; font-size: ${starSize}">&#9733;&#9733;&#9733;&#9734;&#9734;</span>`; // 3 gold stars
    case "satisfied":
      return `<span style="color: ${goldColor}; font-size: ${starSize}">&#9733;&#9733;&#9733;&#9733;&#9734;</span>`; // 4 gold stars
    case "very satisfied":
      return `<span style="color: ${goldColor}; font-size: ${starSize}">&#9733;&#9733;&#9733;&#9733;&#9733;</span>`; // 5 gold stars
    default:
      return ""; // No stars for unknown messages
  }
}
// Function to update the report count
function updateReportCount() {
  const reportedProblemsRef = ref(db, "ReportedProblems");

  // Reset report count
  let reportCount = 0;

  // Listen for changes in the ReportedProblems node
  onValue(reportedProblemsRef, (snapshot) => {
    reportCount = 0; // Reset report count
    snapshot.forEach((uidSnapshot) => {
      // Increment report count for each UID
      uidSnapshot.forEach(() => {
        reportCount++;
      });
    });

    // Update the report number element
    const reportNumberElement = document.getElementById("reportNumber");
    if (reportNumberElement) {
      reportNumberElement.textContent = formatNumber(reportCount);
    }
  });
}

// Function to format the number
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
}

// Call the function to initially update the report count
updateReportCount();

// Call the function to initially populate the table
updateFeedbackTable();
