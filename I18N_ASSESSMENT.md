# Backend Internationalization (i18n) Audit Report
## La Hacienda Restaurant QR Code Ordering System

**Assessment Date:** 2025-10-30
**Scope:** Backend (FastAPI) user-facing text identification for i18n implementation

---

## Executive Summary

The backend contains **extensive hardcoded English text** scattered across multiple layers:
- **Email templates** (2 HTML files with user-facing content)
- **API error/validation messages** (50+ HTTPException detail strings)
- **Success response messages** (15+ response "message" fields)
- **Service layer messages** (validation errors, status messages)
- **Email subjects and bodies** (payment and receipt emails)

**Current i18n Status:** NONE - No existing internationalization framework detected

**Estimated Scope:** 80-100 unique translatable strings across 5-6 major categories

---

## SECTION 1: EMAIL TEMPLATES & EMAIL CONTENT

### 1.1 Email Template Files (HTML)

**Location:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/templates/email/`

#### A. Payment Link Email Template
**File:** `payment_link.html`
**Lines of translatable content:** 10+ strings

User-facing strings requiring translation:
```
- "🌮 La Hacienda" (header title)
- "Mexican Restaurant" (subtitle)
- "Payment Required" (main heading)
- "Thank you for dining with us! Your share of the bill is ready for payment."
- "Order Number:" (label)
- "Your Amount:" (label)
- "Please click the button below to complete your payment securely:" (instruction)
- "Pay Now" (button text)
- "This payment link is unique to you. Please complete payment within 24 hours." (notice)
- "If you have any questions, please speak with our staff at the restaurant." (support message)
- "La Hacienda Mexican Restaurant" (footer title)
- "Authentic Mexican Cuisine" (subtitle)
- "This is an automated email. Please do not reply." (disclaimer)
```

#### B. Receipt Email Template
**File:** `receipt.html`
**Lines of translatable content:** 12+ strings

User-facing strings requiring translation:
```
- "🌮 La Hacienda" (header)
- "Mexican Restaurant" (subtitle)
- "Order Receipt" (page title)
- "Order Number:" (label)
- "Table:" (label)
- "Date:" (label)
- "Time:" (label)
- "Order Items" (section heading)
- "Item" (table header)
- "Qty" (table header)
- "Price" (table header)
- "Subtotal:" (label)
- "GST (5%):" (label) - NOTE: Tax rate hardcoded
- "Tip:" (label)
- "Total:" (label)
- "✨ Thank you for dining with us! ✨" (message)
- "Notes:" (label)
- "La Hacienda Mexican Restaurant" (footer)
- "Authentic Mexican Cuisine" (footer)
- "We hope you enjoyed your meal! Please visit us again soon." (closing message)
- "This is an automated email receipt for your records." (disclaimer)
```

### 1.2 Email Service Functions
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/services/email_service.py`

Hardcoded subjects in code:
```python
# Payment link email
subject=f"Payment Required - Order {order_number}"

# Receipt email
subject=f"Receipt - Order {order_data['order_number']}"
```

---

## SECTION 2: API ENDPOINT ERROR MESSAGES

### 2.1 Authentication Errors
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/utils/auth.py`

```
1. "Could not validate credentials" (4 instances)
2. "Invalid token format"
3. "Admin user not found"
4. "Admin account is inactive" (2 instances)
```

### 2.2 Admin Authentication Endpoint
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/admin_auth.py`

```
1. "Incorrect username or password"
2. "Only admin or manager can create new admin users"
3. "Username already registered"
4. "Email already registered"
5. "Successfully logged out" (success message)
```

### 2.3 Menu Management Errors
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/admin_menu.py`

```
1. "Menu item not found" (3 instances)
2. "Invalid category ID" (2 instances)
3. "All variant prices (small_glass, large_glass, bottle) are required when has_variants is true" (2 instances)
4. "Large glass price must be greater than small glass price" (2 instances)
5. "Bottle price must be greater than large glass price" (2 instances)
6. "File must be a CSV"
7. "File must be UTF-8 encoded"
8. CSV error messages:
   - "Row {row_num}: Missing name"
   - "Row {row_num}: Missing category_name"
   - "Row {row_num}: Missing price"
   - "Row {row_num}: Unknown category '{category_name}'"
   - "Row {row_num}: Invalid data - {error}"
   - "Row {row_num}: {error}"
