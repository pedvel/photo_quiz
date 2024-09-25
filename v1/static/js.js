// Dark mode
const modeToggle = document.getElementById('toggle');
const body = document.body;

// Function to apply the theme
function applyTheme(theme) {
    if (theme === 'dark-mode') {
        body.classList.add('dark-mode');
        modeToggle.checked = true; // Set toggle to dark mode
    } else {
        body.classList.remove('dark-mode');
        modeToggle.checked = false; // Set toggle to light mode
    }
}

// Function to toggle the theme
function toggleDarkMode() {
    const isDarkMode = body.classList.contains('dark-mode');
    if (isDarkMode) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light-mode'); // Save to localStorage
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode'); // Save to localStorage
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // If no saved theme, use the system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDarkMode ? 'dark-mode' : 'light-mode');
    }
}

// Add event listener to toggle switch
modeToggle.addEventListener('click', toggleDarkMode);

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', loadTheme);

//"Go to top" button
window.addEventListener('scroll', function () {
    const scrollToTopButton = document.getElementById('scrollToTop');
    const featuresSection = document.querySelector('.featuresSection');

    if (featuresSection) {
        const featuresPosition = featuresSection.getBoundingClientRect().top;

        if (window.scrollY > featuresSection.offsetTop) {
            scrollToTopButton.style.display = 'block';
        } else {
            scrollToTopButton.style.display = 'none';
        }
    }
});

document.getElementById('scrollToTop').addEventListener('click', function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});



