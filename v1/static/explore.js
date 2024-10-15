document.addEventListener('DOMContentLoaded', function () {
    let fullThemeContainer = null; // Variable to track the active themeContainer
    let originalGridState = null;  // To save the original state for the themeContainer

    // Use event delegation for handling "Load More" button clicks
    document.body.addEventListener('click', function (event) {
        const loadMoreLink = event.target.closest('#loadMore');

        // Check if the clicked element is a "Load More" button
        if (loadMoreLink) {
            event.preventDefault();
            handleLoadMore(loadMoreLink);
        }
    });

    function handleLoadMore(loadMoreLink) {
        // Finds the closest .more container and changes the img opacity
        const moreDiv = loadMoreLink.closest('.more');
        const imgInMoreDiv = moreDiv.querySelector('img');

        if (imgInMoreDiv) {
            imgInMoreDiv.style.opacity = '1';
        }

        // Hide "more" button
        loadMoreLink.style.display = 'none';

        // Retrieves necessary data attributes
        const theme = loadMoreLink.getAttribute('data-theme');
        const offset = parseInt(loadMoreLink.getAttribute('data-offset'), 10);
        const url = loadMoreLink.getAttribute('data-url');

        loadMoreButtonClick(loadMoreLink, theme, offset, url);
    }

    function loadMoreButtonClick(button, theme, offset, url) {
        button.style.display = 'none';

        fetch(`${url}?theme=${encodeURIComponent(theme)}&offset=${offset}`, {
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

                        if (imgCount === 6) {
                            // Check if the container is an image grid or expanded view
                            if (container.classList.contains('image-grid')) {
                                createMoreDiv(container, theme, offset, url, username, imgUrl);
                            } else {
                                // Create a new structure like in the showExpandedView function
                                const newMoreHTML = `
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
                                           data-url="${url}">
                                            <i class="fa-solid fa-circle-plus"></i>
                                        </a>
                                        <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" onchange="bookmark(${imgId})" ${favorites.includes(parseInt(imgId)) ? 'checked' : ''}>
                                        <label for="checkbox-${imgId}" class="bookmark-icon ${favorites.includes(parseInt(imgId)) ? 'bookmarked' : ''}"></label>
                                    </div>
                                </div>`;
                                container.insertAdjacentHTML('beforeend', newMoreHTML);
                            }
                        } else {
                            // Append based on the container type
                            if (container.classList.contains('expanded-view')) {
                                appendExpandedImage(container, username, imgUrl, imgId);
                            } else {
                                appendImage(container, username, imgUrl, true, imgId);
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


    // Dynamically creates a new .more div to hold additional content when the "Load More" button is clicked
    // For grid view?
    function createMoreDiv(container, theme, offset, url, username, imgUrl) {
        const moreDiv = document.createElement('div');
        moreDiv.className = 'more';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.value = username;
        moreDiv.appendChild(hiddenInput);

        const img = document.createElement('img');
        img.src = imgUrl;
        img.className = 'image';
        img.style.opacity = '0.25';
        moreDiv.appendChild(img);

        const loadMoreLink = document.createElement('a');
        loadMoreLink.id = 'loadMore';
        loadMoreLink.className = 'highlightText2';
        loadMoreLink.setAttribute('data-theme', theme);
        loadMoreLink.setAttribute('data-offset', offset + 6);
        loadMoreLink.setAttribute('data-url', url);
        loadMoreLink.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
        moreDiv.appendChild(loadMoreLink);

        container.appendChild(moreDiv);
    }

    // Appends new images to grid view
    function appendImage(container, username, imgUrl, visible, imgId) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.value = username;
        container.appendChild(hiddenInput);

        const img = document.createElement('img');
        img.src = imgUrl;
        img.id = imgId;
        img.className = 'image';
        img.style.opacity = visible ? '1' : '0.25'; // Set opacity based on visibility
        container.appendChild(img);
    }

    // Appends an image with additional user information (username) to an expanded view.
    function appendExpandedImage(container, username, imgUrl, imgId) {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photoContainer';

        const userInfo = document.createElement('div');
        userInfo.innerHTML = `
            <p>${username}</p>
            <p>...</p>
        `;
        photoContainer.appendChild(userInfo);

        const photoDiv = document.createElement('div');
        photoDiv.className = 'photo';

        const img = document.createElement('img');
        img.src = imgUrl;
        img.id = imgId;
        img.className = 'image';
        img.style.opacity = '1';
        photoDiv.appendChild(img);

        // Add a checkbox and label for bookmarking (similar to newLayoutHTML in showExpandedView)
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'bookmark-toggle';
        checkbox.onchange = function () {
            bookmark(imgId);
        };
        const label = document.createElement('label');
        label.className = 'bookmark-icon';
        photoDiv.appendChild(checkbox);
        photoDiv.appendChild(label);

        photoContainer.appendChild(photoDiv);
        container.appendChild(photoContainer);
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
                originalGridState = themeContainer.querySelector('.image-grid').cloneNode(true);
            }

            // Hide the original grid and display the expanded view
            themeContainer.querySelector('.image-grid').style.display = 'none';
            showExpandedView(themeContainer, image.src);
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
                const loadMoreLink = lastMoreDiv.querySelector('a#loadMore');
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
                               data-theme="${loadMoreLink.getAttribute('data-theme')}"
                               data-offset="${loadMoreLink.getAttribute('data-offset')}"
                               data-url="${loadMoreLink.getAttribute('data-url')}">
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
        imageGrid.style.display = '';

        originalGridState = null; // Clear the saved original state
        fullThemeContainer = null;
    }
});
