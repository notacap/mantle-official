 1. Upload the Plugin to WordPress

  Via FTP (recommended):
  1. Connect to your WordPress server via FTP
  2. Navigate to: wp-content/plugins/
  3. Upload the entire `custom_plugins/mantle-bogo` folder
  4. Final path: wp-content/plugins/mantle-bogo/

  Or via WordPress Admin:
  1. Zip the `custom_plugins/mantle-bogo` folder
  2. Go to WordPress Admin > Plugins > Add New > Upload Plugin
  3. Upload the zip file

  2. Activate the Plugin

  1. Go to WordPress Admin > Plugins
  2. Find "Mantle BOGO Deals"
  3. Click "Activate"

  3. Verify Installation

  1. Go to WooCommerce > BOGO Deals (new menu item)
  2. Test the API: visit https://your-wordpress-url.com/wp-json/mantle/v1/active-deals

  4. Create Your Holiday Deals

  In WooCommerce > BOGO Deals > Add New Deal, create:

  | Deal                  | Dates                | Type          | Discount |
  |-----------------------|----------------------|---------------|----------|
  | Rain Gear BOGO        | Nov 23-29, 2025      | Same Category | 35%      |
  | Mod 1/2 Pants > Shirt | Nov 30 - Dec 6, 2025 | Cross Product | 30%      |
  | Mod 3 Pants > Top     | Dec 7-13, 2025       | Cross Product | 25%      |
  | Sitewide Holiday      | Dec 14-31, 2025      | Sitewide      | 20%      |

  5. Test the Integration

  # Test cart validation
  curl -X POST https://your-wordpress-url.com/wp-json/mantle/v1/validate-cart \
    -H "Content-Type: application/json" \
    -d '{"items":[{"product_id":123,"quantity":2}]}'

  # Test active deals
  curl https://your-wordpress-url.com/wp-json/mantle/v1/active-deals

  Troubleshooting

  If REST API returns 404:
  1. Go to WordPress Admin > Settings > Permalinks
  2. Click "Save Changes" (refreshes rewrite rules)

  If CORS errors occur, add to your WordPress wp-config.php:
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
