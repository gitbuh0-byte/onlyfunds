import { ArrowRight, Lock, Sparkles, Shield, Mail, Share2, DollarSign, Download, ChevronRight, HelpCircle, FileText, Video, Image, FileCode } from "lucide-react";
import { User } from "firebase/auth";
import { OnlyFundsLogo, OnlyFundsIcon } from "./OnlyFundsLogo";

interface LandingPageProps {
  user: User | null;
  onLogin: () => void;
  onNavigateToDashboard: () => void;
}

export default function LandingPage({
  user,
  onLogin,
  onNavigateToDashboard
}: LandingPageProps) {
  return (
    <div id="landing-page" className="relative min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500 pb-24 font-sans">
      
      {/* Dynamic Fitme-inspired Grid Overlay background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative High-contrast Radial Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Container */}
      <header className="max-w-7xl mx-auto px-6 sm:px-8 pt-20 pb-16 text-center relative z-10">
        
        {/* Large Display Typography with custom hover interaction on title phrase */}
        <h1 
          id="hero-main-title"
          className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tighter text-zinc-950 dark:text-white max-w-5xl mx-auto leading-[1.05] mb-10 transition-all duration-300 cursor-default group"
        >
          <span className="block transform transition-transform duration-500 hover:scale-[1.01] hover:text-teal-600 dark:hover:text-teal-400">
            Monetize your
          </span>
          <span className="block transform transition-transform duration-500 hover:scale-[1.01] hover:text-emerald-500">
            premium assets with
          </span>
          <span className="inline-flex items-center justify-center mt-6 transform transition-all duration-300 hover:scale-[1.02]">
            <span className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-950 dark:text-white font-display">
              Only<span className="text-emerald-500 dark:text-emerald-400">Funds</span>
            </span>
          </span>
        </h1>
        
        {/* Supporting Copywriting */}
        <p className="mt-8 text-lg sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto font-sans font-normal leading-relaxed tracking-tight">
          Establish premium secure locks for your source code, video tutorials, templates, or private communications. Set security fees, share instant checkout links, and collect live tracked payouts.
        </p>

        {/* Dynamic Heavy-Contrast CTA Pill Button Layout */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto sm:max-w-none">
          {user ? (
            <button
              id="hero-go-dashboard"
              onClick={onNavigateToDashboard}
              className="group flex items-center justify-center space-x-3 px-10 py-5 bg-zinc-950 dark:bg-white hover:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-950 rounded-full font-bold text-base shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto cursor-pointer"
            >
              <span>Go to Creator Dashboard</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" />
            </button>
          ) : (
            <button
              id="hero-login-google"
              onClick={onLogin}
              className="group flex items-center justify-center space-x-3 px-10 py-5 bg-zinc-950 dark:bg-white hover:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-950 rounded-full font-bold text-base shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto cursor-pointer"
            >
              <span>Start Sharing Now</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Sleek Horizontal Bento Stats Line */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto border-t border-b border-zinc-200 dark:border-zinc-800 py-10">
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight">$14.2K+</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-2">Creator Earned</span>
          </div>
          <div className="flex flex-col items-center border-l border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight">5,200+</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-2">Paid Decryptions</span>
          </div>
          <div className="flex flex-col items-center border-l border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight">100%</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-2">Secure Escrow</span>
          </div>
          <div className="flex flex-col items-center border-l border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight">&lt; 3 Min</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-2">Creation Time</span>
          </div>
        </div>
      </header>

      {/* Grid Features section in Fitme athletic aesthetic */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div className="max-w-2xl text-left">
            <span className="text-teal-500 font-bold text-xs uppercase tracking-widest">Why Only Funds?</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 dark:text-white mt-3 font-display">
              Designed for high-conversion sharing
            </h2>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm text-left">
            Bypassing complex integrations. Drag, drop, lock, and publish a premium shareable receipt directly on any platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1 */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-850 hover:border-teal-500/40 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-12 h-12 flex items-center justify-center mb-8">
                <Lock className="w-5 h-5 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight font-display">Encrypted Subdocument Storage</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                Assets and written credentials reside inside highly secure Firestore subcollections. Custom rules guarantee nobody reads premium data without a proven mock receipt.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold tracking-wider">
              SECURE FIRESTORE ENGINE
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-850 hover:border-teal-500/40 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-12 h-12 flex items-center justify-center mb-8">
                <Share2 className="w-5 h-5 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight font-display">Social Embed & Pop-Up Previews</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                Every shareable link is supported by custom OpenGraph tags. Previews populate beautifully on Twitter, Discord, and Slack inside an authentic, conversion-designed checkout.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold tracking-wider">
              OPENGRAPH ENHANCED CHEKOUTS
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-850 hover:border-teal-500/40 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-12 h-12 flex items-center justify-center mb-8">
                <Mail className="w-5 h-5 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight font-display">Email Marketing Templates</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                Send beautiful, bespoke HTML email flyers directly to your mailing list. Simply copy our elegant CSS-inlined template from the link details screen.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold tracking-wider">
              INLINED EMAIL TEMPLATES
            </div>
          </div>
        </div>
      </section>

      {/* Modern, clean FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-16 border-t border-zinc-100 dark:border-zinc-900">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-center text-zinc-950 dark:text-white mb-10 font-display">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 text-left">
          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-850">
            <h4 className="font-bold text-base text-zinc-950 dark:text-white font-display">Do visitors need an account to unlock files?</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              No! Buyers can input their email directly in the payout interface and complete their purchase instantly with custom demo checkout screens. 
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-850">
            <h4 className="font-bold text-base text-zinc-950 dark:text-white font-display">How are the security fees and files protected?</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Files uploaded are split. Public metadata stays accessible while the locked payload resides inside a restricted subcollection protected by Google Firebase Security Rules.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
