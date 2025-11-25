# Mantle BOGO Deals Plugin

Custom WordPress plugin for managing BOGO (Buy One Get One) deals for Mantle Clothing's headless Next.js ecommerce site.

## Features

- Admin dashboard for managing BOGO deals
- Same-category BOGO (Buy 1 Get 1 from same category)
- Cross-product deals (Buy from category A, get discount on category B)
- Sitewide percentage discounts
- Date-based scheduling (auto-enable/disable)
- REST API endpoints for Next.js frontend
- Real-time cart validation

## Installation

### Step 1: Upload Plugin via FTP

1. Download the `mantle-bogo` folder
2. Connect to your WordPress site via FTP
3. Navigate to `wp-content/plugins/`
4. Upload the entire `mantle-bogo` folder
5. Your structure should be: `wp-content/plugins/mantle-bogo/mantle-bogo.php`

### Step 2: Activate Plugin

1. Log into WordPress admin
2. Go to **Plugins** > **Installed Plugins**
3. Find "Mantle BOGO Deals"
4. Click **Activate**
5. The database table will be created automatically

### Step 3: Verify Installation

1. In WordPress admin, go to **WooCommerce** > **BOGO Deals**
2. You should see the deals management page
3. Test the REST API:
   ```bash
   curl https://your-wordpress-url.com/wp-json/mantle/v1/active-deals
   ```

## Usage Guide

### Adding Holiday Deals

Go to **WooCommerce > BOGO Deals > Add New Deal**

#### Deal 1: Rain Gear BOGO (Nov 23-29, 2025)

```
Deal Name: Rain Gear BOGO 35% Off
Deal Type: Same Category BOGO
Start Date: November 23, 2025 12:00 AM
End Date: November 29, 2025 11:59 PM
Buy Categories: [Select Rain Gear category]
Get Categories: [Leave empty - same as buy]
Buy Quantity: 1
Get Quantity: 1
Discount Percent: 35
Active: Checked
```

#### Deal 2: Mod 1/2 Pants > Shirt (Nov 30 - Dec 6, 2025)

```
Deal Name: Mod 1/2 Pants Get Shirt Discount
Deal Type: Cross Product Deal
Start Date: November 30, 2025 12:00 AM
End Date: December 6, 2025 11:59 PM
Buy Categories: [Select Mod 1 Pants, Mod 2 Pants]
Get Categories: [Select Mod 1 Shirts, Mod 2 Shirts]
Buy Quantity: 1
Get Quantity: 1
Discount Percent: 30
Active: Checked
```

#### Deal 3: Mod 3 Pants > Top (Dec 7-13, 2025)

```
Deal Name: Mod 3 Pants Get Top Discount
Deal Type: Cross Product Deal
Start Date: December 7, 2025 12:00 AM
End Date: December 13, 2025 11:59 PM
Buy Categories: [Select Mod 3 Pants]
Get Categories: [Select Mod 3 Tops]
Buy Quantity: 1
Get Quantity: 1
Discount Percent: 25
Active: Checked
```

#### Deal 4: Everything 20% Off (Dec 14-31, 2025)

```
Deal Name: Holiday Sale - 20% Off Everything
Deal Type: Sitewide Discount
Start Date: December 14, 2025 12:00 AM
End Date: December 31, 2025 11:59 PM
Discount Percent: 20
Active: Checked
```

## REST API Endpoints

### 1. Validate Cart

**Endpoint:** `POST /wp-json/mantle/v1/validate-cart`

**Request:**
```json
{
  "items": [
    {
      "product_id": 123,
      "quantity": 2
    },
    {
      "product_id": 456,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "valid": true,
    "deals_applied": [
      {
        "deal_id": 1,
        "deal_name": "Rain Gear BOGO 35% Off",
        "discount_amount": 24.50,
        "message": "Rain Gear BOGO 35% Off: Buy 1 Get 1 at 35% off"
      }
    ],
    "total_discount": 24.50,
    "messages": [
      "Rain Gear BOGO 35% Off: Buy 1 Get 1 at 35% off"
    ]
  },
  "cart_summary": {
    "subtotal": 100.00,
    "discount": 24.50,
    "total": 75.50
  }
}
```

