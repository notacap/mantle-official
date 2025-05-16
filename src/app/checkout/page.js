'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './checkout.css';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Make sure to set this in your .env.local file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const usStates = [
  { name: 'Alabama', code: 'AL' }, { name: 'Alaska', code: 'AK' }, { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' }, { name: 'California', code: 'CA' }, { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' }, { name: 'Delaware', code: 'DE' }, { name: 'District of Columbia', code: 'DC' },
  { name: 'Florida', code: 'FL' }, { name: 'Georgia', code: 'GA' }, { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' }, { name: 'Illinois', code: 'IL' }, { name: 'Indiana', code: 'IN' },
  { name: 'Iowa', code: 'IA' }, { name: 'Kansas', code: 'KS' }, { name: 'Kentucky', code: 'KY' },
  { name: 'Louisiana', code: 'LA' }, { name: 'Maine', code: 'ME' }, { name: 'Maryland', code: 'MD' },
  { name: 'Massachusetts', code: 'MA' }, { name: 'Michigan', code: 'MI' }, { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' }, { name: 'Missouri', code: 'MO' }, { name: 'Montana', code: 'MT' },
  { name: 'Nebraska', code: 'NE' }, { name: 'Nevada', code: 'NV' }, { name: 'New Hampshire', code: 'NH' },
  { name: 'New Jersey', code: 'NJ' }, { name: 'New Mexico', code: 'NM' }, { name: 'New York', code: 'NY' },
  { name: 'North Carolina', code: 'NC' }, { name: 'North Dakota', code: 'ND' }, { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' }, { name: 'Oregon', code: 'OR' }, { name: 'Pennsylvania', code: 'PA' },
  { name: 'Rhode Island', code: 'RI' }, { name: 'South Carolina', code: 'SC' }, { name: 'South Dakota', code: 'SD' },
  { name: 'Tennessee', code: 'TN' }, { name: 'Texas', code: 'TX' }, { name: 'Utah', code: 'UT' },
  { name: 'Vermont', code: 'VT' }, { name: 'Virginia', code: 'VA' }, { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' }, { name: 'Wisconsin', code: 'WI' }, { name: 'Wyoming', code: 'WY' },
  { name: 'Armed Forces (AA)', code: 'AA' }, { name: 'Armed Forces (AE)', code: 'AE' }, { name: 'Armed Forces (AP)', code: 'AP' }
];

function AddressForm({ type, formData, handleChange }) {
  const prefix = type === 'shipping' ? 'shipping_address' : 'billing_address'; // Match API structure

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
        <select id={`${prefix}.country`} name={`${prefix}.country`} value={formData?.[prefix]?.country || 'US'} onChange={handleChange} autoComplete="country-name" required className="checkout-input">
          <option value="US">United States</option>
          {/* Add other countries if needed */}
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
          <label htmlFor={`${prefix}.state`} className="block text-sm font-medium leading-6 text-gray-900">State <span className="text-red-600">*</span></label>
          <select id={`${prefix}.state`} name={`${prefix}.state`} value={formData?.[prefix]?.state || ''} onChange={handleChange} autoComplete="address-level1" required className="checkout-input">
            <option value="">Select a state...</option>
            {usStates.map(state => (
              <option key={state.code} value={state.code}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}.postcode`} className="block text-sm font-medium leading-6 text-gray-900">ZIP Code <span className="text-red-600">*</span></label>
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
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const { cart, callCartApi, isLoading: isCartLoading, error: cartError } = useCart();
  const [formData, setFormData] = useState({
    billing_address: { country: 'US' },
    shipping_address: { country: 'US' },
    payment_method: '', // For selected payment method
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);

  useEffect(() => {
    console.log("[CheckoutPage] Cart data received:", cart);
    if (cart && Array.isArray(cart.payment_methods) && cart.payment_methods.length > 0) {
      console.log("[CheckoutPage] Detected payment methods directly from cart.payment_methods:", cart.payment_methods);
      setAvailablePaymentMethods(cart.payment_methods);
      if (!formData.payment_method) {
        setFormData(prev => ({ ...prev, payment_method: cart.payment_methods[0].name }));
      }
    } else if (cart && cart.payment_requirements && Array.isArray(cart.payment_requirements.payment_methods)) {
      console.log("[CheckoutPage] Detected payment methods from cart.payment_requirements.payment_methods:", cart.payment_requirements.payment_methods);
      setAvailablePaymentMethods(cart.payment_requirements.payment_methods);
      if (!formData.payment_method && cart.payment_requirements.payment_methods.length > 0) {
        setFormData(prev => ({ ...prev, payment_method: cart.payment_requirements.payment_methods[0].name }));
      }
    } else {
      console.log("[CheckoutPage] No payment methods found in expected locations (cart.payment_methods or cart.payment_requirements.payment_methods) or cart structure is unexpected.");
      setAvailablePaymentMethods([]);
    }
  }, [cart]);

  const handlePaymentMethodChange = (e) => {
    setFormData(prev => ({ ...prev, payment_method: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [addressType, fieldName] = name.split('.'); // e.g., "billing_address", "first_name"
      setFormData(prev => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [fieldName]: value
        }
      }));
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
    e.preventDefault();
    setIsProcessing(true);
    setSubmissionError(null);

    let dataToSend = {
      billing_address: formData.billing_address,
      shipping_address: shipToDifferentAddress ? formData.shipping_address : formData.billing_address,
      payment_method: formData.payment_method, // Include selected payment method
      ...(formData.order_notes && { customer_note: formData.order_notes }),
    };

    console.log("Submitting customer and payment method data:", dataToSend);

    try {
      // Step 1: Update customer information
      await callCartApi('/wp-json/wc/store/v1/cart/update-customer', 'POST', dataToSend);
      console.log("Customer data updated successfully.");

      // Step 2: Process Payment & Place Order
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
          setIsProcessing(false);
          return;
        }

        // Add paymentMethod.id to dataToSend for the final checkout call
        dataToSend.payment_data = [
          { key: 'stripe_token', value: paymentMethod.id }
        ];
        
        console.log("Payment method created (pm_...):", paymentMethod.id);
        console.log("Data for final checkout:", dataToSend);

      } else if (formData.payment_method === 'stripe_paypal') {
        // For PayPal, the dataToSend might be simpler, or redirect might be handled by WC Stripe plugin
        // The payment_data structure might differ. Check cart.payment_requirements for details.
        console.log("Attempting PayPal checkout...");
        // Placeholder: PayPal often involves redirection or a specific flow initiated by Stripe.js or the gateway.
        // dataToSend might simply need payment_method: 'stripe_paypal'
        // The WooCommerce Stripe Gateway plugin might handle the redirect after the checkout call.
      }
      
      // Actual call to /checkout endpoint
      console.log("Calling /wc/store/v1/checkout with:", dataToSend);
      const orderResult = await callCartApi('/wp-json/wc/store/v1/checkout', 'POST', dataToSend);
      console.log("Order placement result:", orderResult);
      alert("Order placed! (Further actions like redirect needed)");
      // TODO: Handle successful order (e.g., clear cart, redirect to thank you page)
      // router.push('/thank-you?order_id=' + orderResult.order_id);

    } catch (error) {
      console.error("Checkout error:", error);
      setSubmissionError(error.message || "An unknown error occurred during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent 
        shipToDifferentAddress={shipToDifferentAddress} 
        setShipToDifferentAddress={setShipToDifferentAddress}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit} // Pass the async handleSubmit
        isProcessing={isProcessing}
        submissionError={submissionError}
        isCartLoading={isCartLoading} // Pass cart loading state
        availablePaymentMethods={availablePaymentMethods}
        handlePaymentMethodChange={handlePaymentMethodChange}
      />
    </Elements>
  );
}

// New component to use Stripe hooks
function CheckoutFormContent({ 
  shipToDifferentAddress, setShipToDifferentAddress, formData, handleChange, handleSubmit, 
  isProcessing, submissionError, isCartLoading, availablePaymentMethods, handlePaymentMethodChange
}) {
  const stripe = useStripe();
  const elements = useElements();

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

  return (
    <div className="bg-gray-50">
      <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <Link href="/cart" className="text-sm font-medium text-[#9CB24D] hover:text-[#8CA23D] mb-8 inline-block">
          &larr; Return to Cart
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-10 text-center">Checkout</h1>

        <form onSubmit={localHandleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Billing Details Form */}
          <div className="mt-10 border-t border-gray-200 pt-10">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Billing details</h2>
            <AddressForm type="billing" formData={formData} handleChange={handleChange} />
            
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
            <div className="mt-10 border-t border-gray-200 pt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping details</h2>
              <AddressForm type="shipping" formData={formData} handleChange={handleChange} />
            </div>
          )}

          {/* Order Notes and Submit (Adjust grid span if shipping form is hidden) */}
          <div className={`mt-10 pt-10 ${shipToDifferentAddress ? 'lg:col-span-2' : 'lg:col-start-2'}`}>
             <div className={shipToDifferentAddress ? "" : "lg:mt-0 lg:border-t lg:border-gray-200" }>
                { !shipToDifferentAddress &&  <div className="mb-6 hidden lg:block">&nbsp;</div> } {/* Spacer to align with billing header when no shipping form */}
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
                    {formData.payment_method === 'stripe_paypal' && (
                        <div className="mb-6">
                            <p className="text-sm text-gray-600">You will be redirected to PayPal to complete your payment.</p>
                            {/* PayPal button or specific instructions might go here depending on Stripe gateway behavior */}
                        </div>
                    )}
                    
                    {/* Display any submission errors */}
                    {submissionError && (
                        <p className="text-red-600 text-sm mt-4 mb-4">{submissionError}</p>
                    )}
                    <button 
                        type="submit" // Changed from button to submit if this is the main form submit trigger
                        disabled={isProcessing || isCartLoading || !stripe || !elements}
                        className="w-full bg-[#9CB24D] hover:bg-[#8CA23D] text-white py-3 px-6 rounded-md font-medium transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Place Order'} {/* Updated button text */}
                    </button>
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 