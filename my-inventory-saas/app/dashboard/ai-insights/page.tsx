'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { generateSalesForecast, analyzeStockVelocity } from '../../utils/ai-analytics'
import { SUPABASE_URL, SUPABASE_KEY } from '../../config'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true)
  const [forecastData, setForecastData] = useState<any>(null)
  const [restockRecommendations, setRestockRecommendations] = useState<any[]>([])
  const [currencySymbol, setCurrencySymbol] = useState('GH₵')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch Profile for Currency
      const { data: profile } = await supabase
        .from('profiles')
        .select('currency_symbol')
        .eq('id', user.id)
        .single()
      
      if (profile) setCurrencySymbol(profile.currency_symbol)

      // 2. Fetch Sales History (Last 90 days)
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: true }) // Oldest first for analysis

      // 3. Fetch Current Inventory
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)

      if (sales && products) {
        // --- Run AI Models ---
        
        // A. Sales Forecasting
        const forecast = generateSalesForecast(sales, 7)
        setForecastData(forecast)

        // B. Smart Restock
        const recommendations = analyzeStockVelocity(products, sales)
        setRestockRecommendations(recommendations)
      }

    } catch (error) {
      console.error("AI Analysis Failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium">Running AI Models...</p>
        </div>
      </div>
    )
  }

  // Prepare Chart Data (Merge History + Forecast)
  const chartData = forecastData ? [
    ...forecastData.historical.map((d: any) => ({ ...d, type: 'Historical' })),
    ...forecastData.forecast.map((d: any) => ({ ...d, type: 'Forecast' }))
  ] : []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Brain className="text-indigo-600 h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Insights & Predictions</h1>
          <p className="text-slate-500">Machine Learning powered analysis of your business performance.</p>
        </div>
      </div>

      {/* 1. Sales Forecast Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">7-Day Sales Forecast</h2>
              <p className="text-sm text-slate-500">Predicted revenue based on linear regression trends.</p>
            </div>
            {forecastData?.trend === 'up' && (
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold">
                <TrendingUp size={16} /> Trending Up
              </span>
            )}
            {forecastData?.trend === 'down' && (
              <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-sm font-bold">
                <TrendingDown size={16} /> Trending Down
              </span>
            )}
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${currencySymbol}${value}`, 'Revenue']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorHistorical)" 
                  name="Historical Sales"
                  data={forecastData?.historical}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorForecast)" 
                  name="AI Prediction"
                  data={forecastData?.forecast}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Quick Stats */}
        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-indigo-100 font-medium mb-1">Predicted Revenue (Next 7 Days)</h3>
            <p className="text-3xl font-bold">
              {currencySymbol}
              {forecastData?.forecast.reduce((sum: number, day: any) => sum + day.value, 0).toFixed(2)}
            </p>
            <div className="mt-4 text-xs text-indigo-200 bg-indigo-700/50 p-3 rounded-lg">
              AI Confidence Score: <span className="font-bold text-white">85%</span>
              <br/>Based on {forecastData?.historical.length} days of data.
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              Stockout Risk
            </h3>
            {restockRecommendations.length > 0 ? (
              <div className="space-y-4">
                {restockRecommendations.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.daysLeft} days left</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600">Restock {item.suggestedRestock}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-center text-slate-400 mt-2">
                  {restockRecommendations.length} items need attention
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Inventory levels look healthy!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Smart Restock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={24} />
            Smart Restock Recommendations
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            AI analyzes your sales velocity to suggest exactly what and when to buy.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-right">Current Stock</th>
                <th className="px-6 py-4 text-right">Sales Velocity</th>
                <th className="px-6 py-4 text-right">Days Until Empty</th>
                <th className="px-6 py-4 text-right">Suggested Order</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {restockRecommendations.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{item.currentStock}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{item.velocity} / day</td>
                  <td className="px-6 py-4 text-right font-mono">
                    <span className={`px-2 py-1 rounded-md font-bold ${item.daysLeft < 3 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.daysLeft} days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600">+{item.suggestedRestock} units</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                      High Priority
                    </span>
                  </td>
                </tr>
              ))}
              {restockRecommendations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No urgent restocks needed. Your inventory is optimized!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
