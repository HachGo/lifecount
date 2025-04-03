// --- Configuration ---
const ESTIMATED_LIFE_EXPECTANCY_YEARS = 80; // Adjust this value as desired
// -------------------

// Get DOM Elements
const dobInput = document.getElementById('dobInput');
const calculateBtn = document.getElementById('calculateBtn');
const resultsDiv = document.getElementById('results');
const errorMsg = document.getElementById('errorMsg');

// Language Elements
const langButtons = document.querySelectorAll('.lang-btn');
let currentLang = localStorage.getItem('preferredLanguage') || 'en';

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

// --- Event Listeners ---
calculateBtn.addEventListener('click', calculateTimeLeft);

// Language switcher event listeners
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!btn.classList.contains('active')) {
            // Update active button
            document.querySelector('.lang-btn.active').classList.remove('active');
            btn.classList.add('active');
            
            // Set language and update UI
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('preferredLanguage', currentLang);
            updateLanguage();
        }
    });
});

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set active button based on current language
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Apply translations
    updateLanguage();
});

// --- Calculation Function ---
// --- Language Functions ---
function updateLanguage() {
    // Update all text elements with translations
    document.querySelector('h1').textContent = translations[currentLang].title;
    document.querySelector('.subtitle').textContent = translations[currentLang].subtitle;
    
    // Update input section
    document.querySelector('label[for="dob"]').textContent = translations[currentLang].dobLabel;
    calculateBtn.textContent = translations[currentLang].calculateBtn;
    
    // Update results section if visible
    document.querySelector('#results h2').textContent = translations[currentLang].approximately;
    document.querySelectorAll('.unit')[0].textContent = translations[currentLang].days;
    document.querySelectorAll('.unit')[1].textContent = translations[currentLang].weeks;
    document.querySelectorAll('.unit')[2].textContent = translations[currentLang].months;
    document.querySelector('.reminder').textContent = translations[currentLang].reminder;
    
    // If there's an error message displayed, translate it too
    if (errorMsg.textContent) {
        // Try to match the error message with one of our known errors
        if (errorMsg.textContent.includes('Please enter your Date of Birth')) {
            errorMsg.textContent = translations[currentLang].errorEmpty;
        } else if (errorMsg.textContent.includes('Invalid Date Format')) {
            errorMsg.textContent = translations[currentLang].errorInvalidFormat;
        } else if (errorMsg.textContent.includes('cannot be in the future')) {
            errorMsg.textContent = translations[currentLang].errorFutureDate;
        } else if (errorMsg.textContent.includes('the time has passed')) {
            errorMsg.textContent = translations[currentLang].errorTimePassed;
        }
    }
}

function calculateTimeLeft() {
    const dobString = dobInput.value;
    errorMsg.textContent = ''; // Clear previous errors
    resultsDiv.classList.add('hidden'); // Hide results initially

    // --- Input Validation ---
    if (!dobString) {
        errorMsg.textContent = translations[currentLang].errorEmpty;
        return;
    }

    const dob = new Date(dobString);
     // Basic check if the date parsing failed (might not catch all invalid dates like 31 Feb)
    if (isNaN(dob.getTime())) {
         errorMsg.textContent = translations[currentLang].errorInvalidFormat;
         return;
    }
     // Ensure the selected date isn't in the future
     const nowForValidation = new Date();
     nowForValidation.setHours(0, 0, 0, 0); // Compare dates only
     if (dob > nowForValidation) {
         errorMsg.textContent = translations[currentLang].errorFutureDate;
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
        errorMsg.textContent = translations[currentLang].errorTimePassed; // Optional message
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