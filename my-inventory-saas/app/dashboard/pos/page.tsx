'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from '../../config'
import ProductCard from './components/ProductCard'
import CartSidebar from './components/CartSidebar'
import { Search, Plus, CheckCircle, Printer, RefreshCw, MessageCircle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { generateReceipt, generateWhatsAppText } from '../../utils/receipt'
import { printHtml } from '../../utils/print'
import { cacheProducts, getCachedProducts, saveOfflineSale, syncOfflineSales } from '../../utils/offline'
import { useSubscription } from '../SubscriptionContext'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Global set to track processed requests across re-renders (fixes Strict Mode double-add issue)
const processedRequests = new Set<string>();

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock_quantity: number;
};

function PosContent() {
  const router = useRouter();
  const lastProcessedRequest = useRef<string | null>(null);
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [taxRate, setTaxRate] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('GH₵'); // NEW: State for currency symbol
  const [storeName, setStoreName] = useState('StockFlow');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [isOnline, setIsOnline] = useState(true); // Track online status
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default to Cash
  const [lastSale, setLastSale] = useState<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    date: string;
    paymentMethod: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const { isExpired } = useSubscription();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  useEffect(() => {
    fetchProducts()

    // Load settings from Supabase (Cloud)
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('store_name, address, phone, currency_symbol, tax_rate')
        .eq('id', user.id)
        .single();

      if (data) {
        setStoreName(data.store_name || 'StockFlow');
        setStoreAddress(data.address || '');
        setStorePhone(data.phone || '');
        setCurrencySymbol(data.currency_symbol || 'GH₵');
        setTaxRate(data.tax_rate || 0);
      }
    };
    loadSettings();

    // Online/Offline listeners
    const handleOnline = async () => {
      setIsOnline(true);
      const { synced, errors } = await syncOfflineSales();
      if (synced > 0) alert(`Synced ${synced} offline sales to database.`);
      if (errors > 0) alert(`Failed to sync ${errors} sales. Will retry next time.`);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Server-side search
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, price, stock_quantity, user_id')
          .eq('user_id', user.id)
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
          .limit(50);
        
        if (data) {
          setFilteredProducts(data.filter(item => item.user_id === user.id));
        }
      } else {
        // If search is empty, show the initial loaded products (Top 50)
        setFilteredProducts(products);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, products])

  useEffect(() => {
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');
    const price = searchParams.get('price');
    const stock = searchParams.get('stock');
    const ts = searchParams.get('ts');

    if (productId && productName && price && stock && products.length > 0) {
      // Create a unique key for this request
      const requestKey = `${productId}-${ts}`;

      // Check if we've already processed this request in this component instance
      if (lastProcessedRequest.current === requestKey) {
         // Ensure URL is cleared even if we skip processing
         if (searchParams.toString().length > 0) {
             window.history.replaceState(null, '', '/dashboard/pos');
         }
         return;
      }

      // Check global set for Strict Mode double-invocation
      if (ts && processedRequests.has(ts)) {
        if (searchParams.toString().length > 0) {
             window.history.replaceState(null, '', '/dashboard/pos');
        }
        return;
      }

      const productToAdd = products.find(p => p.id === parseInt(productId));
      if (productToAdd) {
        // Mark as processed BEFORE any async operations or state updates
        lastProcessedRequest.current = requestKey;
        if (ts) processedRequests.add(ts);

        const existingCartItem = cart.find(item => item.id === productToAdd.id);
        const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;

        const clearUrl = () => {
           window.history.replaceState(null, '', '/dashboard/pos');
        };

        if (currentQuantity + 1 <= productToAdd.stock_quantity) {
          handleAddToCart(productToAdd);
          clearUrl();
        } else if (productToAdd.stock_quantity === 0) {
          alert(`${productToAdd.name} is out of stock.`);
          clearUrl();
        } else {
          alert(`Cannot add more ${productToAdd.name}. Only ${productToAdd.stock_quantity} in stock.`);
          clearUrl();
        }
      }
    }
  }, [searchParams, products, router]);

  async function fetchProducts() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Limit initial load to 50 for speed
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, stock_quantity, user_id')
        .eq('user_id', user.id)
        .limit(50)
        .order('id', { ascending: false });

      if (error) throw error;
      
      const safeData = (data || []).filter(item => item.user_id === user.id);
      setProducts(safeData)
      setFilteredProducts(safeData) // Initialize filtered list
      cacheProducts(safeData); // Cache for offline use
    } catch (err) {
      console.log('Network error or offline, loading from cache...');
      const cached = getCachedProducts();
      if (cached.length > 0) {
        setProducts(cached);
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        const requestedQuantity = existingItem.quantity + 1; // Increment for existing item
        if (requestedQuantity > product.stock_quantity) {
          alert(`Cannot add more ${product.name}. Only ${product.stock_quantity} in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: requestedQuantity } : item
        )
      } else {
        // For new items, quantity starts at 1
        if (1 > product.stock_quantity) {
          alert(`${product.name} is out of stock.`);
          return prevCart;
        }
        return [
          ...prevCart,
          { ...product, quantity: 1, stock_quantity: product.stock_quantity },
        ]
      }
    })
  }

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const quantityToSet = Math.max(1, Math.min(newQuantity, item.stock_quantity));
          return { ...item, quantity: quantityToSet };
        }
        return item;
      })
    })
  }

  const handleRemoveItem = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add products to checkout.')
      return
    }

    const oversoldItems = cart.filter(item => item.quantity > item.stock_quantity);
    if (oversoldItems.length > 0) {
      alert(
        `Cannot checkout. The following items exceed available stock:\n\n` +
          oversoldItems.map(item => `- ${item.name}: ${item.quantity} requested, ${item.stock_quantity} in stock`).join('\n')
      );
      return;
    }

    if (!window.confirm('Confirm checkout?')) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const saleItems = cart.map((item) => ({
        user_id: user.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        sale_date: new Date().toISOString(),
        payment_method: paymentMethod,
      }))

      const { error: saleError } = await supabase.from('sales').insert(saleItems)
      if (saleError) throw saleError

      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: item.stock_quantity - item.quantity })
          .eq('id', item.id)
        if (stockError) throw stockError
      }

      finalizeSale(saleItems);
      fetchProducts()
    } catch (error: any) {
      // Offline fallback
      if (!navigator.onLine || error.message?.includes('fetch') || error.message?.includes('network')) {
          const saleItems = cart.map((item) => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            sale_date: new Date().toISOString(),
            payment_method: paymentMethod,
          }));
          
          saleItems.forEach(sale => saveOfflineSale(sale));
          
          alert('Offline mode: Sale saved locally. Will sync when online.');
          finalizeSale(saleItems);
      } else {
          console.error('Checkout error:', error.message)
          alert('Checkout failed: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const finalizeSale = (saleItems: any[]) => {
      setLastSale({
        items: [...cart],
        subtotal,
        tax: taxAmount,
        total: grandTotal,
        date: new Date().toLocaleString(),
        paymentMethod: paymentMethod
      });
      setCart([])
  }

  const handlePrintReceipt = () => {
    if (!lastSale) return;
    const storeSettings = {
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      currency: currencySymbol,
      taxRate: taxRate
    };
    const receiptContent = generateReceipt(lastSale.items, lastSale.subtotal, lastSale.tax, lastSale.total, storeSettings, lastSale.date, lastSale.paymentMethod);
    printHtml(receiptContent);
  };

  const handleWhatsAppReceipt = () => {
    if (!lastSale) return;
    const storeSettings = {
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      currency: currencySymbol,
      taxRate: taxRate
    };
    const text = generateWhatsAppText(lastSale.items, lastSale.subtotal, lastSale.tax, lastSale.total, storeSettings, lastSale.date, lastSale.paymentMethod);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleNewSale = () => {
    setLastSale(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Product Grid (Left/Main Area) */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">{storeName === 'StockFlow' ? 'Point of Sale' : `${storeName} POS`}</h1>
        
        {/* Search Bar */}
        <div className="mb-6 flex items-center bg-white p-3 rounded-lg shadow-sm border border-slate-300">
          <Search size={20} className="text-slate-500 mr-3" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="flex-grow border-none outline-none text-slate-900 placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-slate-500 text-center py-10">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                currency={currencySymbol} 
                disabled={isExpired}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar (Right Area) */}
      <div className="w-full md:w-80 flex-shrink-0 bg-slate-100 p-4 md:p-6 border-t md:border-t-0 md:border-l border-slate-200">
        <CartSidebar
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={grandTotal}
          currency={currencySymbol} // Pass currencySymbol
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          disabled={isExpired}
        />
      </div>

      {/* Success Modal */}
      {lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Sale Completed!</h2>
            <p className="text-slate-500 mb-6">
              Total: <span className="font-bold text-slate-800">{currencySymbol}{lastSale.total.toFixed(2)}</span>
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handlePrintReceipt}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <Printer size={20} /> Print Receipt
              </button>
              <button 
                onClick={handleWhatsAppReceipt}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <MessageCircle size={20} /> Send via WhatsApp
              </button>
              <button 
                onClick={handleNewSale}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-colors"
              >
                <RefreshCw size={20} /> Start New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading POS...</div>}>
      <PosContent />
    </Suspense>
  );
}
