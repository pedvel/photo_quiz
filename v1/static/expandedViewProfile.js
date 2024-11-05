document.addEventListener("DOMContentLoaded", function () {
    // Get all images within the image-grid container
    const images = document.querySelectorAll('.image');

    images.forEach(image => {
        // Add click event listener to each image
        image.addEventListener('click', function () {
            showFullLayout(image);

            // Remove logo and add "Back" button
            const logoBackContainer = document.getElementById('logoBackContainer');
            logoBackContainer.innerHTML = '<i id="iconBack" class="fa-solid fa-arrow-left" style="font-size: 2rem;"></i>';

            // Get the newly added icon element
            const iconBack = document.getElementById('iconBack');

            // Add an event listener to the icon for going back to grid view
            iconBack.addEventListener('click', function (event) {
                event.preventDefault();
                window.location.reload();
            });
        });
    });
});

function showFullLayout(clickedImage) {
    // Hide the grid container
    document.querySelector('.image-grid').style.display = 'none';

    // Show the expanded view container
    const fullLayout = document.querySelector('.expanded-view');
    fullLayout.style.display = 'block'; // Make it visible

    // Clear any existing content in the expanded view container
    fullLayout.innerHTML = '';

    // Loop through all images and add them to the full-layout in expanded format
    document.querySelectorAll('.image').forEach(image => {
        // Extract data attributes from each image
        const picUrl = image.getAttribute('src');
        const quizContent = image.getAttribute('alt');
        const imgId = image.getAttribute('id');
        const isFavorite = image.getAttribute('bkm_self') === 'true'; // Check if it's in favorites

        // Create a new layout structure for each image
        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photoContainer');

        const textDiv = document.createElement('div');
        textDiv.innerHTML = `<p>${quizContent}</p><p>...</p>`;
        photoContainer.appendChild(textDiv);

        const photoDiv = document.createElement('div');
        photoDiv.classList.add('photo');

        // Add image element
        const imgElement = document.createElement('img');
        imgElement.src = picUrl;
        imgElement.alt = quizContent;
        imgElement.id = `expanded-${imgId}`;
        photoDiv.appendChild(imgElement);

        // Add bookmark checkbox and label with dynamic checked status and classes
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox-${imgId}`;
        checkbox.classList.add('bookmark-toggle');
        checkbox.checked = isFavorite; // Set checked based on favorite status
        checkbox.onchange = () => bookmark(imgId);

        const label = document.createElement('label');
        label.setAttribute('for', `checkbox-${imgId}`);
        label.classList.add('bookmark-icon');
        if (isFavorite) {
            label.classList.add('bookmarked'); // Add bookmarked class if it’s a favorite
        }

        photoDiv.appendChild(checkbox);
        photoDiv.appendChild(label);

        photoContainer.appendChild(photoDiv);
        fullLayout.appendChild(photoContainer);
    });

    // Scroll to the clicked image within the expanded view
    setTimeout(() => {
        const targetImage = document.getElementById(`expanded-${clickedImage.id}`);
        if (targetImage) {
            targetImage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}
