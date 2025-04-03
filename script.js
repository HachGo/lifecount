// --- Configuration ---
const ESTIMATED_LIFE_EXPECTANCY_YEARS = 80; // Adjust this value as desired
// -------------------

// Get DOM Elements
const dobInput = document.getElementById('dobInput');
const calculateBtn = document.getElementById('calculateBtn');
const resultsDiv = document.getElementById('results');
const errorMsg = document.getElementById('errorMsg');

const daysLeftSpan = document.getElementById('daysLeft');
const weeksLeftSpan = document.getElementById('weeksLeft');
const monthsLeftSpan = document.getElementById('monthsLeft');

// --- Constants for Calculations ---
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const AVG_DAYS_PER_MONTH = 365.25 / 12; // Approximation

const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

// --- Event Listener ---
calculateBtn.addEventListener('click', calculateTimeLeft);

// --- Calculation Function ---
function calculateTimeLeft() {
    const dobString = dobInput.value;
    errorMsg.textContent = ''; // Clear previous errors
    resultsDiv.classList.add('hidden'); // Hide results initially

    // --- Input Validation ---
    if (!dobString) {
        errorMsg.textContent = 'Please enter your Date of Birth.';
        return;
    }

    const dob = new Date(dobString);
     // Basic check if the date parsing failed (might not catch all invalid dates like 31 Feb)
    if (isNaN(dob.getTime())) {
         errorMsg.textContent = 'Invalid Date Format. Please use YYYY-MM-DD.';
         return;
    }
     // Ensure the selected date isn't in the future
     const nowForValidation = new Date();
     nowForValidation.setHours(0, 0, 0, 0); // Compare dates only
     if (dob > nowForValidation) {
         errorMsg.textContent = 'Date of Birth cannot be in the future.';
         return;
     }


    // --- Calculations ---
    const now = new Date();

    // Calculate estimated end date
    // Create a *new* date object based on DOB to avoid modifying the original `dob`
    const endDate = new Date(dob);
    endDate.setFullYear(dob.getFullYear() + ESTIMATED_LIFE_EXPECTANCY_YEARS);

    // Calculate difference in milliseconds
    const diffMs = endDate.getTime() - now.getTime();

    // Check if the estimated end date has passed
    if (diffMs <= 0) {
        daysLeftSpan.textContent = "0";
        weeksLeftSpan.textContent = "0";
        monthsLeftSpan.textContent = "0";
        resultsDiv.classList.remove('hidden');
        errorMsg.textContent = "According to the estimate, the time has passed!"; // Optional message
        return;
    }

    // Convert milliseconds to days, weeks, months
    const daysLeft = Math.floor(diffMs / MS_PER_DAY);
    const weeksLeft = Math.floor(daysLeft / DAYS_PER_WEEK);
    const monthsLeft = Math.floor(daysLeft / AVG_DAYS_PER_MONTH); // Approximation

    // --- Display Results ---
    // Use toLocaleString for nice formatting with commas
    daysLeftSpan.textContent = daysLeft.toLocaleString();
    weeksLeftSpan.textContent = weeksLeft.toLocaleString();
    monthsLeftSpan.textContent = monthsLeft.toLocaleString();

    resultsDiv.classList.remove('hidden'); // Show the results section
}