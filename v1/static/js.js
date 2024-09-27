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



let isDesktop = false;

// Function to check device orientation
function checkDeviceOrientation(event) {
    if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
        isDesktop = false; // Mobile device
        document.getElementById('message2').innerText = "Display is Mobile";
    } else {
        isDesktop = true; // Desktop device
        document.getElementById('message2').innerText = "Display is Desktop";
    }
    // Update link behavior based on isDesktop
    updateLinkBehavior();
}

// Function to update link behavior
function updateLinkBehavior() {
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');

    if (isDesktop) {
        // For Desktop: Show modal
        registerLink.onclick = function (event) {
            event.preventDefault(); // Prevent default link behavior
            document.getElementById('mobileModal').style.display = 'flex';
        };
        loginLink.onclick = function (event) {
            event.preventDefault();
            document.getElementById('mobileModal').style.display = 'flex';
        };
    } else {
        // For Mobile: Navigate to pages
        registerLink.onclick = function () {
            window.location.href = registerUrl; // Redirect to register page
        };
        loginLink.onclick = function () {
            window.location.href = loginUrl; // Redirect to login page
        };
    }
}

// Check if DeviceOrientationEvent is supported
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', checkDeviceOrientation);
} else {
    // Fallback if not supported
    isDesktop = true; // Assume desktop if not supported
    document.getElementById('message2').innerText = 'Device orientation is not supported on your device.';
}

// Initial check for isDesktop
updateLinkBehavior();


// Close modal
document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('mobileModal').style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', function (event) {
    const modal = document.getElementById('mobileModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

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