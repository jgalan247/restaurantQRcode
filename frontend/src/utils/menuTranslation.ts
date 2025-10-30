import i18n from '../i18n';

/**
 * Translates menu item name
 * Looks up translation in menu-items.json, falls back to original name
 */
export function translateItemName(itemName: string): string {
  const key = `items.${itemName}.name`;
  const translated = i18n.t(key, { ns: 'menuItems' });

  // If translation key not found, return original name
  return translated === key ? itemName : translated;
}

/**
 * Translates menu item description
 * Looks up translation in menu-items.json, falls back to original description
 */
export function translateItemDescription(itemName: string, originalDescription?: string): string {
  if (!originalDescription) return '';

  const key = `items.${itemName}.description`;
  const translated = i18n.t(key, { ns: 'menuItems' });

  // If translation key not found, return original description
  return translated === key ? originalDescription : translated;
}

/**
 * Translates category name
 * Looks up translation in menu-items.json, falls back to original category
 */
export function translateCategory(categoryName: string): string {
  const key = `categories.${categoryName}`;
  const translated = i18n.t(key, { ns: 'menuItems' });

  // If translation key not found, return original category
  return translated === key ? categoryName : translated;
}
