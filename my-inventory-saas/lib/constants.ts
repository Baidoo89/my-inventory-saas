import { BarChart3, LayoutList, History, Settings, CreditCard, ShoppingBag, Crown, HelpCircle, Brain } from 'lucide-react';

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/pos', label: 'Point of Sale', icon: ShoppingBag },
  { href: '/dashboard/inventory', label: 'Inventory', icon: LayoutList },
  { href: '/dashboard/ai-insights', label: 'AI Insights', icon: Brain },
  { href: '/dashboard/transactions', label: 'Transactions', icon: History },
  { href: '/dashboard/subscription', label: 'Subscription', icon: Crown },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
];
