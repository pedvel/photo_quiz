document.addEventListener('DOMContentLoaded', function () {
    let fullThemeContainer = null; // Variable to track the active themeContainer
    let originalGridState = null;  // To save the original state for the themeContainer

    // Use event delegation for handling "Load More" button clicks
    document.body.addEventListener('click', function (event) {
        const loadMoreButton = event.target.closest('#loadMore');

        // Check if the clicked element is a "Load More" button
        if (loadMoreButton) {
            event.preventDefault();
            loadMore(loadMoreButton);
        }
    });

    function loadMore(loadMoreButton) {
        // Finds the closest .more container and changes the img opacity
        const moreDiv = loadMoreButton.closest('.more');
        const imgInMoreDiv = moreDiv.querySelector('img');

        if (imgInMoreDiv) {
            imgInMoreDiv.style.filter = 'blur(0)';
        }

        // Hide "more" button
        loadMoreButton.style.display = 'none';

        // Retrieves necessary data attributes for data fetch
        const theme = loadMoreButton.getAttribute('data-theme');
        const offset = parseInt(loadMoreButton.getAttribute('data-offset'), 10);
        const dataUrl = loadMoreButton.getAttribute('data-url');

        dataFetch(loadMoreButton, theme, offset, dataUrl);
    }

    function dataFetch(button, theme, offset, dataUrl) {
        fetch(`${dataUrl}?theme=${encodeURIComponent(theme)}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                if (Array.isArray(data) && data.length > 0) {
                    const container = button.closest('.expanded-view') || button.closest('.image-grid');

                    if (!container) {
                        throw new Error('Could not find a valid container to append elements.');
                    }

                    let imgCount = 0;

                    data.forEach((imageData) => {
                        imgCount++;
                        const imgUrl = imageData.pic_url;
                        const username = imageData.user_name;
                        const imgId = imageData.id;

                        // If sixth image
                        if (imgCount === 6) {
                            // Check if the container is an image grid or expanded view
                            if (container.classList.contains('image-grid')) {
                                loadSixthPhotoToGridLayout(container, username, imgUrl, imgId, theme, offset, dataUrl);
                            } else {
                                loadSixthPhotoToExpandedLayout(container, username, imgUrl, imgId, theme, offset, dataUrl);
                            }
                        } else {
                            // Append based on the container type
                            if (container.classList.contains('image-grid')) {
                                appendGridImage(container, username, imgUrl, imgId);
                            } else {
                                appendExpandedImage(container, username, imgUrl, imgId);
                            }
                        }
                    });

                    button.setAttribute('data-offset', offset + imgCount);

                    if (data.length < 6) {
                        button.style.display = 'none';
                    }
                } else {
                    button.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error loading more images:', error);
            });
    }

    // LOAD MORE - GRID VIEW
    // Sixth photo
    function loadSixthPhotoToGridLayout(container, username, imgUrl, imgId, theme, offset, dataUrl) {
        const moreDiv = document.createElement('div');
        moreDiv.className = 'more';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.value = username;
        moreDiv.appendChild(hiddenInput);

        const img = document.createElement('img');
        img.id = imgId;
        img.src = imgUrl;
        img.className = 'image';
        img.style.filter = 'blur(8px)';
        moreDiv.appendChild(img);

        const loadMoreButton = document.createElement('a');
        loadMoreButton.id = 'loadMore';
        loadMoreButton.className = 'highlightText2';
        loadMoreButton.setAttribute('data-theme', theme);
        loadMoreButton.setAttribute('data-offset', offset + 6);
        loadMoreButton.setAttribute('data-url', dataUrl);
        loadMoreButton.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
        moreDiv.appendChild(loadMoreButton);

        container.appendChild(moreDiv);
    }

    // Remaining photos
    function appendGridImage(container, username, imgUrl, imgId) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.value = username;
        container.appendChild(hiddenInput);

        const img = document.createElement('img');
        img.src = imgUrl;
        img.id = imgId;
        img.className = 'image';
        container.appendChild(img);
    }

    // LOAD MORE - EXPANDED
    // Sixth photo
    function loadSixthPhotoToExpandedLayout(container, username, imgUrl, imgId, theme, offset, dataUrl) {
        const sixthPhotoExpandedLayoutHTML = `
        <div class="more photoContainer">
            <div>
                <p>${username}</p>
                <p>...</p>
            </div>
            <div class="photo">
                <img src="${imgUrl}">
                <a id="loadMore" class="highlightText2"
                   data-theme="${theme}"
                   data-offset="${offset + 6}"
                   data-url="${dataUrl}">
                    <i class="fa-solid fa-circle-plus"></i>
                </a>
                <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" onchange="bookmark(${imgId})" ${favorites.includes(parseInt(imgId)) ? 'checked' : ''}>
                <label for="checkbox-${imgId}" class="bookmark-icon ${favorites.includes(parseInt(imgId)) ? 'bookmarked' : ''}"></label>
            </div>
        </div>`;
        container.insertAdjacentHTML('beforeend', sixthPhotoExpandedLayoutHTML);
    }

    // Remaining photos
    function appendExpandedImage(container, username, imgUrl, imgId) {
        let newLayoutHTML = `
                <div class="photoContainer">
                    <div>
                        <p>${username}</p>
                        <p>...</p>
                    </div>
                    <div class="photo">
                        <img src="${imgUrl}">
                        <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" onchange="bookmark(${imgId})" ${favorites.includes(parseInt(imgId)) ? 'checked' : ''}>
                        <label for="checkbox-${imgId}" class="bookmark-icon ${favorites.includes(parseInt(imgId)) ? 'bookmarked' : ''}"></label>
                    </div>
                </div>`;

        container.insertAdjacentHTML('beforeend', newLayoutHTML);
    }


    // Use event delegation for handling image clicks
    document.body.addEventListener('click', function (event) {
        const image = event.target.closest('.image');
        if (image) {
            const themeContainer = image.closest('.themeContainer');

            // Revert to original state if a different container is clicked
            if (fullThemeContainer && fullThemeContainer !== themeContainer) {
                revertToGridView();
            }

            // Save the current theme container and its original grid state
            fullThemeContainer = themeContainer;
            if (!originalGridState) {
                const grid = themeContainer.querySelector('.image-grid');
                if (grid && !grid.classList.contains('blur')) {
                    originalGridState = grid.cloneNode(true);
                }
            }

            // Hide the original grid and display the expanded view + "Back" feature
            const imageGrid = themeContainer.querySelector('.image-grid');
            const logoBackContainer = document.getElementById('logoBackContainer');
            if (imageGrid && !imageGrid.classList.contains('blur')) {
                imageGrid.style.display = 'none';
                scrollPosition = window.scrollY;
                showExpandedView(themeContainer, image.src);
                logoBackContainer.innerHTML = '<i id="iconBack" class="fa-solid fa-arrow-left" style="font-size: 2rem;"></i>';

                // Get the newly added icon element
                const iconBack = document.getElementById('iconBack');

                // Add an event listener to the icon
                iconBack.addEventListener('click', function (event) {
                    // Refreshes page and scrolls to original position
                    event.preventDefault();
                    window.location.reload();
                    window.scrollTo(0, parseInt(scrollPosition, 10));
                });
            }
        }
    });

    // Displays a new expanded view of the images for the specified themeContainer
    function showExpandedView(themeContainer, clickedImageSrc) {
        const allImages = themeContainer.querySelectorAll('.image');
        const usernameInputs = themeContainer.querySelectorAll('input[type="hidden"]');
        const originalMoreDivs = themeContainer.querySelectorAll('.more');

        let newLayoutHTML = `<div class="expanded-view">`;

        // Get the total count of images
        const totalImagesCount = allImages.length;

        // Determine imagesToShow based on totalImagesCount divisibility by 6
        const imagesToShow = (totalImagesCount % 6 === 0) ? totalImagesCount - 1 : totalImagesCount;

        // Add images to the new layout
        for (let index = 0; index < imagesToShow; index++) {
            const img = allImages[index];
            const username = usernameInputs[index].value;
            const imgId = img.id;

            newLayoutHTML += `
                <div class="photoContainer">
                    <div>
                        <p>${username}</p>
                        <p>...</p>
                    </div>
                    <div class="photo">
                        <img src="${img.src}">
                        <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" onchange="bookmark(${imgId})" ${favorites.includes(parseInt(imgId)) ? 'checked' : ''}>
                        <label for="checkbox-${imgId}" class="bookmark-icon ${favorites.includes(parseInt(imgId)) ? 'bookmarked' : ''}"></label>
                    </div>
                </div>`;
        }
        newLayoutHTML += `</div>`;

        // Add the new layout HTML to the container
        themeContainer.insertAdjacentHTML('beforeend', newLayoutHTML);

        // If totalImagesCount is divisible by 6, handle the "more" div
        if (totalImagesCount % 6 === 0) {
            const lastMoreDiv = originalMoreDivs.length > 0 ? originalMoreDivs[originalMoreDivs.length - 1] : null;
            const expandedView = themeContainer.querySelector('.expanded-view');

            if (lastMoreDiv) {
                const lastMoreImage = lastMoreDiv.querySelector('img');
                const lastUsernameInput = lastMoreDiv.querySelector('input[type="hidden"]');
                const loadMoreButton = lastMoreDiv.querySelector('#loadMore');
                const imgId = lastMoreImage.id;

                let newMoreHTML = `
                    <div class="more photoContainer">
                        <div>
                            <p>${lastUsernameInput.value}</p>
                            <p>...</p>
                        </div>
                        <div class="photo">
                            <img src="${lastMoreImage.src}">
                            <a id="loadMore" class="highlightText2"
                               data-theme="${loadMoreButton.getAttribute('data-theme')}"
                               data-offset="${loadMoreButton.getAttribute('data-offset')}"
                               data-url="${loadMoreButton.getAttribute('data-url')}">
                                <i class="fa-solid fa-circle-plus"></i>
                            </a>
                        <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" onchange="bookmark(${imgId})" ${favorites.includes(parseInt(imgId)) ? 'checked' : ''}>
                        <label for="checkbox-${imgId}" class="bookmark-icon ${favorites.includes(parseInt(imgId)) ? 'bookmarked' : ''}"></label>
                        </div>
                    </div>`;

                // Append the new "more" structure to the expanded view
                expandedView.insertAdjacentHTML('beforeend', newMoreHTML);
            }
        }

        // Scroll to the clicked image in the expanded view
        const newImages = themeContainer.querySelectorAll('.photo img');
        newImages.forEach(newImg => {
            if (newImg.src === clickedImageSrc) {
                newImg.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        });
    }

    function revertToGridView() {
        if (!fullThemeContainer || !originalGridState) return;

        // Remove the expanded view and restore the original grid layout
        const expandedView = fullThemeContainer.querySelector('.expanded-view');
        if (expandedView) {
            expandedView.remove();
        }

        const imageGrid = fullThemeContainer.querySelector('.image-grid');
        if (imageGrid && !imageGrid.classList.contains('blur')) {
            imageGrid.style.display = '';
        }

        originalGridState = null; // Clear the saved original state
        fullThemeContainer = null;
    }
});

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