import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface BudgetBuilderRequest {
  budget: number;
  dietary_preferences: string[];
  meal_preferences: string[];
  allergen_exclusions: string[];
}

export interface ComboItem {
  id: number;
  name: string;
  description?: string;
  price: string;
  category: string;
  image_url?: string;
  dietary_tags: string[];
  calories?: number;
  allergens: string[];
}

export interface UpgradeSuggestion {
  description: string;
  additional_cost: string;
  from_item_id?: number;
  to_item_id: number;
  to_item: ComboItem;
}

export interface MealCombo {
  combo_id?: number;
  combo_type: string;
  name: string;
  description?: string;
  items: ComboItem[];
  total_price: string;
  budget_remaining: string;
  savings?: string;
  upgrade_suggestions: UpgradeSuggestion[];
}

export interface ChefComboItem {
  menu_item: any;
  quantity: number;
}

export interface ChefCombo {
  id: number;
  name: string;
  description?: string;
  price: string;
  image_url?: string;
  display_order: number;
  items: ChefComboItem[];
}

export interface BudgetBuilderResponse {
  budget: string;
  meal_combos: MealCombo[];
  chef_combos: ChefCombo[];
}

export const budgetBuilderService = {
  async generateCombos(request: BudgetBuilderRequest): Promise<BudgetBuilderResponse> {
    const response = await axios.post(`${API_BASE_URL}/menu/budget-builder`, request);
    return response.data;
  },
};
