/**
 * UI Module
 * Handles all DOM interactions, rendering, and event listeners.
 */

// DOM Elements
const grid = document.getElementById('recipe-grid');
const modal = document.getElementById('recipe-modal');
const modalContent = modal.querySelector('.modal-content');
const categoryNav = document.getElementById('category-nav');
const searchInput = document.getElementById('recipe-search');
const searchResults = document.getElementById('search-results');

let currentRecipes = [];

/**
 * Renders the grid of recipe cards
 * @param {Array} recipes 
 */
export function renderRecipes(recipes) {
    currentRecipes = recipes;
    grid.innerHTML = '';

    if (recipes.length === 0) {
        grid.innerHTML = '<p class="empty-state">No recipes found matching your criteria.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        grid.appendChild(card);
    });
}

function createRecipeCard(recipe) {
    const el = document.createElement('article');
    el.className = 'recipe-card';
    el.onclick = () => openModal(recipe);

    // Image fallback
    const imgSrc = recipe.image || 'assets/placeholder.jpg';

    // Tags HTML
    const tagsHtml = (recipe.tags || [])
        .slice(0, 3)
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');

    el.innerHTML = `
        <div class="card-image-wrapper">
            <img src="${imgSrc}" alt="${recipe.name}" class="card-image" loading="lazy">
        </div>
        <div class="card-content">
            <h3 class="card-title">${recipe.name}</h3>
            <div class="card-tags">
                ${tagsHtml}
            </div>
        </div>
    `;
    return el;
}

/**
 * Modal Logic
 */
export function openModal(recipe) {
    // Populate Data
    document.getElementById('modal-title').textContent = recipe.name;
    document.getElementById('modal-image').src = recipe.image || 'assets/placeholder.jpg';
    document.getElementById('modal-about').textContent = recipe.about || 'No description available.';

    // Tags
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = (recipe.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

    // Ingredients
    const ingList = document.getElementById('modal-ingredients');
    ingList.innerHTML = (recipe.ingredients || []).map(i => `<li>${i}</li>`).join('');

    // Steps
    const stepsList = document.getElementById('modal-steps');
    stepsList.innerHTML = (recipe.steps || []).map(s => `<li>${s}</li>`).join('');

    // Comments
    const commentsList = document.getElementById('modal-comments');
    if (recipe.comments && recipe.comments.length > 0) {
        commentsList.innerHTML = recipe.comments.map(c => `
            <div class="comment">
                <strong>${c.user || 'Anonymous'}</strong>: ${c.text}
            </div>
        `).join('');
    } else {
        commentsList.innerHTML = '<p class="text-muted">No comments yet.</p>';
    }

    // Show
    modal.hidden = false;
    // Small timeout to allow display:block to apply before opacity transition
    requestAnimationFrame(() => {
        modal.classList.add('open');
    });
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

export function closeModal() {
    modal.classList.remove('open');
    setTimeout(() => {
        modal.hidden = true;
        document.body.style.overflow = '';
    }, 300); // Match transition duration
}

// Close on backdrop click (DISABLED for redesign)
// modal.addEventListener('click', (e) => {
//    if (e.target === modal) closeModal();
// });

modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
});

/**
 * Category Filters
 */
export function setupCategories(recipes) {
    // Extract unique categories (based on folder or tags)
    // Here we can use the folder name we captured in _category or tags
    // Let's use tags for filtering as it's more flexible
    const allTags = new Set();
    recipes.forEach(r => (r.tags || []).forEach(t => allTags.add(t)));

    // Simple top categories implementation
    // We could append buttons to categoryNav here

    categoryNav.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-btn')) return;

        // UI update
        categoryNav.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.dataset.filter;
        if (filter === 'all') {
            renderRecipes(recipes);
        } else {
            // Filter logic (mock)
            // In a real app we'd map this dynamically
        }
    });
}
