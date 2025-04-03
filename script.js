// --- Configuration ---
const ESTIMATED_LIFE_EXPECTANCY_YEARS = 78.6; // 根据中国人均预期寿命设置
// -------------------

// Get DOM Elements
const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const daySelect = document.getElementById('daySelect');
const calculateBtn = document.getElementById('calculateBtn');
const resultsDiv = document.getElementById('results');
const errorMsg = document.getElementById('errorMsg');
const timelineGrid = document.getElementById('timelineGrid');

// Language Elements
const langButtons = document.querySelectorAll('.lang-btn');
let currentLang = localStorage.getItem('preferredLanguage') || 'zh'; // 默认设置为中文

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

// Initialize language and date selectors on page load
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
    
    // Initialize date selectors
    initializeDateSelectors();
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

// Initialize date selectors with year, month, and day options
function initializeDateSelectors() {
    // 添加年份选项 (1900年到当前年份)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // 添加月份选项 (1-12月)
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    }
    
    // 年份和月份变化时更新日期选项
    yearSelect.addEventListener('change', updateDayOptions);
    monthSelect.addEventListener('change', updateDayOptions);
}

// 根据选择的年月更新日期选项
function updateDayOptions() {
    // 清空现有选项，保留默认选项
    daySelect.innerHTML = '<option value="">日期</option>';
    
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    
    // 如果年份和月份都已选择
    if (!isNaN(year) && !isNaN(month)) {
        // 获取所选月份的天数
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // 添加日期选项
        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        }
    }
}

function calculateTimeLeft() {
    errorMsg.textContent = ''; // Clear previous errors
    resultsDiv.classList.add('hidden'); // Hide results initially

    // --- Input Validation ---
    const year = yearSelect.value;
    const month = monthSelect.value;
    const day = daySelect.value;
    
    if (!year || !month || !day) {
        errorMsg.textContent = translations[currentLang].errorEmpty;
        return;
    }
    
    // 创建日期对象 (月份从0开始，所以要减1)
    const dob = new Date(year, month - 1, day);
    
    // Basic check if the date parsing failed
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
    
    // 生成GitHub风格的时间线可视化
    generateTimelineVisualization(dob, endDate);
}

// 生成GitHub风格的时间线可视化
function generateTimelineVisualization(birthDate, endDate) {
    // 清空现有的时间线
    timelineGrid.innerHTML = '';
    
    // 计算已经过去的天数和总天数
    const now = new Date();
    const totalDays = Math.floor((endDate.getTime() - birthDate.getTime()) / MS_PER_DAY);
    const pastDays = Math.floor((now.getTime() - birthDate.getTime()) / MS_PER_DAY);
    
    // 创建GitHub风格的时间线网格
    // 每行显示52个方块，代表一年的52周
    const SQUARES_PER_ROW = 52;
    const totalRows = Math.ceil(totalDays / SQUARES_PER_ROW);
    
    // 创建行和方块
    for (let row = 0; row < totalRows; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'timeline-row';
        
        for (let col = 0; col < SQUARES_PER_ROW; col++) {
            const dayIndex = row * SQUARES_PER_ROW + col;
            
            // 如果超出总天数，不再创建方块
            if (dayIndex >= totalDays) break;
            
            const square = document.createElement('div');
            square.className = 'timeline-square';
            
            // 根据是否已过去设置不同的类
            if (dayIndex < pastDays) {
                square.classList.add('past');
            } else {
                square.classList.add('future');
            }
            
            // 添加提示信息
            const dayNumber = dayIndex + 1;
            square.title = `第 ${dayNumber} 天`;
            
            rowElement.appendChild(square);
        }
        
        timelineGrid.appendChild(rowElement);
    }
}