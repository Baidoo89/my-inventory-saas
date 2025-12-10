'use client'

import { useState, useEffect } from 'react'
import Sidebar from "../components/layout/Sidebar"
import Header from "../components/layout/Header"
import { usePathname, useRouter } from 'next/navigation'
import { NAV_LINKS } from '../../lib/constants'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from '../config'
import { SubscriptionProvider, useSubscription } from './SubscriptionContext'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('StockFlow');
  const pathname = usePathname();
  const router = useRouter();
  const { plan, isExpired } = useSubscription();

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen]);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        const { data } = await supabase
          .from('profiles')
          .select('store_name')
          .eq('id', user.id)
          .single();
        if (data?.store_name) {
          setStoreName(data.store_name);
        }
      }
    }
    fetchUserData();
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await supabase.auth.signOut();
        localStorage.clear();
      } catch (error) {
        console.error('Error signing out:', error);
      } finally {
        router.push('/'); 
      }
    }
  };

  const currentPage = NAV_LINKS.find(link => link.href === pathname);
  const title = currentPage ? currentPage.label : 'Dashboard';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-0 md:translate-x-0 transition-transform duration-300 ease-in-out z-50 md:h-screen`}>
        <Sidebar subscriptionPlan={plan} onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-30">
          <Header 
            onToggleSidebar={handleToggleSidebar} 
            onLogout={handleLogout} 
            title={title} 
            userEmail={userEmail}
            storeName={storeName} 
          /> 
        </div>
        
        {/* Expired Banner */}
        {isExpired && (
            <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-white" />
                    <span className="font-medium">
                        Read-Only Mode: Your subscription or free trial has expired. You can view your data but cannot make changes.
                    </span>
                </div>
                <Link href="/dashboard/subscription" className="bg-white text-red-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-50 transition-colors">
                    Renew Now
                </Link>
            </div>
        )}

        <main className="flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SubscriptionProvider>
            <DashboardContent>{children}</DashboardContent>
        </SubscriptionProvider>
    )
}
