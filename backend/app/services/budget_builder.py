from decimal import Decimal
from typing import List, Optional, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.menu import MenuItem, Category, ChefCombo, ChefComboItem
from app.schemas.menu import (
    BudgetBuilderRequest,
    MealComboResponse,
    ComboItemDetail,
    UpgradeSuggestion,
    ChefComboResponse
)
import random


class BudgetBuilderService:
    """Service for generating meal combinations within budget"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_combinations(
        self,
        request: BudgetBuilderRequest
    ) -> Tuple[List[MealComboResponse], List[ChefComboResponse]]:
        """Generate 3-5 meal combinations within budget"""

        # Get all available menu items
        items = await self._get_filtered_items(
            request.dietary_preferences,
            request.allergen_exclusions
        )

        # Organize items by category type
        items_by_type = self._organize_by_type(items)

        # Generate custom combinations
        combinations = []

        # Strategy 1: Balanced meal (starter + main + dessert + drink)
        if self._wants_course(request.meal_preferences, 'starter'):
            combo1 = await self._generate_balanced_combo(
                items_by_type,
                request.budget,
                request.meal_preferences
            )
            if combo1:
                combinations.append(combo1)

        # Strategy 2: Main-focused (heavy main + drink)
        if self._wants_course(request.meal_preferences, 'main'):
            combo2 = await self._generate_main_focused_combo(
                items_by_type,
                request.budget,
                request.meal_preferences
            )
            if combo2:
                combinations.append(combo2)

        # Strategy 3: Light meal (starter + sides + drink)
        combo3 = await self._generate_light_combo(
            items_by_type,
            request.budget,
            request.meal_preferences
        )
        if combo3:
            combinations.append(combo3)

        # Strategy 4: Value combo (maximize items within budget)
        combo4 = await self._generate_value_combo(
            items_by_type,
            request.budget,
            request.meal_preferences
        )
        if combo4:
            combinations.append(combo4)

        # Strategy 5: Premium combo (fewer items, higher quality)
        combo5 = await self._generate_premium_combo(
            items_by_type,
            request.budget,
            request.meal_preferences
        )
        if combo5:
            combinations.append(combo5)

        # Add upgrade suggestions to each combo
        for combo in combinations:
            combo.upgrade_suggestions = await self._generate_upgrades(
                combo,
                items_by_type,
                request.budget
            )

        # Get chef combos within budget
        chef_combos = await self._get_chef_combos(request.budget)

        return combinations[:5], chef_combos  # Return max 5 combos

    async def _get_filtered_items(
        self,
        dietary_prefs: List[str],
        allergen_exclusions: List[str]
    ) -> List[MenuItem]:
        """Get menu items filtered by dietary preferences and allergens"""

        from sqlalchemy.orm import selectinload

        query = select(MenuItem).where(
            MenuItem.is_available == True
        ).options(selectinload(MenuItem.category))
        result = await self.db.execute(query)
        items = result.scalars().all()

        filtered_items = []
        for item in items:
            # Check dietary preferences
            if dietary_prefs:
                if 'vegetarian' in dietary_prefs and 'v' not in (item.dietary_tags or []):
                    continue
                if 'vegan' in dietary_prefs and 'vg' not in (item.dietary_tags or []):
                    continue
                if 'gluten_free' in dietary_prefs and not item.is_gluten_free:
                    continue

            # Check allergen exclusions
            if allergen_exclusions and item.allergens:
                if any(allergen in item.allergens for allergen in allergen_exclusions):
                    continue

            filtered_items.append(item)

        return filtered_items

    def _organize_by_type(self, items: List[MenuItem]) -> Dict[str, List[MenuItem]]:
        """Organize items by course type"""

        result = {
            'starters': [],
            'mains': [],
            'desserts': [],
            'drinks': [],
            'sides': []
        }

        for item in items:
            # Load category relationship if not loaded
            category_name = item.category.name if item.category else ""

            if 'Small Plates' in category_name or 'Sides' in category_name:
                result['starters'].append(item)
                result['sides'].append(item)
            elif 'Mains' in category_name:
                result['mains'].append(item)
            elif 'Dessert' in category_name:
                result['desserts'].append(item)
            elif 'Drinks' in category_name or 'Beer' in category_name or 'Wine' in category_name:
                result['drinks'].append(item)

        # Sort by price within each category
        for key in result:
            result[key].sort(key=lambda x: x.price)

        return result

    def _wants_course(self, meal_prefs: List[str], course: str) -> bool:
        """Check if user wants a specific course"""
        if not meal_prefs:  # If no preferences, include all
            return True
        return course in meal_prefs

    async def _generate_balanced_combo(
        self,
        items_by_type: Dict[str, List[MenuItem]],
        budget: Decimal,
        meal_prefs: List[str]
    ) -> Optional[MealComboResponse]:
        """Generate a balanced meal with multiple courses"""

        selected_items = []
        total = Decimal('0')
        target = budget * Decimal('0.9')  # Aim for 90% of budget

        # Add starter (20% of budget)
        if self._wants_course(meal_prefs, 'starter') and items_by_type['starters']:
            starter_budget = budget * Decimal('0.2')
            starter = self._find_closest_item(items_by_type['starters'], starter_budget)
            if starter and total + starter.price <= target:
                selected_items.append(starter)
                total += starter.price

        # Add main (50% of budget)
        if self._wants_course(meal_prefs, 'main') and items_by_type['mains']:
            main_budget = budget * Decimal('0.5')
            main = self._find_closest_item(items_by_type['mains'], main_budget)
            if main and total + main.price <= target:
                selected_items.append(main)
                total += main.price

        # Add dessert (15% of budget)
        if self._wants_course(meal_prefs, 'dessert') and items_by_type['desserts']:
            dessert_budget = budget * Decimal('0.15')
            dessert = self._find_closest_item(items_by_type['desserts'], dessert_budget)
            if dessert and total + dessert.price <= target:
                selected_items.append(dessert)
                total += dessert.price

        # Add drink (15% of budget)
        if self._wants_course(meal_prefs, 'drink') and items_by_type['drinks']:
            drink_budget = budget - total
            drink = self._find_closest_item(items_by_type['drinks'], drink_budget)
            if drink and total + drink.price <= budget:
                selected_items.append(drink)
                total += drink.price

        if not selected_items:
            return None

        return await self._create_combo_response(
            "Balanced Experience",
            "A well-rounded meal with multiple courses",
            selected_items,
            total,
            budget
        )

    async def _generate_main_focused_combo(
        self,
        items_by_type: Dict[str, List[MenuItem]],
        budget: Decimal,
        meal_prefs: List[str]
    ) -> Optional[MealComboResponse]:
        """Generate a combo focused on a premium main course"""

        selected_items = []
        total = Decimal('0')

        # Add premium main (70% of budget)
        if items_by_type['mains']:
            main_budget = budget * Decimal('0.7')
            main = self._find_closest_item(items_by_type['mains'], main_budget, prefer_higher=True)
            if main:
                selected_items.append(main)
                total += main.price

        # Add side
        if items_by_type['sides']:
            side_budget = budget * Decimal('0.15')
            side = self._find_closest_item(items_by_type['sides'], side_budget)
            if side and total + side.price <= budget:
                selected_items.append(side)
                total += side.price

        # Add drink
        if self._wants_course(meal_prefs, 'drink') and items_by_type['drinks']:
            drink_budget = budget - total
            drink = self._find_closest_item(items_by_type['drinks'], drink_budget)
            if drink and total + drink.price <= budget:
                selected_items.append(drink)
                total += drink.price

        if not selected_items:
            return None

        return await self._create_combo_response(
            "Main Event",
            "Focused on a premium main course",
            selected_items,
            total,
            budget
        )

    async def _generate_light_combo(
        self,
        items_by_type: Dict[str, List[MenuItem]],
        budget: Decimal,
        meal_prefs: List[str]
    ) -> Optional[MealComboResponse]:
        """Generate a lighter meal with multiple small items"""

        selected_items = []
        total = Decimal('0')
        remaining = budget

        # Add multiple starters/sides
        for item in items_by_type['starters'][:4]:
            if total + item.price <= budget * Decimal('0.8'):
                selected_items.append(item)
                total += item.price
            if len(selected_items) >= 3:
                break

        # Add drink
        if self._wants_course(meal_prefs, 'drink') and items_by_type['drinks']:
            drink_budget = budget - total
            drink = self._find_closest_item(items_by_type['drinks'], drink_budget)
            if drink and total + drink.price <= budget:
                selected_items.append(drink)
                total += drink.price

        if not selected_items:
            return None

        return await self._create_combo_response(
            "Light & Fresh",
            "Perfect for a lighter meal with variety",
            selected_items,
            total,
            budget
        )

    async def _generate_value_combo(
        self,
        items_by_type: Dict[str, List[MenuItem]],
        budget: Decimal,
        meal_prefs: List[str]
    ) -> Optional[MealComboResponse]:
        """Generate combo with maximum items within budget"""

        selected_items = []
        total = Decimal('0')

        # Combine all items and sort by price
        all_items = []
        if self._wants_course(meal_prefs, 'starter'):
            all_items.extend(items_by_type['starters'])
        if self._wants_course(meal_prefs, 'main'):
            all_items.extend(items_by_type['mains'])
        if self._wants_course(meal_prefs, 'dessert'):
            all_items.extend(items_by_type['desserts'])
        if self._wants_course(meal_prefs, 'drink'):
            all_items.extend(items_by_type['drinks'])

        # Sort by value (price)
        all_items.sort(key=lambda x: x.price)

        # Greedy algorithm: add items until budget exceeded
        for item in all_items:
            if total + item.price <= budget:
                # Avoid duplicates
                if item not in selected_items:
                    selected_items.append(item)
                    total += item.price
                if len(selected_items) >= 6:  # Max 6 items
                    break

        if not selected_items:
            return None

        return await self._create_combo_response(
            "Maximum Value",
            "Get the most items for your budget",
            selected_items,
            total,
            budget
        )

    async def _generate_premium_combo(
        self,
        items_by_type: Dict[str, List[MenuItem]],
        budget: Decimal,
        meal_prefs: List[str]
    ) -> Optional[MealComboResponse]:
        """Generate combo with premium items"""

        selected_items = []
        total = Decimal('0')

        # Select higher-priced items from each category
        if self._wants_course(meal_prefs, 'main') and items_by_type['mains']:
            main = self._find_closest_item(
                items_by_type['mains'],
                budget * Decimal('0.6'),
                prefer_higher=True
            )
            if main:
                selected_items.append(main)
                total += main.price

        if self._wants_course(meal_prefs, 'drink') and items_by_type['drinks']:
            # Find premium drinks
            premium_drinks = [d for d in items_by_type['drinks'] if d.price > Decimal('4')]
            if premium_drinks:
                drink = self._find_closest_item(
                    premium_drinks,
                    budget - total,
                    prefer_higher=True
                )
                if drink and total + drink.price <= budget:
                    selected_items.append(drink)
                    total += drink.price

        if self._wants_course(meal_prefs, 'dessert') and items_by_type['desserts']:
            dessert = self._find_closest_item(
                items_by_type['desserts'],
                budget - total
            )
            if dessert and total + dessert.price <= budget:
                selected_items.append(dessert)
                total += dessert.price

        if not selected_items:
            return None

        return await self._create_combo_response(
            "Premium Selection",
            "High-quality items for a special occasion",
            selected_items,
            total,
            budget
        )

    def _find_closest_item(
        self,
        items: List[MenuItem],
        target_price: Decimal,
        prefer_higher: bool = False
    ) -> Optional[MenuItem]:
        """Find item closest to target price"""

        if not items:
            return None

        if prefer_higher:
            # Find item just below target, preferring higher prices
            valid_items = [item for item in items if item.price <= target_price]
            if valid_items:
                return max(valid_items, key=lambda x: x.price)
            return None
        else:
            # Find closest to target
            return min(items, key=lambda x: abs(x.price - target_price))

    async def _create_combo_response(
        self,
        name: str,
        description: str,
        items: List[MenuItem],
        total: Decimal,
        budget: Decimal
    ) -> MealComboResponse:
        """Create a MealComboResponse from selected items"""

        combo_items = []
        for item in items:
            # Get category name
            result = await self.db.execute(
                select(Category).where(Category.id == item.category_id)
            )
            category = result.scalar_one_or_none()
            category_name = category.name if category else "Other"

            combo_items.append(ComboItemDetail(
                id=item.id,
                name=item.name,
                description=item.description,
                price=item.price,
                category=category_name,
                image_url=item.image_url,
                dietary_tags=item.dietary_tags or [],
                calories=item.calories,
                allergens=item.allergens or []
            ))

        return MealComboResponse(
            combo_id=None,
            combo_type='custom',
            name=name,
            description=description,
            items=combo_items,
            total_price=total,
            budget_remaining=budget - total,
            upgrade_suggestions=[]
        )

    async def _generate_upgrades(
        self,
        combo: MealComboResponse,
        items_by_type: Dict[str, List[MenuItem]],
        budget: Decimal
    ) -> List[UpgradeSuggestion]:
        """Generate upgrade suggestions for a combo"""

        upgrades = []
        current_total = combo.total_price
        remaining = budget - current_total

        # Find items in combo that can be upgraded
        for item in combo.items:
            # Find items in same category with higher price
            category_items = []
            if 'Sides' in item.category or 'Small Plates' in item.category:
                category_items = items_by_type['starters']
            elif 'Mains' in item.category:
                category_items = items_by_type['mains']
            elif 'Dessert' in item.category:
                category_items = items_by_type['desserts']
            elif 'Drink' in item.category or 'Beer' in item.category or 'Wine' in item.category:
                category_items = items_by_type['drinks']

            for upgrade_item in category_items:
                if upgrade_item.id != item.id and upgrade_item.price > item.price:
                    additional_cost = upgrade_item.price - item.price
                    if additional_cost <= remaining:
                        # Get category for upgrade item
                        result = await self.db.execute(
                            select(Category).where(Category.id == upgrade_item.category_id)
                        )
                        upgrade_category = result.scalar_one_or_none()
                        upgrade_category_name = upgrade_category.name if upgrade_category else "Other"

                        upgrades.append(UpgradeSuggestion(
                            description=f"For £{additional_cost:.2f} more, upgrade from {item.name} to {upgrade_item.name}",
                            additional_cost=additional_cost,
                            from_item_id=item.id,
                            to_item_id=upgrade_item.id,
                            to_item=ComboItemDetail(
                                id=upgrade_item.id,
                                name=upgrade_item.name,
                                description=upgrade_item.description,
                                price=upgrade_item.price,
                                category=upgrade_category_name,
                                image_url=upgrade_item.image_url,
                                dietary_tags=upgrade_item.dietary_tags or [],
                                calories=upgrade_item.calories,
                                allergens=upgrade_item.allergens or []
                            )
                        ))
                        break  # Only one upgrade per item

        # Suggest adding items if budget allows
        if remaining >= Decimal('3'):
            # Suggest adding dessert if not present
            has_dessert = any('Dessert' in item.category for item in combo.items)
            if not has_dessert and items_by_type['desserts']:
                dessert = self._find_closest_item(items_by_type['desserts'], remaining)
                if dessert:
                    result = await self.db.execute(
                        select(Category).where(Category.id == dessert.category_id)
                    )
                    dessert_category = result.scalar_one_or_none()
                    dessert_category_name = dessert_category.name if dessert_category else "Desserts"

                    upgrades.append(UpgradeSuggestion(
                        description=f"For £{dessert.price:.2f} more, add {dessert.name}",
                        additional_cost=dessert.price,
                        from_item_id=None,
                        to_item_id=dessert.id,
                        to_item=ComboItemDetail(
                            id=dessert.id,
                            name=dessert.name,
                            description=dessert.description,
                            price=dessert.price,
                            category=dessert_category_name,
                            image_url=dessert.image_url,
                            dietary_tags=dessert.dietary_tags or [],
                            calories=dessert.calories,
                            allergens=dessert.allergens or []
                        )
                    ))

        return upgrades[:3]  # Return max 3 upgrade suggestions

    async def _get_chef_combos(self, budget: Decimal) -> List[ChefComboResponse]:
        """Get chef combos within budget"""

        result = await self.db.execute(
            select(ChefCombo)
            .where(ChefCombo.is_active == True)
            .where(ChefCombo.price <= budget)
            .order_by(ChefCombo.display_order)
        )
        combos = result.scalars().all()

        response_combos = []
        for combo in combos:
            # Get combo items with menu items
            items_result = await self.db.execute(
                select(ChefComboItem)
                .where(ChefComboItem.combo_id == combo.id)
            )
            combo_items = items_result.scalars().all()

            # Load menu items
            from sqlalchemy.orm import selectinload
            items_list = []
            for combo_item in combo_items:
                menu_item_result = await self.db.execute(
                    select(MenuItem)
                    .where(MenuItem.id == combo_item.menu_item_id)
                    .options(selectinload(MenuItem.modifiers))
                )
                menu_item = menu_item_result.scalar_one_or_none()
                if menu_item:
                    items_list.append({
                        'menu_item': menu_item,
                        'quantity': combo_item.quantity
                    })

            response_combos.append(ChefComboResponse(
                id=combo.id,
                name=combo.name,
                description=combo.description,
                price=combo.price,
                image_url=combo.image_url,
                display_order=combo.display_order,
                items=items_list
            ))

        return response_combos
