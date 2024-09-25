//Photo saved
document.querySelectorAll('.bookmark-toggle').forEach(toggle => {
    toggle.addEventListener('change', function () {
        if (this.checked) {
            const popup = document.getElementById('popup');
            popup.style.display = 'block'; // Show the popup
            popup.style.opacity = '1'; // Ensure it's visible
            setTimeout(() => {
                popup.style.opacity = '0'; // Fade out
                setTimeout(() => {
                    popup.style.display = 'none'; // Hide it after fade out
                }, 1000); // Match this time to the CSS transition
            }, 1000); // Keep it visible for 3 seconds
        }
    });
});