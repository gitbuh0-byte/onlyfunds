import { User } from "firebase/auth";
import { LogIn, LogOut, LayoutDashboard, Wallet, Menu, X } from "lucide-react";
import ThemeSelector, { Theme } from "./ThemeSelector";
import { useState } from "react";
import { OnlyFundsLogo } from "./OnlyFundsLogo";

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  currentView: "landing" | "dashboard" | "paywall";
  activeTab?: string;
  onNavigate: (view: "landing" | "dashboard", tab?: "assets" | "wallet" | "requests" | "upload" | "settings") => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function Navbar({
  user,
  onLogin,
  onLogout,
  currentView,
  activeTab,
  onNavigate,
  currentTheme,
  onThemeChange
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand Emblem */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate(user ? "dashboard" : "landing")}>
            <OnlyFundsLogo iconClassName="w-8 h-8" textClassName="text-xl font-black" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <button
                id="nav-btn-wallet"
                onClick={() => onNavigate("dashboard", "wallet")}
                className={`flex items-center space-x-1.5 text-sm font-bold transition-colors ${
                  currentView === "dashboard" && activeTab === "wallet"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span>Wallet</span>
              </button>
            ) : (
              <button
                id="nav-btn-wallet"
                onClick={onLogin}
                className="flex items-center space-x-1.5 text-sm font-bold text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span>Wallet</span>
              </button>
            )}

            {user && (
              <button
                id="nav-btn-dashboard"
                onClick={() => onNavigate("dashboard", "assets")}
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  currentView === "dashboard" && activeTab !== "wallet"
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}
          </div>

          {/* User Profile & Theme selection */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

            {user ? (
              <div className="flex items-center space-x-3 border-l border-gray-100 dark:border-zinc-800 pl-4">
                <div className="flex items-center space-x-2">
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || "User")}`}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 shadow-inner"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 max-w-[120px] truncate">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 max-w-[120px] truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="flex items-center space-x-1 p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-sm font-medium"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 h-9 bg-teal-600 dark:bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-700 dark:hover:bg-teal-600 shadow-sm transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Login with Google</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-4 shadow-xl transition-all duration-300 animate-in fade-in-50">
          <div className="flex flex-col space-y-2">
            {user ? (
              <button
                id="mobile-nav-wallet"
                onClick={() => {
                  onNavigate("dashboard", "wallet");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 p-3 rounded-xl text-sm font-bold transition-colors ${
                  currentView === "dashboard" && activeTab === "wallet"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Wallet className="w-5 h-5 text-emerald-500" />
                <span>Wallet & Payouts</span>
              </button>
            ) : (
              <button
                id="mobile-nav-wallet"
                onClick={() => {
                  onLogin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 p-3 rounded-xl text-sm font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <Wallet className="w-5 h-5 text-emerald-500" />
                <span>Wallet & Payouts</span>
              </button>
            )}

            {user && (
              <button
                id="mobile-nav-dashboard"
                onClick={() => {
                  onNavigate("dashboard", "assets");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 p-3 rounded-xl text-sm font-medium transition-colors ${
                  currentView === "dashboard" && activeTab !== "wallet"
                    ? "bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400"
                    : "text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Creator Dashboard</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-zinc-900 rounded-xl">
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || "User")}`}
                    alt={user.displayName || "User"}
                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-700"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-gray-800 dark:text-zinc-100">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                      {user.email}
                    </span>
                  </div>
                </div>
                <button
                  id="mobile-logout-btn"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                id="mobile-login-btn"
                onClick={() => {
                  onLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-500/10 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Login with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
