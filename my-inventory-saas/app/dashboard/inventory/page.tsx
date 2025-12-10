'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, X, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL, SUPABASE_KEY } from '../../config'
import InventoryTable from './components/InventoryTable'
import { useSubscription } from '../SubscriptionContext'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const TableSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
    <div className="w-full h-96 bg-slate-50 animate-pulse"></div>
  </div>
)

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productForm, setProductForm] = useState<any>({ id: null, name: '', sku: '', price: '', stock_quantity: '' })
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [currencySymbol, setCurrencySymbol] = useState('GH₵'); // NEW: State for currency symbol
  const [storeName, setStoreName] = useState('Inventory'); // NEW: State for store name
  const [searchTerm, setSearchTerm] = useState(''); // NEW: Search state
  const router = useRouter();
  const { isExpired } = useSubscription();

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch Profile Settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('low_stock_threshold, currency_symbol, store_name')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.low_stock_threshold !== null && profile.low_stock_threshold !== undefined) {
        setLowStockThreshold(profile.low_stock_threshold);
      }
      if (profile.currency_symbol) setCurrencySymbol(profile.currency_symbol);
      if (profile.store_name) setStoreName(profile.store_name);
    }

    let query = supabase.from('products').select('*').eq('user_id', user.id).order('id', { ascending: false })
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching products:', error.message);
      alert('Error fetching products: ' + error.message);
    }
    // Client-side filter backup
    setProducts((data || []).filter(item => item.user_id === user.id))
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  async function handleDelete(id: number) {
    if (!confirm('Delete product?')) return

    const { count: salesCount, error: countError } = await supabase
      .from('sales')
      .select('id', { count: 'exact' })
      .eq('product_id', id);

    if (countError) {
      console.error('Error checking sales count:', countError.message);
      alert('Failed to check sales history. Cannot delete product.');
      return;
    }

    if (salesCount && salesCount > 0) {
      alert('This product cannot be deleted because it has existing sales records. Archive it instead if you no longer wish to sell it.');
      return;
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error('Error deleting product:', error.message);
      alert('Error deleting product: ' + error.message);
    } else {
      fetchData()
    }
  }

  function handleEdit(item: any) {
    setProductForm({ id: item.id, name: item.name, sku: item.sku, price: item.price, stock_quantity: item.stock_quantity })
    setIsProductModalOpen(true)
  }

  async function handleProductSubmit(e: any) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to add products");
      return;
    }

    const payload = { 
      user_id: user.id,
      name: productForm.name, 
      sku: productForm.sku, 
      price: parseFloat(productForm.price), 
      stock_quantity: parseInt(productForm.stock_quantity) 
    }
    
    if (productForm.id) {
      // Remove user_id from update payload to avoid overwriting ownership
      const { user_id, ...updatePayload } = payload;
      const { error } = await supabase.from('products').update(updatePayload).eq('id', productForm.id)
      if (error) {
        console.error('Error updating product:', error.message);
        alert('Error updating product: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('products').insert([payload])
      if (error) {
        console.error('Error adding product:', error.message);
        alert('Error adding product: ' + error.message);
      }
    }
    setIsProductModalOpen(false)
    fetchData()
  }

  const handleAddProductClick = () => {
    if (isExpired) return;
    setProductForm({ id: null, name: '', sku: '', price: '', stock_quantity: '' })
    setIsProductModalOpen(true)
  }

  const openSaleModal = (product: any) => {
    const timestamp = Date.now();
    router.push(`/dashboard/pos?productId=${product.id}&productName=${product.name}&price=${product.price}&stock=${product.stock_quantity}&ts=${timestamp}`);
  };

  return (
    <div className="w-full"> 
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{storeName === 'Inventory' ? 'Inventory' : `${storeName} Inventory`}</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 text-slate-900 placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                disabled={isExpired}
                onClick={handleAddProductClick} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap ${isExpired ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
            <Plus size={20} /> Add Product
            </button>
        </div>
      </div>
      {loading ? <TableSkeleton /> : <InventoryTable products={products} onEdit={handleEdit} onDelete={handleDelete} onSell={openSaleModal} lowStockThreshold={lowStockThreshold} currencySymbol={currencySymbol} isReadOnly={isExpired} />}

      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                  {productForm.id ? "Edit Product" : "New Product"}
              </h2>
              <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input
                  required
                  placeholder="e.g. Wireless Mouse"
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900"
                  value={productForm.name}
                  onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                  }
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input
                  required
                  placeholder="e.g. WM-001"
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900"
                  value={productForm.sku}
                  onChange={(e) =>
                      setProductForm({ ...productForm, sku: e.target.value })
                  }
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                      <input
                          required
                          type="number"
                          placeholder="0.00"
                          className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900"
                          value={productForm.price}
                          onChange={(e) =>
                          setProductForm({ ...productForm, price: e.target.value })
                          }
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                      <input
                          required
                          type="number"
                          placeholder="0"
                          className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900"
                          value={productForm.stock_quantity}
                          onChange={(e) =>
                          setProductForm({
                              ...productForm,
                              stock_quantity: e.target.value,
                          })
                          }
                      />
                  </div>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors mt-2">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
