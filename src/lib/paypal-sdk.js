import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';

// Function to get a configured PayPal client instance with OrdersController
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET_KEY;

  if (!clientId || !clientSecret) {
    console.error('PayPal Client ID or Secret not found in environment variables for server-side SDK.');
    throw new Error('PayPal API configuration is incomplete on the server.');
  }

  // Debug logging (remove in production)
  console.log("[PayPal SDK Debug] Client ID length:", clientId?.length);
  console.log("[PayPal SDK Debug] Client ID starts with:", clientId?.substring(0, 10) + "...");
  console.log("[PayPal SDK Debug] Secret length:", clientSecret?.length);
  console.log("[PayPal SDK Debug] Secret starts with:", clientSecret?.substring(0, 10) + "...");

  // Determine the environment using PAYPAL_ENVIRONMENT or fallback to NODE_ENV
  const paypalEnv = process.env.PAYPAL_ENVIRONMENT || process.env.NODE_ENV;
  const currentEnvironment = paypalEnv === 'production'
    ? Environment.Production
    : Environment.Sandbox;

  console.log("[PayPal SDK Debug] PAYPAL_ENVIRONMENT:", process.env.PAYPAL_ENVIRONMENT);
  console.log("[PayPal SDK Debug] NODE_ENV:", process.env.NODE_ENV);
  console.log("[PayPal SDK Debug] Using PayPal Environment:", currentEnvironment);

  // Create and return a new client instance with OrdersController
  try {
    const client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      environment: currentEnvironment,
    });
    
    // Create the OrdersController instance
    const ordersController = new OrdersController(client);
    
    console.log("[PayPal SDK] Client and OrdersController created successfully with environment:", currentEnvironment);
    
    // Return an object with both client and ordersController for compatibility
    return {
      client,
      ordersController
    };
  } catch (error) {
    console.error("Failed to create PayPal SDK Client:", error);
    throw error; // Re-throw the error to be caught by the calling API route
  }
}

export default getPayPalClient; 