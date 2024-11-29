document.addEventListener('DOMContentLoaded', function () {
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

        // Remove the "more" class from the div
        moreDiv.classList.remove('more');

        // Retrieves necessary data attributes for data fetch
        const theme = loadMoreButton.getAttribute('data-theme');
        const offset = parseInt(loadMoreButton.getAttribute('data-offset'), 10);
        console.log("Initial offset:", offset);
        const limit = parseInt(loadMoreButton.getAttribute('data-limit'), 10);
        console.log("Initial limit:", limit);
        const dataUrl = loadMoreButton.getAttribute('data-url');

        dataFetch(loadMoreButton, theme, offset, dataUrl, limit);
    }

    function dataFetch(button, theme, offset, dataUrl, limit) {
        fetch(`${dataUrl}?theme=${encodeURIComponent(theme)}&offset=${offset}&limit=${limit}`, {
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
                            loadSixthPhotoToGridLayout(container, username, imgUrl, imgId, theme, offset, dataUrl, limit);
                        } else {
                            // Append based on the container type
                            appendGridImage(container, username, imgUrl, imgId, theme);
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
    function loadSixthPhotoToGridLayout(container, username, imgUrl, imgId, theme, offset, dataUrl, limit) {
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
        img.alt = theme;
        moreDiv.appendChild(img);

        const loadMoreButton = document.createElement('a');
        loadMoreButton.id = 'loadMore';
        loadMoreButton.className = 'highlightText2';
        loadMoreButton.setAttribute('data-theme', theme);
        loadMoreButton.setAttribute('data-offset', offset + 6);
        console.log("New offset:", offset + 6);
        loadMoreButton.setAttribute('data-limit', limit);
        console.log("New limit:", limit);
        loadMoreButton.setAttribute('data-url', dataUrl);
        loadMoreButton.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
        moreDiv.appendChild(loadMoreButton);

        container.appendChild(moreDiv);
    }

    // Remaining photos
    function appendGridImage(container, username, imgUrl, imgId, theme) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.value = username;
        container.appendChild(hiddenInput);

        const img = document.createElement('img');
        img.src = imgUrl;
        img.id = imgId;
        img.className = 'image';
        img.alt = username + " " + theme;
        container.appendChild(img);
    }
});