// Function to check device orientation
let isDesktop = false;

function checkDeviceOrientation(event) {
    if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
        isDesktop = false; // Mobile device
    } else {
        isDesktop = true; // Desktop device
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
    isDesktop = false; // Assume mobile if not supported
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