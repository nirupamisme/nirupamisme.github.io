document.addEventListener('DOMContentLoaded', function() {

    /* ==================== DARK/LIGHT THEME ==================== */
    const themeButton = document.getElementById('theme-button');
    const darkTheme = 'dark-theme';
    const iconTheme = 'bx-sun';

    const selectedTheme = localStorage.getItem('selected-theme');
    const selectedIcon = localStorage.getItem('selected-icon');

    const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
    const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'bx-moon' : 'bx-sun';

    if (selectedTheme) {
        document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
        themeButton.classList[selectedIcon === 'bx-moon' ? 'add' : 'remove'](iconTheme);
    }

    themeButton.addEventListener('click', () => {
        document.body.classList.toggle(darkTheme);
        themeButton.classList.toggle(iconTheme);
        localStorage.setItem('selected-theme', getCurrentTheme());
        localStorage.setItem('selected-icon', getCurrentIcon());
    });

    /* ==================== REPOSITORY SEARCH & FILTERING ==================== */
    const repoControls = document.querySelector('.repo-controls');

    if (repoControls) {
        const searchInput = document.getElementById('repo-search-input');
        const searchOptions = document.getElementById('search-options');
        const filterItems = document.querySelectorAll('.repo__filter-item');
        const repoCards = document.querySelectorAll('.repo-card');
        
        // 1. Prepare data for Fuse.js
        const repoData = Array.from(repoCards).map(card => {
            return {
                title: card.querySelector('.repo-card__title').textContent,
                description: card.querySelector('.repo-card__description').textContent,
                category: card.dataset.category,
                element: card
            };
        });

        // 2. Configure Fuse.js
        const fuseOptions = {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'description', weight: 0.3 }
            ],
            threshold: 0.4,
        };
        const fuse = new Fuse(repoData, fuseOptions);

        // --- Central filter function ---
        function filterRepos() {
            const searchQuery = searchInput.value.toLowerCase();
            const searchType = document.querySelector('input[name="search-type"]:checked').value;
            const activeCategory = document.querySelector('.repo__filter-item.active-filter').dataset.filter;

            let searchMatches = new Set();

            if (searchQuery.length === 0) {
                repoData.forEach(repo => searchMatches.add(repo.element));
            } else if (searchType === 'fuzzy') {
                const results = fuse.search(searchQuery);
                results.forEach(result => searchMatches.add(result.item.element));
            } else {
                repoData.forEach(repo => {
                    const titleMatch = repo.title.toLowerCase().includes(searchQuery);
                    const descriptionMatch = repo.description.toLowerCase().includes(searchQuery);
                    if (titleMatch || descriptionMatch) {
                        searchMatches.add(repo.element);
                    }
                });
            }

            // --- Apply category filter on top of search results ---
            repoData.forEach(repo => {
                const categoryMatch = (activeCategory === 'all' || repo.category === activeCategory);
                const searchMatch = searchMatches.has(repo.element);

                if (searchMatch && categoryMatch) {
                    repo.element.style.display = 'flex';
                } else {
                    repo.element.style.display = 'none';
                }
            });
        }

        // --- Event listeners ---
        searchInput.addEventListener('input', filterRepos);
        searchOptions.addEventListener('change', filterRepos);

        filterItems.forEach(item => {
            item.addEventListener('click', function() {
                filterItems.forEach(el => el.classList.remove('active-filter'));
                this.classList.add('active-filter');
                filterRepos();
            });
        });
    }

    /* ==================== QUOTE SLIDER ==================== */
    const quotesContainer = document.querySelector('.quotes__container');
    if (quotesContainer) {
        const quotes = document.querySelectorAll('.quote__item');
        const prevButton = document.getElementById('quote-prev');
        const nextButton = document.getElementById('quote-next');
        let currentQuoteIndex = 0;
        let quoteTimer;

        // Function to show the quote at a specific index
        function showQuote(index) {
            quotes.forEach((quote, i) => {
                quote.classList.remove('active-quote');
                if (i === index) {
                    quote.classList.add('active-quote');
                }
            });
        }

        // Function to advance to the next quote
        function nextQuote() {
            currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            showQuote(currentQuoteIndex);
        }

        // Function to go back to the previous quote
        function prevQuote() {
            currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
            showQuote(currentQuoteIndex);
        }

        // Function to start the automatic timer
        function startQuoteTimer() {
            // Clear any existing timer to prevent duplicates
            clearInterval(quoteTimer);
            // Set a new timer to call nextQuote() every 5 seconds (5000 milliseconds)
            quoteTimer = setInterval(nextQuote, 5000); 
        }

        // Event listeners for manual navigation
        prevButton.addEventListener('click', () => {
            prevQuote();
            // Reset the timer after a manual click
            startQuoteTimer(); 
        });

        nextButton.addEventListener('click', () => {
            nextQuote();
            // Reset the timer after a manual click
            startQuoteTimer(); 
        });

        // Pause the timer when the user hovers over the quotes
        quotesContainer.addEventListener('mouseenter', () => {
            clearInterval(quoteTimer);
        });

        quotesContainer.addEventListener('mouseleave', () => {
            startQuoteTimer();
        });

        // Start the timer when the page is loaded
        startQuoteTimer();
    }
});