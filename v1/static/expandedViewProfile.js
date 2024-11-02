document.addEventListener('DOMContentLoaded', function () {
    let fullThemeContainer = null; // Variable to track the active themeContainer
    let originalGridState = null;  // To save the original state for the themeContainer

    // Use event delegation for handling image clicks
    document.body.addEventListener('click', function (event) {
        const image = event.target.closest('.image');
        if (image) {
            const imageGrid = image.closest('.image-grid');

            const logoBackContainer = document.getElementById('logoBackContainer');
            if (imageGrid) {
                imageGrid.style.display = 'none';
                scrollPosition = window.scrollY;
                showExpandedView(imageGrid, image.src);
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

    // Displays a new expanded view of the images
    function showExpandedView(imageGrid, clickedImageSrc) {
        const allImages = imageGrid.querySelectorAll('.image');
        const themes = imageGrid.querySelectorAll('input[type="hidden"]');

        let newLayoutHTML = `<div class="expanded-view">`;

        // Get the total count of images
        const totalImagesCount = allImages.length;

        // Determine imagesToShow based on totalImagesCount divisibility by 6
        const imagesToShow = (totalImagesCount % 6 === 0) ? totalImagesCount - 1 : totalImagesCount;

        // Add images to the new layout
        for (let index = 0; index < imagesToShow; index++) {
            const img = allImages[index];
            const theme = themes[index].value;
            const imgId = img.id;

            newLayoutHTML += `
                <div class="photoContainer">
                    <div>
                        <p>${theme}</p>
                        <p>...</p>
                    </div>
                    <div class="photo">
                        <img src="${img.src}" alt="${theme}">
                        <input type="checkbox" id="checkbox-${imgId}" class="bookmark-toggle" onchange="bookmark(${imgId})" ${favorites.includes(parseInt(imgId)) ? 'checked' : ''}>
                        <label for="checkbox-${imgId}" class="bookmark-icon ${favorites.includes(parseInt(imgId)) ? 'bookmarked' : ''}"></label>
                    </div>
                </div>`;
        }
        newLayoutHTML += `</div>`;

        // Add the new layout HTML to the container
        imageGrid.insertAdjacentHTML('beforeend', newLayoutHTML);

        // Scroll to the clicked image in the expanded view
        const newImages = imageGrid.querySelectorAll('.photo img');
        newImages.forEach(newImg => {
            if (newImg.src === clickedImageSrc) {
                newImg.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        });
    }
});