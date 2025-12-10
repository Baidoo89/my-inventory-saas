"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  X,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  ShoppingCart,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { cacheProducts, getCachedProducts } from '../utils/offline';

// --- Supabase client ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Components (StatCard, SalesChart, Skeletons remain the same) ---
const StatCard = ({
  type,
  label,
  value,
  currency,
}: {
  type: string;
  label: string;
  value: number;
  currency?: string;
}) => {
  let Icon = Package;
  let colorClass = "bg-blue-100 text-blue-600";

  if (type === "revenue") {
    Icon = DollarSign;
    colorClass = "bg-green-100 text-green-600";
  } else if (type === "lowStock") {
    Icon = AlertTriangle;
    colorClass = "bg-red-100 text-red-600";
  } else if (type === "stockValue") {
    Icon = TrendingUp;
    colorClass = "bg-purple-100 text-purple-600";
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">
          {currency}
          {value.toLocaleString()}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

const SalesChart = ({ data, currencySymbol }: { data: any[], currencySymbol: string }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-72 w-full bg-slate-50 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Sales Overview</h3>
        <p className="text-slate-500 text-sm">Revenue for the last 7 days</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value) => `${currencySymbol}${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${currencySymbol}${value}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse flex justify-between items-center">
    <div className="w-full">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
    </div>
    <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
  </div>
);

const SalesChartSkeleton = () => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
    <div className="h-72 bg-slate-200 rounded"></div>
  </div>
);

// --- Main Dashboard Component ---

export default function Dashboard() {
  // Data States
  const [products, setProducts] = useState<any[]>([]); // Displayed products (Top 50 or Search Results)
  const [allProductsForStats, setAllProductsForStats] = useState<any[]>([]); // All products (lightweight) for stats
  const [sales, setSales] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, stockValue: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('GH₵');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [storeName, setStoreName] = useState('Dashboard');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // Forms
  const [productForm, setProductForm] = useState<any>({
    id: null,
    name: "",
    sku: "",
    price: "",
    stock_quantity: "",
  });
  const [saleForm, setSaleForm] = useState<any>({
    product_id: null,
    product_name: "",
    price_per_unit: 0,
    quantity: 1,
    payment_method: 'Cash',
  });

  // Helper to calculate stats from raw data
  const calculateStats = (pData: any[], sData: any[], threshold: number) => {
    // 1. Calculate Totals
    const totalRevenue = sData.reduce(
      (sum, sale) => sum + Number(sale.total_price),
      0
    );
    const totalStockValue = pData.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.stock_quantity),
      0
    );
    const lowStockCount = pData.filter((item) => item.stock_quantity < threshold).length;

    // 2. Prepare Chart Data (Group Sales by Date)
    const salesByDate: any = {};
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        salesByDate[key] = 0;
    }

    sData.forEach((sale) => {
      const date = new Date(sale.sale_date).toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (salesByDate[date] !== undefined) {
          salesByDate[date] += Number(sale.total_price);
      }
    });

    const chartArray = Object.keys(salesByDate).map((key) => ({
      name: key,
      sales: salesByDate[key],
    }));

    setStats({
      revenue: totalRevenue,
      stockValue: totalStockValue,
      lowStock: lowStockCount,
    });
    setChartData(chartArray);
  };

  // Fetch data from Supabase
  async function fetchData() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return; 
      }

      // Fetch Profile Settings (Threshold, Currency, Store Name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('low_stock_threshold, currency_symbol, store_name')
        .eq('id', user.id)
        .single();

      let currentThreshold = 5;
      if (profile) {
        // Ensure we handle null or undefined values safely
        if (profile.low_stock_threshold !== null && profile.low_stock_threshold !== undefined) {
          currentThreshold = profile.low_stock_threshold;
        }
        setLowStockThreshold(currentThreshold);
        
        if (profile.currency_symbol) setCurrencySymbol(profile.currency_symbol);
        if (profile.store_name) setStoreName(profile.store_name);
      }

      const [displayProductsResult, statsProductsResult, salesResult] = await Promise.all([
        // 1. Fetch Display Products (Limit 50)
        supabase
          .from("products")
          .select("id, name, sku, price, stock_quantity, user_id")
          .eq('user_id', user.id) // Filter by user
          .order("id", { ascending: false })
          .limit(50),
        
        // 2. Fetch All Products (Lightweight) for Stats
        supabase
          .from("products")
          .select("price, stock_quantity, user_id")
          .eq('user_id', user.id), // Filter by user

        // 3. Fetch Sales (Last 30 days ideally, but keeping simple for now)
        supabase
          .from("sales")
          .select("total_price, sale_date, user_id")
          .eq('user_id', user.id) // Filter by user
          .order("sale_date", { ascending: false })
      ]);

      // Double-check filtering on client side (Defense in Depth)
      const displayData = (displayProductsResult.data || []).filter(item => item.user_id === user.id);
      const statsData = (statsProductsResult.data || []).filter(item => item.user_id === user.id);
      const salesData = (salesResult.data || []).filter(item => item.user_id === user.id);

      if (displayData.length > 0) {
        cacheProducts(displayData);
      }

      setProducts(displayData);
      setAllProductsForStats(statsData);
      setSales(salesData);

      // Calculate stats immediately with fresh data
      calculateStats(statsData, salesData, currentThreshold);

    } catch (error: any) {
      console.error("Error:", error.message);
      // Offline fallback for products
      const cached = getCachedProducts();
      if (cached.length > 0) {
          setProducts(cached);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Recalculate Stats only when threshold changes (using stored allProducts)
  useEffect(() => {
    if (allProductsForStats.length > 0) {
      calculateStats(allProductsForStats, sales, lowStockThreshold);
    }
  }, [lowStockThreshold]); 

  // --- Handlers ---
  
  const [searchTerm, setSearchTerm] = useState('');

  // Search Effect - Only updates `products` list, preserves `stats`
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('products')
          .select('id, name, sku, price, stock_quantity, user_id')
          .eq('user_id', user.id)
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
          .limit(50);
        
        if (data) {
          // Client-side filter backup
          setProducts(data.filter(item => item.user_id === user.id));
        }
      } else {
        // If search cleared, reload top 50 but don't need to refetch everything if we cached it, 
        // but for simplicity calling fetchData to ensure sync is fine, or just re-fetch top 50.
        // Calling fetchData is safer to ensure sync.
        fetchData(); 
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  async function handleDelete(id: number) {
    if (!confirm("Delete product?")) return;

    const { count: salesCount, error: countError } = await supabase
      .from("sales")
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
      fetchData();
    }
  }

  function handleEdit(item: any) {
    setProductForm({
      id: item.id,
      name: item.name,
      sku: item.sku,
      price: item.price,
      stock_quantity: item.stock_quantity,
    });
    setIsProductModalOpen(true);
  }

  function openSaleModal(item: any) {
    setSaleForm({
      product_id: item.id,
      product_name: item.name,
      price_per_unit: item.price,
      quantity: 1,
      payment_method: 'Cash',
    });
    setIsSaleModalOpen(true);
  }

  async function handleSaleSubmit(e: any) {
    e.preventDefault();
    const qty = parseInt(saleForm.quantity);
    const total = qty * saleForm.price_per_unit;
    
    try {
      // 1. Validate Stock Availability First (Fetch fresh stock)
      const { data: freshProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', saleForm.product_id)
        .single();
        
      if (fetchError) throw fetchError;
      if (!freshProduct) throw new Error("Product not found");

      if (freshProduct.stock_quantity < qty) {
        alert(`Insufficient stock! Only ${freshProduct.stock_quantity} units of "${freshProduct.name}" available.`);
        return;
      }

      // 2. Insert Sale
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: saleError } = await supabase
        .from("sales")
        .insert([
          {  
            user_id: user.id,
            product_id: saleForm.product_id, 
            product_name: saleForm.product_name, 
            quantity: qty, 
            total_price: total, 
            payment_method: saleForm.payment_method 
          },
        ]);
      
      if (saleError) throw saleError;

      // 3. Update Product Stock
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock_quantity: freshProduct.stock_quantity - qty })
        .eq("id", saleForm.product_id);
          
      if (updateError) throw updateError;
          
      setIsSaleModalOpen(false);
      fetchData(); // Refresh all data to update stats and list
      alert("Sale recorded successfully!");
    } catch (error: any) {
      console.error("Error processing sale:", error.message);
      alert("Failed to process sale: " + error.message);
    }
  }

  async function handleProductSubmit(e: any) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to add products");
      return;
    }

    try {
      // Check Subscription Limit for New Products
      if (!productForm.id) {
        /* SUBSCRIPTION DISABLED FOR NOW
        // 1. Get User Plan and Creation Date
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, created_at')
          .eq('id', user.id)
          .single();
        
        const plan = profile?.subscription_plan || 'Starter';
        const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
        const now = new Date();
        const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
        const isTrialActive = daysSinceCreation <= 14;

        // 2. Check Trial Status
        if (plan === 'Starter' && !isTrialActive) {
            alert("Your 14-day free trial has ended. Please upgrade to Pro to continue adding products.");
            return;
        }
        */
      }

      const payload = {
        user_id: user.id,
        name: productForm.name,
        sku: productForm.sku,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity),
      };
    
      let error;
      if (productForm.id) {
        // Remove user_id from update payload if you don't want to overwrite ownership (optional but safer)
        const { user_id, ...updatePayload } = payload;
        const { error: updateError } = await supabase.from("products").update(updatePayload).eq("id", productForm.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("products").insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      setIsProductModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving product:", error.message);
      alert("Failed to save product: " + error.message);
    }
  }

  function openNewProductModal() {
    setProductForm({
      id: null,
      name: "",
      sku: "",
      price: "",
      stock_quantity: "",
    });
    setIsProductModalOpen(true);
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">{storeName}</h1>
                <p className="text-slate-500 mt-1">Manage your inventory and track sales</p>
            </div>
            <button 
                onClick={openNewProductModal}
                className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm active:scale-95 transform"
            >
                <Plus size={20} />
                Add Product
            </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <SalesChartSkeleton />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Low Stock Alert Banner */}
            {stats.lowStock > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600 flex-shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">Low Stock Warning</h4>
                  <p className="text-sm text-amber-800">
                    You have <span className="font-bold">{stats.lowStock}</span> products running low (below {lowStockThreshold}). 
                    <a href="/dashboard/inventory" className="underline ml-1 font-medium hover:text-amber-900">Check inventory</a> to restock.
                  </p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                type="revenue"
                label="Total Revenue"
                value={stats.revenue}
                currency={currencySymbol}
              />
              <StatCard
                type="stockValue"
                label="Inventory Value"
                value={stats.stockValue}
                currency={currencySymbol}
              />
              <StatCard
                type="lowStock"
                label="Low Stock Alerts"
                value={stats.lowStock}
                currency=""
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Chart */}
                <div className="lg:col-span-2">
                    <SalesChart data={chartData} currencySymbol={currencySymbol} />
                </div>

                {/* Right Column: Quick Inventory List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
                        <div className="p-6 border-b border-slate-100 bg-white sticky top-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Inventory</h3>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="overflow-y-auto p-2">
                            {products.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">No products found</div>
                            ) : (
                                products.map((item) => (
                                    <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Stock: <span className={`${item.stock_quantity < (lowStockThreshold || 5) ? 'text-red-500 font-bold' : ''}`}>{item.stock_quantity}</span> | SKU: {item.sku}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openSaleModal(item)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-md" 
                                                title="Sell"
                                            >
                                                <ShoppingCart size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md" 
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md" 
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                          <a href="/dashboard/inventory" className="text-sm text-indigo-600 font-medium hover:underline">
                            View All Inventory &rarr;
                          </a>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        )}

        {/* Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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

        {/* Sales Modal */}
        {isSaleModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Record Sale</h2>
                    <button 
                        onClick={() => setIsSaleModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                        <p className="text-sm text-slate-500">Product</p>
                        <p className="font-bold text-slate-800 text-lg">{saleForm.product_name}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-indigo-600 font-medium">
                              {currencySymbol}{saleForm.price_per_unit} per unit
                          </p>
                          <p className="text-xs text-slate-500">
                            Current Stock: <span className="font-bold text-slate-700">{products.find(p => p.id === saleForm.product_id)?.stock_quantity || '...'}</span>
                          </p>
                        </div>
                    </div>

                    <form onSubmit={handleSaleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Sold</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center text-xl font-bold"
                                value={saleForm.quantity}
                                onChange={(e) =>
                                    setSaleForm({ ...saleForm, quantity: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Cash', 'Momo', 'Card'].map((method) => (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => setSaleForm({ ...saleForm, payment_method: method })}
                                  className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${
                                    saleForm.payment_method === method
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                                  }`}
                                >
                                  {method}
                                </button>
                              ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center py-4 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Total:</span>
                            <span className="text-2xl font-bold text-slate-800">
                                {currencySymbol}{(saleForm.quantity * saleForm.price_per_unit).toFixed(2)}
                            </span>
                        </div>

                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
                            Confirm Sale
                        </button>
                    </form>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}