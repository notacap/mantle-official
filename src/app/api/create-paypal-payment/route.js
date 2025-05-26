import { NextResponse } from 'next/server';
import getPayPalClient from '@/lib/paypal-sdk';
// We might need to import specific request/response types if the SDK uses them explicitly
// e.g., import { OrderRequest } from '@paypal/paypal-server-sdk/lib/orders/types'; // Path is a guess

export async function POST(request) {
  try {
    const { orderId, amount, currency_code = 'USD' } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });
    }

    const { ordersController } = getPayPalClient();

    // Construct the order request payload for the new SDK structure
    const orderPayload = {
      intent: 'CAPTURE',
      purchaseUnits: [{
        amount: {
          currencyCode: currency_code,
          value: amount.toString(), // PayPal API expects string for value
        },
        invoiceId: orderId, // Link to WooCommerce order
      }],
      // application_context can be added for return_url, cancel_url etc. if needed for a server-side approval flow
      // but for client-side JS SDK, these are often handled client-side.
    };

    console.log("[API /create-paypal-payment] Attempting to create order with payload:", JSON.stringify(orderPayload, null, 2));

    // Use the correct SDK structure: ordersController.createOrder()
    const response = await ordersController.createOrder({
      body: orderPayload,
      prefer: 'return=representation'
    });
    
    console.log("[API /create-paypal-payment] PayPal create order API response status:", response.statusCode);
    console.log("[API /create-paypal-payment] PayPal create order API response body:", JSON.stringify(response.body, null, 2));

    // The new SDK returns response.statusCode and response.body
    if (response.statusCode !== 201 && response.statusCode !== 200) {
      console.error('PayPal API Error during order creation:', response.body);
      return NextResponse.json({ 
        error: 'Failed to create PayPal order.', 
        details: response.body 
      }, { status: response.statusCode });
    }

    // Parse response.body if it's a string
    let responseBody = response.body;
    if (typeof responseBody === 'string') {
      try {
        responseBody = JSON.parse(responseBody);
      } catch (parseError) {
        console.error('Failed to parse PayPal response body:', parseError);
        throw new Error("Failed to parse PayPal response");
      }
    }

    const paypalOrderId = responseBody?.id;
    if (!paypalOrderId) {
        console.error('PayPal Order ID not found in create order response:', responseBody);
        throw new Error("Failed to retrieve PayPal Order ID after creation.");
    }

    console.log("[API /create-paypal-payment] Successfully extracted PayPal Order ID:", paypalOrderId);
    return NextResponse.json({ paypalOrderId: paypalOrderId });

  } catch (error) {
    console.error('[API /create-paypal-payment] Error creating PayPal payment:', error);
    let errorDetails = error.message;
    if (error.response?.body) { // If the error object has response data (e.g. from PayPal SDK error)
        errorDetails = typeof error.response.body === 'string' ? error.response.body : JSON.stringify(error.response.body);
    }
    return NextResponse.json({ error: 'Internal Server Error creating PayPal payment', details: errorDetails }, { status: 500 });
  }
} 