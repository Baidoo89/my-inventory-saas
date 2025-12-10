'use client'

import { useState, useEffect } from 'react'
import { LogOut, Settings, Store, User, X } from 'lucide-react' // Added X icon
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from '../../config' // Corrected import path

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

type ProfileDropdownProps = {
  onLogout: () => void;
  userEmail: string | null;
};

export default function ProfileDropdown({ onLogout, userEmail }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferredName, setPreferredName] = useState('');
  const [storeName, setStoreName] = useState('StockFlow')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null); // NEW: Profile Image State
  const [subscriptionPlan, setSubscriptionPlan] = useState('Starter'); // NEW: Subscription Plan State
  const [isTrial, setIsTrial] = useState(false);
  const [isStoreSettingsModalOpen, setIsStoreSettingsModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Load Profile from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('store_name, address, phone, subscription_plan, subscription_expiry, created_at, preferred_name')
        .eq('id', user.id)
        .single();

      if (data) {
        setStoreName(data.store_name || 'StockFlow');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        if (data.preferred_name) setPreferredName(data.preferred_name); // Use DB name if available
        
        // Check Expiry
        let activePlan = data.subscription_plan || 'Starter';
        if (activePlan === 'Pro Shop' && data.subscription_expiry) {
             const expiry = new Date(data.subscription_expiry);
             const now = new Date();
             if (expiry < now) activePlan = 'Starter';
        }
        setSubscriptionPlan(activePlan);

        if (data.created_at) {
             const createdAt = new Date(data.created_at);
             const now = new Date();
             const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
             if (diffDays <= 14) setIsTrial(true);
        }
      }

      // 2. Load Local Preferences (Visual only)
      // Removed preferredName from local storage to ensure DB sync
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) setProfileImage(savedImage);
    }
    loadProfile();
  }, []);

  const handleSaveStoreSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // 1. Save to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          store_name: storeName,
          address: address,
          phone: phone,
          preferred_name: preferredName // Save name to DB
        });

      if (error) throw error;

      // 2. Save Local Preferences
      // localStorage.setItem('preferredName', preferredName); // Removed to ensure DB sync
      if (profileImage) {
          localStorage.setItem('profileImage', profileImage);
      }

      alert('Store & Profile Settings Saved to Cloud!');
      setIsStoreSettingsModalOpen(false);
      window.location.reload(); 
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings: " + error.message);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:gap-3 border-l border-slate-200 pl-4 md:pl-6 text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 rounded-full flex items-center justify-center text-indigo-600 overflow-hidden">
            {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <User size={20} />
            )}
        </div>
        <div className="hidden md:block text-left">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-xs md:text-sm text-slate-800">{preferredName || 'User Name'}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${(subscriptionPlan === 'Pro Shop' || subscriptionPlan === 'Enterprise') ? 'bg-indigo-100 text-indigo-700' : (isTrial ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}`}>
              {(subscriptionPlan === 'Pro Shop' || subscriptionPlan === 'Enterprise') ? 'PRO' : (isTrial ? 'TRIAL' : 'FREE')}
            </span>
          </div>
          <p className="text-xs text-slate-500">{userEmail || 'user@email.com'}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in duration-150">
          <div className="py-1">
            <div className="block px-4 py-2 text-xs text-slate-400">{userEmail}</div>
            <button
              onClick={() => { setIsStoreSettingsModalOpen(true); setIsOpen(false); }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <Settings size={16} /> Store & Profile Settings
            </button>
            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Store & Profile Settings Modal */}
      {isStoreSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Store & Profile Settings</h2>
              <button 
                  onClick={() => setIsStoreSettingsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveStoreSettings(); }} className="p-6 space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture</label>
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200">
                          {profileImage ? (
                              <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                              <User size={32} className="text-slate-400" />
                          )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Name</label>
                  <input type="text" className="w-full border p-2 rounded-lg placeholder-slate-400 text-slate-900" value={preferredName} onChange={e => setPreferredName(e.target.value)} placeholder="Your Preferred Name" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shop / Company Name</label>
                  <input type="text" className="w-full border p-2 rounded-lg placeholder-slate-400 text-slate-900" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="e.g. My Awesome Shop" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" className="w-full border p-2 rounded-lg placeholder-slate-400 text-slate-900" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Main St, City, Country" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" className="w-full border p-2 rounded-lg placeholder-slate-400 text-slate-900" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +123 456 7890" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-colors mt-2">
                Save Store & Profile Settings
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