9. "CSV parsing error: {error}"
10. "Upload failed: {error}"
11. CSV success message: "Processed {rows} rows: {created} created, {updated} updated, {skipped} skipped, {errors} errors"
```

### 2.4 Order Management Errors
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/orders.py`

```
1. "Order not found" (4 instances)
2. "Failed to generate PDF"
3. "Order status updated" (success message)
```

### 2.5 Admin Orders Endpoint
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/admin_orders.py`

```
1. "Order not found" (2 instances)
2. "Order status updated to {status}" (success message)
```

### 2.6 Payment-Related Errors
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/payment.py`

```
1. "Order not found" (5 instances)
2. "Order already paid"
3. "Payment split not found" (2 instances)
4. "Payment validation failed"
5. "Payment processed successfully (TEST MODE)" (test message)
6. "PayLink created successfully" (success message)
7. "Failed to create payment link: {error}"
8. "Payment split created successfully" (success message)
9. "Payment splits created" (success message)
10. "Payment verified successfully" (success message)
11. "Payment verification failed"
12. Test mode note: "Test mode: Order marked as paid immediately. In production, payment confirmation is async."
```

### 2.7 Promotions Endpoint
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/customer_promotions.py`

```
1. "Special not found" (3 instances)
2. "Offer not found" (3 instances)
3. "Must provide either offer_id or special_id"
```

### 2.8 Specials/Offers Management (Admin)
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/admin.py`

```
1. "Special not found" (4 instances)
2. "Failed to delete special"
3. "Special status updated" (success message)
4. "Offer not found" (4 instances)
5. "Offer status updated" (success message)
```

### 2.9 Menu Endpoint
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/menu.py`

```
1. "Category not found"
2. "Menu item not found"
```

### 2.10 Tables Endpoint
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/tables.py`

```
1. "Table not found" (3 instances)
2. "Table with this number already exists"
3. "Table deleted successfully" (success message)
```

### 2.11 Settings Endpoint
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/admin_settings.py`

```
1. "Business hours not found" (2 instances)
2. "Holiday not found" (2 instances)
3. "Table not found"
4. "Settings updated successfully" (success message)
5. "Business hours deleted successfully" (success message)
6. "Holiday deleted successfully" (success message)
7. "Payment gateway connection successful" (success message)
8. "Test email sent successfully" (success message)
```

### 2.12 Reports Endpoint
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/admin_reports.py`

```
1. "Invalid granularity. Use: day, week, month"
```

---

## SECTION 3: SERVICE LAYER VALIDATION MESSAGES

### 3.1 Order Service
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/services/order_service.py`

```
1. "Invalid table number" (ValueError)
2. "Menu item {id} not available" (ValueError)
3. "Order not found" (2 instances, ValueError)
```

### 3.2 Admin Order Service
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/services/admin_order_service.py`

```
1. "Invalid status: {new_status}" (ValueError)
```

### 3.3 CityPay Payment Services
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/services/citypay_paylink_service.py`

```
1. "Amount must be positive" (ValueError)
2. "Valid email required" (ValueError)
```

### 3.4 Settings Service
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/services/settings_service.py`

```
1. "Business hours not found" (HTTPException)
2. "Holiday not found" (HTTPException)
3. "Table not found" (HTTPException)
```

---

## SECTION 4: PYDANTIC SCHEMA VALIDATION

### 4.1 Order Schemas
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/schemas/order.py`

Pydantic validation error messages (auto-generated by Field validators):
```python
# Field constraints that generate automatic validation messages:
- OrderItemCreate.quantity: Field(ge=1, le=50) 
  -> "ensure this value is greater than or equal to 1"
  -> "ensure this value is less than or equal to 50"

- OrderItemCreate.special_notes: Field(None, max_length=500)
  -> "ensure this value has at most 500 characters"

- OrderCreate.items: Field(min_length=1)
  -> "ensure this value has at least 1 item"

- OrderCreate.customer_notes: Field(None, max_length=1000)
  -> "ensure this value has at most 1000 characters"

