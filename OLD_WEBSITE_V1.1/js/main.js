import { getAllRecipes } from './api.js';
import { renderRecipes, setupCategories } from './ui.js';
import { initSearch } from './search.js';

// App Initialization
async function init() {
    // Show loading state initially (already in HTML, but good to know)

    // Fetch Data
    const recipes = await getAllRecipes();

    // Initial Render
    renderRecipes(recipes);

    // Setup Features
    setupCategories(recipes);
    initSearch(recipes);

    // Handle Loading State removal if needed (ui.js render handles overwriting it)
}

// Start
document.addEventListener('DOMContentLoaded', init);
