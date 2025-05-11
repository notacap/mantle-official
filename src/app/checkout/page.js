'use client';

import { useState } from 'react';
import Link from 'next/link';
import './checkout.css'; // We'll create this file for styling

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
  const prefix = type === 'shipping' ? 'shipping' : 'billing';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}FirstName`} className="block text-sm font-medium leading-6 text-gray-900">First name <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}FirstName`} id={`${prefix}FirstName`} autoComplete="given-name" required className="checkout-input" />
        </div>
        <div>
          <label htmlFor={`${prefix}LastName`} className="block text-sm font-medium leading-6 text-gray-900">Last name <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}LastName`} id={`${prefix}LastName`} autoComplete="family-name" required className="checkout-input" />
        </div>
      </div>

      <div>
        <label htmlFor={`${prefix}Company`} className="block text-sm font-medium leading-6 text-gray-900">Company (optional)</label>
        <input type="text" name={`${prefix}Company`} id={`${prefix}Company`} autoComplete="organization" className="checkout-input" />
      </div>

      <div>
        <label htmlFor={`${prefix}Country`} className="block text-sm font-medium leading-6 text-gray-900">Country / Region <span className="text-red-600">*</span></label>
        <select id={`${prefix}Country`} name={`${prefix}Country`} autoComplete="country-name" required className="checkout-input">
          <option value="US">United States</option>
          {/* Add other countries if needed */}
        </select>
      </div>

      <div>
        <label htmlFor={`${prefix}StreetAddress1`} className="block text-sm font-medium leading-6 text-gray-900">Street address <span className="text-red-600">*</span></label>
        <input type="text" name={`${prefix}StreetAddress1`} id={`${prefix}StreetAddress1`} placeholder="House number and street name" autoComplete="address-line1" required className="checkout-input" />
      </div>
      <div>
        <input type="text" name={`${prefix}StreetAddress2`} id={`${prefix}StreetAddress2`} placeholder="Apartment, suite, unit, etc. (optional)" autoComplete="address-line2" className="checkout-input mt-2" />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}City`} className="block text-sm font-medium leading-6 text-gray-900">Town / City <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}City`} id={`${prefix}City`} autoComplete="address-level2" required className="checkout-input" />
        </div>
        <div>
          <label htmlFor={`${prefix}State`} className="block text-sm font-medium leading-6 text-gray-900">State <span className="text-red-600">*</span></label>
          <select id={`${prefix}State`} name={`${prefix}State`} autoComplete="address-level1" required className="checkout-input">
            <option value="">Select a state...</option>
            {usStates.map(state => (
              <option key={state.code} value={state.code}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}ZipCode`} className="block text-sm font-medium leading-6 text-gray-900">ZIP Code <span className="text-red-600">*</span></label>
          <input type="text" name={`${prefix}ZipCode`} id={`${prefix}ZipCode`} autoComplete="postal-code" required className="checkout-input" />
        </div>
        <div>
          <label htmlFor={`${prefix}Phone`} className="block text-sm font-medium leading-6 text-gray-900">Phone <span className="text-red-600">*</span></label>
          <input type="tel" name={`${prefix}Phone`} id={`${prefix}Phone`} autoComplete="tel" required className="checkout-input" />
        </div>
      </div>
      {type === 'billing' && (
        <div>
          <label htmlFor="billingEmail" className="block text-sm font-medium leading-6 text-gray-900">Email address <span className="text-red-600">*</span></label>
          <input type="email" name="billingEmail" id="billingEmail" autoComplete="email" required className="checkout-input" />
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  // Placeholder for form data state and handlers
  const [formData, setFormData] = useState({}); 
  const handleChange = (e) => {
    // Basic handler, can be expanded
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add form validation and submission logic
    console.log("Form submitted", formData);
    alert("Checkout form submitted (not functional yet)!");
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <Link href="/cart" className="text-sm font-medium text-[#9CB24D] hover:text-[#8CA23D] mb-8 inline-block">
          &larr; Return to Cart
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-10 text-center">Checkout</h1>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
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
                    <textarea id="orderNotes" name="orderNotes" rows="4" placeholder="Notes about your order, e.g. special notes for delivery." className="checkout-input"></textarea>
                </div>

                {/* Placeholder for Order Summary / Payment Information */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                    <p className="text-sm text-gray-500 mb-6">Your order summary and payment options will appear here. For now, this is just a placeholder.</p>
                    {/* This button will submit the entire form */}
                    <button 
                        type="submit" 
                        className="w-full bg-[#9CB24D] hover:bg-[#8CA23D] text-white py-3 px-6 rounded-md font-medium transition-colors text-lg"
                    >
                        Place Order (UI Only)
                    </button>
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 