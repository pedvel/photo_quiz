const themeContainers = document.querySelectorAll('.themeContainer');
const exploreTitle = document.querySelector('h1');

window.addEventListener('scroll', () => {
    themeContainers.forEach((container, index) => {
        const h2 = container.querySelector('h2');
        const themeRect = container.getBoundingClientRect();
        const titleRect = exploreTitle.getBoundingClientRect();

        // Check if the bottom of the title is above the top of the h2
        if (titleRect.bottom >= themeRect.top && titleRect.bottom <= themeRect.bottom) {
            h2.classList.add('sticky');
        } else {
            h2.classList.remove('sticky');
        }

        // Remove sticky class if the next container's top is in view
        const nextContainer = themeContainers[index + 1];
        if (nextContainer) {
            const nextRect = nextContainer.getBoundingClientRect();
            if (nextRect.top <= themeRect.bottom) {
                h2.classList.remove('sticky');
            }
        }
    });
});
