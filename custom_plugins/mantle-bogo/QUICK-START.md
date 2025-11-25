# Quick Start Guide

## Step 1: Upload Plugin

### Via FTP:
1. Download the `mantle-bogo` folder
2. Connect to your WordPress via FTP
3. Upload to: `wp-content/plugins/mantle-bogo/`
4. Done!

### Via WordPress Admin (Alternative):
1. Zip the `mantle-bogo` folder
2. Go to WordPress admin > Plugins > Add New > Upload Plugin
3. Upload the zip file
4. Activate

## Step 2: Activate & Test

1. Go to **Plugins** > Find "Mantle BOGO Deals" > Click **Activate**
2. Go to **WooCommerce** > **BOGO Deals** (new menu item)
3. You should see empty deals list
4. Test API: Open this in browser:
   ```
   https://your-wordpress-url.com/wp-json/mantle/v1/active-deals
   ```
   You should see: `{"success":true,"deals":[]}`

## Step 3: Add Your Holiday Deals

Click "Add New Deal" and add these 4 deals:

### Deal 1: Rain Gear BOGO (Nov 23-29, 2025)
- Deal Name: `Rain Gear BOGO 35% Off`
- Deal Type: `Same Category BOGO`
- Start: `2025-11-23 00:00`
- End: `2025-11-29 23:59`
- Buy Categories: Select "Rain Gear"
- Buy Quantity: `1`
- Get Quantity: `1`
- Discount: `35`%
- Active: Checked

### Deal 2: Mod 1/2 Pants > Shirt (Nov 30 - Dec 6, 2025)
- Deal Name: `Mod 1/2 Pants Get Shirt Discount`
- Deal Type: `Cross Product Deal`
- Start: `2025-11-30 00:00`
- End: `2025-12-06 23:59`
- Buy Categories: Select "Mod 1 Pants" + "Mod 2 Pants"
- Get Categories: Select "Mod 1 Shirts" + "Mod 2 Shirts"
- Buy Quantity: `1`
- Get Quantity: `1`
- Discount: `30`%
- Active: Checked

### Deal 3: Mod 3 Pants > Top (Dec 7-13, 2025)
- Deal Name: `Mod 3 Pants Get Top Discount`
- Deal Type: `Cross Product Deal`
- Start: `2025-12-07 00:00`
- End: `2025-12-13 23:59`
- Buy Categories: Select "Mod 3 Pants"
- Get Categories: Select "Mod 3 Tops"
- Buy Quantity: `1`
- Get Quantity: `1`
- Discount: `25`%
- Active: Checked

### Deal 4: Everything 20% Off (Dec 14-31, 2025)
- Deal Name: `Holiday Sale - 20% Off Everything`
- Deal Type: `Sitewide Discount`
- Start: `2025-12-14 00:00`
- End: `2025-12-31 23:59`
- Discount: `20`%
- Active: Checked

## Step 4: Next.js Integration

See `NEXTJS-INTEGRATION.md` for complete code examples.

### Quick version:

1. **Create hook** (`src/app/hooks/useBOGOValidation.js`) - copy from integration guide
2. **Update cart component** - add discount display using the hook
3. **Update checkout** - include discount as fee_line in order
4. **Test with cart items** - verify discounts apply

### Test URLs:
```bash
# Validate a cart
curl -X POST https://your-wordpress-url.com/wp-json/mantle/v1/validate-cart \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":123,"quantity":2}]}'

# Get active deals
curl https://your-wordpress-url.com/wp-json/mantle/v1/active-deals
```

## Troubleshooting

### "Plugin doesn't show up"
- Check folder is exactly: `wp-content/plugins/mantle-bogo/`
- Main file should be: `wp-content/plugins/mantle-bogo/mantle-bogo.php`

### "BOGO Deals menu not appearing"
- Deactivate and reactivate plugin
- Clear WordPress cache
- Check user has `manage_woocommerce` capability

### "REST API returns 404"
- Go to Settings > Permalinks
- Click "Save Changes" (refreshes rewrite rules)
- Try API again

### "Deals not applying"
- Check product is in correct WooCommerce category
- Verify deal dates are correct (2025!)
- Ensure deal is marked as "Active"
- Check quantities meet requirements

## What the Admin Interface Looks Like

Your client logs into WordPress admin and sees:

```
WooCommerce
  > Orders
  > Products
  > BOGO Deals  <-- New menu item
```

They can:
- Add new deals with simple form
- Edit existing deals
- Activate/deactivate deals
- Delete old deals
- See all deals in list view

No coding required!

## Files Included

```
mantle-bogo/
├── mantle-bogo.php              # Main plugin file
├── README.md                    # Full documentation
├── NEXTJS-INTEGRATION.md        # Frontend integration guide
├── QUICK-START.md               # This file
├── includes/
│   ├── class-bogo-database.php  # Database handler
│   ├── class-bogo-engine.php    # Discount calculation
│   ├── class-bogo-admin.php     # Admin interface
│   └── class-bogo-rest-api.php  # REST API endpoints
└── assets/
    └── admin.css                # Admin styles
```

## Need Help?

- Check README.md for detailed docs
- Check NEXTJS-INTEGRATION.md for frontend code examples
- Test API endpoints with curl commands above
