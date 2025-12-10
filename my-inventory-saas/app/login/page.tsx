'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL, SUPABASE_KEY } from '../config'
import { Logo } from '../components/Logo'
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, WifiOff, BarChart3, ShieldCheck, Store, Phone, MapPin, User, Play } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

type AuthMode = 'login' | 'signup' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // New Sign Up Fields
  const [preferredName, setPreferredName] = useState('') // Changed to preferredName
  const [storeName, setStoreName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(false) // Splash Screen State
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' })
        setLoading(false)
        return
    }

    if (mode === 'signup') {
        if (phone.replace(/\D/g, '').length < 10) {
            setMessage({ type: 'error', text: 'Please enter a valid phone number (at least 10 digits).' })
            setLoading(false)
            return
        }
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        // Show Splash Screen
        setShowSplash(true);
        setTimeout(() => {
            router.push('/dashboard')
        }, 2500); // 2.5s delay for effect

      } else if (mode === 'signup') {
        // 1. Sign Up User
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) throw authError
        
        if (authData.user) {
            // 2. Save Profile Details
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    preferred_name: preferredName, // Changed column to preferred_name
                    store_name: storeName,
                    phone: phone,
                    address: address,
                    subscription_plan: 'Starter'
                })
            
            if (profileError) {
                console.error("Profile save error:", profileError);
                // Don't block signup success, but warn
            }
        }

        setMode('login')
        setMessage({ type: 'success', text: 'Account created! Please check your email to confirm, then log in.' })
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Password reset link sent! Check your email.' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
      setLoading(false) // Only stop loading on error (keep loading for splash)
    } finally {
      if (mode !== 'login') setLoading(false)
    }
  }

  if (showSplash) {
      return (
          <div className="fixed inset-0 bg-indigo-600 z-50 flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
              <div className="scale-150 mb-8 animate-bounce">
                  <Logo size={80} textClassName="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">StockFlow</h1>
              <p className="text-indigo-200 text-lg font-medium italic">&quot;Master your inventory. Grow your flow.&quot;</p>
              <div className="mt-12">
                  <Loader2 className="w-8 h-8 animate-spin text-white/50" />
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-50"></div>

        {/* Content */}
        <div className="relative z-10">
          <Logo size={48} textClassName="text-white" />
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-8 tracking-tight">Manage your shop from anywhere.</h2>
          
          {/* Demo Video Placeholder */}
          <div className="mb-10 rounded-2xl overflow-hidden border border-indigo-400/30 shadow-2xl bg-indigo-800/50 aspect-video flex items-center justify-center group cursor-pointer hover:bg-indigo-800/70 transition-all relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform border border-white/30">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
                <span className="text-sm font-medium text-indigo-100 tracking-wide uppercase">Watch Demo</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-indigo-500/50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-400/30">
                <WifiOff className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Works Offline</h3>
                <p className="text-indigo-100 leading-relaxed opacity-90">Internet down? No problem. Keep selling and syncing when you&apos;re back online.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-indigo-500/50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-400/30">
                <BarChart3 className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Real-time Analytics</h3>
                <p className="text-indigo-100 leading-relaxed opacity-90">See your daily sales, profits, and top products instantly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-indigo-500/50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-400/30">
                <ShieldCheck className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Secure & Private</h3>
                <p className="text-indigo-100 leading-relaxed opacity-90">Your business data is encrypted and safe. Only you have access.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-indigo-200">
          © 2025 StockFlow Ghana. Built by TeCH Dalt89.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-slate-50 lg:bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex justify-center mb-8">
            <Link href="/" className="hover:scale-105 transition-transform duration-300">
              <Logo size={56} />
            </Link>
          </div>
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create an account'}
              {mode === 'forgot-password' && 'Reset password'}
            </h2>
            <p className="mt-2 text-slate-600">
              {mode === 'login' && 'Enter your details to access your shop.'}
              {mode === 'signup' && 'Start managing your inventory for free.'}
              {mode === 'forgot-password' && 'We\'ll send you a link to reset it.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            
            {/* Sign Up Extra Fields */}
            {mode === 'signup' && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white shadow-sm"
                                placeholder="John Doe"
                                value={preferredName}
                                onChange={(e) => setPreferredName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Shop / Company Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Store className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white shadow-sm"
                                placeholder="My Awesome Shop"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="tel"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white shadow-sm"
                                placeholder="024 123 4567"
                                value={phone}
                                onChange={(e) => {
                                    // Only allow numbers and spaces
                                    const val = e.target.value.replace(/[^0-9\s]/g, '');
                                    setPhone(val);
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address / Location</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white shadow-sm"
                                placeholder="Accra, Ghana"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white shadow-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input (Hidden for Forgot Password) */}
            {mode !== 'forgot-password' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setMessage(null); }}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Link'}
                  {!loading && <ArrowRight size={18} />}
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('signup'); setMessage(null); }} className="font-bold text-indigo-600 hover:text-indigo-500">
                  Sign up for free
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setMessage(null); }} className="font-bold text-indigo-600 hover:text-indigo-500">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}