// Temporary function to show upcoming features in popups
const followersButton = document.getElementById('followers');
const followingButton = document.getElementById('following');
const bmkOthersDiv = document.getElementById('bmkOthers');
const popup = document.getElementById('popup');

// Function to display different messages
function showMessage(message) {
    popup.innerHTML = message;
    popup.style.display = 'block';
    // Add event listener to hide the popup when clicking outside
    setTimeout(() => {
        document.addEventListener('touchstart', hidePopup2);
    }, 300); // 300 milliseconds delay, adjust as needed
}

// Function to hide the popup
function hidePopup2() {
    popup.style.display = 'none';
    document.removeEventListener('touchstart', hidePopup2);
}

// Event listeners for each element
followersButton.addEventListener('touchstart', () => {
    const message = `
    <p>Soon other users</p>
    <p>will be able to follow you</p>
`;
    showMessage(message);
});

followingButton.addEventListener('touchstart', () => {
    const message = `
    <p>You will be able</p>
    <p>to follow other users soon!</p>
`;
    showMessage(message);
});

bmkOthersDiv.addEventListener('touchstart', () => {
    const message = `
        <p>This is the total times your photos</p>
        <p>were saved by others.</p>
        <br>
        <p>Soon you will be able to see</p>
        <p>your most saved photos!</p>
    `;
    showMessage(message);
});


// Function to display participation popup
const explorePopup = document.getElementById('explorePopup');
const explorePopupText = document.querySelector('.explorePopup_text');

// Function to show the pop-up
function showPopup() {
    explorePopup.style.display = 'block';
}

// Function to hide the pop-up
function hidePopup() {
    explorePopup.style.display = 'none';
}

// Global function to be called when the snapTheme icon is clicked
window.snapTheme = function () {
    showPopup();
};

// Event listener to close the pop-up when tapping outside of "explorePopup_text"
document.addEventListener('touchstart', function (event) {
    // Check if the popup is visible
    if (explorePopup.style.display === 'block') {
        // Check if the tap is outside explorePopup_text
        if (!explorePopupText.contains(event.target)) {
            hidePopup();
        } else {
            console.log('Tapped inside explorePopup_text. Popup remains visible.');
        }
    } else {
        console.log('Popup is not visible; no action taken.');
    }
});