- SplitEqualRequest.people_count: Field(ge=2, le=10)
  -> "ensure this value is greater than or equal to 2"
  -> "ensure this value is less than or equal to 10"

- SplitEqualRequest.emails: Field(min_length=2, max_length=10)
  -> "ensure this value has at least 2 items"
  -> "ensure this value has at most 10 items"

- SplitEqualRequest.tip_percentage: Field(default=0, ge=0, le=100)
  -> "ensure this value is greater than or equal to 0"
  -> "ensure this value is less than or equal to 100"

- SplitEqualRequest custom validator:
  "Must provide exactly {people_count} email addresses"

- SplitByItemsRequest custom validator:
  "At least one split is required"
```

### 4.2 Admin Schemas
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/schemas/admin.py`

EmailStr field automatically validates and generates:
- "invalid email format"

---

## SECTION 5: DATABASE & DYNAMIC ENUM VALUES

### 5.1 Order Status Values
These are system statuses (not user-facing in UI, but part of responses):
```
- "cart"
- "pending_payment"
- "paid"
- "preparing"
- "completed"
- "cancelled"
```

### 5.2 Payment Status Values
```
- "pending"
- "processing"
- "completed"
- "failed"
```

### 5.3 Restaurant Constants
```
- "La Hacienda" (restaurant name, appears in emails and UI)
- "Mexican Restaurant" (subtitle)
- "Authentic Mexican Cuisine" (description)
```

---

## SECTION 6: CONFIGURATION & ENVIRONMENT VALUES

### 6.1 Hard-coded Strings in Config
**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/config.py`

These may be environment variables but often have defaults:
- MAIL_FROM_NAME (used in email sending)
- Restaurant name and details

---

## SECTION 7: CSV UPLOAD TEMPLATE

**File:** `/Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode/backend/app/api/v1/admin_menu.py`

CSV template download includes header descriptions:
```
CSV format documentation and example rows with:
- Column names: name, category_name, description, price, etc.
- Example data: "Chicken Quesadilla,Starters,Grilled chicken with melted cheese,8.95..."
```

---

## DETAILED BREAKDOWN BY CATEGORY

### By Volume:
1. **Error/Detail Messages (detail= parameters):** ~45 strings
2. **Success/Response Messages (message= keys):** ~15 strings
3. **Email Template Content:** ~25-30 strings
4. **Validation Messages (schemas):** ~15-20 strings
5. **Service Layer Validation:** ~8 strings
6. **Configuration/Labels:** ~5-10 strings

**TOTAL UNIQUE TRANSLATABLE STRINGS: ~100-110**

### By Frequency:
- **Most Common:** "not found" pattern (~10 variations)
- **Payment-related:** ~12 unique messages
- **Menu/Item management:** ~12 unique messages
- **Admin/Auth:** ~10 unique messages
- **Settings/Config:** ~8 unique messages

---

## SECTION 8: EXISTING i18n SETUP

### Current Status: **NONE**

Search results show:
- No `i18n`, `i18next`, `gettext`, `babel`, `translation`, or `locale` modules imported
- No translation files or dictionaries
- No language parameter handling in APIs
- No Accept-Language header processing

---

## SECTION 9: IMPLEMENTATION COMPLEXITY ASSESSMENT

### Low Complexity (Easy to Extract):
- Email template text (already in HTML files, can use Jinja2 i18n extensions)
- API error/detail messages (centralized in HTTPException calls)
- Success response messages (consistent pattern)

### Medium Complexity (Requires Code Changes):
- Pydantic validation messages (need custom error handlers or message overrides)
- Database enum status values (may need language parameter in responses)
- CSV template and parsing messages (need dynamic generation)

### High Complexity (Architecture Changes):
- Email subject lines (dynamically formatted with order numbers)
- Determining user language preference (Accept-Language header, user profile, etc.)
- Handling pluralization and context-dependent messages
- Managing translation file updates with CI/CD

---

## SECTION 10: RECOMMENDED IMPLEMENTATION APPROACH

### Phase 1: Foundation (Weeks 1-2)
1. Choose i18n framework: **Python `babel` + `gettext`** (standard) OR **`fluent` (Mozilla)**
2. Create translation infrastructure:
   - Language detection middleware (Accept-Language header)
   - Translation loader/provider
   - Per-request language context
3. Extract all strings identified in this report

### Phase 2: Core Implementation (Weeks 2-4)
1. Implement i18n in priority order:
   - Email templates (Jinja2 i18n support)
   - API error/success messages
   - Authentication messages
2. Create translation files for: English (en), Spanish (es), French (fr) as initial supported languages
3. Add language parameter to API responses (optional but recommended)

### Phase 3: Advanced Features (Weeks 4-6)
1. Custom Pydantic error messages
2. Database enum localization
3. Email subject line translation
4. CSV template localization
5. Admin interface for translation management (optional)

### Phase 4: Testing & Deployment (Weeks 6-8)
1. Comprehensive testing with multiple languages
2. Update documentation
3. Deploy with fallback to English

---

## FILE MAPPING FOR i18n EXTRACTION

```
PRIORITY 1 - CRITICAL:
├── backend/app/templates/email/payment_link.html (12+ strings)
├── backend/app/templates/email/receipt.html (14+ strings)
├── backend/app/services/email_service.py (2 subject lines)
└── backend/app/api/v1/admin_auth.py (5 messages)

