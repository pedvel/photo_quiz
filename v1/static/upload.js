// Photo submission
document.getElementById('upload').addEventListener('change', function () {
    const form = document.getElementById('photoForm');
    const formData = new FormData(form);

    const formPopUp = document.getElementById('explorePopup');
    if (formPopUp) {
        formPopUp.remove();
    }

    // Show the loading indicator and add "processing" class
    document.getElementById("uploading").style.display = "block"; // Show loading indicator
    document.body.classList.add("processing");

    // Log the form data for debugging
    for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    // Send a POST request using Fetch API
    fetch('/upload/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token for security
        }
    })
        .then(response => {
            // Remove the loading indicator and "processing" class after fetch completes
            document.getElementById("uploading").style.display = "none";
            document.body.classList.remove("processing");

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
                window.scrollTo(0, 0); // Scroll to the top
            } else {
                // Handle server error response
                alert(data.error || 'An error occurred while saving the image.');
            }
        })
        .catch(error => {
            // Remove the loading indicator and "processing" class if there's an error
            document.getElementById("uploading").style.display = "none";
            document.body.classList.remove("processing");

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