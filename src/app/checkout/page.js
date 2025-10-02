'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './checkout.css';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CheckoutCartSummary from '../components/CheckoutCartSummary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// START PAYPAL IMPORTS
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// END PAYPAL IMPORTS

// Make sure to set this in your .env.local file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function AddressForm({ type, formData, handleChange, countries = [] }) {
  const prefix = type === 'shipping' ? 'shipping_address' : 'billing_address'; // Match API structure

  // Find the selected country to get its states
  const selectedCountryCode = formData?.[prefix]?.country || '';
  const selectedCountry = countries.find(c => c.code === selectedCountryCode);
  const availableStates = selectedCountry?.states || [];
  const hasStates = availableStates.length > 0;

  // Determine postal code label based on country
  const postalCodeLabel = selectedCountryCode === 'US' ? 'ZIP Code' : 'Postal Code';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}.first_name`} className="block text-sm font-medium leading-6 text-gray-900">First name <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}.first_name`} id={`${prefix}.first_name`} value={formData?.[prefix]?.first_name || ''} onChange={handleChange} autoComplete="given-name" required className="checkout-input" />
        </div>
        <div>
          <label htmlFor={`${prefix}.last_name`} className="block text-sm font-medium leading-6 text-gray-900">Last name <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}.last_name`} id={`${prefix}.last_name`} value={formData?.[prefix]?.last_name || ''} onChange={handleChange} autoComplete="family-name" required className="checkout-input" />
        </div>
      </div>

      <div>
        <label htmlFor={`${prefix}.company`} className="block text-sm font-medium leading-6 text-gray-900">Company (optional)</label>
        <input type="text" name={`${prefix}.company`} id={`${prefix}.company`} value={formData?.[prefix]?.company || ''} onChange={handleChange} autoComplete="organization" className="checkout-input" />
      </div>

      <div>
        <label htmlFor={`${prefix}.country`} className="block text-sm font-medium leading-6 text-gray-900">Country / Region <span className="text-red-600">*</span></label>
        <select id={`${prefix}.country`} name={`${prefix}.country`} value={selectedCountryCode} onChange={handleChange} autoComplete="country-name" required className="checkout-input">
          <option value="">Select a country...</option>
          {countries.map(country => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${prefix}.address_1`} className="block text-sm font-medium leading-6 text-gray-900">Street address <span className="text-red-600">*</span></label>
        <input type="text" name={`${prefix}.address_1`} id={`${prefix}.address_1`} value={formData?.[prefix]?.address_1 || ''} onChange={handleChange} placeholder="House number and street name" autoComplete="address-line1" required className="checkout-input" />
      </div>
      <div>
        <input type="text" name={`${prefix}.address_2`} id={`${prefix}.address_2`} value={formData?.[prefix]?.address_2 || ''} onChange={handleChange} placeholder="Apartment, suite, unit, etc. (optional)" autoComplete="address-line2" className="checkout-input mt-2" />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}.city`} className="block text-sm font-medium leading-6 text-gray-900">Town / City <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}.city`} id={`${prefix}.city`} value={formData?.[prefix]?.city || ''} onChange={handleChange} autoComplete="address-level2" required className="checkout-input" />
        </div>
        <div>
          <label htmlFor={`${prefix}.state`} className="block text-sm font-medium leading-6 text-gray-900">
            State / Province {hasStates && <span className="text-red-600">*</span>}
          </label>
          {hasStates ? (
            <select
              id={`${prefix}.state`}
              name={`${prefix}.state`}
              value={formData?.[prefix]?.state || ''}
              onChange={handleChange}
              autoComplete="address-level1"
              required={hasStates}
              className="checkout-input"
            >
              <option value="">Select a state/province...</option>
              {availableStates.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id={`${prefix}.state`}
              name={`${prefix}.state`}
              value={formData?.[prefix]?.state || ''}
              onChange={handleChange}
              placeholder="State / Province / Region"
              autoComplete="address-level1"
              className="checkout-input"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}.postcode`} className="block text-sm font-medium leading-6 text-gray-900">{postalCodeLabel} <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}.postcode`} id={`${prefix}.postcode`} value={formData?.[prefix]?.postcode || ''} onChange={handleChange} autoComplete="postal-code" required className="checkout-input" />
        </div>
        <div>
          <label htmlFor={`${prefix}.phone`} className="block text-sm font-medium leading-6 text-gray-900">Phone <span className="text-red-600">*</span></label>
          <input type="tel" name={`${prefix}.phone`} id={`${prefix}.phone`} value={formData?.[prefix]?.phone || ''} onChange={handleChange} autoComplete="tel" required className="checkout-input" />
        </div>
      </div>
      {type === 'billing' && (
        <div>
          <label htmlFor="billing_address.email" className="block text-sm font-medium leading-6 text-gray-900">Email address <span className="text-red-600">*</span></label>
          <input type="email" name="billing_address.email" id="billing_address.email" value={formData?.billing_address?.email || ''} onChange={handleChange} autoComplete="email" required className="checkout-input" />
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const { cart, callCartApi, isLoading: isCartLoading, error: cartError, fetchCartAndNonce } = useCart();
  const [formData, setFormData] = useState({
    billing_address: { country: '' },
    shipping_address: { country: '' },
    payment_method: '', // For selected payment method
    order_notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [isPaymentDeclineError, setIsPaymentDeclineError] = useState(false);
  const [countries, setCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [addressValidationError, setAddressValidationError] = useState(null);
  const isInitialMount = useRef(true);

  // START PAYPAL STATE
  const [createdWooOrder, setCreatedWooOrder] = useState(null);
  // END PAYPAL STATE

  const handleModalClose = () => {
    setIsPaymentDeclineError(false);
    setSubmissionError(null);
  };

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch('/api/countries');
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        const data = await response.json();
        setCountries(data);

        // Set default country to US if available
        const usCountry = data.find(c => c.code === 'US');
        if (usCountry) {
          setFormData(prev => ({
            ...prev,
            billing_address: { ...prev.billing_address, country: 'US' },
            shipping_address: { ...prev.shipping_address, country: 'US' }
          }));
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Set fallback to US only
        setCountries([{
          code: 'US',
          name: 'United States (US)',
          states: []
        }]);
        setFormData(prev => ({
          ...prev,
          billing_address: { ...prev.billing_address, country: 'US' },
          shipping_address: { ...prev.shipping_address, country: 'US' }
        }));
      } finally {
        setIsLoadingCountries(false);
      }
    }

    fetchCountries();
  }, []);

  // Update cart when billing/shipping address changes (for shipping rate recalculation)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if countries haven't loaded yet
    if (isLoadingCountries) {
      return;
    }

    // Skip if cart is still loading (nonce not ready)
    if (isCartLoading) {
      return;
    }

    // Skip initial render when form is empty
    const billingCountry = formData?.billing_address?.country;
    const shippingCountry = formData?.shipping_address?.country;

    if (!billingCountry && !shippingCountry) {
      return;
    }

    // Debounce cart updates to avoid excessive API calls
    const timeoutId = setTimeout(async () => {
      // Clear previous address validation errors
      setAddressValidationError(null);

      try {
        const updatePayload = {};

        // Helper function to get a valid dummy postcode and state for a country
        const getDummyPostcode = (countryCode) => {
          const dummyPostcodes = {
            'US': '10001',      // New York, NY
            'CA': 'M5H 2N2',    // Toronto, ON
            'MX': '01000',      // Mexico City
            'GU': '96910',      // Guam
            'PR': '00901',      // Puerto Rico
            'GB': 'SW1A 1AA',   // London, UK
            'AU': '2000',       // Sydney, Australia
            'DE': '10115',      // Berlin, Germany
            'FR': '75001',      // Paris, France
            'IT': '00100',      // Rome, Italy
            'ES': '28001',      // Madrid, Spain
            'NL': '1011',       // Amsterdam, Netherlands
            'BE': '1000',       // Brussels, Belgium
            'CH': '8001',       // Zurich, Switzerland
            'AT': '1010',       // Vienna, Austria
            'SE': '111 20',     // Stockholm, Sweden
            'NO': '0010',       // Oslo, Norway
            'DK': '1050',       // Copenhagen, Denmark
            'FI': '00100',      // Helsinki, Finland
          };
          return dummyPostcodes[countryCode] || '00000';
        };

        // Helper function to get a valid dummy state for countries that have states
        const getDummyState = (countryCode) => {
          const dummyStates = {
            'US': 'NY',    // New York
            'CA': 'ON',    // Ontario
            'AU': 'NSW',   // New South Wales
            'MX': 'DF',    // Mexico City (Distrito Federal)
          };
          return dummyStates[countryCode] || '';
        };

        // Add billing address if country is set
        if (billingCountry) {
          const billingPostcode = formData.billing_address.postcode || getDummyPostcode(billingCountry);
          const billingState = formData.billing_address.state || getDummyState(billingCountry);
          updatePayload.billing_address = {
            country: billingCountry,
            ...(billingState && { state: billingState }),
            ...(formData.billing_address.city && { city: formData.billing_address.city }),
            postcode: billingPostcode
          };
        }

        // Add shipping address if country is set
        if (shipToDifferentAddress && shippingCountry) {
          const shippingPostcode = formData.shipping_address.postcode || getDummyPostcode(shippingCountry);
          const shippingState = formData.shipping_address.state || getDummyState(shippingCountry);
          updatePayload.shipping_address = {
            country: shippingCountry,
            ...(shippingState && { state: shippingState }),
            ...(formData.shipping_address.city && { city: formData.shipping_address.city }),
            postcode: shippingPostcode
          };
        } else if (!shipToDifferentAddress && billingCountry) {
          // Use billing address as shipping address if not shipping to different address
          updatePayload.shipping_address = updatePayload.billing_address;
        }

        // Only call API if we have something to update
        if (Object.keys(updatePayload).length > 0) {
          await callCartApi('/wp-json/wc/store/v1/cart/update-customer', 'POST', updatePayload);
        }
      } catch (error) {
        console.error('Error updating customer for shipping calculation:', error);

        // Parse and display validation errors to the user
        if (error.message && (error.message.includes('invalid_postcode') ||
            error.message.includes('invalid_state') ||
            error.message.includes('postcode') ||
            error.message.includes('ZIP'))) {
          setAddressValidationError('Please check that your address details (state/province and postal code) match the selected country.');
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData?.billing_address?.country,
    formData?.billing_address?.state,
    formData?.billing_address?.city,
    formData?.billing_address?.postcode,
    formData?.shipping_address?.country,
    formData?.shipping_address?.state,
    formData?.shipping_address?.city,
    formData?.shipping_address?.postcode,
    shipToDifferentAddress,
    isLoadingCountries,
    isCartLoading
    // callCartApi is intentionally excluded to avoid infinite loops
  ]);

  useEffect(() => {
    // console.log("[CheckoutPage] Cart data received:", cart);
    if (cart && Array.isArray(cart.payment_methods) && cart.payment_methods.length > 0) {
      // console.log("[CheckoutPage] Detected payment methods directly from cart.payment_methods:", cart.payment_methods);
      setAvailablePaymentMethods(cart.payment_methods);
      if (!formData.payment_method) {
        setFormData(prev => ({ ...prev, payment_method: cart.payment_methods[0].name }));
      }
    } else if (cart && cart.payment_requirements && Array.isArray(cart.payment_requirements.payment_methods)) {
      // console.log("[CheckoutPage] Detected payment methods from cart.payment_requirements.payment_methods:", cart.payment_requirements.payment_methods);
      setAvailablePaymentMethods(cart.payment_requirements.payment_methods);
      if (!formData.payment_method && cart.payment_requirements.payment_methods.length > 0) {
        setFormData(prev => ({ ...prev, payment_method: cart.payment_requirements.payment_methods[0].name }));
      }
    } else {
      // console.log("[CheckoutPage] No payment methods found in expected locations (cart.payment_methods or cart.payment_requirements.payment_methods) or cart structure is unexpected.");
      setAvailablePaymentMethods([]);
    }
  }, [cart, formData.payment_method]);

  const handlePaymentMethodChange = (e) => {
    setSubmissionError(null); // Clear previous errors when changing payment method
    setFormData(prev => ({ ...prev, payment_method: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [addressType, fieldName] = name.split('.'); // e.g., "billing_address", "first_name"

      // Update form data
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [addressType]: {
            ...prev[addressType],
            [fieldName]: value
          }
        };

        // If country changes, reset state and postcode to avoid invalid combinations
        if (fieldName === 'country') {
          const selectedCountry = countries.find(c => c.code === value);
          // Clear state and postcode when country changes
          newFormData[addressType].state = '';
          newFormData[addressType].postcode = '';

          // If the new country has states, the user will need to select one
          // (We don't auto-select to avoid confusion with the cleared postcode)
        }

        return newFormData;
      });
    } else if (type === 'checkbox') {
        // Handle top-level checkboxes if any
        // Example: setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'orderNotes') {
        setFormData(prev => ({ ...prev, order_notes: value }));
    } else {
      // Handle other top-level fields directly if needed
      // Example: setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e, stripe, elements) => {
    if (e) e.preventDefault(); // Prevent default form submission if called from an event

    // If PayPal is selected, this function should not proceed with its original Stripe logic.
    // The actual payment initiation for PayPal happens via PayPalButtons.
    if (formData.payment_method === 'paypal') {
        // This function might be called by the main form's onSubmit,
        // but for PayPal, we don't want it to proceed with Stripe logic or Place Order API call here.
        // The `createOrderOrUpdateCustomer` will be called directly by PayPalButtons' `onClick` or `createOrder`.
        // console.log("[CheckoutPage] handleSubmit called with PayPal selected. PayPalButtons will manage the flow.");
        // setIsProcessing(true); // Set processing true, will be set to false on completion/error by PayPal flow
        // setSubmissionError(null);
        return; // Exit if PayPal is chosen, as PayPalButtons handles the process.
    }
    
    // Ensure Stripe is selected if we reach here (or any other non-PayPal direct processing method)
    if (formData.payment_method !== 'stripe') {
        console.warn("[CheckoutPage] handleSubmit called for non-Stripe/non-PayPal method without specific logic.");
        setSubmissionError("Selected payment method is not configured for this action.");
        setIsProcessing(false);
        return;
    }

    setIsProcessing(true);
    setSubmissionError(null);
    setIsPaymentDeclineError(false);

    let dataToSend = {
      billing_address: formData.billing_address,
      shipping_address: shipToDifferentAddress ? formData.shipping_address : formData.billing_address,
      payment_method: formData.payment_method, // Include selected payment method
      ...(formData.order_notes && { customer_note: formData.order_notes }),
    };

    console.log("Submitting customer and payment method data:", dataToSend);

    try {
      // Step 1: Update customer information (common for Stripe)
      // For PayPal, this will be called before creating the WC order inside createOrderForPaypal
      const customerUpdateData = {
        billing_address: formData.billing_address,
        shipping_address: shipToDifferentAddress ? formData.shipping_address : formData.billing_address,
      };
      await callCartApi('/wp-json/wc/store/v1/cart/update-customer', 'POST', customerUpdateData);
      console.log("Customer data updated successfully for Stripe.");

      // Step 2: Process Payment & Place Order (Stripe specific)
      if (!stripe || !elements) {
        console.error("[CheckoutPage] Stripe.js or Elements not loaded properly in handleSubmit.");
        setSubmissionError("Payment processing is not ready. Please ensure Stripe has loaded.");
        setIsProcessing(false);
        return;
      }

      if (formData.payment_method === 'stripe') { // Example: Card payment
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          console.error("Card details element not found.");
          setSubmissionError("Card details element not found.");
          setIsProcessing(false);
          return;
        }

        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: `${formData.billing_address.first_name} ${formData.billing_address.last_name}`,
            email: formData.billing_address.email,
            phone: formData.billing_address.phone,
            address: {
              line1: formData.billing_address.address_1,
              line2: formData.billing_address.address_2,
              city: formData.billing_address.city,
              state: formData.billing_address.state,
              postal_code: formData.billing_address.postcode,
              country: formData.billing_address.country,
            },
          },
        });

        if (stripeError) {
          console.error("Stripe error:", stripeError);
          setSubmissionError(stripeError.message || "Error creating payment method.");
          setIsPaymentDeclineError(true);
          setIsProcessing(false);
          return;
        }

        // Add paymentMethod.id to dataToSend for the final checkout call
        dataToSend.payment_data = [
          { key: 'stripe_token', value: paymentMethod.id },
          { key: 'billing_email', value: formData.billing_address.email },
          { key: 'billing_first_name', value: formData.billing_address.first_name },
          { key: 'billing_last_name', value: formData.billing_address.last_name },
          { key: 'billing_address_1', value: formData.billing_address.address_1 },
          { key: 'billing_address_2', value: formData.billing_address.address_2 || '' },
          { key: 'billing_city', value: formData.billing_address.city },
          { key: 'billing_state', value: formData.billing_address.state },
          { key: 'billing_postcode', value: formData.billing_address.postcode },
          { key: 'billing_country', value: formData.billing_address.country },
          { key: 'billing_phone', value: formData.billing_address.phone }
        ];
        
        // console.log("Payment method created (pm_...):", paymentMethod.id);
        // console.log("Data for final checkout:", dataToSend);

      } else if (formData.payment_method === 'stripe_paypal') {
        // For PayPal, the dataToSend might be simpler, or redirect might be handled by WC Stripe plugin
        // The payment_data structure might differ. Check cart.payment_requirements for details.
        // console.log("Attempting PayPal checkout...");
        // Placeholder: PayPal often involves redirection or a specific flow initiated by Stripe.js or the gateway.
        // dataToSend might simply need payment_method: 'stripe_paypal'
        // The WooCommerce Stripe Gateway plugin might handle the redirect after the checkout call.
      }
      
      // Actual call to /checkout endpoint (for Stripe)
      console.log("Calling /wc/store/v1/checkout with Stripe data:", dataToSend);
      const orderResult = await callCartApi('/wp-json/wc/store/v1/checkout', 'POST', dataToSend);
      // console.log("Stripe Order placement result:", orderResult);

      if (orderResult && (orderResult.order_id || orderResult.order_number)) {
        await fetchCartAndNonce(); // Clear cart, get new nonce

        const orderNumber = orderResult.order_number || orderResult.order_id;
        const orderKey = orderResult.order_key || '';
        router.push(`/order-confirmation?order_number=${orderNumber}&order_key=${orderKey}`);
      } else {
        console.error("Checkout was successful but order data is missing in the response:", orderResult);
        setSubmissionError("Checkout was successful, but there was an issue retrieving your order details. Please check your email or contact support.");
      }

    } catch (error) {
      console.error("Checkout error:", error);
      setSubmissionError(error.message || "An unknown error occurred during checkout.");
      setIsPaymentDeclineError(true);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // START PAYPAL HANDLERS
  const createWooCommerceOrderForPayPal = async () => {
    setIsProcessing(true);
    setSubmissionError(null);
    setIsPaymentDeclineError(false);
    // setCreatedWooOrder(null); // Not strictly necessary to clear here if we're returning directly

    // START DEFENSIVE CHECK
    if (!cart || !cart.totals || typeof cart.totals.total_price === 'undefined' || typeof cart.totals.currency_code === 'undefined' || typeof cart.totals.currency_minor_unit === 'undefined') {
      console.error("[PayPal] Cart data (especially total_price, currency_code, currency_minor_unit) is not available or incomplete.", JSON.stringify(cart?.totals, null, 2));
      setSubmissionError("Your cart information is currently unavailable. Please refresh or try again shortly.");
      setIsProcessing(false);
      throw new Error("Cart totals are not available to proceed with PayPal order creation.");
    }
    // END DEFENSIVE CHECK

    const customerData = {
      billing_address: formData.billing_address,
      shipping_address: shipToDifferentAddress ? formData.shipping_address : formData.billing_address,
      ...(formData.order_notes && { customer_note: formData.order_notes }),
    };

    try {
      // 1. Update customer details in WooCommerce
      // console.log("[PayPal] Updating customer data before creating WC order:", customerData);
      await callCartApi('/wp-json/wc/store/v1/cart/update-customer', 'POST', customerData);
      // console.log("[PayPal] Customer data updated successfully.");

      // 2. Create WooCommerce order to get an order ID
      const wooOrderPayload = {
        ...customerData, // Includes billing, shipping, and notes
        payment_method: 'paypal', // Specify PayPal as the payment method
        // Ensure other necessary fields for order creation are included if any
        // The store API /checkout endpoint should handle creating the order from the current cart
      };
      // console.log("[PayPal] Creating WooCommerce order with payload:", wooOrderPayload);
      const wooOrderResult = await callCartApi('/wp-json/wc/store/v1/checkout', 'POST', wooOrderPayload);
      // console.log("[PayPal] WooCommerce order creation result:", wooOrderResult);

      if (!wooOrderResult || !(wooOrderResult.order_id || wooOrderResult.order_number)) {
        throw new Error("Failed to create WooCommerce order or retrieve order ID.");
      }
      
      const orderId = wooOrderResult.order_id || wooOrderResult.order_number;
      const orderKey = wooOrderResult.order_key || '';
      
      const minorUnit = cart.totals.currency_minor_unit;
      const rawTotalPrice = parseInt(cart.totals.total_price, 10);
      const formattedTotalPrice = (rawTotalPrice / Math.pow(10, minorUnit)).toFixed(minorUnit);

      const orderDetails = { 
        id: orderId, 
        key: orderKey, 
        total: formattedTotalPrice, 
        currency: cart.totals.currency_code || 'USD' 
      };

      setCreatedWooOrder(orderDetails); // Still set state for onApprove if needed
      //setIsProcessing(false); // Processing continues with PayPal client-side
      return orderDetails; // Return the full details object

    } catch (error) {
      console.error("[PayPal] Error creating WooCommerce order:", error);
      setSubmissionError(error.message || "Failed to prepare order for PayPal. Please try again.");
      setIsPaymentDeclineError(true);
      setIsProcessing(false);
      throw error; // Re-throw to stop PayPal flow
    }
  };


  const onPayPalApprove = async (data, actions) => {
    // console.log("[PayPal] onApprove data:", data); // data.orderID is the PayPal Order ID
    // setIsProcessing(true); // Already true from createOrder or onClick of PayPal button
    setSubmissionError(null);
    setIsPaymentDeclineError(false);

    try {
      const response = await fetch('/api/capture-paypal-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypalOrderID: data.orderID }), // Pass PayPal's orderID
      });

      const captureResult = await response.json();
      // console.log("[PayPal] Capture result:", captureResult);

      if (!response.ok) {
        throw new Error(captureResult.error || captureResult.message || 'PayPal payment capture failed.');
      }

      // Ensure we have the WooCommerce order details from the state or captureResult
      const wooOrderIdToConfirm = captureResult.wooCommerceOrderId || createdWooOrder?.id;
      const wooOrderKeyToConfirm = createdWooOrder?.key || ''; // Order key might not be in captureResult

      if (!wooOrderIdToConfirm) {
        console.error("[PayPal] WooCommerce Order ID missing after capture. This is critical.");
        setSubmissionError("Payment successful, but we couldn't finalize your order details. Please contact support with PayPal Transaction ID: " + (captureResult.paypalTransactionId || data.orderID));
        setIsProcessing(false); // Stop processing, but it's a partial success
        // Potentially redirect to a specific page or show message
        return;
      }
      
      await fetchCartAndNonce(); // Clear original cart, get new nonce
      
      router.push(`/order-confirmation?order_number=${wooOrderIdToConfirm}&order_key=${wooOrderKeyToConfirm}`);

    } catch (error) {
      console.error("[PayPal] onApprove error:", error);
      setSubmissionError(error.message || "An error occurred while processing your PayPal payment.");
      setIsPaymentDeclineError(true);
    } finally {
       setIsProcessing(false); // Ensure processing is set to false
    }
  };

  const onPayPalCreateOrder = async (data, actions) => {
      // console.log("[PayPal] createOrder data from PayPal SDK:", data);
    setSubmissionError(null);
    setIsProcessing(true);
    setIsPaymentDeclineError(false);

    try {
        const wooOrderDetails = await createWooCommerceOrderForPayPal(); 
        
        // console.log("[PayPal] After createWooCommerceOrderForPayPal call:");
        // console.log("[PayPal] wooOrderDetails received:", JSON.stringify(wooOrderDetails, null, 2));
        // console.log("[PayPal] createdWooOrder state (may be stale here):", JSON.stringify(createdWooOrder, null, 2));

        if (!wooOrderDetails || !wooOrderDetails.id || !wooOrderDetails.total) {
            console.error("[PayPal] Validation failed: wooOrderDetails:", wooOrderDetails);
            throw new Error("WooCommerce order details not available or incomplete for PayPal.");
        }

        // console.log(`[PayPal] Calling /api/create-paypal-payment with WC Order ID: ${wooOrderDetails.id}, Amount: ${wooOrderDetails.total}, Currency: ${wooOrderDetails.currency}`);
        const response = await fetch('/api/create-paypal-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: wooOrderDetails.id.toString(),
                amount: wooOrderDetails.total,
                currency_code: wooOrderDetails.currency 
            }),
        });

        const payment = await response.json();
        if (!response.ok) {
            throw new Error(payment.error || payment.details || 'Failed to create PayPal payment intent.');
        }
        // console.log("[PayPal] PayPal Order ID from API:", payment.paypalOrderId);
        return payment.paypalOrderId; // This is what PayPalButtons expects

    } catch (error) {
        console.error("[PayPal] Error in createOrder callback:", error);
        setSubmissionError(error.message || "Could not initiate PayPal payment. Please check your details or try another method.");
        setIsPaymentDeclineError(true);
        setIsProcessing(false); // Stop processing on failure
        throw error; // Re-throw to inform PayPal SDK
    }
    // No setIsProcessing(false) here, as it's handled in onApprove/onError/onCancel or if createOrder fails
  };
  
  const onPayPalError = (err) => {
    console.error("[PayPal] SDK Error:", err);
    setSubmissionError("An error occurred with PayPal. Please try again or use a different payment method.");
    setIsPaymentDeclineError(true);
    setIsProcessing(false);
  };

  const onPayPalCancel = (data) => {
    // console.log("[PayPal] Payment cancelled:", data);
    setSubmissionError("PayPal payment was cancelled. You can try again or choose another payment method.");
    setIsProcessing(false);
  };
  // END PAYPAL HANDLERS


  // Note: PAYPAL_CLIENT_ID should be NEXT_PUBLIC_PAYPAL_CLIENT_ID if accessed here.
  // Ensure it's set in .env.local
  const payPalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!payPalClientId && formData.payment_method === 'paypal') {
    console.error("PayPal Client ID is not configured. PayPal cannot be initialized.");
    // Optionally, set an error message or disable PayPal if ID is missing
  }

  return (
    // Wrap with PayPalScriptProvider if PayPal Client ID is available
    // Conditionally render based on payPalClientId to avoid errors if it's not set
    payPalClientId ? (
      <PayPalScriptProvider options={{ "client-id": payPalClientId, currency: formData?.billing_address?.currency || cart?.totals?.currency_code || "USD" }}>
        <Elements stripe={stripePromise}>
          <CheckoutFormContent
            shipToDifferentAddress={shipToDifferentAddress}
            setShipToDifferentAddress={setShipToDifferentAddress}
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isProcessing={isProcessing}
            submissionError={submissionError}
            isPaymentDeclineError={isPaymentDeclineError}
            handleModalClose={handleModalClose}
            isCartLoading={isCartLoading}
            availablePaymentMethods={availablePaymentMethods}
            handlePaymentMethodChange={handlePaymentMethodChange}
            countries={countries}
            isLoadingCountries={isLoadingCountries}
            addressValidationError={addressValidationError}
            // START PAYPAL PROPS
            onPayPalCreateOrder={onPayPalCreateOrder}
            onPayPalApprove={onPayPalApprove}
            onPayPalError={onPayPalError}
            onPayPalCancel={onPayPalCancel}
            // END PAYPAL PROPS
          />
        </Elements>
      </PayPalScriptProvider>
    ) : (
      // Fallback if PayPal Client ID is not loaded, Stripe still works
      <Elements stripe={stripePromise}>
        <CheckoutFormContent
          shipToDifferentAddress={shipToDifferentAddress}
          setShipToDifferentAddress={setShipToDifferentAddress}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isProcessing={isProcessing}
          submissionError={submissionError}
          isPaymentDeclineError={isPaymentDeclineError}
          handleModalClose={handleModalClose}
          isCartLoading={isCartLoading}
          availablePaymentMethods={availablePaymentMethods}
          handlePaymentMethodChange={handlePaymentMethodChange}
          countries={countries}
          isLoadingCountries={isLoadingCountries}
          addressValidationError={addressValidationError}
          // PayPal props won't be used here, or pass null/undefined
        />
      </Elements>
    )
  );
}

