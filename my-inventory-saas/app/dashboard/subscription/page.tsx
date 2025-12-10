'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Crown, Zap, Shield, Smartphone, CreditCard, Download } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'
import { SUPABASE_URL, SUPABASE_KEY } from '../../config'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// REPLACE THIS WITH YOUR ACTUAL PAYSTACK PUBLIC KEY
const PAYSTACK_PUBLIC_KEY = 'pk_live_94ccc19d06832773d7b02b4be2a1e31162b7fa87'; 

const PaystackButton = dynamic(() => import('./PaystackButton'), { ssr: false })

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [productCount, setProductCount] = useState(0)
  const [currentPlan, setCurrentPlan] = useState('Starter') // Default to Starter
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [expiryDate, setExpiryDate] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [userEmail, setUserEmail] = useState('')

  const onPaystackSuccess = async (reference: any) => {
      // Implementation for whatever you want to do with reference and after success call.
      console.log(reference);
      await upgradeToPro();
  };

  const onPaystackClose = () => {
      // implementation for  whatever you want to do when the Paystack dialog closed.
      console.log('closed')
  }

  useEffect(() => {
    fetchUsageData()
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    if (user.email) setUserEmail(user.email);

    const { data } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_expiry, created_at')
      .eq('id', user.id)
      .single();
    
    if (data) {
      if (data.subscription_plan) {
        // Check if expired
        if (data.subscription_plan === 'Pro Shop' && data.subscription_expiry) {
            const expiry = new Date(data.subscription_expiry);
            const now = new Date();
            if (expiry < now) {
                setCurrentPlan('Starter'); // Expired
            } else {
                setCurrentPlan('Pro Shop');
                setExpiryDate(data.subscription_expiry);
            }
        } else {
            setCurrentPlan(data.subscription_plan);
        }
      }
      
      // Calculate trial days
      const createdAt = data.created_at ? new Date(data.created_at) : new Date();
      const now = new Date();
      const diffTime = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const remaining = 14 - diffDays;
      setTrialDaysLeft(remaining > 0 ? remaining : 0);
    }
  }

  async function fetchUsageData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (!error && count !== null) {
        setProductCount(count)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const upgradeToPro = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate expiry date (30 days from now)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
            subscription_plan: 'Pro Shop',
            subscription_expiry: expiry.toISOString()
        })
        .eq('id', user.id);

      if (error) {
        alert('Payment successful but failed to update plan. Please contact support: ' + error.message);
      } else {
        setCurrentPlan('Pro Shop');
        setExpiryDate(expiry.toISOString());
        alert(`Payment Successful! You have been upgraded to Pro Shop until ${expiry.toLocaleDateString()}.`);
        window.location.reload();
      }
  };

  const isPro = currentPlan === 'Pro Shop' || currentPlan === 'Enterprise'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription & Billing</h1>
        <p className="text-slate-500 mt-1">Manage your plan, billing details, and invoices.</p>
      </div>

      {/* Current Plan Overview */}
      <div className="w-full">
        {/* Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Crown size={120} className="text-indigo-600" />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Current Plan</span>
              {isPro && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">ACTIVE</span>}
              {!isPro && trialDaysLeft !== null && trialDaysLeft > 0 && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  TRIAL: {trialDaysLeft} DAYS LEFT
                </span>
              )}
              {!isPro && trialDaysLeft !== null && trialDaysLeft === 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  TRIAL EXPIRED
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{currentPlan}</h2>
            <p className="text-slate-600 max-w-md">
              {isPro 
                ? `You have access to all premium features. Your plan renews on ${expiryDate ? new Date(expiryDate).toLocaleDateString() : '...'}.` 
                : "You are on the 14-day free trial. Enjoy unlimited access to all features before your trial expires."}
            </p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-slate-700">{isPro ? 'Subscription Status' : 'Trial Period'}</span>
              <span className="text-slate-500">
                {isPro ? (expiryDate ? `Expires: ${new Date(expiryDate).toLocaleDateString()}` : 'Active') : (trialDaysLeft !== null ? `${trialDaysLeft} Days Remaining` : 'Calculating...')}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isPro ? 'bg-emerald-500 w-full' : (trialDaysLeft === 0 ? 'bg-red-500' : 'bg-indigo-600')}`}
                style={{ width: isPro ? '100%' : (trialDaysLeft !== null ? `${(trialDaysLeft / 14) * 100}%` : '100%') }}
              ></div>
            </div>
            {!isPro && trialDaysLeft !== null && trialDaysLeft <= 3 && trialDaysLeft > 0 && (
              <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1">
                <Shield size={12} /> Your trial is ending soon. Upgrade now to avoid interruption.
              </p>
            )}
             {!isPro && trialDaysLeft === 0 && (
              <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                <Shield size={12} /> Trial expired. Please upgrade to continue using the app.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="grid md:grid-cols-2 gap-6 pt-8 max-w-4xl mx-auto">
        {/* Starter Plan */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${currentPlan === 'Starter' ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200 bg-white'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Starter</h3>
              <p className="text-slate-500 text-sm">14-Day Free Trial</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-900">Free</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-emerald-500"/> Unlimited Access (14 Days)</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-emerald-500"/> Unlimited Products</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-emerald-500"/> Sales Dashboard</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-emerald-500"/> WhatsApp Receipts</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-emerald-500"/> Offline Mode</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-emerald-500"/> Cloud Sync & Backup</li>
          </ul>

          {currentPlan === 'Starter' ? (
            <button disabled className="w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-bold cursor-not-allowed">
              Current Plan
            </button>
          ) : (
            <button onClick={() => setCurrentPlan('Starter')} className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50">
              Downgrade
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${currentPlan === 'Pro Shop' ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-md'}`}>
          {currentPlan !== 'Pro Shop' && (
            <div className="absolute top-0 right-0 bg-amber-400 text-xs font-bold px-3 py-1 rounded-bl-lg text-slate-900">
              POPULAR
            </div>
          )}
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Pro Shop <Crown size={18} className="text-amber-500 fill-amber-500" />
              </h3>
              <p className="text-slate-500 text-sm">Unlimited Access Forever</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-900">GH₵ 50</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-indigo-600"/> Unlimited Access Forever</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-indigo-600"/> Unlimited Products</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-indigo-600"/> Sales Dashboard</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-indigo-600"/> WhatsApp Receipts</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-indigo-600"/> Offline Mode</li>
            <li className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-indigo-600"/> Cloud Sync & Backup</li>
          </ul>

          {currentPlan === 'Pro Shop' ? (
            <button disabled className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold opacity-90 cursor-default">
              Current Plan
            </button>
          ) : (
            <div>
                <PaystackButton 
                    email={userEmail}
                    amount={5000}
                    publicKey={PAYSTACK_PUBLIC_KEY}
                    onSuccess={onPaystackSuccess}
                    onClose={onPaystackClose}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                    Upgrade to Pro (GH₵ 50)
                </PaystackButton>
                <p className="text-xs text-center text-slate-500 mt-2">
                    Paying with Mobile Money? If the prompt doesn&apos;t appear, check your &quot;Pending Approvals&quot; (e.g. *170#)
                </p>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900">Billing History</h3>
          <button className="text-sm text-indigo-600 font-medium hover:underline">Download All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Placeholder Data */}
              {currentPlan === 'Pro Shop' ? (
                 <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">INV-2024-001</td>
                    <td className="px-6 py-4 text-slate-600">{new Date().toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-600">GH₵ 50.00</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No invoices found. You are on the free plan.
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
