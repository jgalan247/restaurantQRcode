from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api.deps import get_db
from app.models.menu import Category, MenuItem
from app.schemas.menu import (
    CategoryResponse,
    MenuItemResponse,
    BudgetBuilderRequest,
    BudgetBuilderResponse
)
from app.services.budget_builder import BudgetBuilderService

router = APIRouter()


@router.get("/", response_model=List[CategoryResponse])
async def get_menu(db: AsyncSession = Depends(get_db)):
    """Get complete menu with all categories and items"""
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .options(
            selectinload(Category.menu_items).selectinload(MenuItem.modifiers)
        )
        .order_by(Category.display_order)
    )
    categories = result.scalars().all()
    return categories


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all categories with items"""
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .options(
            selectinload(Category.menu_items).selectinload(MenuItem.modifiers)
        )
        .order_by(Category.display_order)
    )
    categories = result.scalars().all()
    return categories


@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific category with items"""
    result = await db.execute(
        select(Category)
        .where(Category.id == category_id)
        .options(
            selectinload(Category.menu_items).selectinload(MenuItem.modifiers)
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/items/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific menu item with modifiers"""
    result = await db.execute(
        select(MenuItem)
        .where(MenuItem.id == item_id)
        .options(selectinload(MenuItem.modifiers))
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


@router.post("/budget-builder", response_model=BudgetBuilderResponse)
async def build_budget_meal(
    request: BudgetBuilderRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate meal combinations within budget"""
    service = BudgetBuilderService(db)
    meal_combos, chef_combos = await service.generate_combinations(request)

    return BudgetBuilderResponse(
        budget=request.budget,
        meal_combos=meal_combos,
        chef_combos=chef_combos
    )
