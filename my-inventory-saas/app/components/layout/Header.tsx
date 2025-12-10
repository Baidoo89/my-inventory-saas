"use client";

import { Menu, LogOut } from "lucide-react"; // Ensure LogOut is imported
import ProfileDropdown from "./ProfileDropdown";

type HeaderProps = {
  title: string;
  onToggleSidebar?: () => void;
  onLogout: () => void;
  userEmail: string | null;
  storeName?: string; // NEW
};

export default function Header({
  title,
  onToggleSidebar,
  onLogout,
  userEmail,
  storeName,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
      {/* Left side: Mobile Toggle and Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 bg-indigo-600 text-white rounded-md"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
            {storeName || 'StockFlow'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            {title}
          </p>
        </div>
      </div>

      {/* Right side: Visible Logout Button and Profile Dropdown */}
      <div className="flex items-center gap-4 md:gap-6 text-slate-500">
        <button
          onClick={onLogout}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-sm font-medium"
        >
          <LogOut size={18} /> Logout
        </button>
        <ProfileDropdown onLogout={onLogout} userEmail={userEmail} />
      </div>
    </header>
  );
}