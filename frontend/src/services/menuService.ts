import api from './api';
import { Category } from '../types/menu';

export const menuService = {
  /**
   * Get complete menu with all categories and items
   */
  async getMenu(): Promise<Category[]> {
    const response = await api.get<Category[]>('/menu/categories');
    return response.data;
  },

  /**
   * Get a specific menu category by ID
   */
  async getCategory(categoryId: number): Promise<Category> {
    const response = await api.get<Category>(`/menu/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Search menu items by name or description
   */
  async searchMenu(query: string): Promise<Category[]> {
    const response = await api.get<Category[]>('/menu', {
      params: { search: query }
    });
    return response.data;
  },
};
