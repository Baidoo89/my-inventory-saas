'use client'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Smartphone, Globe, ShieldCheck, Menu, X, BarChart3, TrendingUp, Package, Users, Zap, Star, HelpCircle, ChevronDown, ChevronUp, DollarSign, AlertTriangle, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Logo } from './components/Logo'

// Mock Data for the Landing Page Chart
const chartData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
]

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. NAVBAR */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="group cursor-pointer">
              <Logo size={40} className="group-hover:scale-105 transition-transform duration-300" />
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Log In</Link>
                <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0">
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 hover:text-slate-900 p-2">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-6 space-y-6 shadow-2xl absolute w-full animate-in slide-in-from-top-5">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-slate-600">Features</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-slate-600">How it Works</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-slate-600">Pricing</a>
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <Link href="/login" className="block w-full text-center text-slate-600 font-bold py-3">Log In</Link>
              <Link href="/login" className="block w-full text-center bg-indigo-600 text-white px-5 py-4 rounded-xl font-bold shadow-lg">
                Get Started Now
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          
          {/* Floating Elements (Decorative) */}
          <div className="absolute top-0 left-10 animate-bounce duration-[3000ms] hidden lg:block">
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 transform -rotate-6">
              <BarChart3 className="text-emerald-500" size={32} />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-700 text-xs font-bold uppercase tracking-wide mb-8 hover:border-indigo-300 transition-colors cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                The #1 Inventory App for Ghana 🇬🇭
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
                Master your inventory. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 animate-gradient-x">Grow your flow.</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
                StockFlow helps you track sales, manage stock, and catch theft instantly. 
                <span className="text-slate-900 font-semibold"> Works offline</span> and on any device.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 mb-12">
                <Link href="/login" className="group inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-1">
                  Start Using for Free 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#demo" className="inline-flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-sm hover:shadow-md">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-slate-600 border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                  Watch Demo
                </a>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 z-${10-i}`}>
                      {i === 4 ? '+' : ''}
                    </div>
                  ))}
                </div>
                <p>Trusted by 500+ businesses</p>
              </div>
            </div>

            {/* Right Column: Dashboard Mockup */}
            <div className="relative perspective-1000 group">
              {/* Decorative background blobs */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

              {/* Browser Window Mockup */}
              <div className="relative bg-slate-50 rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden transform rotate-y-[-12deg] rotate-x-[5deg] group-hover:rotate-0 transition-transform duration-1000 ease-out ring-1 ring-slate-900/5 scale-90 lg:scale-100 origin-center">
                {/* Browser Header */}
                <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg text-xs text-slate-500 flex items-center gap-2 w-full max-w-[200px] justify-center font-mono shadow-inner">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      stockflow.app
                    </div>
                  </div>
                </div>

                {/* Dashboard Content Mockup - Compact for Split View */}
                <div className="flex h-[450px] bg-slate-50 overflow-hidden">
                  {/* Sidebar (Icons only for compact view) */}
                  <div className="hidden sm:flex w-16 flex-col bg-white border-r border-slate-200 py-4 items-center space-y-6">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <TrendingUp className="text-white" size={16} />
                    </div>
                    <div className="space-y-4 w-full flex flex-col items-center">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BarChart3 size={20} /></div>
                      <div className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Package size={20} /></div>
                      <div className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Users size={20} /></div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Overview</h2>
                      </div>
                      <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-indigo-200">New Sale</button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-xs font-medium mb-1">Revenue</p>
                        <h3 className="text-xl font-bold text-slate-900">GH₵ 24k</h3>
                        <div className="text-[10px] text-emerald-600 font-bold mt-1">+12%</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-xs font-medium mb-1">Sales</p>
                        <h3 className="text-xl font-bold text-slate-900">1,234</h3>
                        <div className="text-[10px] text-blue-600 font-bold mt-1">+5%</div>
                      </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
                      <h3 className="text-sm font-bold text-slate-900 mb-2">Weekly Sales</h3>
                      <div className="flex-1 w-full min-h-0">
                        {mounted ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" hide />
                              <YAxis hide />
                              <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                              <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fill="url(#colorSales)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Trusted by 500+ businesses across Ghana</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Kofi Electronics', 'Mama Tessy Styles', 'Accra Pharmacy', 'Kumasi Mart', 'Tamale Provisions'].map((name, i) => (
              <div key={i} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Everything you need to run your shop</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Built specifically for the unique challenges of Ghanaian businesses. No complex setup required.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-300 border border-slate-100 hover:border-indigo-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Works Offline</h3>
              <p className="text-slate-600 leading-relaxed">Internet cut? No problem. Keep selling. StockFlow saves everything locally and syncs automatically when data comes back.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-300 border border-slate-100 hover:border-indigo-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Analytics</h3>
              <p className="text-slate-600 leading-relaxed">See exactly how much profit you made today. Track your best selling items and know exactly when to restock.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-300 border border-slate-100 hover:border-indigo-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Theft Protection</h3>
              <p className="text-slate-600 leading-relaxed">Track every single item. If stock goes missing, you&apos;ll know exactly when it happened and who was on shift.</p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-300 border border-slate-100 hover:border-indigo-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Receipts</h3>
              <p className="text-slate-600 leading-relaxed">Save money on paper. Send professional digital receipts directly to your customer&apos;s WhatsApp instantly.</p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-300 border border-slate-100 hover:border-indigo-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Bell size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Low Stock Alerts</h3>
              <p className="text-slate-600 leading-relaxed">Never run out of best-sellers. Get notified automatically when items are running low so you can restock in time.</p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-300 border border-slate-100 hover:border-indigo-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Customer Management</h3>
              <p className="text-slate-600 leading-relaxed">Keep track of your loyal customers. See their purchase history and manage who owes you money easily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Get started in 3 minutes</h2>
            <p className="text-slate-400 text-lg">No technical skills needed. If you can use WhatsApp, you can use StockFlow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 border-t border-dashed border-slate-600"></div>

            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free. No credit card required.' },
              { step: '02', title: 'Add Products', desc: 'Scan barcodes or type product names.' },
              { step: '03', title: 'Start Selling', desc: 'Record sales and track profits instantly.' }
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center text-3xl font-bold text-indigo-400 mb-6 shadow-xl z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 bg-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Don&apos;t just take our word for it</h2>
            <p className="text-lg text-slate-600">See what other business owners are saying.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Mensah', role: 'Owner, Sarah\'s Boutique', text: 'Since I started using StockFlow, I stopped losing money. I can check my sales from home!' },
              { name: 'Kwame Osei', role: 'Manager, Osei Pharmacy', text: 'The offline mode is a lifesaver. Even when the network is bad, we can still sell to customers.' },
              { name: 'Emmanuel K.', role: 'CEO, Tech Hub', text: 'Best inventory app in Ghana. Simple, fast, and the support team is very helpful.' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 text-lg italic">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING SECTION */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 text-lg">Start for free, upgrade as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl relative group">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-slate-900 mb-6">Free</div>
              <p className="text-slate-500 mb-8 text-sm">Perfect for small shops just getting started.</p>
              <ul className="space-y-4 mb-8 text-slate-600">
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /> Up to 50 Products</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /> Basic Sales Tracking</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /> 1 User Account</li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-center transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-indigo-600 p-8 rounded-3xl border border-indigo-500 shadow-2xl transform md:-translate-y-6 relative z-10">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl uppercase tracking-wider">Most Popular</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro Shop</h3>
              <div className="text-5xl font-bold text-white mb-6">GH₵ 50<span className="text-lg font-normal text-indigo-200">/mo</span></div>
              <p className="text-indigo-100 mb-8 text-sm">For growing businesses that need more power.</p>
              <ul className="space-y-4 mb-8 text-indigo-50">
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-white" /> Unlimited Products</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-white" /> Advanced Analytics</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-white" /> WhatsApp Receipts</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-white" /> Priority Support</li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-xl bg-white text-indigo-600 font-bold text-center hover:bg-indigo-50 transition-colors shadow-lg">
                Get Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-slate-900 mb-6">GH₵ 150<span className="text-lg font-normal text-slate-400">/mo</span></div>
              <p className="text-slate-500 mb-8 text-sm">For large stores with multiple branches.</p>
              <ul className="space-y-4 mb-8 text-slate-600">
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /> Multi-Branch Support</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-500" /> Custom Features</li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-center transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Do I need internet to use StockFlow?', a: 'No! StockFlow works completely offline. You can make sales and manage inventory without data. It will automatically sync when you connect to the internet later.' },
              { q: 'Can I use it on my phone?', a: 'Yes, StockFlow is designed to work perfectly on any smartphone, tablet, or laptop.' },
              { q: 'Is my data safe?', a: 'Absolutely. We use bank-level encryption to keep your sales data and customer information secure.' },
              { q: 'Can I print receipts?', a: 'Yes, you can connect to a thermal printer via Bluetooth, or simply send digital receipts via WhatsApp to save money on paper.' }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-lg">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">Ready to grow your business?</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">Join hundreds of shop owners who are saving time and making more money with StockFlow.</p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-1">
            Start Your Free Trial <ArrowRight size={24} />
          </Link>
          <p className="mt-6 text-indigo-200 text-sm">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
                <Logo size={32} textClassName="text-white" />
              </div>
              <p className="text-slate-400 max-w-xs leading-relaxed">
                The #1 inventory management solution for Ghanaian businesses. Simple, powerful, and reliable.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="https://youtube.com/@techdalt89?si=C85o-IXP3XfBT5g0" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">About Developer</a></li>
                <li><a href="mailto:baido.dalt89@gmail.com" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © 2025 StockFlow Ghana. Built by <span className="text-white font-bold">TeCH Dalt89</span>.
            </div>
            <div className="flex gap-6 text-sm">
               <a href="mailto:baido.dalt89@gmail.com" className="hover:text-white transition-colors">Contact Developer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}