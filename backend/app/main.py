from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path

from app.config import get_settings
from app.api.v1 import api_router
from app.database import engine, Base, AsyncSessionLocal
from decimal import Decimal

settings = get_settings()


async def seed_initial_data():
    """Seed initial menu data from CSV on startup"""
    try:
        import csv
        from sqlalchemy import text, select

        # Check if categories already exist to avoid duplicates
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT COUNT(*) FROM categories"))
            if result.scalar() > 0:
                print("✓ Menu data already exists, skipping seed")
                return

        csv_path = Path("data") / "menu_items.csv"
        if not csv_path.exists():
            print(f"⚠️ CSV file not found at {csv_path}, skipping seed")
            return

        print("📊 Seeding menu data from CSV...")

        from app.models.menu import Category, MenuItem

        # Read CSV and group by category
        categories_dict = {}
        items_list = []

        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                category_name = row.get("category_name", "Other").strip()

                # Create category if not exists
                if category_name not in categories_dict:
                    categories_dict[category_name] = Category(
                        name=category_name,
                        description=f"{category_name} menu items",
                        display_order=len(categories_dict) + 1
                    )

                # Parse dietary tags from CSV (e.g., "v|gf" -> ["v", "gf"])
                dietary_tags_raw = row.get("dietary_tags", "").strip()
                dietary_tags = [tag.strip() for tag in dietary_tags_raw.split("|") if tag.strip()] if dietary_tags_raw else None

                # Parse allergens from CSV (e.g., "gluten|dairy" -> ["gluten", "dairy"])
                allergens_raw = row.get("allergens", "").strip()
                allergens = [allergen.strip() for allergen in allergens_raw.split("|") if allergen.strip()] if allergens_raw else None

                # Parse boolean fields
                def parse_bool(value):
                    if isinstance(value, str):
                        return value.lower() in ("true", "1", "yes")
                    return bool(value)

                # Store item data for later
                items_list.append({
                    "category": categories_dict[category_name],
                    "name": row.get("name", "").strip(),
                    "description": row.get("description", "").strip(),
                    "price": Decimal(str(row.get("price", 0) or 0)),
                    "calories": int(row.get("calories", 0) or 0) if row.get("calories") else None,
                    "allergens": allergens,
                    "spice_level": row.get("spice_level", "").strip() or None,
                    "is_available": parse_bool(row.get("is_available", "true")),
                    "dietary_tags": dietary_tags,
                    "is_lite_bite": parse_bool(row.get("is_lite_bite", "false")),
                    "is_child_friendly": parse_bool(row.get("is_child_friendly", "false")),
                    "is_salad": parse_bool(row.get("is_salad", "false")),
                    "is_deal": parse_bool(row.get("is_deal", "false")),
                    "is_gluten_free": parse_bool(row.get("is_gluten_free", "false")),
                    "display_order": int(row.get("display_order", 0) or 0),
                    "image_url": row.get("image_url", "").strip() or None,
                })

        # Insert into database
        async with AsyncSessionLocal() as session:
            # Add all categories
            for category in categories_dict.values():
                session.add(category)

            await session.flush()  # Get category IDs

            # Add all menu items
            for item_data in items_list:
                menu_item = MenuItem(
                    category_id=item_data["category"].id,
                    name=item_data["name"],
                    description=item_data["description"],
                    price=item_data["price"],
                    calories=item_data["calories"],
                    allergens=item_data["allergens"],
                    spice_level=item_data["spice_level"],
                    is_available=item_data["is_available"],
                    dietary_tags=item_data["dietary_tags"],
                    is_lite_bite=item_data["is_lite_bite"],
                    is_child_friendly=item_data["is_child_friendly"],
                    is_salad=item_data["is_salad"],
                    is_deal=item_data["is_deal"],
                    is_gluten_free=item_data["is_gluten_free"],
                    display_order=item_data["display_order"],
                    image_url=item_data["image_url"],
                )
                session.add(menu_item)

            await session.commit()
            print(f"✓ Seeded {len(categories_dict)} categories with {len(items_list)} menu items")

    except Exception as e:
        print(f"⚠️ Seed data error: {e}")
        import traceback
        traceback.print_exc()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    print("🚀 Starting up...")
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Database tables ready")
    
    # Seed initial data
    await seed_initial_data()

    yield

    # Shutdown
    print("🛑 Shutting down...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Restaurant table-side ordering system with QR code access, cart management, and split payments",
    lifespan=lifespan,
)

# CORS Middleware - MUST be added BEFORE other middleware
# Use CORS_ORIGINS from settings for flexibility across environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers in responses
)

# Static files for QR codes
static_path = Path("static")
if static_path.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API router
# Note: Digital Ocean strips /api prefix, so we only use /v1 here
app.include_router(api_router, prefix="/v1")


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Root endpoint
@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
    }


# Custom exception handlers
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "body": exc.body,
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Custom handler for ValueError"""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )