document.addEventListener('DOMContentLoaded', function () {
    let fullThemeContainer = null; // Variable to track the active themeContainer
    let originalGridState = null;  // To save the original state for the themeContainer

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
        const theme = themeContainer.querySelector('h2').textContent;

        let newLayoutHTML = `<div class="expanded-view">`;

        // Load bookmark.js if not already loaded
        loadScript('../static/bookmark.js')
            .then(() => {
                console.log('bookmark.js loaded successfully.');
            })
            .catch((error) => {
                console.error('Error loading bookmark.js:', error);
            });

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
                        <img src="${img.src}" alt="${username} ${theme}">
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
                const theme = themeContainer.querySelector('h2').textContent;

                let newMoreHTML = `
                    <div class="more photoContainer">
                        <div>
                            <p>${lastUsernameInput.value}</p>
                            <p>...</p>
                        </div>
                        <div class="photo">
                            <img src="${lastMoreImage.src}" alt=${lastUsernameInput.value} ${theme}>
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