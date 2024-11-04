// Temporary function to show upcoming features in popups
const followersButton = document.getElementById('followers');
const followingButton = document.getElementById('following');
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