# Personal Recipe Website - User Guide

This is a modern, static recipe website designed for easy personal use. It requires no backend and loads recipes dynamically from your file system.

## 📂 Folder Structure

```
/
├── index.html          # Main entry point (website home)
├── css/
│   └── style.css       # Core styles and themes
├── js/
│   ├── main.js         # App entry logic
│   ├── api.js          # Auto-discovery logic for recipes
│   ├── ui.js           # UI rendering and Modal logic
│   └── search.js       # Search bar and autocomplete logic
├── recipes/            # RECIPE DATABASE
│   ├── italian/        # Category Folder
│   │   └── spaghetti.json
│   ├── american/
│   │   └── cheeseburger.json
│   └── (new-category)/
│       └── (recipe).json
└── assets/             # Images (optional)
```

## 🍳 How to Add New Recipes

1.  **Create a Folder**: Navigate to the `recipes/` directory. Create a new folder for your category (e.g., `recipes/desserts/`) if it doesn't exist.
2.  **Create a JSON File**: Inside that folder, create a new file ending in `.json` (e.g., `cake.json`).
3.  **Add Recipe Data**: Paste the following template and fill it out:

```json
{
  "name": "Recipe Name",
  "tags": ["Tag1", "Tag2"],
  "image": "https://link-to-image.jpg",
  "about": "Short description related to the recipe.",
  "ingredients": [
    "1 cup Flour",
    "2 Eggs"
  ],
  "steps": [
    "Step 1 instruction...",
    "Step 2 instruction..."
  ],
  "comments": []
}
```
4.  **Done!** Refresh the page. The website will automatically scan the folders and display your new recipe.

## ⚙️ How Auto-Loading Works (Important!)

Since this is a static site with **no backend database**, it uses a smart "Directory Crawling" technique.

- When the site loads, it asks the server for the contents of `/recipes/`.
- The server responds with an HTML list of files/folders.
- The JavaScript parses this list to find categories, then looks inside each category for `.json` files.

**⚠️ Requirements:**
To make this work locally, you must run a simple static server that supports directory listing (most do).

**Recommended Way to Run:**
1.  Open your terminal in the project folder.
2.  Run generic Python server:
    ```bash
    python3 -m http.server
    ```
3.  Open `http://localhost:8000` in your browser.

*Note: If you just double-click `index.html`, modern browsers will block the file scanning for security reasons.*