### 2. Get Active Deals

**Endpoint:** `GET /wp-json/mantle/v1/active-deals`

**Response:**
```json
{
  "success": true,
  "deals": [
    {
      "id": 1,
      "name": "Rain Gear BOGO 35% Off",
      "type": "same_category",
      "discount_percent": 35,
      "start_date": "2025-11-23 00:00:00",
      "end_date": "2025-11-29 23:59:59",
      "description": "Buy 1 Get 1 at 35% off"
    }
  ]
}
```

## Next.js Integration

See `NEXTJS-INTEGRATION.md` for complete frontend implementation guide.

### Quick Example

```javascript
// In your cart component using the useBOGOValidation hook
import { useBOGOValidation } from '@/app/hooks/useBOGOValidation';

export default function CartSummary() {
  const { bogoDiscount, bogoMessages, isValidating } = useBOGOValidation();

  return (
    <div>
      {bogoMessages.length > 0 && (
        <div className="deals-applied">
          {bogoMessages.map((msg, idx) => (
            <p key={idx}>{msg}</p>
          ))}
        </div>
      )}
      {bogoDiscount > 0 && (
        <p>You save: ${bogoDiscount.toFixed(2)}</p>
      )}
    </div>
  );
}
```

## Troubleshooting

### Plugin Not Showing Up

- Check file permissions (should be 644 for files, 755 for folders)
- Verify plugin is in correct location: `wp-content/plugins/mantle-bogo/`
- Check PHP error logs

### Database Table Not Created

Deactivate and reactivate the plugin:
1. Go to Plugins
2. Deactivate "Mantle BOGO Deals"
3. Activate again

### Deals Not Applying

- Check deal date ranges
- Verify "Active" checkbox is checked
- Ensure products are properly categorized in WooCommerce
- Check if customer has required items in cart

### REST API Not Working

- Go to Settings > Permalinks
- Click "Save Changes" (this refreshes rewrite rules)
- Test endpoint again

### CORS Issues (for headless setup)

Add CORS headers to WordPress. In `wp-config.php` or via plugin:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

## File Structure

```
mantle-bogo/
├── mantle-bogo.php              # Main plugin file
├── README.md                    # This file
├── NEXTJS-INTEGRATION.md        # Frontend integration guide
├── QUICK-START.md               # Quick setup guide
├── includes/
│   ├── class-bogo-database.php  # Database handler
│   ├── class-bogo-engine.php    # Discount calculation logic
│   ├── class-bogo-admin.php     # WordPress admin interface
│   └── class-bogo-rest-api.php  # REST API endpoints
└── assets/
    └── admin.css                # Admin panel styles
```

## How It Works

1. **Admin creates deals** via WooCommerce > BOGO Deals
2. **Deals are stored** in custom database table `wp_mantle_bogo_deals`
3. **Frontend sends cart items** to `/wp-json/mantle/v1/validate-cart`
4. **Plugin calculates discounts** based on:
   - Active deals within date range
   - Product categories in cart
   - Deal type rules (same category, cross product, sitewide)
5. **Response includes** discount amount and messages for display
6. **Checkout applies discount** as a negative fee line on the order

## Deal Types Explained

### Same Category BOGO
Customer buys X items from a category, gets Y items from the SAME category discounted.
- Example: Buy 1 Rain Gear, get 1 Rain Gear 35% off

### Cross Product Deal
Customer buys from category A, gets discount on category B.
- Example: Buy Mod 1 Pants, get Mod 1 Shirt 30% off

### Sitewide Discount
Percentage off all products in the cart.
- Example: 20% off everything

## Changelog

### Version 1.0.0
- Initial release
- Same category BOGO support
- Cross product deals support
- Sitewide discounts
- Admin interface
- REST API endpoints
- Date-based scheduling
