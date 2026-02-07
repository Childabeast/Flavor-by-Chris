export interface IngredientItem {
    id?: string; // Optional for new items
    name: string;
    amount: string;
    quantity?: string;
    fraction?: string;
    unit?: string;
}

export interface IngredientSection {
    id?: string;
    title: string;
    items: IngredientItem[];
}

export interface Recipe {
    id: string;
    name: string;
    image: string;
    rating: number; // e.g. 4.6
    description?: string;
    ingredientSections: IngredientSection[];
    instructions: string; // multiline text
    notes?: string;
    createdAt?: number;
    userId?: string;
    isPublic?: boolean;
}
