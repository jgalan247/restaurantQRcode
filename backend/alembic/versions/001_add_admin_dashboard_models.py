"""Add admin dashboard models - specials, offers, and order tracking

Revision ID: 001_admin_dashboard
Revises:
Create Date: 2025-10-13 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_admin_dashboard'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create specials table
    op.create_table('specials',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint('price >= 0', name='check_special_price_positive'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_specials_id'), 'specials', ['id'], unique=False)

    # Create special_items table
    op.create_table('special_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('special_id', sa.Integer(), nullable=False),
        sa.Column('menu_item_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.CheckConstraint('quantity > 0', name='check_special_item_quantity_positive'),
        sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['special_id'], ['specials.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_special_items_id'), 'special_items', ['id'], unique=False)
    op.create_index(op.f('ix_special_items_menu_item_id'), 'special_items', ['menu_item_id'], unique=False)
    op.create_index(op.f('ix_special_items_special_id'), 'special_items', ['special_id'], unique=False)

    # Create offers table
    op.create_table('offers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('discount_type', sa.String(length=50), nullable=False),
        sa.Column('discount_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('minimum_spend', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('applicable_days', postgresql.ARRAY(sa.String(length=10)), nullable=True),
        sa.Column('applicable_times_start', sa.String(length=10), nullable=True),
        sa.Column('applicable_times_end', sa.String(length=10), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=True),
        sa.Column('max_usage', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint("discount_type IN ('fixed', 'percentage', 'bogo', 'free_item')", name='check_offer_discount_type'),
        sa.CheckConstraint('discount_value >= 0', name='check_discount_value_positive'),
        sa.CheckConstraint('minimum_spend >= 0', name='check_minimum_spend_positive'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_offers_id'), 'offers', ['id'], unique=False)

    # Add special_id and offer_id columns to orders table
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('special_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('offer_id', sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f('ix_orders_offer_id'), ['offer_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_orders_special_id'), ['special_id'], unique=False)
        batch_op.create_foreign_key('fk_orders_special_id', 'specials', ['special_id'], ['id'])
        batch_op.create_foreign_key('fk_orders_offer_id', 'offers', ['offer_id'], ['id'])


def downgrade():
    # Remove foreign keys and columns from orders table
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_constraint('fk_orders_offer_id', type_='foreignkey')
        batch_op.drop_constraint('fk_orders_special_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_orders_special_id'))
        batch_op.drop_index(batch_op.f('ix_orders_offer_id'))
        batch_op.drop_column('offer_id')
        batch_op.drop_column('special_id')

    # Drop offers table
    op.drop_index(op.f('ix_offers_id'), table_name='offers')
    op.drop_table('offers')

    # Drop special_items table
    op.drop_index(op.f('ix_special_items_special_id'), table_name='special_items')
    op.drop_index(op.f('ix_special_items_menu_item_id'), table_name='special_items')
    op.drop_index(op.f('ix_special_items_id'), table_name='special_items')
    op.drop_table('special_items')

    # Drop specials table
    op.drop_index(op.f('ix_specials_id'), table_name='specials')
    op.drop_table('specials')
