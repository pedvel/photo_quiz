// Flag and delay to control click events when the popup is active or recently closed
let popupOpen = false;
let ignoreClicks = false; // Will be set to true for 2 seconds after popup closes

const explorePopup = document.getElementById('explorePopup');
const explorePopupText = document.querySelector('.explorePopup_text');

// Function to show the popup
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

    // Show the popup and set popupOpen to true
    explorePopup.style.display = 'block';
    popupOpen = true;
    console.log("Popup shown with quiz content:", quizContent);
}

// Function to hide the popup and start the 2-second delay
function hidePopup() {
    explorePopup.style.display = 'none';
    popupOpen = false;

    // Start 2-second delay during which clicks will be ignored
    ignoreClicks = true;
    setTimeout(() => {
        ignoreClicks = false; // Reset the flag after 2 seconds
    }, 500);

    console.log("Popup hidden and clicks will be ignored for 2 seconds.");
}

// Global function to be called when a snapTheme icon is clicked
window.snapTheme = function (quizContent) {
    // Show the popup with the given quiz content
    showPopup(quizContent);
};

// Event listener to close the popup when tapping outside "explorePopup_text"
document.addEventListener('touchstart', function (event) {
    const snapThemeIcon = event.target.closest('.snapTheme');
    if (explorePopup.style.display === 'block' &&
        !explorePopupText.contains(event.target) &&
        !snapThemeIcon) {
        hidePopup();
    }
});