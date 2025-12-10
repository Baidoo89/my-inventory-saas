import { Printer, MessageCircle } from 'lucide-react';

type SalesTableProps = {
  salesHistory: any[];
  currencySymbol: string;
  onPrintReceipt: (sale: any) => void;
  onWhatsAppReceipt: (sale: any) => void;
};

export default function SalesTable({ salesHistory, currencySymbol, onPrintReceipt, onWhatsAppReceipt }: SalesTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4 text-right">Qty</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesHistory.map((sale: any) => (
              <tr key={sale.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-500 text-sm">{new Date(sale.sale_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-slate-700 text-sm font-mono">#{sale.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{sale.product_name}</td>
                <td className="px-6 py-4 text-right text-slate-800">{sale.quantity}</td>
                <td className="px-6 py-4 text-slate-700 text-sm">{sale.payment_method || 'Cash'}</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600">+{currencySymbol}{Number(sale.total_price).toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Completed 
                  </span>
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  <button 
                    onClick={() => onPrintReceipt(sale)}
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                    title="Print Receipt"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => onWhatsAppReceipt(sale)}
                    className="p-2 text-slate-400 hover:text-green-600 rounded-lg transition-colors"
                    title="Send via WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
