'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from '../../config'
import SalesTable from './components/SalesTable'
import { generateReceipt, generateWhatsAppText } from '../../utils/receipt'
import { printHtml } from '../../utils/print'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const TableSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
    <div className="w-full h-96 bg-slate-50 animate-pulse"></div>
  </div>
)

import { RefreshCw, Search } from 'lucide-react'

export default function TransactionsPage() {
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('') // NEW: Search state
  const [currencySymbol, setCurrencySymbol] = useState('GH₵');
  const [storeSettings, setStoreSettings] = useState({
    name: 'SmartStock',
    address: '',
    phone: '',
    currency: 'GH₵',
    taxRate: 0
  });

  async function fetchSales() {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch Store Settings for Receipts
    const { data: profile } = await supabase
      .from('profiles')
      .select('store_name, address, phone, currency_symbol, tax_rate')
      .eq('id', user.id)
      .single();

    if (profile) {
      setStoreSettings({
        name: profile.store_name || 'SmartStock',
        address: profile.address || '',
        phone: profile.phone || '',
        currency: profile.currency_symbol || 'GH₵',
        taxRate: profile.tax_rate || 0
      });
      setCurrencySymbol(profile.currency_symbol || 'GH₵');
    }

    // Limit to last 500 transactions to prevent performance issues
    let query = supabase
      .from('sales')
      .select('id, sale_date, product_name, quantity, total_price, payment_method, user_id')
      .eq('user_id', user.id) // Filter by user
      .order('sale_date', { ascending: false })
      .limit(500)

    if (searchTerm) {
      query = query.ilike('product_name', `%${searchTerm}%`)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching sales:', error.message);
    } else {
      // Client-side filter backup
      setSalesHistory((data || []).filter(item => item.user_id === user.id))
    }
    setLoading(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSales()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  useEffect(() => {
    // Initial fetch is handled by the searchTerm effect (searchTerm starts as empty string)
    // fetchSales() 
  }, [])

  const handlePrintReceipt = (sale: any) => {
    // Reconstruct receipt item from sale record
    // Note: Since we don't have tax info stored per sale, we estimate or use 0 for historical records if not available.
    // Ideally, tax should be stored in sales table. For now, we'll assume the total price includes tax or tax is 0 for simplicity in this view,
    // or we can calculate it backwards if we assume the current tax rate applies (which might be wrong).
    // Let's display the total as is.
    
    const item = {
      name: sale.product_name,
      quantity: sale.quantity,
      price: sale.total_price / sale.quantity // Derived unit price
    };

    const receiptContent = generateReceipt(
      [item], 
      sale.total_price, // Subtotal (assuming inclusive or ignoring tax separation for historical single item print)
      0, // Tax (set to 0 as we don't have it stored)
      sale.total_price, // Total
      storeSettings,
      new Date(sale.sale_date).toLocaleString()
    );

    printHtml(receiptContent);
  };

  const handleWhatsAppReceipt = (sale: any) => {
    const item = {
      name: sale.product_name,
      quantity: sale.quantity,
      price: sale.total_price / sale.quantity
    };

    const text = generateWhatsAppText(
      [item],
      sale.total_price,
      0,
      sale.total_price,
      storeSettings,
      new Date(sale.sale_date).toLocaleString()
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{storeSettings.name === 'SmartStock' ? 'Transactions' : `${storeSettings.name} Transactions`}</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 text-slate-900 placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
            onClick={fetchSales}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm whitespace-nowrap"
            >
            <RefreshCw size={18} />
            <span>Refresh</span>
            </button>
        </div>
      </div>

      {loading ? <TableSkeleton /> : <SalesTable salesHistory={salesHistory} currencySymbol={currencySymbol} onPrintReceipt={handlePrintReceipt} onWhatsAppReceipt={handleWhatsAppReceipt} />}
    </div>
  )
}
