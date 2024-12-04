document.body.addEventListener('click', function (event) {
    if (popupOpen || ignoreClicks) return;

    const image = event.target.closest('.image');
    if (!image) return;

    const imageGrid = image.closest('.image-grid');
    if (imageGrid && imageGrid.classList.contains('blur')) return;

    const moreContainer = image.closest('.more');
    if (moreContainer) return;

    const themeContainer = image.closest('.themeContainer');
    if (!themeContainer) return;

    const theme = themeContainer.querySelector('h2').textContent;
    const imageId = image.id;
    const images = imageGrid.querySelectorAll('img.image');

    // Get the count of images
    const imageCount = images.length;

    // Redirect to the new page with theme as a path parameter and image ID as a query param
    window.location.href = `${exploreThemeUrl}${encodeURIComponent(theme)}?imageCount=${encodeURIComponent(imageCount)}&imageId=${encodeURIComponent(imageId)}`;
});
