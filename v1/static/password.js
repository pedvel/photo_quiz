// Password toggle
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('id_password');
    const eyeIcon = document.getElementById('eyeIcon');

    togglePassword.addEventListener('click', () => {
        // Toggle the type attribute of the password input
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle the eye icon
        if (type === 'password') {
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        } else {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        }
    });
});


// Function to check device orientation
let isDesktop = false;

function checkDeviceOrientation(event) {
    if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
        isDesktop = false; // Mobile device

    } else {
        isDesktop = true; // Desktop device

        // Redirect to index.html if desktop
        window.location.href = indexUrl;
    }
}

// Check if DeviceOrientationEvent is supported
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', checkDeviceOrientation);
} else {
    // Fallback if not supported
    isDesktop = false; // Assume mobile if not supported

}