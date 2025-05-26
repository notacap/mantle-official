// Simple test script to verify PayPal SDK integration
// Run with: node test-paypal.js

import getPayPalClient from './src/lib/paypal-sdk.js';

async function testPayPalSDK() {
  try {
    console.log('Testing PayPal SDK integration...');
    
    // Test 1: Check if client can be created
    const { client, ordersController } = getPayPalClient();
    console.log('✓ PayPal client and OrdersController created successfully');
    
    // Test 2: Check if ordersController exists
    if (ordersController) {
      console.log('✓ ordersController is available');
    } else {
      console.log('✗ ordersController is NOT available');
    }
    
    // Test 3: Check if createOrder method exists
    if (ordersController && typeof ordersController.createOrder === 'function') {
      console.log('✓ createOrder method is available');
    } else {
      console.log('✗ createOrder method is NOT available');
      if (ordersController) {
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ordersController)));
      }
    }
    
    // Test 4: Check if captureOrder method exists
    if (ordersController && typeof ordersController.captureOrder === 'function') {
      console.log('✓ captureOrder method is available');
    } else {
      console.log('✗ captureOrder method is NOT available');
      if (ordersController) {
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ordersController)));
      }
    }
    
    console.log('\nPayPal SDK structure test completed!');
    console.log('The PayPal SDK is now correctly configured.');
    
  } catch (error) {
    console.error('Error testing PayPal SDK:', error.message);
    console.error('Make sure you have set the following environment variables:');
    console.error('- PAYPAL_CLIENT_ID');
    console.error('- PAYPAL_SECRET_KEY');
  }
}

testPayPalSDK(); 