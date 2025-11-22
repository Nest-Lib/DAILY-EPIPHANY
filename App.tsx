
import React, { useState, useEffect } from 'react';
import { generateEpiphanyText, generateEpiphanyImage } from './services/geminiService';
import { EpiphanyResult, LoadingState, User, ViewState, DailyChallenge, UserSettings, Category } from './types';
import { InputForm } from './components/InputForm';
import { EpiphanyResult as ResultView } from './components/EpiphanyResult';
import { LoadingOverlay } from './components/LoadingOverlay';
import { RecentList } from './components/RecentList';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { CommunityPage } from './components/CommunityPage';
import { SettingsPage } from './components/SettingsPage';
import { StepIndicator } from './components/StepIndicator';
import { MindfulMoment } from './components/MindfulMoment';
import { checkStreak } from './services/challengeService';
import { simulateSendEmail } from './services/notificationService';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LogIn, User as UserIcon, LogOut, LayoutDashboard, Sparkles, Users, Settings as SettingsIcon } from 'lucide-react';

const GUEST_KEY = 'daily_epiphany_guest_history';
const USER_SESSION_KEY = 'daily_epiphany_user_session';
const GUEST_SETTINGS_KEY = 'daily_epiphany_guest_settings';

const DEFAULT_SETTINGS: UserSettings = {
  style: 'poetic',
  theme: 'cosmic',
  fontSize: 'medium',
  language: 'English',
  isPublic: true,
  browserNotifications: false,
  notificationTime: '09:00',
  emailFrequency: 'weekly',
  emailContent: 'community'
};

