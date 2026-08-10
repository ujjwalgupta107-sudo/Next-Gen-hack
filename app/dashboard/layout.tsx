"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Upload,
  Search,
  FolderOpen,
  ShoppingBag,
  Image as ImageIcon,
  FileKey,
  BarChart3,
  User,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { shortenAddress } from "../lib/crypto";
import { useAuth } from "../lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Upload & Register", icon: Upload },
  { href: "/dashboard/verify", label: "Verify Ownership", icon: Search },
  { href: "/dashboard/assets", label: "Asset Library", icon: FolderOpen },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/dashboard/nft", label: "NFT Gallery", icon: ImageIcon },
  { href: "/dashboard/licenses", label: "Licenses", icon: FileKey },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, currentWallet, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const displayWallet = user?.walletAddress || currentWallet || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const handleDisconnect = async () => {
    await logout();
  };

  const currentTitle =
    NAV_ITEMS.find((i) => i.href === pathname)?.label ||
    BOTTOM_ITEMS.find((i) => i.href === pathname)?.label ||
    "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-slate-200 bg-white relative z-20 shrink-0"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 no-underline overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs shadow-indigo-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-base font-bold text-slate-900 whitespace-nowrap tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Proof<span className="text-indigo-600">Vault</span> <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap text-xs font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="py-3 px-3 space-y-1 border-t border-slate-200">
          {BOTTOM_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap text-xs font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all z-30"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col lg:hidden shadow-xl"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Proof<span className="text-indigo-600">Vault</span> AI
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="btn-icon w-8 h-8">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="py-3 px-3 space-y-1 border-t border-slate-200">
                {BOTTOM_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 bg-white shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="btn-icon lg:hidden w-8 h-8">
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-base font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <button
              className="btn-icon w-9 h-9 relative"
              onClick={() => setNotifications(0)}
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* Wallet / User Info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate-700 hidden sm:inline">
                {user?.username ? `@${user.username}` : shortenAddress(displayWallet)}
              </span>
              <Wallet className="w-3.5 h-3.5 text-slate-500 sm:hidden" />
            </div>

            {/* Logout */}
            <button
              onClick={handleDisconnect}
              className="btn-icon w-9 h-9 text-slate-500 hover:text-red-600 hover:border-red-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
