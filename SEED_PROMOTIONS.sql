-- ============================================
-- SEED PROMOTIONAL DATA
-- Run this script to populate specials, offers, and chef combos
-- ============================================

-- Clean existing promotional data (optional - remove if you want to keep existing data)
-- DELETE FROM special_items;
-- DELETE FROM specials;
-- DELETE FROM offers;
-- DELETE FROM chef_combo_items;
-- DELETE FROM chef_combos;

-- ============================================
-- 1. DAILY SPECIALS (Menu of the Day)
-- ============================================

-- Special 1: Taco Tuesday Special
INSERT INTO specials (name, description, price, is_active, start_date, end_date, display_order, image_url)
VALUES (
    'Taco Tuesday Special',
    'Three authentic street tacos with your choice of filling, served with rice, beans, and a drink. Available every Tuesday!',
    15.99,
    true,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    1,
    null
) RETURNING id;

-- Get the special_id (we'll need to manually set this or use a function)
-- For now, assuming special_id = 1 for this example

INSERT INTO special_items (special_id, menu_item_id, quantity, display_order, is_custom, custom_item_name, custom_item_description)
VALUES
    (1, (SELECT id FROM menu_items WHERE name ILIKE '%taco%' LIMIT 1), 3, 1, false, null, null),
    (1, (SELECT id FROM menu_items WHERE name ILIKE '%rice%' LIMIT 1), 1, 2, false, null, null),
    (1, (SELECT id FROM menu_items WHERE name ILIKE '%bean%' LIMIT 1), 1, 3, false, null, null),
    (1, (SELECT id FROM menu_items WHERE name ILIKE '%coca%cola%' LIMIT 1), 1, 4, false, null, null);

-- Special 2: Weekend Brunch Special
INSERT INTO specials (name, description, price, is_active, start_date, end_date, display_order, image_url)
VALUES (
    'Weekend Brunch Fiesta',
    'Bottomless brunch! Huevos Rancheros, unlimited mimosas, churros, and fresh fruit. Saturdays & Sundays 10AM-2PM.',
    25.00,
    true,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '60 days',
    2,
    null
) RETURNING id;

INSERT INTO special_items (special_id, menu_item_id, quantity, display_order, is_custom, custom_item_name, custom_item_description)
VALUES
    (2, null, 1, 1, true, 'Huevos Rancheros', 'Two fried eggs on corn tortillas with ranchero sauce, refried beans, and avocado'),
    (2, null, 1, 2, true, 'Unlimited Mimosas', 'Fresh orange juice and prosecco'),
    (2, (SELECT id FROM menu_items WHERE name ILIKE '%churros%' LIMIT 1), 1, 3, false, null, null),
    (2, null, 1, 4, true, 'Fresh Fruit Platter', 'Seasonal fresh fruit selection');

-- Special 3: Enchilada Evening
INSERT INTO specials (name, description, price, is_active, start_date, end_date, display_order, image_url)
VALUES (
    'Enchilada Evening',
    'Three cheese enchiladas smothered in mole sauce, served with Mexican rice, refried beans, sour cream, and house margarita.',
    18.50,
    true,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    3,
    null
);

INSERT INTO special_items (special_id, menu_item_id, quantity, display_order, is_custom, custom_item_name, custom_item_description)
VALUES
    (3, null, 3, 1, true, 'Cheese Enchiladas', 'Corn tortillas filled with queso fresco and covered in mole sauce'),
    (3, null, 1, 2, true, 'Mexican Rice', 'Traditional Spanish-style rice'),
    (3, null, 1, 3, true, 'Refried Beans', 'Smooth pinto beans topped with queso'),
    (3, (SELECT id FROM menu_items WHERE name ILIKE '%margarita%' LIMIT 1), 1, 4, false, null, null);

-- ============================================
-- 2. PROMOTIONAL OFFERS & DEALS
-- ============================================

-- Offer 1: Happy Hour
INSERT INTO offers (
    name,
    description,
    discount_type,
    discount_value,
    minimum_spend,
    applicable_days,
    applicable_times_start,
    applicable_times_end,
    start_date,
    end_date,
    is_active,
    is_featured,
    max_usage
)
VALUES (
    'Happy Hour - 50% Off Drinks',
    'Half price on all beers, wines, and cocktails! Weekdays 4PM-6PM only.',
    'percentage',
    50.00,
    0.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    '16:00',
    '18:00',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    true,
    true,
    null
);

-- Offer 2: Student Discount
INSERT INTO offers (
    name,
    description,
    discount_type,
    discount_value,
    minimum_spend,
    applicable_days,
    applicable_times_start,
    applicable_times_end,
    start_date,
    end_date,
    is_active,
    is_featured,
    max_usage
)
VALUES (
    'Student Special - 20% Off',
    'Show your student ID and get 20% off your entire order. Valid every day!',
    'percentage',
    20.00,
    15.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    null,
    null,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '180 days',
    true,
    false,
    null
);

-- Offer 3: Birthday Special
INSERT INTO offers (
    name,
    description,
    discount_type,
    discount_value,
    minimum_spend,
    applicable_days,
    applicable_times_start,
    applicable_times_end,
    start_date,
    end_date,
    is_active,
    is_featured,
    max_usage
)
VALUES (
    'Birthday Fiesta - Free Dessert',
    'Celebrating your birthday? Get a free dessert on us! Show ID for proof of birthday within 7 days.',
    'free_item',
    0.00,
    20.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    null,
    null,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '365 days',
    true,
    true,
    null
);

-- Offer 4: Family Deal
INSERT INTO offers (
    name,
    description,
    discount_type,
    discount_value,
    minimum_spend,
    applicable_days,
    applicable_times_start,
    applicable_times_end,
    start_date,
    end_date,
    is_active,
    is_featured,
    max_usage
)
VALUES (
    'Family Sunday - £10 Off',
    'Bring the whole family! Get £10 off orders over £50 every Sunday.',
    'fixed',
    10.00,
    50.00,
    ARRAY['sunday'],
    null,
    null,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    true,
    true,
    null
);

-- Offer 5: Lunch Deal
INSERT INTO offers (
    name,
    description,
    discount_type,
    discount_value,
    minimum_spend,
    applicable_days,
    applicable_times_start,
    applicable_times_end,
    start_date,
    end_date,
    is_active,
    is_featured,
    max_usage
)
VALUES (
    'Lunch Express - 15% Off',
    'Quick lunch? Get 15% off all orders between 12PM-3PM on weekdays.',
    'percentage',
    15.00,
    10.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    '12:00',
    '15:00',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '60 days',
    true,
    false,
    null
);

-- ============================================
-- 3. CHEF'S RECOMMENDATIONS (Chef Combos)
-- ============================================

-- Chef Combo 1: Quick Lunch
INSERT INTO chef_combos (name, description, price, is_active, display_order)
VALUES (
    'Quick Lunch',
    'Perfect for a quick midday bite. Includes nachos, quesadilla, and a refreshing drink.',
    20.00,
    true,
    1
);

INSERT INTO chef_combo_items (combo_id, menu_item_id, quantity)
VALUES
    (1, (SELECT id FROM menu_items WHERE name ILIKE '%nacho%' LIMIT 1), 1),
    (1, (SELECT id FROM menu_items WHERE name ILIKE '%quesadilla%' LIMIT 1), 1),
    (1, (SELECT id FROM menu_items WHERE name ILIKE '%coca%cola%' LIMIT 1), 1);

-- Chef Combo 2: Date Night
INSERT INTO chef_combos (name, description, price, is_active, display_order)
VALUES (
    'Date Night',
    'Romantic dinner for two. Share nachos, enjoy quesadillas, finish with churros and wine.',
    50.00,
    true,
    2
);

INSERT INTO chef_combo_items (combo_id, menu_item_id, quantity)
VALUES
    (2, (SELECT id FROM menu_items WHERE name ILIKE '%nacho%' LIMIT 1), 1),
    (2, (SELECT id FROM menu_items WHERE name ILIKE '%quesadilla%' LIMIT 1), 2),
    (2, (SELECT id FROM menu_items WHERE name ILIKE '%churros%' LIMIT 1), 1),
    (2, (SELECT id FROM menu_items WHERE name ILIKE '%rioja%' OR name ILIKE '%red%wine%' LIMIT 1), 1);

-- Chef Combo 3: Full Experience
INSERT INTO chef_combos (name, description, price, is_active, display_order)
VALUES (
    'Full Experience',
    'The complete La Hacienda experience. Nachos, quesadilla, guacamole, churros, and a Corona.',
    40.00,
    true,
    3
);

INSERT INTO chef_combo_items (combo_id, menu_item_id, quantity)
VALUES
    (3, (SELECT id FROM menu_items WHERE name ILIKE '%nacho%' LIMIT 1), 1),
    (3, (SELECT id FROM menu_items WHERE name ILIKE '%quesadilla%' LIMIT 1), 1),
    (3, (SELECT id FROM menu_items WHERE name ILIKE '%guacamole%' LIMIT 1), 1),
    (3, (SELECT id FROM menu_items WHERE name ILIKE '%churros%' LIMIT 1), 1),
    (3, (SELECT id FROM menu_items WHERE name ILIKE '%corona%' LIMIT 1), 1);

-- Chef Combo 4: Family Feast
INSERT INTO chef_combos (name, description, price, is_active, display_order)
VALUES (
    'Family Feast',
    'Feed the whole family! Multiple mains, sides to share, and drinks for everyone.',
    80.00,
    true,
    4
);

INSERT INTO chef_combo_items (combo_id, menu_item_id, quantity)
VALUES
    (4, (SELECT id FROM menu_items WHERE name ILIKE '%nacho%' LIMIT 1), 2),
    (4, (SELECT id FROM menu_items WHERE name ILIKE '%quesadilla%' LIMIT 1), 3),
    (4, (SELECT id FROM menu_items WHERE name ILIKE '%guacamole%' LIMIT 1), 2),
    (4, (SELECT id FROM menu_items WHERE name ILIKE '%churros%' LIMIT 1), 2),
    (4, (SELECT id FROM menu_items WHERE name ILIKE '%coca%cola%' LIMIT 1), 4);

-- Chef Combo 5: Solo Treat
INSERT INTO chef_combos (name, description, price, is_active, display_order)
VALUES (
    'Solo Treat',
    'Treat yourself! A well-balanced meal with quesadilla, guacamole, churros, and a Sprite.',
    30.00,
    true,
    5
);

INSERT INTO chef_combo_items (combo_id, menu_item_id, quantity)
VALUES
    (5, (SELECT id FROM menu_items WHERE name ILIKE '%quesadilla%' LIMIT 1), 1),
    (5, (SELECT id FROM menu_items WHERE name ILIKE '%guacamole%' LIMIT 1), 1),
    (5, (SELECT id FROM menu_items WHERE name ILIKE '%churros%' LIMIT 1), 1),
    (5, (SELECT id FROM menu_items WHERE name ILIKE '%sprite%' LIMIT 1), 1);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check what was created
SELECT 'SPECIALS CREATED:' as info, COUNT(*) as count FROM specials;
SELECT 'SPECIAL ITEMS CREATED:' as info, COUNT(*) as count FROM special_items;
SELECT 'OFFERS CREATED:' as info, COUNT(*) as count FROM offers;
SELECT 'CHEF COMBOS CREATED:' as info, COUNT(*) as count FROM chef_combos;
SELECT 'CHEF COMBO ITEMS CREATED:' as info, COUNT(*) as count FROM chef_combo_items;

-- Show all specials
SELECT id, name, price, is_active, start_date, end_date FROM specials ORDER BY display_order;

-- Show all offers
SELECT id, name, discount_type, discount_value, is_active, is_featured FROM offers;

-- Show all chef combos
SELECT id, name, price, is_active FROM chef_combos ORDER BY display_order;

-- ============================================
-- SUCCESS!
-- ============================================
-- If you see counts above, your promotional data has been seeded successfully!
-- The features should now appear on the customer menu page.
