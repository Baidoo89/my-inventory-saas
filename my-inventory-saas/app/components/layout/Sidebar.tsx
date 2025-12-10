'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { NAV_LINKS } from '../../../lib/constants'
import { Logo } from '../Logo'
import { X } from 'lucide-react'

interface SidebarProps {
  subscriptionPlan?: string;
  onClose?: () => void;
}

export default function Sidebar({ subscriptionPlan, onClose }: SidebarProps) {
  const pathname = usePathname()
  const isPro = subscriptionPlan === 'Pro Shop' || subscriptionPlan === 'Enterprise';

  return (
    <aside className="w-64 flex-shrink-0 bg-indigo-800 border-r border-slate-700 p-6 text-white h-full flex flex-col shadow-xl md:shadow-none"> 
      <div className="mb-8 flex items-center justify-between">
        <Logo textClassName="text-white" />
        {isPro && (
          <span className="bg-amber-400 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
            PRO
          </span>
        )}
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-indigo-200 hover:text-white hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {NAV_LINKS.map((link) => { 
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose} // Close sidebar on mobile when link is clicked
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-700'
              }`}
            >
              <div className={`transition-colors ${isActive ? 'text-white' : 'text-indigo-200 group-hover:text-white'}`}>
                {link.icon && <link.icon size={20} />} 
              </div>
              {link.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-indigo-700">
        <div className="text-center">
            <p className="text-xs font-semibold text-indigo-300 mb-1">
            StockFlow v1.0.0
            </p>
            <p className="text-[10px] text-indigo-400">
            Built by TeCH Dalt89
            </p>
        </div>
      </div>
    </aside>
  );
}
