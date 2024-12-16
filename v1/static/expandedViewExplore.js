document.addEventListener("DOMContentLoaded", () => {
    // ** DOM Element References **
    const themeModal = document.getElementById('themeModal');
    const expandedView = document.getElementById('expanded-view');
    const loadingMessage = document.getElementById("loading");

    // ** State Variables **
    let isLoading = false; // Prevent simultaneous fetches
    let offset = 0; // Offset for paginated fetches
    let limit = 0; // Number of images to fetch per request

    // ** URL Parameters **
    const urlParams = new URLSearchParams(window.location.search);
    const imageCount = urlParams.get('imageCount'); // Images per fetch (overrides default if provided)
    if (imageCount) limit = parseInt(imageCount, 10);

    const imageId = urlParams.get('imageId'); // Specific image to scroll into view
    console.log("imageId:", imageId);

    // ** Fetch and Render Images **
    const fetchThemeImages = () => {
        if (isLoading) return; // Prevent multiple simultaneous fetches
        isLoading = true;
        loadingMessage.style.display = "block"; // Show loading message

        console.log(`Fetching images for theme: ${theme}, offset: ${offset}, limit: ${limit}`);

        fetch(`/load_more?theme=${encodeURIComponent(theme)}&offset=${offset}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(response => response.json())
            .then(images => {
                console.log("Fetched images:", images);
                // Build HTML layout for fetched images
                let newLayoutHTML = ``;

                images.forEach(item => {
                    const { id, pic_url, user_name } = item;
                    const isFavorite = favorites.includes(id);
                    const profileUrl = `/${user_name}`;

                    newLayoutHTML += `
                <div class="photoContainer">
                    <div>
                        <a href="${profileUrl}">${user_name}</a>
                    </div>
                    <div class="photo">
                        <img src="${pic_url}" alt="${user_name} ${theme}" id="${id}">
                        <input type="checkbox" id="checkbox-${id}" class="bookmark-toggle" ${isFavorite ? 'checked' : ''}>
                        <label for="checkbox-${id}" class="bookmark-icon ${isFavorite ? 'bookmarked' : ''}"></label>
                    </div>
                </div>`;
                });

                expandedView.innerHTML += newLayoutHTML; // Append new images to the view

                // Attach event listeners to all checkboxes after adding them to the DOM
                themeModal.querySelectorAll('.bookmark-toggle').forEach((checkbox) => {
                    const imgId = parseInt(checkbox.id.split('-')[1]); // Extract imgId from checkbox id
                    checkbox.checked = favorites.includes(imgId); // Set checked state based on favorites array
                    checkbox.addEventListener('change', () => bookmark(imgId)); // Attach bookmark handler
                });

                // Scroll to the specific clicked image if needed
                const newImages = themeModal.querySelectorAll('.photo img');
                newImages.forEach(newImg => {
                    if (newImg.id === imageId) {
                        newImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });

                // Update offset for the next fetch
                offset += limit;
                console.log(`New offset: ${offset}, New limit: ${limit}`);
            })
            .catch(error => console.error("Error fetching theme images:", error))
            .finally(() => {
                isLoading = false;
                loadingMessage.style.display = "none";
            });
    };

    // Fetch more images when the user scrolls near the bottom
    const fetchMoreThemeImages = () => {
        if (isLoading) return; // Prevent multiple simultaneous fetches
        isLoading = true;
        loadingMessage.style.display = "block"; // Show loading message

        console.log(`Fetching more images for theme: ${theme}, offset: ${offset}, limit: 6`);

        fetch(`/load_more?theme=${encodeURIComponent(theme)}&offset=${offset}&limit=6`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(response => response.json())
            .then(images => {
                console.log("Fetched more images:", images);
                let newLayoutHTML = ``;

                images.forEach(item => {
                    const { id, pic_url, user_name } = item;
                    const isFavorite = favorites.includes(id);

                    newLayoutHTML += `
                <div class="photoContainer">
                    <div>
                        <p>${user_name}</p>
                    </div>
                    <div class="photo">
                        <img src="${pic_url}" alt="${user_name} ${theme}" id="${id}">
                        <input type="checkbox" id="checkbox-${id}" class="bookmark-toggle" ${isFavorite ? 'checked' : ''}>
                        <label for="checkbox-${id}" class="bookmark-icon ${isFavorite ? 'bookmarked' : ''}"></label>
                    </div>
                </div>`;
                });

                expandedView.innerHTML += newLayoutHTML; // Append new images to the view

                // Update offset for the next fetch
                offset += 6; // Increment offset by 6 for the next batch
                console.log(`New offset: ${offset}, New limit: 6`);

                // Handle case when no more images are available
                if (images.length === 0) {
                    console.log("No more images to load.");
                    window.removeEventListener("scroll", handleScroll); // Stop infinite scroll
                    let endLayout = `
                    <div class="homeEnd">
                        <i class="fa-regular fa-circle-check"></i>
                        <div>
                            <h3>You are all caught up</h3>
                            <h4>You've seen all theme photos</h4>
                        </div>
                        <a class="highlightText2" id="copyLinkButton">Share Pixly with a friend!</a>    
                    </div>`;
                    expandedView.innerHTML += endLayout;

                    const copyLinkButton = document.getElementById('copyLinkButton');
                    if (copyLinkButton) {
                        copyLinkButton.addEventListener('click', function (event) {  // Changed to 'click' for broader compatibility
                            event.preventDefault();

                            const currentURL = "https://pixly.pythonanywhere.com/";  // Assuming you want the current URL

                            const tempTextArea = document.createElement('textarea');
                            tempTextArea.value = currentURL;

                            document.body.appendChild(tempTextArea);
                            tempTextArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(tempTextArea);

                            const popup = document.getElementById('popup');
                            popup.textContent = 'Pixly link copied, ready to share!';

                            // Show and fade out the popup
                            popup.style.display = 'block';
                            popup.style.opacity = '1';
                            setTimeout(() => {
                                popup.style.opacity = '0';
                                setTimeout(() => {
                                    popup.style.display = 'none';
                                }, 1000);
                            }, 1000);
                        });
                    }
                    return;
                }
            })
            .catch(error => console.error("Error fetching more images:", error))
            .finally(() => {
                isLoading = false;
                loadingMessage.style.display = "none";
            });
    };

    // Infinite scroll event handler
    const handleScroll = () => {
        console.log("Scroll event detected");
        // Check if the user is near the bottom of the page
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            console.log("User reached bottom, fetching more images...");
            fetchMoreThemeImages();
        }
    };

    // Initial fetch to load images on page load
    fetchThemeImages();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
});
