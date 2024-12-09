document.body.addEventListener('click', function (event) {
    if (popupOpen || ignoreClicks) return;

    const image = event.target.closest('.image');
    if (!image) return;

    const imageId = image.id;

    // Redirect to the new page with theme as a path parameter and image ID as a query param
    window.location.href = `${expandProfileUrl}?imageId=${encodeURIComponent(imageId)}`;
});