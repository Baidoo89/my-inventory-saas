import { ShoppingCart, Pencil, Trash2 } from 'lucide-react';

type InventoryTableProps = {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
  onSell: (product: any) => void;
  lowStockThreshold: number;
  currencySymbol: string;
  isReadOnly?: boolean;
};

export default function InventoryTable({ products, onEdit, onDelete, onSell, lowStockThreshold, currencySymbol, isReadOnly = false }: InventoryTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4 text-right">Stock</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                <td className="px-6 py-4 text-slate-700 text-sm font-mono">{item.sku}</td> 
                <td className="px-6 py-4 text-right font-medium text-slate-800"> 
                  <span className={`${item.stock_quantity <= lowStockThreshold ? 'text-red-600 font-bold' : ''}`}>{item.stock_quantity}</span> {/* Used lowStockThreshold */} 
                </td>
                <td className="px-6 py-4 text-right font-mono tabular-nums text-slate-800">{currencySymbol}{Number(item.price).toFixed(2)}</td> 
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                        disabled={isReadOnly}
                        onClick={() => !isReadOnly && onSell(item)} 
                        className={`p-2 rounded-lg ${isReadOnly ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                    >
                        <ShoppingCart size={18} />
                    </button>
                    <button 
                        disabled={isReadOnly}
                        onClick={() => !isReadOnly && onEdit(item)} 
                        className={`p-2 rounded-lg ${isReadOnly ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600'}`}
                    >
                        <Pencil size={18} />
                    </button>
                    <button 
                        disabled={isReadOnly}
                        onClick={() => !isReadOnly && onDelete(item.id)} 
                        className={`p-2 rounded-lg ${isReadOnly ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600'}`}
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
