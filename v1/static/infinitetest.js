document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    const themesContainer = document.getElementById("themes-container");
    let completed_themes = document.querySelector('input[name="completed_themes"]').value;
    let offset = 0;

    const loadingMessage = document.getElementById("loading");
    let isLoading = false;

    const fetchThemes = () => {
        if (isLoading) return; // Prevent multiple requests
        isLoading = true;
        loadingMessage.style.display = "block"; // Show loading message

        fetch(`${exploreMoreUrl}?completed_themes=${completed_themes}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })

            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data fetched successfully:", data);
                const themesData = data.pics;

                if (Object.keys(themesData).length === 0) {
                    console.log("No more themes to load");
                    window.removeEventListener("scroll", handleScroll);
                    loadingMessage.textContent = "No more themes to load";
                    return;
                }

                Object.entries(themesData).forEach(([theme, photos]) => {
                    console.log(`Processing theme: ${theme}`);
                    //Crea el div del tema
                    const themeContainer = document.createElement('div');
                    themeContainer.className = 'themeContainer';

                    //Agrega el titulo
                    const themeName = document.createElement('h2');
                    themeName.textContent = theme;
                    themeContainer.appendChild(themeName);

                    //Crea el div de la grilla
                    const imageGrid = document.createElement('div');
                    if (completed_themes.includes(theme)) {
                        imageGrid.className = 'image-grid';

                        photos.forEach(([id, pic_url, username]) => {
                            const userInput = document.createElement("input");
                            userInput.type = "hidden";
                            userInput.value = username;
                            imageGrid.appendChild(userInput);

                            const img = document.createElement("img");
                            img.src = pic_url;
                            img.alt = "";
                            img.id = id;
                            img.className = "image";
                            //Agrega la imagen a la grilla
                            imageGrid.appendChild(img);
                        });
                    } else {
                        imageGrid.className = 'image-grid blur';

                        photos.forEach(([id, pic_url]) => {
                            const img = document.createElement("img");
                            img.src = pic_url;
                            img.className = "image";
                            //Agrega la imagen a la grilla
                            imageGrid.appendChild(img);
                        });

                        const eyeIcon = document.createElement("i");
                        eyeIcon.className = "fa-solid fa-eye highlightText2";
                        eyeIcon.onclick = () => snapTheme(theme);
                        imageGrid.appendChild(eyeIcon);
                    }
                    //Agrega la grilla al tema
                    themeContainer.appendChild(imageGrid);
                    //Agrega el tema a la pagina
                    themesContainer.appendChild(themeContainer);
                });
                offset += 8;
            })
            .catch(error => {
                console.error("Fetch error:", error);
            })
            .finally(() => {
                isLoading = false;
                loadingMessage.style.display = "none";
            });
    };

    const handleScroll = () => {
        // Check if user scrolled near the bottom
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            fetchThemes();
        }
    };

    // Initial fetch
    fetchThemes();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
});

