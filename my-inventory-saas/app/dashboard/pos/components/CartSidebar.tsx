'use client'

import { MinusCircle, PlusCircle, Trash2, ShoppingBag } from 'lucide-react'

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartSidebarProps = {
  cart: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
  subtotal: number; // NEW
  taxAmount: number; // NEW
  total: number;
  currency: string;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  disabled?: boolean;
};

export default function CartSidebar({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  subtotal, // NEW
  taxAmount, // NEW
  total,
  currency,
  paymentMethod,
  onPaymentMethodChange,
  disabled
}: CartSidebarProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <ShoppingBag size={24} /> Cart
      </h2>

      <div className="flex-grow overflow-y-auto pr-2">
        {cart.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Cart is empty.</p>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex-grow">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">{currency}{item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="text-slate-500 hover:text-indigo-600 disabled:opacity-50"
                  >
                    <MinusCircle size={20} />
                  </button>
                  <span className="font-bold text-slate-800">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="text-slate-500 hover:text-indigo-600"
                  >
                    <PlusCircle size={20} />
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-rose-500 hover:text-rose-700 ml-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-200 mt-6 pt-6 space-y-3">
        <div className="flex justify-between items-center text-slate-600">
          <p>Subtotal:</p>
          <p className="font-medium">{currency}{subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <p>Tax:</p>
          <p className="font-medium">{currency}{taxAmount.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold text-slate-800">Grand Total:</p>
          <p className="text-2xl font-extrabold text-indigo-600">{currency}{total.toFixed(2)}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="Cash"
                checked={paymentMethod === 'Cash'}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-slate-700">Cash</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="Momo"
                checked={paymentMethod === 'Momo'}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-slate-700">Momo</span>
            </label>
          </div>
        </div>

        <button 
          onClick={onCheckout}
          disabled={cart.length === 0 || disabled}
          className={`w-full py-3 rounded-lg font-bold transition-colors disabled:opacity-50 ${disabled ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {disabled ? 'Read Only Mode' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
