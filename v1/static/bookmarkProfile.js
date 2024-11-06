async function bookmark(image_id) {
    const checkbox = document.getElementById(`checkbox-${image_id}`);
    const popup = document.getElementById('popup');

    try {
        // Fetch request to toggle favorite status
        const response = await fetch(`${bookmarkUrl}?image_id=${image_id}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error('Error while requesting data');
        }

        const data = await response.json();
        const savesField = document.querySelector('.userHeader a p');
        let saves = parseInt(savesField.textContent, 10);

        if (data.status === 'added') {
            console.log('Added to bookmarks');
            checkbox.checked = true; // Mark the checkbox as checked
            // Optionally change the icon style to indicate it's bookmarked
            checkbox.nextElementSibling.classList.add('bookmarked'); // Add a class for styling
            popup.textContent = 'Added to bookmarks';
            saves += 1;
            savesField.textContent = saves;

        } else if (data.status === 'removed') {
            console.log('Removed from bookmarks');
            checkbox.checked = false; // Uncheck the checkbox
            // Remove the bookmarked style
            checkbox.nextElementSibling.classList.remove('bookmarked');
            popup.textContent = 'Removed from bookmarks';
            saves -= 1;
            savesField.textContent = saves;
        } else {
            console.error('Error: ', data.message);
        }

        // Show and fade out the popup
        popup.style.display = 'block';
        popup.style.opacity = '1';
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 1000);
        }, 1000);

    } catch (error) {
        console.error('Error in the process:', error);
    }
}

