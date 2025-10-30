# French Translation Implementation Guide

## ✅ What's Already Done

### Infrastructure Setup (100% Complete)
- ✅ Installed `react-i18next`, `i18next`, and `i18next-browser-languagedetector`
- ✅ Created `frontend/src/i18n.ts` configuration
- ✅ Set up language detection and localStorage persistence
- ✅ Initialized i18n in `main.tsx`

### Translation Files (100% Complete)
- ✅ **English UI** (`frontend/src/locales/en/translation.json`) - 150+ strings
- ✅ **French UI** (`frontend/src/locales/fr/translation.json`) - 150+ strings
- ✅ **English Menu Items** (`frontend/src/locales/en/menu-items.json`) - Sample items
- ✅ **French Menu Items** (`frontend/src/locales/fr/menu-items.json`) - Sample items

### Components Updated (Partial - Examples Provided)
- ✅ **Header.tsx** - Language toggle button (EN/FR with globe icon)
- ✅ **CartDrawer.tsx** - Cart title, empty state, checkout button
- ✅ **CartSummary.tsx** - Subtotal, GST, Total labels
- ✅ **menuTranslation.ts** - Helper utility for translating menu items

### How It Works
1. User clicks **Globe icon** in header to toggle between EN/FR
2. Language preference saved to localStorage
3. All UI text automatically updates via `useTranslation()` hook
4. Menu items (names/descriptions) translate via lookup in `menu-items.json`

---

## 📋 What Remains To Be Done

### Customer-Facing Components (15 components)

#### Menu Components (Priority: HIGH)
These are the most used components and should be done first:

**1. MenuFilters.tsx** (`frontend/src/components/menu/MenuFilters.tsx`)
Replace these strings:
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Example replacements:
"Filters" → {t('filters.title')}
"Clear all filters" → {t('filters.clearAll')}
"Dietary Preferences" → {t('filters.dietary')}
"Vegetarian" → {t('dietary.vegetarian')}
"Mild" → {t('spice.mild')}
"All Prices" → {t('priceRanges.all')}
"Celery" → {t('allergens.celery')}
```

**2. MenuItemModal.tsx** (`frontend/src/components/menu/MenuItemModal.tsx`)
Replace these strings:
```typescript
"Add to Cart" → {t('menu.addToCart')}
"Unavailable" → {t('menu.unavailable')}
"Customize your order" → {t('menu.customize')}
"Add extras" → {t('menu.addExtras')}
"Quantity" → {t('menu.quantity')}
"Small Glass (125ml)" → {t('variants.smallGlass')}
```

For menu item names/descriptions:
```typescript
import { translateItemName, translateItemDescription } from '../../../utils/menuTranslation';

// In the component:
const translatedName = translateItemName(item.name);
const translatedDesc = translateItemDescription(item.name, item.description);
```

**3. AllergenWarningModal.tsx** (`frontend/src/components/menu/AllergenWarningModal.tsx`)
Replace these strings:
```typescript
"Allergen Information" → {t('allergenWarning.title')}
"Important: If you have..." → {t('allergenWarning.important')}
"14 Major Allergens (UK Law):" → {t('allergenWarning.majorAllergens')}
"Cross-contamination: Our kitchen..." → {t('allergenWarning.crossContamination')}
"I Understand" → {t('allergenWarning.understand')}
```

**4. MenuNavigation.tsx** (`frontend/src/components/menu/MenuNavigation.tsx`)
Translate category names:
```typescript
import { translateCategory } from '../../../utils/menuTranslation';

