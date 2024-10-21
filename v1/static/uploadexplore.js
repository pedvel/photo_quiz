const explorePopup = document.getElementById('explorePopup');
const explorePopupText = document.querySelector('.explorePopup_text');

// Function to show the pop-up
function showPopup(quizContent) {
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

// Photo submission
//document.getElementById('upload').addEventListener('change', function () {
//});

document.getElementById('upload').addEventListener('change', function () {
    const form = document.getElementById('photoForm');
    const formData = new FormData(form);

    // Log the form data for debugging
    for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    // Send a POST request using Fetch API
    fetch('/save_from_explore/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token for security
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`Error ${response.status}: ${err.error || 'Bad Request'}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                // Successfully saved, refresh the current page
                console.log('Image saved successfully:', data.message);
                window.location.reload();
            } else {
                // Handle server error response
                alert(data.error || 'An error occurred while saving the image.');
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert(`Failed to save the image: ${error.message}`);
        });
});

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
