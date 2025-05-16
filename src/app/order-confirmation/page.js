'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './order-confirmation.css'; // We'll create this CSS file next

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [orderKey, setOrderKey] = useState('');

  useEffect(() => {
    const odNumber = searchParams.get('order_number');
    const odKey = searchParams.get('order_key');
    if (odNumber) {
      setOrderNumber(odNumber);
    }
    if (odKey) {
      setOrderKey(odKey); // You might not need to display the key, but it's good to have
    }
  }, [searchParams]);

  return (
    <main className="order-confirmation-page bg-gray-50 min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div>
          {/* You can use an SVG icon for success here */}
          <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Thank You For Your Order!</h1>
          <p className="mt-2 text-md text-gray-600">
            Your order has been placed successfully.
          </p>
          {orderNumber && (
            <p className="mt-4 text-lg font-medium text-gray-800">
              Order Number: <span className="text-[#9CB24D]">{orderNumber}</span>
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            You will receive an email confirmation shortly with your order details.
          </p>
        </div>
        
        <div className="mt-10 space-y-4">
          <Link href="/shop" 
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#9CB24D] hover:bg-[#8CA23D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CB24D] transition-colors">
            Continue Shopping
          </Link>
          <Link href="/contact" 
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">
            Contact Us
          </Link>
        </div>

        {/* Optional: Display order key if needed for any reason, or link to an order tracking page */}
        {/* {orderKey && (
          <p className="mt-4 text-xs text-gray-400">Order Key: {orderKey}</p>
        )} */}
      </div>
    </main>
  );
} 