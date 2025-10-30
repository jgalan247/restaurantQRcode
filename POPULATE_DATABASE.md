-- Seed Menu Data for La Hacienda Restaurant
-- Run this SQL script to populate categories and menu items

-- ============================================================================
-- 1. CREATE CATEGORIES
-- ============================================================================

INSERT INTO categories (name, description, display_order, is_active, created_at, updated_at)
VALUES
  ('Small Plates & Sides', 'Appetizers and side dishes', 1, true, NOW(), NOW()),
  ('Mains', 'Main courses and entrees', 2, true, NOW(), NOW()),
  ('Desserts', 'Sweet treats and desserts', 3, true, NOW(), NOW()),
  ('Hot Drinks', 'Coffee, tea, and hot beverages', 4, true, NOW(), NOW()),
  ('Beers & Cider', 'Alcoholic beverages', 5, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. INSERT MENU ITEMS
-- ============================================================================

-- Small Plates & Sides
INSERT INTO menu_items (
  name, category_id, description, price, calories, allergens, spice_level,
  is_available, is_lite_bite, is_child_friendly, is_salad, is_deal, is_gluten_free,
  dietary_tags, display_order, created_at, updated_at
)
VALUES
  ('Chicken Quesadilla', (SELECT id FROM categories WHERE name = 'Small Plates & Sides'),
   'Grilled chicken with melted cheese in a flour tortilla', 8.95, 520,
   ARRAY['gluten', 'dairy'], 'mild', true, false, true, false, false, false,
   ARRAY[]::text[], 1, NOW(), NOW()),

  ('Nachos Supreme', (SELECT id FROM categories WHERE name = 'Small Plates & Sides'),
   'Crispy tortilla chips topped with cheese sauce jalapeños and sour cream', 9.95, 680,
   ARRAY['dairy', 'gluten'], 'medium', true, false, false, false, false, false,
   ARRAY[]::text[], 2, NOW(), NOW()),

  ('Guacamole & Chips', (SELECT id FROM categories WHERE name = 'Small Plates & Sides'),
   'Fresh avocado dip with crispy tortilla chips', 6.95, 340,
   ARRAY['gluten'], 'mild', true, true, true, false, false, true,
   ARRAY['vg'], 3, NOW(), NOW()),

  ('Chicken Wings (6)', (SELECT id FROM categories WHERE name = 'Small Plates & Sides'),
   'Spicy buffalo wings with ranch dressing', 7.95, 480,
   ARRAY['dairy'], 'hot', true, false, false, false, false, false,
   ARRAY[]::text[], 4, NOW(), NOW()),

  ('Vegetable Fajita Quesadilla', (SELECT id FROM categories WHERE name = 'Small Plates & Sides'),
   'Grilled peppers onions and mushrooms with cheese', 7.95, 450,
   ARRAY['gluten', 'dairy'], 'mild', true, true, true, false, false, false,
   ARRAY['v'], 5, NOW(), NOW()),

-- Mains
  ('Classic Beef Burrito', (SELECT id FROM categories WHERE name = 'Mains'),
   'Seasoned ground beef black beans rice cheese and salsa wrapped in a flour tortilla', 12.95, 780,
   ARRAY['gluten', 'dairy'], 'medium', true, false, false, false, false, false,
   ARRAY[]::text[], 10, NOW(), NOW()),

  ('Chicken Burrito Bowl', (SELECT id FROM categories WHERE name = 'Mains'),
   'Grilled chicken on cilantro rice with black beans corn salsa and guacamole', 13.95, 620,
   ARRAY['dairy'], 'mild', true, false, false, false, false, false,
   ARRAY['gf'], 11, NOW(), NOW()),

  ('Vegetarian Enchiladas', (SELECT id FROM categories WHERE name = 'Mains'),
   'Three cheese enchiladas with red sauce served with rice and beans', 11.95, 680,
   ARRAY['gluten', 'dairy'], 'mild', true, false, false, false, false, false,
   ARRAY['v'], 12, NOW(), NOW()),

  ('Carne Asada Tacos (3)', (SELECT id FROM categories WHERE name = 'Mains'),
   'Grilled steak tacos with onions cilantro and lime', 14.95, 720,
   ARRAY['gluten'], 'hot', true, false, false, false, false, false,
   ARRAY[]::text[], 13, NOW(), NOW()),

  ('Fish Tacos (3)', (SELECT id FROM categories WHERE name = 'Mains'),
   'Battered fish with cabbage slaw chipotle mayo and lime', 13.95, 650,
   ARRAY['gluten', 'fish', 'dairy'], 'medium', true, false, false, false, false, false,
   ARRAY[]::text[], 14, NOW(), NOW()),

  ('Chicken Fajitas', (SELECT id FROM categories WHERE name = 'Mains'),
   'Sizzling chicken with peppers and onions served with tortillas', 15.95, 680,
   ARRAY['gluten', 'dairy'], 'medium', true, false, false, false, false, false,
   ARRAY[]::text[], 15, NOW(), NOW()),

  ('Veggie Burrito Bowl', (SELECT id FROM categories WHERE name = 'Mains'),
   'Black beans rice grilled vegetables guacamole and salsa', 10.95, 520,
   ARRAY['dairy'], 'mild', true, true, false, false, false, true,
   ARRAY['vg', 'gf'], 16, NOW(), NOW()),

  ('Beef Chimichanga', (SELECT id FROM categories WHERE name = 'Mains'),
   'Deep-fried burrito filled with beef and cheese topped with sour cream', 13.95, 850,
   ARRAY['gluten', 'dairy'], 'medium', true, false, false, false, false, false,
   ARRAY[]::text[], 17, NOW(), NOW()),

  ('Pulled Pork Tacos (3)', (SELECT id FROM categories WHERE name = 'Mains'),
   'Slow-cooked pork with pineapple salsa', 13.95, 690,
   ARRAY['gluten'], 'medium', true, false, false, false, false, false,
   ARRAY[]::text[], 18, NOW(), NOW()),

  ('Shrimp Fajitas', (SELECT id FROM categories WHERE name = 'Mains'),
   'Sizzling shrimp with peppers and onions served with tortillas', 16.95, 620,
   ARRAY['gluten', 'shellfish', 'dairy'], 'mild', true, false, false, false, false, false,
   ARRAY[]::text[], 19, NOW(), NOW()),

  ('Kids Cheese Quesadilla', (SELECT id FROM categories WHERE name = 'Mains'),
   'Small cheese quesadilla with fries', 5.95, 380,
   ARRAY['gluten', 'dairy'], 'none', true, false, true, false, true, false,
   ARRAY[]::text[], 20, NOW(), NOW()),

  ('Kids Chicken Tenders', (SELECT id FROM categories WHERE name = 'Mains'),
   'Breaded chicken strips with fries', 6.95, 420,
   ARRAY['gluten'], 'none', true, false, true, false, true, false,
   ARRAY[]::text[], 21, NOW(), NOW()),

  ('Caesar Salad', (SELECT id FROM categories WHERE name = 'Mains'),
   'Romaine lettuce parmesan cheese croutons and Caesar dressing', 8.95, 380,
   ARRAY['gluten', 'dairy', 'fish'], 'none', true, true, false, true, false, false,
   ARRAY[]::text[], 22, NOW(), NOW()),

  ('Taco Salad', (SELECT id FROM categories WHERE name = 'Mains'),
   'Crispy tortilla bowl with beef lettuce cheese tomato and sour cream', 11.95, 620,
   ARRAY['gluten', 'dairy'], 'mild', true, false, false, true, false, false,
   ARRAY[]::text[], 23, NOW(), NOW()),

  ('Southwest Chicken Salad', (SELECT id FROM categories WHERE name = 'Mains'),
   'Grilled chicken on mixed greens with corn black beans and chipotle ranch', 12.95, 480,
   ARRAY['dairy'], 'mild', true, true, false, true, false, false,
   ARRAY['gf'], 24, NOW(), NOW()),

-- Desserts
  ('Churros', (SELECT id FROM categories WHERE name = 'Desserts'),
   'Fried dough pastry with cinnamon sugar and chocolate sauce', 5.95, 420,
   ARRAY['gluten', 'dairy'], 'none', true, false, true, false, false, false,
   ARRAY['v'], 30, NOW(), NOW()),

  ('Flan', (SELECT id FROM categories WHERE name = 'Desserts'),
   'Traditional Mexican caramel custard', 6.95, 340,
   ARRAY['dairy', 'eggs'], 'none', true, false, true, false, false, true,
   ARRAY['v'], 31, NOW(), NOW()),

  ('Tres Leches Cake', (SELECT id FROM categories WHERE name = 'Desserts'),
   'Sponge cake soaked in three types of milk', 6.95, 480,
   ARRAY['gluten', 'dairy', 'eggs'], 'none', true, false, true, false, false, false,
   ARRAY['v'], 32, NOW(), NOW()),

  ('Fried Ice Cream', (SELECT id FROM categories WHERE name = 'Desserts'),
   'Vanilla ice cream in a crispy coating with honey and whipped cream', 6.95, 520,
   ARRAY['gluten', 'dairy', 'eggs'], 'none', true, false, true, false, false, false,
   ARRAY['v'], 33, NOW(), NOW()),

-- Hot Drinks
  ('Coffee', (SELECT id FROM categories WHERE name = 'Hot Drinks'),
   'Freshly brewed Colombian coffee', 2.95, 5,
   ARRAY[]::text[], 'none', true, false, false, false, false, true,
   ARRAY['vg'], 40, NOW(), NOW()),

  ('Hot Chocolate', (SELECT id FROM categories WHERE name = 'Hot Drinks'),
   'Rich Mexican hot chocolate with cinnamon', 3.95, 280,
   ARRAY['dairy'], 'none', true, false, true, false, false, false,
   ARRAY['v'], 41, NOW(), NOW()),

-- Beers & Cider
  ('Corona', (SELECT id FROM categories WHERE name = 'Beers & Cider'),
   'Mexican lager 330ml', 4.95, 150,
   ARRAY[]::text[], 'none', true, false, false, false, false, true,
   ARRAY['vg'], 50, NOW(), NOW()),

  ('Modelo Especial', (SELECT id FROM categories WHERE name = 'Beers & Cider'),
   'Premium Mexican pilsner 330ml', 4.95, 145,
   ARRAY[]::text[], 'none', true, false, false, false, false, true,
   ARRAY['vg'], 51, NOW(), NOW()),

  ('Margarita', (SELECT id FROM categories WHERE name = 'Beers & Cider'),
   'Classic lime margarita', 7.95, 220,
   ARRAY[]::text[], 'none', true, false, false, false, false, true,
   ARRAY['vg'], 52, NOW(), NOW()),

  ('Michelada', (SELECT id FROM categories WHERE name = 'Beers & Cider'),
   'Beer cocktail with lime and hot sauce', 6.95, 180,
   ARRAY[]::text[], 'none', true, false, false, false, false, true,
   ARRAY['vg'], 53, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. VERIFY DATA
-- ============================================================================

-- Count categories
SELECT 'Categories:' as type, COUNT(*) as count FROM categories;

-- Count menu items by category
SELECT c.name as category, COUNT(m.id) as item_count
FROM categories c
LEFT JOIN menu_items m ON m.category_id = c.id
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- Total menu items
SELECT 'Total Menu Items:' as type, COUNT(*) as count FROM menu_items;

-- Show sample items
SELECT
  c.name as category,
  m.name as item,
  m.price,
  m.is_available
FROM menu_items m
JOIN categories c ON m.category_id = c.id
ORDER BY c.display_order, m.display_order
LIMIT 10;
