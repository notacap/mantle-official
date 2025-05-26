# PayPal Integration Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# WordPress/WooCommerce Configuration
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# PayPal Configuration
# Client-side PayPal Client ID (for PayPal JavaScript SDK)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here

# Server-side PayPal credentials (for PayPal Server SDK)
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_SECRET_KEY=your_paypal_client_secret_here

# Other Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## PayPal Setup Steps

1. **Get PayPal Credentials:**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Create a new app or use an existing one
   - Copy the Client ID and Client Secret
   - For testing, use Sandbox credentials

2. **Configure Environment Variables:**
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: Your PayPal Client ID (used by the frontend PayPal JavaScript SDK)
   - `PAYPAL_CLIENT_ID`: Same PayPal Client ID (used by the backend PayPal Server SDK)
   - `PAYPAL_SECRET_KEY`: Your PayPal Client Secret (used by the backend PayPal Server SDK)

3. **WooCommerce PayPal Standard Setup:**
   - In your WordPress admin, go to WooCommerce > Settings > Payments
   - Enable "PayPal Standard" payment method
   - Configure it with your PayPal account email

## Updated Code Changes

The following files have been updated to work with PayPal Server SDK v1.0.0:

- `src/lib/paypal-sdk.js` - Updated to use OrdersController class
- `src/app/api/create-paypal-payment/route.js` - Updated to use `ordersController.createOrder()`
- `src/app/api/capture-paypal-payment/route.js` - Updated to use `ordersController.captureOrder()`

## Key Changes Made

1. **SDK Structure Update:**
   - Import `OrdersController` separately from the PayPal SDK
   - Create OrdersController instance: `new OrdersController(client)`
   - Use `ordersController.createOrder()` instead of `paypalClient.ordersController.ordersCreate()`
   - Use `ordersController.captureOrder()` instead of `paypalClient.ordersController.ordersCapture()`

2. **Request/Response Structure:**
   - Updated payload structure to use camelCase (e.g., `purchaseUnits` instead of `purchase_units`)
   - Updated response handling to use `response.body` instead of `response.data`
   - Updated status code handling to use `response.statusCode` instead of `response.status`

3. **Error Handling:**
   - Updated error response structure to match new SDK format

## Testing

1. **Set Environment Variables:** Create a `.env.local` file with your PayPal credentials
2. **Test SDK Structure:** Run `node test-paypal.js` to verify the SDK is working
3. **Restart Development Server:** `npm run dev`
4. **Try PayPal Payment:** Test the PayPal payment flow on your checkout page

## Troubleshooting

If you still get errors:

1. **Check Environment Variables:** Make sure all PayPal environment variables are set correctly in `.env.local`
2. **Check PayPal Dashboard:** Ensure your app is configured correctly in PayPal Developer Dashboard
3. **Check Console Logs:** Look for detailed error messages in both browser and server console
4. **Verify SDK Version:** Ensure you're using `@paypal/paypal-server-sdk@1.0.0`
5. **Run Test Script:** Use `node test-paypal.js` to verify SDK structure

## Dependencies

Make sure you have the correct PayPal dependencies installed:

```json
{
  "@paypal/paypal-server-sdk": "^1.0.0",
  "@paypal/react-paypal-js": "^8.8.3"
}
```

## Important Notes

- The PayPal Server SDK v1.0.0 has a completely different structure than previous versions
- You must import `OrdersController` separately and instantiate it with the client
- Method names are `createOrder` and `captureOrder` (not `ordersCreate` and `ordersCapture`)
- Make sure both `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_ID` are set to the same value 