'use client'

import { ShoppingCart } from 'lucide-react'

type ProductCardProps = {
  product: any; // Ideally, define a more specific product type
  onAddToCart: (product: any) => void;
  currency: string; // Added currency prop
  disabled?: boolean;
};

export default function ProductCard({ product, onAddToCart, currency, disabled }: ProductCardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md transition-shadow duration-200 border border-slate-100 flex flex-col ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}`}
      onClick={() => !disabled && onAddToCart(product)}
    >
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-slate-900 truncate">{product.name}</h3>
        <p className="text-sm text-slate-500">SKU: {product.sku}</p>
        <p className="text-xl font-extrabold text-indigo-600 mt-2">{currency}{Number(product.price).toFixed(2)}</p> {/* Used currency prop */} 
      </div>
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
        <span className="text-sm text-slate-600">Stock: {product.stock_quantity}</span>
        <button 
          disabled={disabled}
          onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onAddToCart(product);
          }}
          className={`p-2 rounded-full transition-colors ${disabled ? 'bg-slate-300 text-slate-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
}
