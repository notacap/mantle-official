import { NextResponse } from 'next/server';
import getPayPalClient from '@/lib/paypal-sdk';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize WooCommerce API client
const getWooCommerceApi = () => {
  const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!siteUrl || !consumerKey || !consumerSecret) {
    console.error('WooCommerce API credentials or URL are not set in environment variables.');
    throw new Error('WooCommerce API configuration is incomplete.');
  }

  return new WooCommerceRestApi({
    url: siteUrl,
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    version: 'wc/v3'
  });
};

export async function POST(request) {
  try {
    const { paypalOrderID } = await request.json();

    if (!paypalOrderID) {
      return NextResponse.json({ error: 'Missing PayPal Order ID' }, { status: 400 });
    }

    const { ordersController } = getPayPalClient();

    // Capture PayPal Payment using the correct SDK structure
    const captureResponse = await ordersController.captureOrder({
      id: paypalOrderID,
      prefer: 'return=representation',
      body: {} // Empty body for capture
    });

    if (captureResponse.statusCode !== 201 && captureResponse.statusCode !== 200) {
      console.error('PayPal Capture Error:', captureResponse.body);
      return NextResponse.json({ 
        error: 'Failed to capture PayPal payment.', 
        details: captureResponse.body 
      }, { status: captureResponse.statusCode });
    }

    // Parse response.body if it's a string
    let captureResponseBody = captureResponse.body;
    if (typeof captureResponseBody === 'string') {
      try {
        captureResponseBody = JSON.parse(captureResponseBody);
      } catch (parseError) {
        console.error('Failed to parse PayPal capture response body:', parseError);
        throw new Error("Failed to parse PayPal capture response");
      }
    }

    // Extract WooCommerce Order ID (invoice_id) from PayPal order details
    const wooCommerceOrderId = captureResponseBody?.purchaseUnits?.[0]?.invoiceId || captureResponseBody?.purchase_units?.[0]?.invoice_id;

    if (!wooCommerceOrderId) {
      console.error('WooCommerce Order ID (invoiceId) not found in PayPal capture response.', captureResponseBody);
      return NextResponse.json({ 
        error: 'Payment captured but failed to retrieve WooCommerce Order ID from PayPal for automatic update.',
        paypalTransactionId: captureResponseBody?.id 
      }, { status: 500 });
    }

    // Update WooCommerce Order Status
    const wooApi = getWooCommerceApi();
    const orderUpdateData = {
      status: 'processing',
      transaction_id: captureResponseBody?.id, // Store PayPal transaction ID
    };

    const wooResponse = await wooApi.put(`orders/${wooCommerceOrderId}`, orderUpdateData);

    if (wooResponse.status !== 200) {
      console.error('WooCommerce Order Update Error:', wooResponse.data);
      return NextResponse.json({
        message: 'PayPal payment captured successfully, but failed to update WooCommerce order status.',
        paypalTransactionId: captureResponseBody.id,
        wooCommerceOrderId: wooCommerceOrderId,
        wooError: wooResponse.data
      }, { status: 207 }); 
    }

    return NextResponse.json({
      message: 'Payment successful and WooCommerce order updated.',
      paypalTransactionId: captureResponseBody.id,
      wooCommerceOrderId: wooCommerceOrderId,
      newStatus: wooResponse.data.status
    });

  } catch (error) {
    console.error('[API /capture-paypal-payment] Error capturing PayPal payment or updating WooCommerce:', error);
    let errorDetails = error.message;
    if (error.response?.body) {
        errorDetails = typeof error.response.body === 'string' ? error.response.body : JSON.stringify(error.response.body);
    }
    return NextResponse.json({ error: 'Internal Server Error capturing PayPal payment', details: errorDetails }, { status: 500 });
  }
} 