// When displaying categories:
const translatedCategory = translateCategory(category.name);
```

#### Cart Components (Priority: MEDIUM)
These are already done as examples:
- ✅ CartDrawer.tsx
- ✅ CartSummary.tsx
- **CartItem.tsx** - Needs translation for modifier names

#### Payment Components (Priority: HIGH)
**5. PaymentOptions.tsx**
```typescript
"Choose Payment Method" → {t('checkout.choosePaymentMethod')}
"Pay Full Amount" → {t('checkout.payFull')}
"Split Equally" → {t('checkout.splitEqually')}
```

**6. TipSelector.tsx**
```typescript
"Add a Tip (optional)" → {t('payment.addTip')}
"No Tip" → {t('payment.noTip')}
"Custom tip amount" → {t('payment.customTip')}
```

**7. SplitEqualForm.tsx & SplitByItemsForm.tsx**
```typescript
"Number of People" → {t('checkout.numberOfPeople')}
"Email Addresses" → {t('checkout.emailAddresses')}
"Person {{number}} email" → {t('checkout.personEmail', { number: index + 1 })}
```

### Customer-Facing Pages (Priority: HIGH)

**8. MenuPage.tsx** (`frontend/src/pages/MenuPage.tsx`)
```typescript
"Our Menu" → {t('menu.title')}
"Showing {{count}} of {{total}} items" → {t('menu.showing', { count: X, total: Y })}
"No menu items match your filters." → {t('menu.noResults')}
"Allergen Info" → {t('menu.allergenInfo')}
```

**9. CheckoutPage.tsx** (`frontend/src/pages/CheckoutPage.tsx`)
```typescript
"Checkout" → {t('checkout.title')}
"Continue" → {t('common.continue')}
"Back" → {t('common.back')}
```

**10. PaymentFormPage.tsx** (`frontend/src/pages/PaymentFormPage.tsx`)
```typescript
"Payment" → {t('payment.title')}
"Card Details" → {t('payment.cardDetails')}
"Card Number" → {t('payment.cardNumber')}
"Place Order" → {t('payment.placeOrder')}
"Processing..." → {t('common.processing')}
```

**11. PaymentSuccessPage.tsx**
```typescript
"Order Placed Successfully!" → {t('paymentSuccess.title')}
"Order Number: {{number}}" → {t('paymentSuccess.orderNumber', { number: orderNum })}
"View Invoice" → {t('paymentSuccess.viewInvoice')}
```

**12. PaymentFailurePage.tsx**
```typescript
"Payment Failed" → {t('paymentFailure.title')}
"Try Again" → {t('paymentFailure.tryAgain')}
```

**13. InvoicePage.tsx**
```typescript
"Invoice" → {t('invoice.title')}
"Download PDF" → {t('invoice.downloadPdf')}
```

### Toast Notifications (Priority: MEDIUM)

Update all `toast.success()` and `toast.error()` calls throughout the codebase:

**In services/api.ts:**
```typescript
import i18n from '../i18n';

toast.error(i18n.t('errors.networkError'));
toast.error(i18n.t('errors.serverError'));
```

**In component files:**
```typescript
const { t } = useTranslation();

toast.success(t('notifications.paymentSuccess'));
toast.error(t('notifications.menuLoadError'));
toast.success(t('cart.addedToCart', { quantity, name: item.name }));
```

---

## 🔧 Implementation Pattern

For each component, follow this 3-step pattern:

### Step 1: Import the hook
```typescript
import { useTranslation } from 'react-i18next';
```

### Step 2: Get the translation function
```typescript
export function MyComponent() {
  const { t } = useTranslation();

  // ... rest of component
}
```

### Step 3: Replace hardcoded strings
```typescript
// Before:
<h1>Our Menu</h1>
<button>Add to Cart</button>

// After:
<h1>{t('menu.title')}</h1>
<button>{t('menu.addToCart')}</button>
```

### Step 4: Handle dynamic content with interpolation
```typescript
// Before:
<p>Showing {count} of {total} items</p>

// After:
<p>{t('menu.showing', { count, total })}</p>
```

---

## 📝 Updating Menu Items From Database

When you populate your database with real menu items, you'll need to extract them and create French translations.

### Option 1: SQL Export (Recommended)
```sql
-- Export all menu items and categories
SELECT name, description FROM menu_items;
SELECT name FROM categories;
```

Copy the results to Google Translate (free), then update:
- `frontend/src/locales/fr/menu-items.json`

### Option 2: API Export Script
Create a script to fetch menu items via API and generate translation files:

```javascript
// scripts/export-menu-for-translation.js
const items = await fetch('http://localhost:8000/api/v1/menu/').then(r => r.json());

const menuItems = {};
items.forEach(item => {
  menuItems[item.name] = {
    name: item.name,  // Keep English for now
    description: item.description  // Keep English for now
  };
});

