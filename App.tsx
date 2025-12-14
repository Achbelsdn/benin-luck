import React, { useState, useEffect } from 'react';
import { LotteryProvider, useLottery } from './context/LotteryContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TicketCard } from './components/TicketCard';
import { PaymentModal } from './components/PaymentModal';
import { AdminPanel } from './components/AdminPanel';
import { DeveloperModal } from './components/DeveloperModal'; 
import { TutorialModal } from './components/TutorialModal';
import { RulesModal } from './components/RulesModal';
import { RevealOnScroll } from './components/RevealOnScroll';
import { ChatBot } from './components/ChatBot';
import { Ticket } from './types';
import { LockKeyhole, Gift, ShieldCheck, Sparkles, Loader2, Wallet, CheckCircle, Moon, Sun, Code2, HelpCircle, CalendarClock, Clock } from 'lucide-react';
import { TICKET_PRICE } from './constants';

const LuxuryLogo = () => (
  <div className="relative w-12 h-12 flex items-center justify-center group cursor-pointer">
      {/* Abstract Gem Shape */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:rotate-180">
         <defs>
             <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#10b981" />
                 <stop offset="100%" stopColor="#064e3b" />
             </linearGradient>
             <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#fbbf24" />
                 <stop offset="50%" stopColor="#f59e0b" />
                 <stop offset="100%" stopColor="#b45309" />
             </linearGradient>
         </defs>
         
         {/* Background Diamond */}
         <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="url(#emeraldGrad)" />
         
         {/* Inner Outline */}
         <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
         
         {/* Central Element */}
         <circle cx="50" cy="50" r="10" fill="url(#goldGrad)" />
      </svg>
  </div>
);

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const MainContent = () => {
  const { tickets, config, loading, reserveTicket, stats, isAdmin, toggleAdmin, winner } = useLottery();
  const { theme, toggleTheme } = useTheme();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDevModal, setShowDevModal] = useState(false); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Auto-show tutorial for first-time visitors using localStorage for persistence
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial && !loading && !isAdmin) {
       setShowTutorial(true);
       localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, [loading, isAdmin]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handlePaymentSubmit = async (id: number, name: string, phone: string, transactionId: string) => {
    const success = await reserveTicket(id, name, phone, transactionId);
    if (success) {
      setSelectedTicket(null);
      alert(`🎉 Demande envoyée ! Le ticket #${id} est réservé. Validation en cours...`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#050505] text-brand-600 dark:text-brand-400 gap-4">
        <div className="relative">
             <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 animate-pulse"></div>
             <div className="relative z-10 animate-bounce">
                <LuxuryLogo />
             </div>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-50">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden selection:bg-brand-500 selection:text-white font-sans">
      
      {/* Winner Overlay Banner */}
      {winner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-3 shadow-xl animate-in slide-in-from-top duration-700">
           <div className="container mx-auto px-4 flex justify-between items-center overflow-hidden">
                <div className="flex items-center gap-2 text-sm md:text-base font-bold whitespace-nowrap animate-pulse-slow">
                    <Sparkles className="text-yellow-300" />
                    <span>GRAND GAGNANT : {winner.purchaser_name} (Ticket #{winner.id})</span>
                </div>
                <div className="hidden md:block text-xs uppercase tracking-widest opacity-80 font-bold">Tirage Terminé</div>
           </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${winner ? 'mt-12' : 'mt-0'} bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
             <div className="flex items-center gap-4 group cursor-default">
                 <LuxuryLogo />
                 <div>
                     <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white leading-none tracking-tight group-hover:text-brand-500 transition-colors">Bénin Luck</h1>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Loterie Prestige</p>
                 </div>
             </div>
             
             <div className="flex items-center gap-2 md:gap-4">
                 {/* Tutorial Button */}
                 <button 
                    onClick={() => setShowTutorial(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    title="Guide du Joueur"
                 >
                    <HelpCircle size={20} /> <span className="hidden md:inline">Guide</span>
                 </button>

                 {/* Developer Button */}
                 <button 
                    onClick={() => setShowDevModal(true)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                 >
                    <Code2 size={16} /> Devs
                 </button>

                 <button 
                    onClick={toggleTheme}
                    className="p-3 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/5"
                 >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                 </button>
                 <button 
                    onClick={toggleAdmin}
                    className={`text-xs px-4 md:px-6 py-3 rounded-full font-bold transition-all border ${isAdmin ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5'}`}
                 >
                    {isAdmin ? 'ADMIN' : 'LOGIN'}
                 </button>
             </div>
        </div>
      </nav>

      <main className={`max-w-7xl mx-auto px-6 pt-36 space-y-32 ${winner ? 'pt-48' : ''}`}>
        
        {isAdmin ? (
            <AdminPanel />
        ) : (
            <>
                {/* Modern Hero Section */}
                <RevealOnScroll>
                    <section className="relative rounded-[3rem] bg-[#0a0a0a] overflow-hidden min-h-[600px] flex items-center p-8 md:p-20 shadow-2xl border border-white/10 ring-1 ring-white/5">
                        {/* Premium Gradients */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500 rounded-full mix-blend-opacity filter blur-[150px] opacity-20 animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-opacity filter blur-[150px] opacity-20"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

                        <div className="relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-10 text-center lg:text-left">
                                
                                <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full pl-2 pr-6 py-2 text-brand-200 text-sm font-bold animate-float shadow-lg shadow-black/20">
                                    <span className="bg-brand-500 text-white p-1 rounded-full"><Sparkles size={12} fill="currentColor"/></span>
                                    <span>L'Art de la Fortune</span>
                                </div>
                                
                                <h2 className="text-6xl md:text-8xl font-serif font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                                    Osez <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-emerald-200 to-brand-400 animate-shine bg-[length:200%_100%]">
                                        L'Exception
                                    </span>
                                </h2>

                                {/* PRIZE & VALUE DISPLAY */}
                                <div className="mt-8 mb-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-5 max-w-xl mx-auto lg:mx-0">
                                        <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-brand-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
                                            <Gift size={32} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-brand-300 font-bold text-xs uppercase tracking-widest mb-1">Lot en Jeu</div>
                                            <div className="text-2xl font-serif font-black text-white leading-none mb-2">{config?.prize_title || "Lot Spécial"}</div>
                                            <div className="inline-flex items-center gap-2 text-sm text-slate-300">
                                                <span>Valeur :</span>
                                                <span className="font-mono font-bold text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded border border-brand-400/20">{config?.prize_value || "Inestimable"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates Display Logic */}
                                <div className="flex flex-col gap-2 max-w-lg mx-auto lg:mx-0">
                                    {/* 1. Date de fin du prix actuel (Si pas de gagnant encore) */}
                                    {!winner && config?.prize_end_date && (
                                        <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl backdrop-blur-sm self-center lg:self-start animate-pulse">
                                            <Clock size={16} className="text-red-400" />
                                            <span className="text-red-200 font-mono text-sm">
                                                Fin du jeu : <span className="font-bold text-white">{formatDate(config.prize_end_date)}</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* 2. Date du prochain prix (Si gagnant déclaré) */}
                                    {winner && config?.next_prize_start_date && (
                                        <div className="inline-flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 rounded-xl backdrop-blur-md self-center lg:self-start mt-4 shadow-lg shadow-emerald-500/10 transform hover:scale-105 transition-transform">
                                            <CalendarClock size={24} className="text-emerald-400" />
                                            <div className="text-left">
                                                <div className="text-emerald-300 text-[10px] uppercase font-bold tracking-widest">Prochaine Session</div>
                                                <div className="text-white font-serif font-bold text-lg">
                                                    {formatDate(config.next_prize_start_date)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-slate-400 text-xl md:text-2xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-light tracking-wide mt-6">
                                    Une expérience de loterie réinventée.
                                    <span className="block mt-4 text-white font-medium">Entrée : <span className="font-bold text-brand-400 text-3xl align-middle ml-2">{TICKET_PRICE} F</span></span>
                                </p>

                                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
                                    <button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
                                        <HelpCircle size={18} /> Comment ça marche ?
                                    </button>
                                </div>
                            </div>

                            {/* Interactive Stats Card */}
                            <div className="relative hidden lg:block">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-indigo-500 blur-3xl opacity-20 rounded-full"></div>
                                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[2.5rem] text-center transform hover:scale-105 transition-transform duration-500 shadow-2xl group">
                                    <div className="text-sm text-brand-300 font-bold uppercase tracking-[0.3em] mb-8">Places Restantes</div>
                                    <div className="text-9xl font-serif font-black text-white mb-2 drop-shadow-2xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-slate-400 transition-all">
                                        {stats.available}
                                    </div>
                                    <div className="text-white/30 font-mono text-sm uppercase tracking-widest mt-4">sur {tickets.length} Disponibles</div>
                                    
                                    <div className="mt-12 bg-black/40 rounded-full h-4 overflow-hidden p-1 border border-white/5">
                                        <div 
                                            className="h-full bg-gradient-to-r from-brand-500 to-emerald-300 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                                            style={{ width: `${(stats.available / tickets.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </RevealOnScroll>

                {/* Steps Section */}
                <section>
                    <RevealOnScroll delay={100}>
                        <div className="text-center mb-20">
                            <h3 className="text-4xl font-serif font-black text-slate-900 dark:text-white mb-6">L'Excellence Simplifiée</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">Trois étapes vers votre destinée.</p>
                        </div>
                    </RevealOnScroll>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent z-0 border-t border-dashed border-slate-300 dark:border-slate-700 opacity-50"></div>

                        <RevealOnScroll delay={200}>
                            <StepCard 
                                number="01" 
                                title="Sélection" 
                                desc="Choisissez votre numéro porte-bonheur sur la grille."
                                icon={<LockKeyhole size={28} className="text-brand-600 dark:text-brand-400" />}
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={300}>
                            <StepCard 
                                number="02" 
                                title="Paiement" 
                                desc={`Envoyez ${TICKET_PRICE} FCFA via Celtiis ou MTN Money.`}
                                icon={<Wallet size={28} className="text-brand-600 dark:text-brand-400" />}
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={400}>
                            <StepCard 
                                number="03" 
                                title="Validation" 
                                desc="Saisissez l'ID de transaction pour confirmer."
                                icon={<CheckCircle size={28} className="text-brand-600 dark:text-brand-400" />}
                            />
                        </RevealOnScroll>
                    </div>
                </section>

                {/* Ticket Grid Section */}
                <section className="scroll-mt-32 pb-20" id="tickets">
                    <RevealOnScroll delay={100}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                            <div>
                                <h3 className="text-4xl font-serif font-black text-slate-900 dark:text-white flex items-center gap-4">
                                    <span className="bg-brand-100 dark:bg-brand-900/20 p-3 rounded-2xl text-brand-600 dark:text-brand-400 rotate-3 shadow-lg shadow-brand-500/10"><Gift size={32} /></span>
                                    La Grille Officielle
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-4 text-xl font-light">Votre futur commence ici.</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-6 text-sm font-bold bg-white dark:bg-[#1a1a1a] px-8 py-4 rounded-2xl shadow-xl shadow-black/5 border border-slate-100 dark:border-white/5">
                                <LegendItem color="bg-white dark:bg-[#1a1a1a] border-2 border-slate-200 dark:border-white/20" label="Libre" />
                                <LegendItem color="bg-amber-100 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700/50" label="En Cours" />
                                <LegendItem color="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700" label="Vendu" />
                            </div>
                        </div>
                    </RevealOnScroll>
                    
                    <RevealOnScroll delay={300}>
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 sm:gap-6 p-8 md:p-12 bg-slate-100/50 dark:bg-[#0f0f0f] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-inner">
                            {tickets.map(ticket => (
                                <TicketCard 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    onClick={handleTicketClick} 
                                />
                            ))}
                        </div>
                    </RevealOnScroll>
                </section>
            </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-32 bg-white dark:bg-[#0a0a0a] border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-90">
                <LuxuryLogo />
                <span className="font-serif font-black text-xl text-slate-900 dark:text-white tracking-tight">Bénin Luck</span>
            </div>
            
            <div className="text-slate-400 text-sm font-medium flex flex-col md:flex-row items-center gap-8">
                {/* Updated Year to 2025 */}
                <span>© 2025 Prestige Edition • Bénin</span>
                <div className="flex gap-6">
                    <button onClick={() => setShowDevModal(true)} className="hover:text-brand-500 transition-colors">Développeurs</button>
                    <button onClick={() => setShowRulesModal(true)} className="hover:text-brand-500 transition-colors">Règlement</button>
                </div>
            </div>
        </div>
      </footer>

      {/* AI ChatBot - Always rendered for users */}
      <ChatBot />

      {/* Modals */}
      <PaymentModal 
        ticket={selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        onSubmit={handlePaymentSubmit} 
      />

      <DeveloperModal 
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        info={config?.developer_info}
        profiles={config?.developer_profiles}
      />

      <TutorialModal 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      <RulesModal 
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
};

// UI Components
const Badge = ({ icon, text }: any) => (
    <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 text-slate-200 text-sm font-bold shadow-lg shadow-black/10 hover:bg-white/10 transition-colors cursor-default">
        {icon}
        <span>{text}</span>
    </div>
);

const StepCard = ({ number, title, desc, icon }: any) => (
    <div className="relative z-10 bg-white dark:bg-[#1a1a1a] p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-white/5 hover:border-brand-200 dark:hover:border-brand-900/30 transition-all hover:-translate-y-2 group">
        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-white/5">
            {icon}
        </div>
        <div className="text-5xl font-serif font-black text-slate-100 dark:text-white/5 absolute top-8 right-8 select-none">{number}</div>
        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h4>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
);

const LegendItem = ({ color, label }: any) => (
    <div className="flex items-center gap-3">
        <span className={`w-5 h-5 rounded-lg shadow-sm ${color}`}></span>
        <span className="text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">{label}</span>
    </div>
);

const App = () => {
  return (
    <ThemeProvider>
      <LotteryProvider>
        <MainContent />
      </LotteryProvider>
    </ThemeProvider>
  );
};

export default App;