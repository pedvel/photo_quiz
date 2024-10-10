document.addEventListener('DOMContentLoaded', function () {
    const loadMoreButtons = document.querySelectorAll('#loadMore');
    let currentThemeContainer = null;  // Variable to track the active themeContainer

    loadMoreButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            const moreDiv = this.closest('.more');
            const imgInMoreDiv = moreDiv.querySelector('img');

            if (imgInMoreDiv) {
                imgInMoreDiv.style.opacity = '1';
            }

            this.style.display = 'none';

            const theme = this.getAttribute('data-theme');
            const offset = parseInt(this.getAttribute('data-offset'), 10);
            const url = this.getAttribute('data-url');
            const that = this;

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
                        const imageGrid = that.closest('.image-grid');
                        let imgCount = 0;

                        data.forEach((imageData, index) => {
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
                                loadMoreLink.className = 'highlightText2';
                                loadMoreLink.setAttribute('data-theme', theme);
                                loadMoreLink.setAttribute('data-offset', offset + 6);
                                loadMoreLink.setAttribute('data-url', url);
                                loadMoreLink.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
                                moreDiv.appendChild(loadMoreLink);

                                imageGrid.appendChild(moreDiv);

                                loadMoreLink.addEventListener('click', function (event) {
                                    event.preventDefault();
                                    const newMoreDiv = this.closest('.more');
                                    const imgInNewMoreDiv = newMoreDiv.querySelector('img');

                                    if (imgInNewMoreDiv) {
                                        imgInNewMoreDiv.style.opacity = '1';
                                    }

                                    this.style.display = 'none';
                                    loadMoreButtonClick(loadMoreLink, theme, offset + 6, url);
                                });
                            } else {
                                const img = document.createElement('img');
                                img.src = imgUrl;
                                img.className = 'image';
                                img.style.opacity = '1';
                                imageGrid.appendChild(img);
                            }
                        });

                        that.setAttribute('data-offset', offset + imgCount);

                        if (data.length < 6) {
                            that.style.display = 'none';
                        }
                    } else {
                        that.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error loading more images:', error);
                });
        });
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

                    data.forEach((imageData, index) => {
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
                            loadMoreLink.className = 'highlightText2';
                            loadMoreLink.setAttribute('data-theme', theme);
                            loadMoreLink.setAttribute('data-offset', offset + 6);
                            loadMoreLink.setAttribute('data-url', url);
                            loadMoreLink.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
                            moreDiv.appendChild(loadMoreLink);

                            imageGrid.appendChild(moreDiv);

                            loadMoreLink.addEventListener('click', function (event) {
                                event.preventDefault();
                                const newMoreDiv = this.closest('.more');
                                const imgInNewMoreDiv = newMoreDiv.querySelector('img');

                                if (imgInNewMoreDiv) {
                                    imgInNewMoreDiv.style.opacity = '1';
                                }

                                this.style.display = 'none';
                                loadMoreButtonClick(loadMoreLink, theme, offset + 6, url);
                            });
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

    // Reverts the previous themeContainer back to grid view
    function revertToGridView(container) {
        if (!container) return;  // If there's no active container, do nothing

        // Fetch quizContent and images from the container
        const quizContent = container.querySelector('h2').innerText;
        const allImages = container.querySelectorAll('.photo img');

        // Build grid layout HTML
        let gridLayoutHTML = `
            <h2>${quizContent}</h2>
            <div class="image-grid">`;

        allImages.forEach((img, index) => {
            gridLayoutHTML += `<img src="${img.src}" class="image">`;
        });

        gridLayoutHTML += `</div>`;

        container.innerHTML = gridLayoutHTML;  // Restore the grid layout
    }

    // Function to handle image click and update the layout
    const themeContainers = document.querySelectorAll('.themeContainer');
    themeContainers.forEach(container => {
        const images = container.querySelectorAll('.image');

        images.forEach(image => {
            image.addEventListener('click', function () {
                const themeContainer = this.closest('.themeContainer');
                const quizContent = themeContainer.querySelector('h2').innerText;
                const clickedImageSrc = this.src;

                // Revert the previously expanded container to grid view, if any
                if (currentThemeContainer && currentThemeContainer !== themeContainer) {
                    revertToGridView(currentThemeContainer);
                }

                currentThemeContainer = themeContainer;  // Set the new active container

                // Get the images in this container (current theme)
                const imageGrid = themeContainer.querySelector('.image-grid');
                const allImages = imageGrid.querySelectorAll('.image');

                // Prepare the new layout HTML structure for the clicked themeContainer
                let newLayoutHTML = '';
                allImages.forEach((img, index) => {
                    newLayoutHTML += `
                        <div class="photoContainer">
                            <div>
                                <p>User ${index + 1}</p>
                                <p>...</p>
                            </div>
                            <div class="photo">
                                <img src="${img.src}">
                                <input type="checkbox" id="checkbox-${index}" class="bookmark-toggle" onchange="toggleFavorite(${index})">
                                <label for="checkbox-${index}" class="bookmark-icon"></label>
                            </div>
                        </div>`;
                });

                // Replace the current grid view with the new layout in this themeContainer
                themeContainer.innerHTML = `
                    <h2>${quizContent}</h2>
                    ${newLayoutHTML}`;

                // Scroll the page to the clicked image in the new layout
                const newImages = themeContainer.querySelectorAll('.photo img');
                newImages.forEach(newImg => {
                    if (newImg.src === clickedImageSrc) {
                        newImg.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
                    }
                });
            });
        });
    });

    // Dummy function for handling bookmarks
    window.toggleFavorite = function (id) {
        console.log(`Toggling favorite for image ${id}`);
    };
});