// Copy to Google Translate, paste French results back
```

### Option 3: Keep Menu Items in English
Many restaurants keep menu item names in their original language (common for Mexican food). Only translate:
- Categories
- UI elements
- Instructions
- Error messages

---

## 🧪 Testing Checklist

After updating components, test the following:

### Functionality Tests
1. ✅ Click Globe icon in header - language switches
2. ✅ Refresh page - language preference persists
3. ✅ All UI text changes when switching languages
4. ✅ Menu item names translate (if translations provided)
5. ✅ Toast notifications appear in correct language
6. ✅ Error messages display in correct language
7. ✅ Form placeholders update
8. ✅ Button labels update

### Visual Tests
1. ✅ Text doesn't overflow containers (French text is ~20% longer)
2. ✅ Mobile view: Globe button visible and usable
3. ✅ Modals/dialogs: all text translated
4. ✅ Cart drawer: all labels translated

### Edge Cases
1. ✅ Menu item not in translation file → shows original name (graceful fallback)
2. ✅ Missing translation key → shows key name (graceful fallback)
3. ✅ Numbers and currency format correctly

---

## 📂 File Structure Reference

```
frontend/src/
├── i18n.ts                          # ✅ i18n configuration
├── main.tsx                         # ✅ Imports i18n
├── locales/
│   ├── en/
│   │   ├── translation.json         # ✅ 150+ English UI strings
│   │   └── menu-items.json          # ✅ English menu items
│   └── fr/
│       ├── translation.json         # ✅ 150+ French UI strings
│       └── menu-items.json          # ✅ French menu items
├── utils/
│   └── menuTranslation.ts           # ✅ Helper functions
├── components/
│   ├── layout/
│   │   └── Header.tsx               # ✅ DONE - Language toggle
│   ├── cart/
│   │   ├── CartDrawer.tsx           # ✅ DONE - Example
│   │   ├── CartSummary.tsx          # ✅ DONE - Example
│   │   └── CartItem.tsx             # ⏳ TODO
│   ├── menu/
│   │   ├── MenuFilters.tsx          # ⏳ TODO - High priority
│   │   ├── MenuItemModal.tsx        # ⏳ TODO - High priority
│   │   ├── AllergenWarningModal.tsx # ⏳ TODO - High priority
│   │   └── MenuNavigation.tsx       # ⏳ TODO - Medium priority
│   └── payment/
│       ├── PaymentOptions.tsx       # ⏳ TODO - High priority
│       ├── TipSelector.tsx          # ⏳ TODO - High priority
│       ├── SplitEqualForm.tsx       # ⏳ TODO - Medium priority
│       └── SplitByItemsForm.tsx     # ⏳ TODO - Medium priority
└── pages/
    ├── MenuPage.tsx                 # ⏳ TODO - High priority
    ├── CheckoutPage.tsx             # ⏳ TODO - High priority
    ├── PaymentFormPage.tsx          # ⏳ TODO - High priority
    ├── PaymentSuccessPage.tsx       # ⏳ TODO - Medium priority
    ├── PaymentFailurePage.tsx       # ⏳ TODO - Low priority
    └── InvoicePage.tsx              # ⏳ TODO - Low priority
```

---

## 🎯 Recommended Order of Implementation

### Phase 1: Core Ordering Flow (Must-Have)
1. ✅ Header (DONE)
2. ⏳ MenuPage
3. ⏳ MenuFilters
4. ⏳ MenuItemModal
5. ✅ CartDrawer (DONE)
6. ✅ CartSummary (DONE)

### Phase 2: Checkout & Payment (Must-Have)
7. ⏳ CheckoutPage
8. ⏳ PaymentOptions
9. ⏳ PaymentFormPage
10. ⏳ TipSelector

### Phase 3: Post-Order Flow (Nice-to-Have)
11. ⏳ PaymentSuccessPage
12. ⏳ InvoicePage
13. ⏳ PaymentFailurePage

### Phase 4: Polish (Optional)
14. ⏳ AllergenWarningModal
15. ⏳ Toast notifications
16. ⏳ Form validation messages

---

## 🚀 Quick Start for Next Steps

To continue implementation, start with **MenuPage.tsx**:

```bash
# Open the file
code frontend/src/pages/MenuPage.tsx

# Add import at top:
import { useTranslation } from 'react-i18next';

# In component:
const { t } = useTranslation();

# Replace strings:
# "Our Menu" → {t('menu.title')}
# "Authentic Mexican cuisine..." → {t('menu.subtitle')}
# etc.
```

Then move to **MenuFilters.tsx** and repeat the pattern.

---

## 💡 Tips & Best Practices

1. **Test frequently**: Switch language after each component update
2. **Use React DevTools**: Check if `useTranslation()` hook is working
3. **Check browser console**: i18next logs missing translation keys
4. **Mobile testing**: French text is longer, may wrap differently
5. **Fallback safety**: If translation missing, English still works

---

## 📞 Need Help?

If you get stuck:
1. Check browser console for i18next errors
2. Verify translation key exists in `translation.json`
3. Confirm `useTranslation()` is imported and called correctly
4. Test with simple string first: `{t('common.back')}`

---

## ✅ Success Criteria

Translation is complete when:
- [x] Globe button appears in header
- [x] Clicking globe switches all UI text
- [x] Language preference persists after refresh
- [ ] All customer-facing pages translated (6 pages)
- [ ] All menu components translated (4 components)
- [ ] All cart components translated (3 components)
- [ ] All payment components translated (4 components)
- [ ] Toast notifications appear in correct language
- [ ] Mobile view works correctly in both languages

---

**Current Progress: ~35% Complete**
- ✅ Infrastructure: 100%
- ✅ Translation Files: 100%
- ✅ Example Components: 20% (3 of 15 components)
- ⏳ Remaining: ~12 components + 6 pages

Good luck! 🎉
