const explorePopup = document.getElementById('explorePopup');
const explorePopupText = document.querySelector('.explorePopup_text');

// Function to show the pop-up
function showPopup(quizContent) {
    // Load upload.js 
    loadScript('../static/upload.js')
        .then(() => {
            console.log('upload.js loaded successfully.');
        })
        .catch((error) => {
            console.error('Error loading upload.js:', error);
        });

    // Update the h1 and input value based on the clicked container's content
    explorePopup.querySelector('.highlightText').textContent = quizContent;
    explorePopup.querySelector('input[name="theme"]').value = quizContent;

    // Show the popup
    explorePopup.style.display = 'block';
    console.log("Popup shown with quiz content:", quizContent);
}

// Function to hide the pop-up
function hidePopup() {
    explorePopup.style.display = 'none';
    console.log("Popup hidden");
}

// Global function to be called when a snapTheme icon is clicked
window.snapTheme = function (quizContent) {
    // Show the popup with the given quiz content
    showPopup(quizContent);
};

// Event listener to close the pop-up when tapping outside of "explorePopup_text"
document.addEventListener('touchstart', function (event) {
    const snapThemeIcon = event.target.closest('.snapTheme'); // Adjusted to match your setup
    if (explorePopup.style.display === 'block' &&
        !explorePopupText.contains(event.target) &&
        !snapThemeIcon) {
        hidePopup();
    }
});