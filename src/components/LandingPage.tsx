import { ArrowRight, Check, ChevronRight, FileCode, Lock, Mail, ShieldCheck, Share2, Sparkles, UploadCloud, Wallet } from "lucide-react";
import { User } from "firebase/auth";

interface LandingPageProps {
  user: User | null;
  onLogin: () => void;
  onNavigateToDashboard: () => void;
}

const steps = [
  { number: "01", title: "Upload your asset", copy: "Add a file, guide, template, or private briefing in seconds." },
  { number: "02", title: "Set a release fee", copy: "Choose the amount and keep your public preview beautifully visible." },
  { number: "03", title: "Share the paywall", copy: "Send one clean link. Buyers pay before the private payload opens." },
  { number: "04", title: "Get paid", copy: "Track unlocks and route your balance to M-Pesa, crypto, or bank." }
];

export default function LandingPage({ user, onLogin, onNavigateToDashboard }: LandingPageProps) {
  const primaryAction = user ? onNavigateToDashboard : onLogin;

  return (
    <div id="landing-page" className="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white font-sans overflow-hidden">
      <main>
        <span id="for-creators" className="block scroll-mt-24" />
        <span id="security" className="block scroll-mt-24" />
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-8">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[1.08/1] max-w-xl mx-auto lg:max-w-none overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8">
                <div className="absolute -right-16 -top-16 w-48 h-48 border-[24px] border-teal-500/20 rounded-full" />
                <div className="absolute left-8 bottom-8 w-28 h-28 border border-emerald-500/50 rounded-full" />
                <div className="relative h-full rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden rotate-[-2deg]">
                  <div className="h-10 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="w-2 h-2 rounded-full bg-emerald-400" /></div>
                    <span className="text-[9px] font-mono text-zinc-400">onlyfunds</span>
                  </div>
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Private asset</p><h3 className="font-display font-black text-2xl mt-2">Brand Systems Kit</h3></div><div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center"><Lock className="w-5 h-5" /></div></div>
                    <div className="grid grid-cols-2 gap-3"><div className="h-28 rounded-xl bg-zinc-950 p-4 text-white flex flex-col justify-between"><FileCode className="w-5 h-5 text-teal-400" /><span className="text-[10px] font-mono">source-files.zip</span></div><div className="h-28 rounded-xl bg-teal-500 p-4 text-zinc-950 flex flex-col justify-between"><Sparkles className="w-5 h-5" /><span className="text-[10px] font-mono">preview unlocked</span></div></div>
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex items-end justify-between"><div><p className="text-[9px] text-zinc-400 uppercase tracking-widest">Release fee</p><p className="font-display font-black text-3xl mt-1">$24.00</p></div><div className="px-3 py-2 rounded-lg bg-zinc-950 text-white text-[10px] font-bold flex items-center gap-1.5">Unlock asset <ArrowRight className="w-3 h-3" /></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 text-left">
              <h1 id="hero-main-title" className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.06em] max-w-3xl">Make your work<br /><span className="text-teal-600 dark:text-teal-400">worth unlocking.</span></h1>
              <p className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">OnlyFunds turns your valuable files into clean, paid links. Keep the preview open, keep the premium payload private, and get paid when it matters.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3"><button id="hero-login-google" onClick={primaryAction} className="group inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold hover:bg-teal-600 dark:hover:bg-teal-400 transition-colors">{user ? "Open dashboard" : "Start selling securely"}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button><a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-bold hover:border-teal-500 hover:text-teal-600 transition-colors">See how it works <ChevronRight className="w-4 h-4" /></a></div>
            </div>
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 border-y border-zinc-200 dark:border-zinc-800">{[["14.2K+", "creator revenue"], ["5,200+", "assets unlocked"], ["95%", "paid to creators"], ["< 3 min", "to publish"]].map(([value, label], index) => <div key={label} className={`py-6 sm:py-8 ${index % 2 ? "border-l" : ""} ${index > 1 ? "md:border-l" : ""} border-zinc-200 dark:border-zinc-800 px-4 sm:px-6`}><p className="font-display text-2xl sm:text-4xl font-black tracking-tight">{value}</p><p className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-zinc-400 font-bold">{label}</p></div>)}</div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28"><div className="grid md:grid-cols-[0.8fr_1.2fr] gap-10 items-end mb-12"><div><p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-teal-600 dark:text-teal-400">One link. More control.</p><h2 className="font-display text-4xl sm:text-6xl font-black tracking-[-0.05em] leading-[0.95] mt-4">Your work deserves<br />a better handoff.</h2></div><p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">From a small template to a full resource library, OnlyFunds gives every asset a considered front door and a protected back room.</p></div><div className="grid md:grid-cols-3 gap-4">{[{ icon: Lock, title: "Private by default", copy: "Metadata stays visible while the file payload sits behind a verified checkout." }, { icon: Share2, title: "Made to travel", copy: "A polished paywall link works in DMs, email, social posts, and your bio." }, { icon: Wallet, title: "Payouts that move", copy: "See revenue, fees, and withdrawals clearly across every payment channel." }].map(({ icon: Icon, title, copy }, index) => <div key={title} className={`p-6 sm:p-8 min-h-64 flex flex-col justify-between ${index === 1 ? "bg-teal-500 text-zinc-950" : "bg-zinc-100 dark:bg-zinc-900"} rounded-[1.5rem]`}><div><Icon className="w-6 h-6 mb-10" /><h3 className="font-display text-2xl font-black tracking-tight">{title}</h3><p className={`text-sm mt-3 leading-relaxed ${index === 1 ? "text-zinc-900/70" : "text-zinc-500 dark:text-zinc-400"}`}>{copy}</p></div><span className="text-[10px] font-mono uppercase tracking-widest opacity-60">0{index + 1} / OnlyFunds</span></div>)}</div></section>

        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28"><div className="bg-zinc-950 dark:bg-black text-white rounded-[2rem] p-6 sm:p-10 lg:p-14 overflow-hidden relative"><div className="absolute -right-20 -top-24 w-72 h-72 rounded-full border-[40px] border-teal-500/20" /><div className="relative grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center"><div><p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-teal-400">A calmer way to sell</p><h2 className="font-display text-4xl sm:text-6xl font-black tracking-[-0.05em] leading-[0.95] mt-4">Secure the file.<br />Open the value.</h2><p className="text-sm text-zinc-400 mt-6 max-w-md leading-relaxed">No storefront buildout. No complicated integration. Upload once, choose a fee, and share a link that does the explaining.</p><button onClick={primaryAction} className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-zinc-950 text-xs font-bold hover:bg-teal-400 transition-colors">{user ? "Go to your workspace" : "Create your first link"}<ArrowRight className="w-4 h-4" /></button></div><div className="grid sm:grid-cols-2 gap-3"><div className="sm:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5"><div className="flex justify-between items-center"><span className="text-xs font-bold">Asset protection</span><span className="text-[10px] font-mono text-emerald-400">ACTIVE</span></div><div className="h-2 bg-zinc-800 rounded-full mt-6 overflow-hidden"><div className="h-full w-[92%] bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" /></div><div className="flex justify-between mt-3 text-[10px] text-zinc-500 font-mono"><span>Public preview</span><span>Encrypted payload</span></div></div>{[[UploadCloud, "Upload", "Any file type"], [Mail, "Distribute", "One shareable URL"], [Check, "Collect", "Live payout tracking"]].map(([Icon, title, copy]) => { const Component = Icon as typeof UploadCloud; return <div key={title as string} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"><Component className="w-5 h-5 text-teal-400" /><p className="mt-8 text-sm font-bold">{title as string}</p><p className="text-[10px] text-zinc-500 mt-1">{copy as string}</p></div>; })}</div></div></div></section>

        <section id="how-it-works" className="max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-zinc-200 dark:border-zinc-800"><div className="text-center max-w-2xl mx-auto"><p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-teal-600 dark:text-teal-400">The workflow</p><h2 className="font-display text-4xl sm:text-6xl font-black tracking-[-0.05em] mt-4">How the unlock works.</h2></div><div className="mt-14 grid md:grid-cols-4 gap-0 border-y border-zinc-200 dark:border-zinc-800">{steps.map((step) => <div key={step.number} className="p-6 sm:p-8 border-b md:border-b-0 md:border-l first:md:border-l-0 border-zinc-200 dark:border-zinc-800"><span className="w-9 h-9 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-[10px] font-mono font-bold">{step.number}</span><h3 className="font-display font-black text-xl mt-8">{step.title}</h3><p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">{step.copy}</p></div>)}</div></section>

        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24"><div className="border-t border-zinc-200 dark:border-zinc-800 pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"><div><h2 className="font-display text-3xl sm:text-5xl font-black tracking-[-0.05em]">Ready to put a lock on it?</h2><p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">Your next paid share can be live before your next coffee.</p></div><button onClick={primaryAction} className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-teal-600 text-white text-sm font-bold hover:bg-teal-500 transition-colors">{user ? "Open dashboard" : "Start with OnlyFunds"}<ArrowRight className="w-4 h-4" /></button></div></section>
      </main>
    </div>
  );
}
