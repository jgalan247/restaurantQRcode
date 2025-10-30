from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

settings = get_settings()

# Convert DATABASE_URL to async format if needed
# Digital Ocean provides postgresql:// but async SQLAlchemy needs postgresql+asyncpg://
database_url = settings.DATABASE_URL

# Check if SSL is required before removing query params
ssl_required = "sslmode=require" in database_url

# Convert to async format
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove query parameters (asyncpg doesn't accept sslmode in URL)
# Instead, we'll pass SSL config via connect_args
if "?" in database_url:
    database_url = database_url.split("?")[0]

# Prepare connect_args for asyncpg
connect_args = {}
if ssl_required:
    # asyncpg expects ssl='require' instead of sslmode=require
    connect_args["ssl"] = "require"

# Create async engine
engine = create_async_engine(
    database_url,
    echo=settings.DEBUG,
    future=True,
    connect_args=connect_args
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


# Base class for all models
class Base(DeclarativeBase):
    pass


# Dependency to get DB session
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