PRIORITY 2 - HIGH:
├── backend/app/api/v1/payment.py (12 messages)
├── backend/app/api/v1/admin_menu.py (15+ messages)
├── backend/app/api/v1/orders.py (4 messages)
├── backend/app/utils/auth.py (5 messages)
└── backend/app/api/v1/admin_orders.py (3 messages)

PRIORITY 3 - MEDIUM:
├── backend/app/api/v1/admin_settings.py (8 messages)
├── backend/app/api/v1/admin.py (8 messages)
├── backend/app/schemas/order.py (6 custom validation messages)
└── backend/app/services/order_service.py (3 messages)

PRIORITY 4 - LOW:
├── backend/app/api/v1/tables.py (3 messages)
├── backend/app/api/v1/customer_promotions.py (3 messages)
├── backend/app/api/v1/menu.py (2 messages)
├── backend/app/api/v1/admin_reports.py (1 message)
└── backend/app/services/*.py (various validation messages)
```

---

## KEY FINDINGS

1. **Scope:** ~100-110 unique translatable strings
2. **No existing i18n:** Current code is 100% English with hardcoded strings
3. **Well-organized:** Error messages follow consistent patterns (detail= parameter)
4. **Email-heavy:** 25-30 strings in email templates alone
5. **Multi-layer:** Strings scattered across:
   - API routes (50+ messages)
   - Services (10+ messages)
   - Schemas (15+ messages)
   - Email templates (25+ strings)
6. **Database-dependent:** Some values (status enums) come from database but are displayed to users

---

## RECOMMENDATIONS FOR i18n SUCCESS

1. **Use Babel + gettext:** Industry standard for Python, easy integration with Jinja2
2. **Middleware approach:** Inject language into request context via Accept-Language header
3. **Fallback strategy:** Default to English if language not found
4. **Translation workflow:** Use .po/.pot files, manage with tools like Crowdin or Lokalise
5. **Email templates:** Separate translatable strings in HTML with Jinja2 i18n tags
6. **API responses:** Consider adding `lang` parameter to responses (optional)
7. **Database:** Wrap status/enum values in translation function for UI display
8. **Testing:** Create test cases for each supported language

---

## ESTIMATED EFFORT

- **Identification:** Complete (this report)
- **Implementation:** 120-160 hours (6-8 developer-weeks)
- **Translation:** 40-60 hours per language (external translators recommended)
- **Testing:** 40-60 hours
- **Documentation:** 20-30 hours

**Total Project Scope:** 220-310 hours + external translation costs

---

## DELIVERABLES CHECKLIST

- [ ] Translation framework setup (Babel + gettext)
- [ ] Language detection middleware
- [ ] Message extraction from all identified locations
- [ ] Email template i18n implementation
- [ ] API error message translation
- [ ] Pydantic validation error customization
- [ ] Translation files (.po/.pot) for each language
- [ ] Crowdin/Lokalise integration (optional)
- [ ] Language-specific testing
- [ ] Documentation update
- [ ] Deployment with fallback

