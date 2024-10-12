document.addEventListener('DOMContentLoaded', function () {
    let fullThemeContainer = null; // Variable to track the active themeContainer
    let originalGridState = null;  // To save the original state for the themeContainer

    // Use event delegation for handling "Load More" button clicks
    document.body.addEventListener('click', function (event) {
        const loadMoreLink = event.target.closest('#loadMore');

        // Check if the clicked element is a "Load More" button
        if (loadMoreLink) {
            event.preventDefault();

            // Makes 6th image visible
            const moreDiv = loadMoreLink.closest('.more');
            const imgInMoreDiv = moreDiv.querySelector('img');

            if (imgInMoreDiv) {
                imgInMoreDiv.style.opacity = '1';
            }

            // Hide "more" button
            loadMoreLink.style.display = 'none';

            // Fetching more content
            const theme = loadMoreLink.getAttribute('data-theme');
            const offset = parseInt(loadMoreLink.getAttribute('data-offset'), 10);
            const url = loadMoreLink.getAttribute('data-url');

            loadMoreButtonClick(loadMoreLink, theme, offset, url);
        }
    });

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
                if (Array.isArray(data) && data.length > 0) {
                    const imageGrid = button.closest('.image-grid');
                    let imgCount = 0;

                    data.forEach((imageData) => {
                        imgCount++;
                        const imgUrl = imageData.pic_url;

                        if (imgCount === 6) {
                            const moreDiv = document.createElement('div');
                            moreDiv.className = 'more';

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

                            imageGrid.appendChild(moreDiv);
                        } else {
                            const img = document.createElement('img');
                            img.src = imgUrl;
                            img.className = 'image';
                            img.style.opacity = '1';
                            imageGrid.appendChild(img);
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

    // Function to handle image click and update the layout
    const themeContainers = document.querySelectorAll('.themeContainer');
    themeContainers.forEach(container => {
        const images = container.querySelectorAll('.image');

        images.forEach(image => {
            image.addEventListener('click', function () {
                const themeContainer = this.closest('.themeContainer');

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
                showExpandedView(themeContainer, this.src);
            });
        });
    });

    function showExpandedView(themeContainer, clickedImageSrc) {
        const quizContent = themeContainer.querySelector('h2').innerText;
        const allImages = themeContainer.querySelectorAll('.image');
        const usernameInputs = themeContainer.querySelectorAll('input[type="hidden"]');

        let newLayoutHTML = `
            <div class="expanded-view">`;

        allImages.forEach((img, index) => {
            const username = usernameInputs[index].value;
            newLayoutHTML += `
                <div class="photoContainer">
                    <div>
                        <p>${username}</p>
                        <p>...</p>
                    </div>
                    <div class="photo">
                        <img src="${img.src}">
                        <input type="checkbox" id="checkbox-${index}" class="bookmark-toggle" onchange="toggleFavorite(${index})">
                        <label for="checkbox-${index}" class="bookmark-icon"></label>
                    </div>
                </div>`;
        });

        newLayoutHTML += '</div>';

        // Add the new layout HTML to the container
        themeContainer.insertAdjacentHTML('beforeend', newLayoutHTML);

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

    // Dummy function for handling bookmarks
    window.toggleFavorite = function (id) {
        console.log(`Toggling favorite for image ${id}`);
    };
});
