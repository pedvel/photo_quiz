// expandedViewExplore.js

const themeModal = document.getElementById('themeModal');
const logoBackContainer = document.getElementById('logoBackContainer');
const mainTitle = document.querySelector('h1'); // Assuming this is the main title
let scrollPosition = 0;

// Event listener for image click
document.body.addEventListener('click', function (event) {
    const image = event.target.closest('.image');
    if (!image) return;

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
        const imgId = img.id;

        newLayoutHTML += `
            <div class="photoContainer">
                <div>
                    <p>${username}</p>
                    <p>...</p>
                </div>
                <div class="photo">
                    <img src="${img.src}" alt="${username} ${theme}">
                    <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" onchange="bookmark(${imgId})" ${favorites.includes(parseInt(imgId)) ? 'checked' : ''}>
                    <label for="checkbox-${imgId}" class="bookmark-icon ${favorites.includes(parseInt(imgId)) ? 'bookmarked' : ''}"></label>
                </div>
            </div>`;
    });
    newLayoutHTML += `</div>`;
    themeModal.innerHTML = newLayoutHTML; // Clear previous content and set new layout

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
}

function closeExpandedView() {
    // Close modal and reset everything to initial state
    themeModal.style.display = 'none';
    themeModal.innerHTML = ''; // Clear modal content to reset layout
    window.scrollTo(0, scrollPosition);
    document.body.style.overflow = 'auto';

    // Restore "Explore" title and remove back button if it exists
    mainTitle.textContent = 'Explore';
    logoBackContainer.innerHTML = ''; // Clear back button
}
