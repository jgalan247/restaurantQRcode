import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CartItem, MenuItem, CartItemModifier } from '../types/menu';
import { parsePrice } from '../utils/formatters';

interface CartState {
  items: CartItem[];
  tableNumber: string;
  sessionToken: string;
}

interface VariantInfo {
  variant: string;
  variantDisplay: string;
  selectedPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; modifiers: CartItemModifier[]; specialInstructions?: string; variantInfo?: VariantInfo } }
  | { type: 'REMOVE_ITEM'; payload: number } // index
  | { type: 'UPDATE_QUANTITY'; payload: { index: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TABLE_INFO'; payload: { tableNumber: string; sessionToken: string } }
  | { type: 'LOAD_CART'; payload: CartState };

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, modifiers: CartItemModifier[], specialInstructions?: string, variantInfo?: VariantInfo) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  setTableInfo: (tableNumber: string, sessionToken: string) => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getGSTAmount: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'la_hacienda_cart';

const initialState: CartState = {
  items: [],
  tableNumber: '',
  sessionToken: '',
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, modifiers, specialInstructions, variantInfo } = action.payload;

      // Check if item with same modifiers, instructions, and variant already exists
      const existingIndex = state.items.findIndex(
        (item) =>
          item.menuItem.id === menuItem.id &&
          JSON.stringify(item.modifiers) === JSON.stringify(modifiers) &&
          item.specialInstructions === specialInstructions &&
          item.variant === variantInfo?.variant
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
        return { ...state, items: newItems };
      } else {
        // Add new item
        return {
          ...state,
          items: [
            ...state.items,
            {
              menuItem,
              quantity: 1,
              modifiers,
              specialInstructions,
              variant: variantInfo?.variant,
              variantDisplay: variantInfo?.variantDisplay,
              selectedPrice: variantInfo?.selectedPrice,
            },
          ],
        };
      }
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { index, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((_, i) => i !== index),
        };
      }
      const newItems = [...state.items];
      newItems[index] = { ...newItems[index], quantity };
      return { ...state, items: newItems };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }

    case 'SET_TABLE_INFO': {
      return {
        ...state,
        tableNumber: action.payload.tableNumber,
        sessionToken: action.payload.sessionToken,
      };
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, (initial) => {
    // Load cart from localStorage on initialization
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    return initial;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [state]);

  // Wrap all functions in useCallback to prevent infinite re-renders
  const addItem = useCallback(
    (menuItem: MenuItem, modifiers: CartItemModifier[], specialInstructions?: string, variantInfo?: VariantInfo) => {
      dispatch({ type: 'ADD_ITEM', payload: { menuItem, modifiers, specialInstructions, variantInfo } });
    },
    []
  );

  const removeItem = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: index });
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setTableInfo = useCallback((tableNumber: string, sessionToken: string) => {
    dispatch({ type: 'SET_TABLE_INFO', payload: { tableNumber, sessionToken } });
  }, []);

  const getCartSubtotal = useCallback((): number => {
    return state.items.reduce((total, item) => {
      // Use selectedPrice for variant items, otherwise use menu item price
      const itemPrice = item.selectedPrice ?? parsePrice(item.menuItem.price);
      const modifiersPrice = item.modifiers.reduce((sum, mod) => sum + parsePrice(mod.price), 0);
      return total + (itemPrice + modifiersPrice) * item.quantity;
    }, 0);
  }, [state.items]);

  const getGSTAmount = useCallback((): number => {
    const subtotal = getCartSubtotal();
    return subtotal * 0.05; // 5% GST
  }, [getCartSubtotal]);

  const getCartTotal = useCallback((): number => {
    return getCartSubtotal() + getGSTAmount();
  }, [getCartSubtotal, getGSTAmount]);

  const getItemCount = useCallback((): number => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setTableInfo,
    getCartTotal,
    getCartSubtotal,
    getGSTAmount,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}