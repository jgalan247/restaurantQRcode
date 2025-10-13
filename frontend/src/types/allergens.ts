export type AllergenType =
  | 'gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'peanuts'
  | 'soybeans'
  | 'milk'
  | 'nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs';

export interface AllergenInfo {
  id: AllergenType;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const ALLERGEN_INFO: Record<AllergenType, AllergenInfo> = {
  gluten: {
    id: 'gluten',
    name: 'Gluten',
    icon: '🌾',
    color: 'amber',
    description: 'Contains wheat, barley, rye or oats'
  },
  crustaceans: {
    id: 'crustaceans',
    name: 'Crustaceans',
    icon: '🦐',
    color: 'orange',
    description: 'Contains prawns, crabs, lobster or crayfish'
  },
  eggs: {
    id: 'eggs',
    name: 'Eggs',
    icon: '🥚',
    color: 'yellow',
    description: 'Contains eggs or egg products'
  },
  fish: {
    id: 'fish',
    name: 'Fish',
    icon: '🐟',
    color: 'blue',
    description: 'Contains fish'
  },
  peanuts: {
    id: 'peanuts',
    name: 'Peanuts',
    icon: '🥜',
    color: 'yellow',
    description: 'Contains peanuts'
  },
  soybeans: {
    id: 'soybeans',
    name: 'Soya',
    icon: '🫘',
    color: 'green',
    description: 'Contains soybeans or soya products'
  },
  milk: {
    id: 'milk',
    name: 'Milk',
    icon: '🥛',
    color: 'blue',
    description: 'Contains milk or dairy products'
  },
  nuts: {
    id: 'nuts',
    name: 'Tree Nuts',
    icon: '🌰',
    color: 'amber',
    description: 'Contains almonds, hazelnuts, walnuts, cashews, etc.'
  },
  celery: {
    id: 'celery',
    name: 'Celery',
    icon: '🥬',
    color: 'green',
    description: 'Contains celery or celeriac'
  },
  mustard: {
    id: 'mustard',
    name: 'Mustard',
    icon: '🟡',
    color: 'yellow',
    description: 'Contains mustard'
  },
  sesame: {
    id: 'sesame',
    name: 'Sesame',
    icon: '⚪',
    color: 'gray',
    description: 'Contains sesame seeds'
  },
  sulphites: {
    id: 'sulphites',
    name: 'Sulphites',
    icon: '🍷',
    color: 'purple',
    description: 'Contains sulphur dioxide'
  },
  lupin: {
    id: 'lupin',
    name: 'Lupin',
    icon: '🌸',
    color: 'pink',
    description: 'Contains lupin flour/seeds'
  },
  molluscs: {
    id: 'molluscs',
    name: 'Molluscs',
    icon: '🐚',
    color: 'blue',
    description: 'Contains mussels, oysters, squid or snails'
  }
};
