document.addEventListener("DOMContentLoaded", () => {
    // ** DOM Element References **
    const themeModal = document.getElementById('expanded-view');

    // ** URL Parameters **
    const urlParams = new URLSearchParams(window.location.search);
    const imageId = urlParams.get('imageId'); // Specific image to scroll into view
    console.log("imageId:", imageId);

    // Scroll to the specific clicked image if needed
    const newImages = themeModal.querySelectorAll('.photo img');
    newImages.forEach(newImg => {
        if (newImg.id === imageId) {
            newImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});