// New component to use Stripe hooks
function CheckoutFormContent({
  shipToDifferentAddress, setShipToDifferentAddress, formData, handleChange, handleSubmit,
  isProcessing, submissionError, isPaymentDeclineError, handleModalClose, isCartLoading, availablePaymentMethods, handlePaymentMethodChange,
  countries, isLoadingCountries, addressValidationError,
  // START PAYPAL PROPS
  onPayPalCreateOrder, onPayPalApprove, onPayPalError, onPayPalCancel
  // END PAYPAL PROPS
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart } = useCart(); // Get cart to access totals for PayPal amount

  // This is the existing submit for Stripe (and potentially other direct methods)
  const localHandleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
        console.error("[CheckoutFormContent] Stripe.js or Elements not loaded when submitting form.");
        // Optionally, set an error message here if submissionError state is accessible
        // For now, rely on the button being disabled or handleSubmit check.
        return;
    }
    // Pass event, stripe, and elements to the main handleSubmit function from CheckoutPage
    await handleSubmit(e, stripe, elements);
  };

  // Determine if PayPal is selected and ready
  const isPayPalSelected = formData.payment_method === 'paypal';
  const payPalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID; // Check again for safety

  return (
    <div className="bg-gray-50">
      <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <Link href="/cart" className="text-sm font-medium text-[#9CB24D] hover:text-[#8CA23D] mb-8 inline-block">
          &larr; Return to Cart
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-10 text-center">Checkout</h1>

        {/* Main grid for form and summary */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start">
          {/* Form Section - Spans 7 columns on large screens */}
          <form onSubmit={localHandleSubmit} className="lg:col-span-7 space-y-12">
            {/* Billing Details Form */}
            <div className="border-t border-gray-200 pt-10">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Billing details</h2>
              {isLoadingCountries ? (
                <p className="text-gray-500">Loading countries...</p>
              ) : (
                <AddressForm type="billing" formData={formData} handleChange={handleChange} countries={countries} />
              )}

              {/* Address Validation Error */}
              {addressValidationError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{addressValidationError}</p>
                </div>
              )}

              <div className="mt-10 relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="shipToDifferentAddress"
                    name="shipToDifferentAddress"
                    type="checkbox"
                    checked={shipToDifferentAddress}
                    onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#9CB24D] focus:ring-[#9CB24D]"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="shipToDifferentAddress" className="font-medium text-gray-900">
                    Ship to a different address?
                  </label>
                </div>
              </div>
            </div>

            {/* Shipping Details Form (Conditional) */}
            {shipToDifferentAddress && (
              <div className="border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping details</h2>
                {isLoadingCountries ? (
                  <p className="text-gray-500">Loading countries...</p>
                ) : (
                  <AddressForm type="shipping" formData={formData} handleChange={handleChange} countries={countries} />
                )}
              </div>
            )}

            {/* Order Notes and Payment Section (within the form) */}
            <div> 
                { !shipToDifferentAddress &&  <div className="mb-6 hidden lg:block">&nbsp;</div> } 
                <div className="mt-8">
                    <label htmlFor="orderNotes" className="block text-sm font-medium leading-6 text-gray-900">Order notes (optional)</label>
                    <textarea id="orderNotes" name="orderNotes" rows="4" placeholder="Notes about your order, e.g. special notes for delivery." value={formData.order_notes || ''} onChange={handleChange} className="checkout-input"></textarea>
                </div>

                {/* Placeholder for Order Summary / Payment Information */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                    {isCartLoading && <p>Loading payment methods...</p>}
                    {!isCartLoading && availablePaymentMethods.length === 0 && <p>No payment methods available.</p>}
                    
                    {availablePaymentMethods.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {availablePaymentMethods.map((methodString) => (
                          // methodString is now directly 'paypal' or 'stripe'
                          <div key={methodString} className="flex items-center">
                            <input 
                              id={`payment_method_${methodString}`}
                              name="payment_method"
                              type="radio"
                              value={methodString} // The value is the method string itself
                              checked={formData.payment_method === methodString}
                              onChange={handlePaymentMethodChange}
                              className="h-4 w-4 text-[#9CB24D] border-gray-300 focus:ring-[#9CB24D]"
                            />
                            <label htmlFor={`payment_method_${methodString}`} className="ml-3 block text-sm font-medium text-gray-700">
                              {/* Capitalize the first letter for display */}
                              {methodString.charAt(0).toUpperCase() + methodString.slice(1)}
                              {/* If you have a mapping for user-friendly names based on these strings, you can use it here */}
                              {/* e.g., paymentMethodDisplayNames[methodString] || defaultName */}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stripe Card Element will go here if 'stripe' (card) is selected */}
                    {formData.payment_method === 'stripe' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Details</label>
                            <CardElement options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                            }} className="checkout-input p-3" />
                        </div>
                    )}

                    {/* Placeholder for PayPal button if 'stripe_paypal' is selected */}
                    {/* Renamed to 'paypal' for direct integration */}
                    {isPayPalSelected && payPalClientId && cart && (
                        <div className="mb-6">
                            {/* Inform users what to expect */}
                            {!isProcessing && <p className="text-sm text-gray-600 mb-2">You will be redirected to PayPal to complete your payment securely.</p>}
                            
                            {/* PayPalButtons component */}
                            {/* It should only be rendered if PayPal is selected and ready */}
                            <PayPalButtons
                                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                                createOrder={onPayPalCreateOrder}
                                onApprove={onPayPalApprove}
                                onError={onPayPalError}
                                onCancel={onPayPalCancel}
                                // onClick is useful for validation before calling createOrder
                                // For example, ensuring all form fields are valid.
                                // onClick={async (data, actions) => {
                                //   // Validate form fields here
                                //   // If validation fails: return actions.reject();
                                //   // If validation passes: return actions.resolve();
                                //   // This is also a good place to call createWooCommerceOrderForPayPal if not done in createOrder itself.
                                //   // However, createOrder is often preferred for async setup that returns a PayPal order ID.
                                // }}
                                disabled={isProcessing || isCartLoading} // Disable if already processing or cart is loading
                            />
                            {isProcessing && formData.payment_method === 'paypal' && <p className="text-sm text-blue-600 mt-2">Processing PayPal payment...</p>}
                        </div>
                    )}
                    {isPayPalSelected && !payPalClientId && (
                         <p className="text-red-600 text-sm mt-4 mb-4">PayPal is currently unavailable. Please select another payment method.</p>
                    )}
                    
                    {/* Display any submission errors */}
                    {submissionError && !isPaymentDeclineError && (
                        <p className="text-red-600 text-sm mt-4 mb-4">{submissionError}</p>
                    )}

                    <Dialog open={isPaymentDeclineError} onOpenChange={(open) => !open && handleModalClose()}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Payment Declined</DialogTitle>
                          <DialogDescription>
                            Please try a different payment method or check your payment details.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={handleModalClose}>Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* "Place Order" button for non-PayPal methods */}
                    {(!isPayPalSelected || !payPalClientId) && (
                      <button 
                          type="submit" 
                          disabled={isProcessing || isCartLoading || (formData.payment_method === 'stripe' && (!stripe || !elements))}
                          className="w-full bg-[#9CB24D] hover:bg-[#8CA23D] text-white py-3 px-6 rounded-md font-medium transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isProcessing ? 'Processing...' : 'Place Order'}
                      </button>
                    )}
                </div>
            </div>
          </form>

          {/* Order Summary Section - Spans 5 columns on large screens */}
          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <CheckoutCartSummary />
          </div>
        </div>
      </div>
    </div>
  );
} 