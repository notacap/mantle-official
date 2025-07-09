"use client";

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/app/services/woocommerce';
import Image from 'next/image';

export default function CheckoutCartSummary() {
  const { cart, isLoading, error } = useCart();

  if (isLoading) {
    return <div>Loading cart summary...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return <div>Your cart is empty.</div>;
  }

  const { items, totals, currency } = cart;

  const subtotal = totals.total_items ? parseFloat(totals.total_items) / (10**totals.currency_minor_unit) : 0;
  const shipping = totals.total_shipping ? parseFloat(totals.total_shipping) / (10**totals.currency_minor_unit) : 0;
  const total = totals.total_price ? parseFloat(totals.total_price) / (10**totals.currency_minor_unit) : 0;
  const discount = totals.total_discount ? parseFloat(totals.total_discount) / (10**totals.currency_minor_unit) : 0;
  const currencySymbol = totals.currency_symbol || '$';

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Order summary</h2>

      <div className="flow-root">
        <ul role="list" className="-my-6 divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.key} className="flex py-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={item.images?.[0]?.thumbnail || '/placeholder.png'}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>{item.name}</h3>
                    <p className="ml-4">{formatPrice(item.totals.line_total, currency)}</p>
                  </div>
                  {item.variation.map(v => (
                     <p key={`${v.attribute}-${v.value}`} className="mt-1 text-sm text-gray-500">{v.attribute}: {v.value}</p>
                  ))}
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <p className="text-gray-500">Qty {item.quantity}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6 space-y-3">
         <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600">Subtotal</dt>
          <dd className="text-sm font-medium text-gray-900">{currencySymbol}{subtotal.toFixed(2)}</dd>
        </div>
        
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <dt className="text-sm">Discount</dt>
            <dd className="text-sm font-medium">-{currencySymbol}{discount.toFixed(2)}</dd>
          </div>
        )}

        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600">Shipping</dt>
          <dd className="text-sm font-medium text-gray-900">{currencySymbol}{shipping.toFixed(2)}</dd>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <dt className="text-base font-medium text-gray-900">Order total</dt>
          <dd className="text-base font-medium text-gray-900">{currencySymbol}{total.toFixed(2)}</dd>
        </div>
      </div>
    </div>
  );
} 