'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Settings, Download, XCircle, LifeBuoy } from 'lucide-react' // Removed LogOut, Store, User
import { useRouter } from 'next/navigation'
import { SUPABASE_URL, SUPABASE_KEY } from '../../config'
import { useSubscription } from '../SubscriptionContext'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function SettingsPage() {
  // Removed storeName, address, phone states as they are in ProfileDropdown
  const [currency, setCurrency] = useState('GH₵')
  const [taxRate, setTaxRate] = useState(0)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)
  // Removed userEmail and preferredName as they are handled in ProfileDropdown and Header

  const router = useRouter()
  const { isExpired } = useSubscription()

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('currency_symbol, tax_rate, low_stock_threshold')
        .eq('id', user.id)
        .single();

      if (data) {
        setCurrency(data.currency_symbol || 'GH₵');
        setTaxRate(data.tax_rate || 0);
        setLowStockThreshold(data.low_stock_threshold || 5);
      }
    }
    loadSettings();
  }, [])

  const handleSaveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Save to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          currency_symbol: currency,
          tax_rate: isNaN(taxRate) ? 0 : taxRate,
          low_stock_threshold: isNaN(lowStockThreshold) ? 5 : lowStockThreshold
        })
        .eq('id', user.id);

      if (error) throw error;
      
      alert('App Preferences Saved to Cloud!')
    } catch (error: any) {
      console.error("Error saving settings:", error.message);
      alert("Failed to save settings: " + error.message);
    }
  }

  // Removed handleLogout as it is in ProfileDropdown

  // Placeholder functions for data management
  const handleExportData = async () => { // Made async
    if (!window.confirm('Exporting all data (Products and Sales) as CSV. Continue?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch Products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, price, stock_quantity')
        .eq('user_id', user.id);
      if (productsError) throw productsError;

      // Fetch Sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, product_id, product_name, quantity, total_price, sale_date')
        .eq('user_id', user.id);
      if (salesError) throw salesError;

      // Helper to convert array of objects to CSV string
      const convertToCsv = (data: any[], filename: string) => {
        if (data.length === 0) return null;

        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(','),
          ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName])).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      // Export Products
      if (productsData && productsData.length > 0) {
        convertToCsv(productsData, 'products_export.csv');
      } else {
        alert('No product data to export.');
      }

      // Export Sales
      if (salesData && salesData.length > 0) {
        convertToCsv(salesData, 'sales_export.csv');
      } else {
        alert('No sales data to export.');
      }

      alert('Data export successful!');

    } catch (error: any) {
      console.error('Error during data export:', error.message);
      alert('Failed to export data: ' + error.message);
    }
  }

  const handleClearSales = async () => {
    if (!window.confirm('Are you sure you want to delete ALL sales history? This cannot be undone.')) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('sales').delete().eq('user_id', user.id);
      if (error) throw error;
      alert('Sales history cleared successfully.');
      window.location.reload();
    } catch (error: any) {
      console.error('Error clearing sales:', error.message);
      alert('Failed to clear sales: ' + error.message);
    }
  }

  const handleFactoryReset = async () => { // Made async
    if (!window.confirm('WARNING: This will delete ALL products and sales data permanently! This action cannot be undone. Are you absolutely sure?')) {
      return;
    }
    if (!window.confirm('FINAL CONFIRMATION: Seriously, all data will be lost. Proceed with Factory Reset?')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Delete all products
      const { error: productsError } = await supabase.from('products').delete().eq('user_id', user.id); 
      if (productsError) throw productsError;

      // Delete all sales
      const { error: salesError } = await supabase.from('sales').delete().eq('user_id', user.id); 
      if (salesError) throw salesError;

      // Clear local storage settings
      localStorage.removeItem('appSettings');
      localStorage.removeItem('preferredName');

      alert('Factory Reset successful! All data has been deleted.');
      router.push('/'); // Redirect to landing page after reset

    } catch (error: any) {
      console.error('Error during Factory Reset:', error.message);
      alert('Factory Reset failed: ' + error.message + '. Check console for details.');
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>
        
        {/* App Preferences */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings className="text-green-500" size={20} /> App Preferences</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
              <input type="text" id="currency" className="w-full border p-2 rounded-lg placeholder-slate-400 text-slate-900" value={currency} onChange={e => setCurrency(e.target.value)} placeholder="e.g. GH₵, $" />
            </div>
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
              <input 
                type="number" 
                id="taxRate" 
                className="w-full border p-2 rounded-lg placeholder-slate-400 text-slate-900" 
                value={isNaN(taxRate) ? '' : taxRate} 
                onChange={e => setTaxRate(parseFloat(e.target.value))} 
                min="0" 
                max="100" 
                step="0.01" 
              />
            </div>
            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
              <input 
                type="number" 
                id="lowStockThreshold" 
                className="w-full border p-2 rounded-lg placeholder-slate-400 text-slate-900" 
                value={isNaN(lowStockThreshold) ? '' : lowStockThreshold} 
                onChange={e => setLowStockThreshold(parseInt(e.target.value))} 
                min="0" 
              />
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={isExpired}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${isExpired ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              Save App Preferences
            </button>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Data Management */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Download className="text-orange-500" size={20} /> Data Management</h2>
          <div className="space-y-4">
            <button onClick={handleExportData} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
              <Download size={20} /> Export All Data
            </button>
            <button 
                onClick={handleClearSales} 
                disabled={isExpired}
                className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${isExpired ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
            >
              <XCircle size={20} /> Clear Sales History Only
            </button>
            <button 
                onClick={handleFactoryReset} 
                disabled={isExpired}
                className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${isExpired ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            >
              <XCircle size={20} /> Factory Reset (Delete Everything)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
