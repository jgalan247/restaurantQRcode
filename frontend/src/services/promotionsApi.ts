import axios from 'axios';
import type { Special, Offer } from '../types/admin';

const API_BASE = 'http://localhost:8000/api/v1';

export const promotionsApi = {
  // Specials
  getActiveSpecials: async (table?: number): Promise<Special[]> => {
    const params = table ? `?table=${table}` : '';
    const response = await axios.get(`${API_BASE}/promotions/specials/active${params}`);
    return response.data;
  },

  getSpecialDetails: async (specialId: number): Promise<Special> => {
    const response = await axios.get(`${API_BASE}/promotions/specials/${specialId}`);
    return response.data;
  },

  // Offers
  getActiveOffers: async (table?: number, featuredOnly?: boolean): Promise<Offer[]> => {
    const params = new URLSearchParams();
    if (table) params.append('table', table.toString());
    if (featuredOnly) params.append('featured_only', 'true');

    const queryString = params.toString();
    const response = await axios.get(
      `${API_BASE}/promotions/offers/active${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  getFeaturedOffers: async (): Promise<Offer[]> => {
    const response = await axios.get(`${API_BASE}/promotions/offers/featured`);
    return response.data;
  },

  getOfferDetails: async (offerId: number): Promise<Offer> => {
    const response = await axios.get(`${API_BASE}/promotions/offers/${offerId}`);
    return response.data;
  },

  // Availability checking
  checkAvailability: async (offerId?: number, specialId?: number): Promise<{
    available: boolean;
    reason: string | null;
    next_available: string | null;
    expires_soon: boolean;
    hours_until_expiry: number | null;
  }> => {
    const params = new URLSearchParams();
    if (offerId) params.append('offer_id', offerId.toString());
    if (specialId) params.append('special_id', specialId.toString());

    const response = await axios.get(
      `${API_BASE}/promotions/check-availability?${params.toString()}`
    );
    return response.data;
  },
};

export default promotionsApi;
