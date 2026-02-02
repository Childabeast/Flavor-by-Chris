import { renderRecipes, openModal } from './ui.js';

const searchInput = document.getElementById('recipe-search');
const searchResults = document.getElementById('search-results');
const searchWrapper = document.querySelector('.search-wrapper');

let allRecipes = [];
let selectedIndex = -1;

export function initSearch(recipes) {
    allRecipes = recipes;

    // input listener
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        handleSearch(query);
    });

    // keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-result-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                items[selectedIndex].click();
            } else if (items.length > 0) {
                // If nothing selected but results exist, pick first? 
                // Or just filter grid? Currently grid filters on input.
                // Let's enter open the first match if specific enough?
                // For now, Enter just confirms selection or does nothing.
            }
        } else if (e.key === 'Tab') {
            // Tab autofill
            if (items.length > 0) {
                e.preventDefault();
                const bestMatch = items[selectedIndex >= 0 ? selectedIndex : 0];
                const name = bestMatch.querySelector('span').textContent; // Hacky access
                searchInput.value = name;
                handleSearch(name.toLowerCase()); // Refilter
                searchResults.hidden = true;
            }
        } else if (e.key === 'Escape') {
            searchResults.hidden = true;
            selectedIndex = -1;
        }
    });

    // Hide when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchWrapper.contains(e.target)) {
            searchResults.hidden = true;
        }
    });

    // Show results again if focusing info
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            searchResults.hidden = false;
        }
    });
}

function handleSearch(query) {
    if (!query) {
        searchResults.hidden = true;
        renderRecipes(allRecipes); // Reset grid
        return;
    }

    // Filter logic
    const matches = allRecipes.filter(r => {
        const nameMatch = r.name.toLowerCase().includes(query);
        const tagMatch = (r.tags || []).some(t => t.toLowerCase().includes(query));
        return nameMatch || tagMatch;
    });

    // Update Grid
    renderRecipes(matches);

    // Update Autocomplete Dropdown
    renderDropdown(matches.slice(0, 5)); // Limit to 5 suggestions
}

function renderDropdown(recipes) {
    searchResults.innerHTML = '';
    selectedIndex = -1;

    if (recipes.length === 0) {
        searchResults.hidden = true;
        return;
    }

    recipes.forEach((r, index) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        // Highlight logic could go here

        item.innerHTML = `
            <img src="${r.image || 'assets/placeholder.jpg'}" class="search-thumb">
            <span>${r.name}</span>
            ${r.tags ? `<span style="font-size:0.7em; color:#888; margin-left:auto">${r.tags[0]}</span>` : ''}
        `;

        item.addEventListener('click', () => {
            openModal(r);
            searchResults.hidden = true;
            searchInput.value = r.name; // optional: fill input
        });

        item.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateSelection(searchResults.children);
        });

        searchResults.appendChild(item);
    });

    searchResults.hidden = false;
}

function updateSelection(items) {
    Array.from(items).forEach((item, idx) => {
        if (idx === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}
