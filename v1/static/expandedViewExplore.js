// expandedViewExplore.js

const themeModal = document.getElementById('themeModal');
const logoBackContainer = document.getElementById('logoBackContainer');
const originalLogoContent = logoBackContainer.innerHTML;
const mainTitle = document.querySelector('h1'); // Assuming this is the main title
let scrollPosition = 0;

// Event listener for image click
document.body.addEventListener('click', function (event) {
    // Exit if popup is open or clicks are temporarily ignored
    if (popupOpen || ignoreClicks) return;

    const image = event.target.closest('.image');
    if (!image) return;

    // Check if the image is inside a "blur" div within the themeContainer
    const imageGrid = image.closest('.image-grid');
    if (imageGrid && imageGrid.classList.contains('blur')) return; // Exit if "blur" class is found

    // Exclude images inside a "more" container
    const moreContainer = image.closest('.more');
    if (moreContainer) return;

    const themeContainer = image.closest('.themeContainer');
    if (!themeContainer) return;

    // Replace logo with "back" button only if it doesn’t already exist
    if (!logoBackContainer.querySelector('#iconBack')) {
        logoBackContainer.innerHTML = '<i id="iconBack" class="fa-solid fa-arrow-left" style="font-size: 2rem;"></i>';
    }

    const iconBack = document.getElementById('iconBack');
    iconBack.addEventListener('click', closeExpandedView);

    // Replace "Explore" title with theme name
    const theme = themeContainer.querySelector('h2').textContent;
    mainTitle.textContent = theme;

    // Show the expanded view if none of the exclusion conditions are met
    showExpandedView(themeContainer, image.src, theme);
});

function showExpandedView(themeContainer, clickedImageSrc, theme) {
    // Save scroll position
    scrollPosition = window.scrollY;

    // Show modal and disable page scrolling
    themeModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Generate modal content
    let newLayoutHTML = `<div class="expanded-view">`;
    const allImages = themeContainer.querySelectorAll('.image');
    const usernameInputs = themeContainer.querySelectorAll('input[type="hidden"]');

    allImages.forEach((img, index) => {
        const username = usernameInputs[index].value;
        const imgId = parseInt(img.id); // Ensure imgId is an integer
        const isFavorite = favorites.includes(imgId); // Check if imgId is in favorites

        // Add HTML for each image and a placeholder for the checkbox
        newLayoutHTML += `
            <div class="photoContainer">
                <div>
                    <p>${username}</p>
                    <p>...</p>
                </div>
                <div class="photo">
                    <img src="${img.src}" alt="${username} ${theme}">
                    <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" ${isFavorite ? 'checked' : ''}>
                    <label for="checkbox-${imgId}" class="bookmark-icon ${isFavorite ? 'bookmarked' : ''}"></label>
                </div>
            </div>`;
    });
    newLayoutHTML += `</div>`;
    themeModal.innerHTML = newLayoutHTML; // Clear previous content and set new layout

    // Attach event listeners to all checkboxes after adding them to the DOM
    themeModal.querySelectorAll('.bookmark-toggle').forEach((checkbox) => {
        const imgId = parseInt(checkbox.id.split('-')[1]); // Extract imgId from checkbox id
        checkbox.checked = favorites.includes(imgId); // Set checked state based on favorites array
        checkbox.addEventListener('change', () => bookmark(imgId)); // Attach bookmark handler
    });

    // Scroll to the clicked image in the modal
    const newImages = themeModal.querySelectorAll('.photo img');
    newImages.forEach(newImg => {
        if (newImg.src === clickedImageSrc) {
            newImg.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    });

    // Load bookmark.js if not already loaded
    loadScript('../static/bookmarkExplore.js')
        .then(() => {
            console.log('bookmark.js loaded successfully.');
        })
        .catch((error) => {
            console.error('Error loading bookmark.js:', error);
        });
}

function closeExpandedView() {
    // Close modal and reset everything to initial state
    themeModal.style.display = 'none';
    themeModal.innerHTML = ''; // Clear modal content to reset layout
    window.scrollTo(0, scrollPosition);
    document.body.style.overflow = 'auto';

    // Restore "Explore" title and remove back button if it exists
    mainTitle.textContent = 'Explore';
    logoBackContainer.innerHTML = originalLogoContent; // Clear back button
}