function App() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [currentEpiphany, setCurrentEpiphany] = useState<EpiphanyResult | null>(null);
  const [history, setHistory] = useState<EpiphanyResult[]>([]);
  const [view, setView] = useState<ViewState>('input');
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMindfulOpen, setIsMindfulOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Challenge State
  const [activeChallenge, setActiveChallenge] = useState<DailyChallenge | null>(null);
  const [formInitialInput, setFormInitialInput] = useState('');

  // UI Feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Determine current step for indicator
  const isLoading = loadingState === 'generating-text' || loadingState === 'generating-image';
  let currentStep: 1 | 2 | 3 = 1;
  if (view === 'result') currentStep = 3;
  else if (isLoading) currentStep = 2;
  else currentStep = 1;

  // --- Toast Logic ---
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Persistence & URL Logic ---

  const getHistoryKey = (u: User | null) => {
    return u ? `daily_epiphany_user_${u.id}_history` : GUEST_KEY;
  };

  // Load Session, Settings, and Check URL
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_SESSION_KEY);
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setSettings(parsedUser.settings || DEFAULT_SETTINGS);
        loadHistory(parsedUser);
      } catch (e) {
        console.error("Failed to restore session", e);
        loadHistory(null);
      }
    } else {
      loadHistory(null);
      // Load guest settings
      const savedGuestSettings = localStorage.getItem(GUEST_SETTINGS_KEY);
      if (savedGuestSettings) {
        setSettings(JSON.parse(savedGuestSettings));
      }
    }

    // Check for Shared Link Params
    const params = new URLSearchParams(window.location.search);
    if (params.has('share_title')) {
      const sharedEpiphany: EpiphanyResult = {
        id: 'shared-' + Date.now(),
        date: new Date().toISOString(),
        originalInput: decodeURIComponent(params.get('share_input') || ''),
        category: 'Other', // Default for shared links if not present
        content: {
          title: decodeURIComponent(params.get('share_title') || ''),
          concept: decodeURIComponent(params.get('share_concept') || ''),
          explanation: decodeURIComponent(params.get('share_expl') || ''),
          fact: 'Shared from a friend.', // Simplified for URL sharing
          visualPrompt: ''
        },
        isFavorite: false
      };
      setCurrentEpiphany(sharedEpiphany);
      setView('result');
      window.history.replaceState({}, '', window.location.pathname);
    }

  }, []);

  const loadHistory = (u: User | null) => {
    const key = getHistoryKey(u);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  };

  const saveHistory = (newHistory: EpiphanyResult[], u: User | null) => {
    const key = getHistoryKey(u);
    localStorage.setItem(key, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const updateUserSession = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    if (user) {
      const updatedUser = { ...user, settings: newSettings };
      updateUserSession(updatedUser);
    } else {
      localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(newSettings));
    }
    addToast('success', 'Settings saved successfully');
  };

  const handleTestEmail = async (type: 'daily' | 'weekly') => {
    const email = user?.email || 'guest@example.com';
    const content = settings.emailContent === 'favorites' ? 'Your top saved epiphanies...' 
                  : settings.emailContent === 'random' ? 'A random cosmic thought...'
                  : 'Top community discovery of the day...';
                  
    const response = await simulateSendEmail(email, type, content);
    addToast('info', response);
  };

  // --- Auth Handlers ---

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    // Merge settings if they exist in new user, else keep current
    if (newUser.settings) {
      setSettings(newUser.settings);
    } else {
       // If newly created user has no settings (edge case), use current defaults
       const updatedUser = { ...newUser, settings: settings };
       newUser = updatedUser;
    }
    
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
    loadHistory(newUser);
    setView('input');
    addToast('success', `Welcome back, ${newUser.name}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    // Revert to guest settings if available
    const savedGuestSettings = localStorage.getItem(GUEST_SETTINGS_KEY);
    if (savedGuestSettings) {
      setSettings(JSON.parse(savedGuestSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
    loadHistory(null);
    setView('input');
    setIsProfileMenuOpen(false);
    addToast('info', 'Signed out successfully');
  };

  const handleDeleteAccount = () => {
    if (user) {
       const historyKey = getHistoryKey(user);
       localStorage.removeItem(historyKey);
    }
    handleLogout();
    addToast('info', 'Account deleted');
  };

  // --- Epiphany Logic ---

  const handleNewObservation = async (input: string, category: Category) => {
    setLoadingState('generating-text');
    setError(null);
    setFormInitialInput(''); // Clear guided input
    
    try {
      // 1. Generate Text content with preferred style
      const content = await generateEpiphanyText(input, category, settings.style);
      
      setLoadingState('generating-image');

      // 2. Generate Image content
      const imageUrl = await generateEpiphanyImage(content.visualPrompt);

      const newEpiphany: EpiphanyResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        originalInput: input,
        category: category,
        content,
        imageUrl,
        isFavorite: false,
        isChallenge: !!activeChallenge
      };

      // 3. Update History
      const newHistory = [newEpiphany, ...history];
      saveHistory(newHistory, user);
      
      // 4. Handle Challenge Completion logic
      if (activeChallenge && user) {
        const updatedUser = checkStreak(user);
        updateUserSession(updatedUser);
        addToast('success', 'Challenge Completed! Streak updated.');
      }

      setCurrentEpiphany(newEpiphany);
      setActiveChallenge(null);
      setView('result');
      setLoadingState('complete');

    } catch (error) {
      console.error(error);
      setLoadingState('idle');
      setError("The universe is quiet. Please try again.");
      addToast('error', 'Failed to generate epiphany');
    }
  };

  const handleRegenerate = () => {
    if (currentEpiphany) {
      handleNewObservation(currentEpiphany.originalInput, currentEpiphany.category);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const newHistory = history.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveHistory(newHistory, user);
    if (currentEpiphany && currentEpiphany.id === id) {
      setCurrentEpiphany({ ...currentEpiphany, isFavorite: !currentEpiphany.isFavorite });
    }
  };

  const handleStartChallenge = (challenge: DailyChallenge) => {
    setActiveChallenge(challenge);
    setView('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Mindful Moment Logic ---

  const handleMindfulComplete = (prompt?: string) => {
    setIsMindfulOpen(false);
    if (prompt) {
      setFormInitialInput(prompt);
    }
    setView('input');
    addToast('info', 'Mind cleared. Ready to observe.');
  };

  // --- Navigation ---

  const handleBack = () => {
    setView('input');
    setCurrentEpiphany(null);
    setError(null);
    setActiveChallenge(null);
  };

  const handleSelectFromHistory = (item: EpiphanyResult) => {
    setCurrentEpiphany(item);
    setView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Theme Classes
  const themeBg = settings.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100';
  
  return (
    <div className={`min-h-screen w-full flex flex-col overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 ${themeBg}`}>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Background Gradients - Dynamic based on theme */}
      <div className="fixed inset-0 pointer-events-none">
         {settings.theme === 'cosmic' && (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-3xl animate-pulse"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-3xl"></div>
            </>
         )}
         {settings.theme === 'light' && (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-3xl"></div>
            </>
         )}
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Header */}
        <header className="w-full p-6 flex justify-between items-center relative z-50">
           <div 
             className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors" 
             onClick={() => setView('input')}
           >
             <div className={`w-2 h-2 rounded-full ${settings.theme === 'light' ? 'bg-indigo-600' : 'bg-indigo-500'}`}></div>
             DAILY EPIPHANY
           </div>

           <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
             <button 
               onClick={() => setView('input')}
               className={`text-sm font-medium transition-colors ${view === 'input' ? (settings.theme === 'light' ? 'text-slate-900' : 'text-white') : 'text-slate-400 hover:text-slate-500'}`}
             >
               Discover
             </button>
             <button 
               onClick={() => setView('community')}
               className={`text-sm font-medium transition-colors ${view === 'community' ? (settings.theme === 'light' ? 'text-slate-900' : 'text-white') : 'text-slate-400 hover:text-slate-500'}`}
             >
               Community
             </button>
             {user && (
               <button 
                 onClick={() => setView('dashboard')}
                 className={`text-sm font-medium transition-colors ${view === 'dashboard' ? (settings.theme === 'light' ? 'text-slate-900' : 'text-white') : 'text-slate-400 hover:text-slate-500'}`}
               >
                 My History
               </button>
             )}
           </nav>

           <div className="relative">
             {user ? (
               <div className="relative">
                 <button 
                   onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                   className={`flex items-center gap-3 rounded-full pl-3 pr-1 py-1 border transition-all ${settings.theme === 'light' ? 'bg-white/50 border-slate-200 hover:bg-white' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                 >
                   <span className={`text-xs font-medium hidden sm:block ${settings.theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{user.name}</span>
                   <img 
                     src={user.avatarUrl} 
                     alt={user.name} 
                     className="w-8 h-8 rounded-full border border-slate-600"
                   />
                 </button>

                 {isProfileMenuOpen && (
                   <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fade-in origin-top-right z-50 text-slate-300">
                     <div className="md:hidden border-b border-slate-700 mb-1 pb-1">
                        <button onClick={() => { setView('community'); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 hover:text-white flex items-center gap-2"><Users className="w-4 h-4" /> Community</button>
                     </div>
                     <button onClick={() => { setView('dashboard'); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 hover:text-white flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> My Epiphanies</button>
                     <button onClick={() => { setView('input'); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 hover:text-white flex items-center gap-2"><Sparkles className="w-4 h-4" /> New Discovery</button>
                     <button onClick={() => { setView('settings'); setIsProfileMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 hover:text-white flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> Settings</button>
                     <div className="h-px bg-slate-700 my-1"></div>
                     <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</button>
                   </div>
                 )}
               </div>
             ) : (
               <div className="flex gap-2">
                   <button 
                     onClick={() => setView('settings')}
                     className={`p-2 rounded-lg transition-colors ${settings.theme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800'}`}
                     title="Settings"
                   >
                      <SettingsIcon className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setIsAuthModalOpen(true)}
                     className={`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${settings.theme === 'light' ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}
                   >
                     <LogIn className="w-4 h-4" />
                     Sign In
                   </button>
               </div>
             )}
           </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center py-8 w-full">
          
          {/* Process Indicator */}
          {(view === 'input' || view === 'result') && (
             <StepIndicator currentStep={currentStep} />
          )}

          {view === 'dashboard' ? (
             <Dashboard 
               history={history} 
               onSelect={handleSelectFromHistory} 
               onToggleFavorite={handleToggleFavorite}
               user={user}
               onStartChallenge={handleStartChallenge}
             />
          ) : view === 'community' ? (
            <CommunityPage user={user} />
          ) : view === 'settings' ? (
            <SettingsPage 
              settings={settings}
              onSave={handleSaveSettings}
              history={history}
              onDeleteAccount={handleDeleteAccount}
              onTestEmail={handleTestEmail}
            />
          ) : isLoading ? (
            <LoadingOverlay state={loadingState as 'generating-text' | 'generating-image'} />
          ) : view === 'result' && currentEpiphany ? (
            <ResultView 
              data={currentEpiphany} 
              onBack={handleBack} 
              onRegenerate={handleRegenerate}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <>
              <InputForm 
                onSubmit={handleNewObservation} 
                error={error} 
                isLoading={isLoading}
                activeChallenge={activeChallenge}
                onCancelChallenge={() => setActiveChallenge(null)}
                onStartMindful={() => setIsMindfulOpen(true)}
                initialInput={formInitialInput}
              />
              <RecentList history={history.slice(0, 6)} onSelect={handleSelectFromHistory} />
            </>
          )}
        </main>
        
        <footer className="w-full p-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Daily Epiphany. Powered by Gemini.</p>
        </footer>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />

      {isMindfulOpen && (
        <MindfulMoment 
          onClose={() => setIsMindfulOpen(false)}
          onComplete={handleMindfulComplete}
        />
      )}

      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setIsProfileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;
