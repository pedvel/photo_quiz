// infiniteScroll.js
document.addEventListener("DOMContentLoaded", function () {
    const themesContainer = document.getElementById("themes-container");
    const loading = document.getElementById("loading");
    let page = 1; // Initial page to load
    let isLoading = false;

    // Function to fetch and add theme containers
    const fetchThemeContainers = async () => {
        isLoading = true;
        loading.style.display = "block"; // Show loading indicator

        try {
            // Replace this with your actual fetch call to the server
            const response = await fetch(`/your-endpoint?page=${page}`); // Modify this line
            const data = await response.json();

            // Parse and add each theme container to the DOM
            data.themeContainers.forEach(theme => {
                const themeContainer = document.createElement("div");
                themeContainer.className = "themeContainer";

                // Populate theme container with title and images
                themeContainer.innerHTML = `
                    <h2>${theme.title}</h2>
                    <div class="image-grid">
                        ${theme.images.map((image, index) => `
                            <div class="${index === 5 ? 'more' : ''}">
                                <input type="hidden" value="${image.description}">
                                <img src="${image.url}" id="${image.id}" class="image" alt="${image.description}">
                                ${index === 5 ? `<a id="loadMore" class="highlightText2" data-theme="${theme.title}" data-offset="6" data-url="/load_more"><i class="fa-solid fa-circle-plus"></i></a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;

                themesContainer.appendChild(themeContainer);
            });

            page++; // Move to the next page for the next fetch
        } catch (error) {
            console.error("Error loading themes:", error);
        } finally {
            isLoading = false;
            loading.style.display = "none"; // Hide loading indicator
        }
    };

    // Infinite scroll event handler
    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

        if (!isLoading && scrollTop + clientHeight >= scrollHeight - 100) {
            fetchThemeContainers(); // Load more content when reaching the bottom
        }
    };

    // Initial load of theme containers
    fetchThemeContainers();

    // Attach scroll event listener
    window.addEventListener("scroll", handleScroll);
});
