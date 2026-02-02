/**
 * API Module
 * Handles fetching and parsing of recipe data from the file system.
 * Relies on server directory listing (Standard for local static servers).
 */

const RECIPES_ROOT = '/recipes/';

/**
 * Fetches all recipes by crawling the /recipes/ directory.
 * @returns {Promise<Array>} Array of recipe objects
 */
export async function getAllRecipes() {
    try {
        console.log('Starting recipe discovery...');
        
        // 1. Fetch root recipes folder
        const rootResponse = await fetch(RECIPES_ROOT);
        if (!rootResponse.ok) throw new Error('Could not access /recipes/ directory');
        
        const rootText = await rootResponse.text();
        const parser = new DOMParser();
        const rootDoc = parser.parseFromString(rootText, 'text/html');
        
        // 2. Find subdirectories (categories)
        // Look for links that end with / and are not parent directory links
        const links = Array.from(rootDoc.querySelectorAll('a'))
            .map(a => a.getAttribute('href'))
            .filter(href => href && href.endsWith('/') && href !== '../' && href !== '/');
            
        console.log('Found category folders:', links);

        // 3. Scan each category folder for JSON files
        const recipePromises = links.map(async (categoryPath) => {
            // Handle relative vs absolute paths from the server listing
            // Some servers return "italian/" others "/recipes/italian/"
            const fullPath = categoryPath.startsWith('/') 
                ? categoryPath 
                : `${RECIPES_ROOT}${categoryPath}`;
                
            try {
                const catResponse = await fetch(fullPath);
                const catText = await catResponse.text();
                const catDoc = parser.parseFromString(catText, 'text/html');
                
                // Find .json files
                const jsonFiles = Array.from(catDoc.querySelectorAll('a'))
                    .map(a => a.getAttribute('href'))
                    .filter(href => href && href.endsWith('.json'));
                    
                // 4. Load each recipe JSON
                const filePromises = jsonFiles.map(async (fileName) => {
                    const filePath = fileName.startsWith('/')
                        ? fileName
                        : `${fullPath}${fileName}`;
                        
                    const res = await fetch(filePath);
                    const data = await res.json();
                    
                    // Add metadata internally if needed (e.g. category)
                    data._category = categoryPath.replace(/\/$/, '');
                    data._path = filePath;
                    return data;
                });
                
                return Promise.all(filePromises);
            } catch (err) {
                console.warn(`Failed to scan category: ${categoryPath}`, err);
                return [];
            }
        });

        const nestedRecipes = await Promise.all(recipePromises);
        const allRecipes = nestedRecipes.flat();
        
        console.log(`Loaded ${allRecipes.length} recipes.`);
        return allRecipes;
        
    } catch (error) {
        console.error('Recipe loading failed:', error);
        console.warn('Ensure you are running a local server that supports directory listing (e.g., python -m http.server)');
        return [];
    }
}
