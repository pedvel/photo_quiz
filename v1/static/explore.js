document.addEventListener('DOMContentLoaded', function () {
    const loadMoreButtons = document.querySelectorAll('#loadMore');

    loadMoreButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            const moreDiv = this.closest('.more');
            const imgInMoreDiv = moreDiv.querySelector('img'); // Get the image in the same div

            // Restore opacity to the image in the more div
            if (imgInMoreDiv) {
                imgInMoreDiv.style.opacity = '1';
            }

            // Hide the original loadMore button
            this.style.display = 'none';

            const theme = this.getAttribute('data-theme');
            const offset = parseInt(this.getAttribute('data-offset'), 10);
            const url = this.getAttribute('data-url');
            const that = this; // Reference to the clicked button

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
                    console.log('Data received:', data);
                    if (Array.isArray(data) && data.length > 0) {
                        const imageGrid = that.closest('.image-grid');
                        let imgCount = 0;

                        data.forEach((imgUrl, index) => {
                            imgCount++;

                            // Check if this is the 6th image
                            if (imgCount === 6) {
                                const moreDiv = document.createElement('div');
                                moreDiv.className = 'more';

                                const img = document.createElement('img');
                                img.src = imgUrl;
                                img.className = 'image';
                                img.style.opacity = '0.25'; // Set opacity to 0.25 for the 6th image
                                moreDiv.appendChild(img);

                                const loadMoreLink = document.createElement('a');
                                loadMoreLink.className = 'highlightText2';
                                loadMoreLink.setAttribute('data-theme', theme);
                                loadMoreLink.setAttribute('data-offset', offset + 6); // Increment offset
                                loadMoreLink.setAttribute('data-url', url);
                                loadMoreLink.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
                                moreDiv.appendChild(loadMoreLink);

                                imageGrid.appendChild(moreDiv);

                                // Add event listener to the new loadMore button
                                loadMoreLink.addEventListener('click', function (event) {
                                    event.preventDefault();
                                    const newMoreDiv = this.closest('.more');
                                    const imgInNewMoreDiv = newMoreDiv.querySelector('img'); // Get the image in the new more div

                                    // Restore opacity to the image in the new more div
                                    if (imgInNewMoreDiv) {
                                        imgInNewMoreDiv.style.opacity = '1';
                                    }

                                    this.style.display = 'none'; // Hide this loadMore button
                                    loadMoreButtonClick(loadMoreLink, theme, offset + 6, url);
                                });
                            } else {
                                const img = document.createElement('img');
                                img.src = imgUrl;
                                img.className = 'image';
                                img.style.opacity = '1'; // Restore opacity for other images
                                imageGrid.appendChild(img);
                            }
                        });

                        // Update the offset for the next request
                        that.setAttribute('data-offset', offset + imgCount);
                        console.log('New offset set to:', offset + imgCount);

                        // Optionally hide the button if no more images
                        if (data.length < 6) {
                            that.style.display = 'none'; // Hide if fewer than 6 images returned
                        }
                    } else {
                        // Hide the button if no more images
                        console.log('No more images to load.');
                        that.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error loading more images:', error);
                });
        });
    });

    // Function to handle loading more images
    function loadMoreButtonClick(button, theme, offset, url) {
        button.style.display = 'none'; // Hide this button

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
                console.log('Data received:', data);
                if (Array.isArray(data) && data.length > 0) {
                    const imageGrid = button.closest('.image-grid');
                    let imgCount = 0;

                    data.forEach((imgUrl, index) => {
                        imgCount++;

                        // Check if this is the 6th image
                        if (imgCount === 6) {
                            const moreDiv = document.createElement('div');
                            moreDiv.className = 'more';

                            const img = document.createElement('img');
                            img.src = imgUrl;
                            img.className = 'image';
                            img.style.opacity = '0.25'; // Set opacity to 0.25 for the 6th image
                            moreDiv.appendChild(img);

                            const loadMoreLink = document.createElement('a');
                            loadMoreLink.className = 'highlightText2';
                            loadMoreLink.setAttribute('data-theme', theme);
                            loadMoreLink.setAttribute('data-offset', offset + 6); // Increment offset
                            loadMoreLink.setAttribute('data-url', url);
                            loadMoreLink.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
                            moreDiv.appendChild(loadMoreLink);

                            imageGrid.appendChild(moreDiv);

                            // Add event listener to the new loadMore button
                            loadMoreLink.addEventListener('click', function (event) {
                                event.preventDefault();
                                const newMoreDiv = this.closest('.more');
                                const imgInNewMoreDiv = newMoreDiv.querySelector('img'); // Get the image in the new more div

                                // Restore opacity to the image in the new more div
                                if (imgInNewMoreDiv) {
                                    imgInNewMoreDiv.style.opacity = '1';
                                }

                                this.style.display = 'none'; // Hide this loadMore button
                                loadMoreButtonClick(loadMoreLink, theme, offset + 6, url);
                            });
                        } else {
                            const img = document.createElement('img');
                            img.src = imgUrl;
                            img.className = 'image';
                            img.style.opacity = '1'; // Restore opacity for other images
                            imageGrid.appendChild(img);
                        }
                    });

                    // Update the offset for the next request
                    button.setAttribute('data-offset', offset + imgCount);
                    console.log('New offset set to:', offset + imgCount);

                    // Optionally hide the button if no more images
                    if (data.length < 6) {
                        button.style.display = 'none'; // Hide if fewer than 6 images returned
                    }
                } else {
                    // Hide the button if no more images
                    console.log('No more images to load.');
                    button.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error loading more images:', error);
            });
    }
});
