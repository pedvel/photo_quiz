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

        if (data.status === 'added') {
            console.log('Added to bookmarks');
            checkbox.checked = true;
            checkbox.nextElementSibling.classList.add('bookmarked');
            popup.textContent = 'Added to bookmarks';

            // Update local favorites array
            if (!favorites.includes(image_id)) {
                favorites.push(image_id); // Add image_id to favorites array
            }

        } else if (data.status === 'removed') {
            console.log('Removed from bookmarks');
            checkbox.checked = false;
            checkbox.nextElementSibling.classList.remove('bookmarked');
            popup.textContent = 'Removed from bookmarks';

            // Update local favorites array
            const index = favorites.indexOf(image_id);
            if (index !== -1) {
                favorites.splice(index, 1); // Remove image_id from favorites array
            }
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
