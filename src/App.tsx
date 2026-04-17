import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingTest from './components/TypingTest';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import About from './components/About';
import Home from './components/Home';
import Features from './components/Features';
import { LogIn, LogOut, User as UserIcon, Menu, X, Mail, Lock, UserPlus } from 'lucide-react';
import { AppUser } from './types/auth';
import { getStoredUser, setStoredUser, loginWithEmailPassword, registerWithEmailPassword } from './services/localDataService';

type View = 'home' | 'test' | 'analytics' | 'profile' | 'about' | 'features';
type Theme = 'light-purple' | 'dark-purple';
type AuthMode = 'signin' | 'signup';

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'light-purple', label: 'Light Purple', color: '#ffffff' },
  { id: 'dark-purple', label: 'Dark Purple', color: '#2e1065' },
];

export default function App() {
  const [user, setUser] = useState<AppUser | null>(() => getStoredUser());
  const [currentView, setCurrentView] = useState<View>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light-purple';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const resetAuthFields = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setAuthError('');
    setAuthLoading(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    resetAuthFields();
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError('');

      const appUser =
        authMode === 'signup'
          ? registerWithEmailPassword(email, password, fullName)
          : loginWithEmailPassword(email, password);

      setUser(appUser);
      setStoredUser(appUser);
      closeAuthModal();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setStoredUser(null);
    setCurrentView('home');
  };

  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const hoverColor = isDark ? 'hover:text-violet-200' : 'hover:text-violet-600';
  const mutedTextColor = isDark ? 'text-white/40' : 'text-violet-900/40';

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStart={() => setCurrentView('test')} onNavigate={(view: View) => setCurrentView(view)} theme={theme} />;
      case 'features':
        return <Features onBack={() => setCurrentView('home')} theme={theme} />;
      case 'analytics':
        return <Analytics user={user} onBack={() => setCurrentView('test')} theme={theme} />;
      case 'profile':
        return <Profile user={user} onBack={() => setCurrentView('test')} onLogout={handleLogout} theme={theme} />;
      case 'about':
        return <About onBack={() => setCurrentView('test')} theme={theme} />;
      default:
        return <TypingTest user={user} onNavigate={(view: View) => setCurrentView(view)} onRequireLogin={() => setShowAuthModal(true)} theme={theme} />;
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'test', label: 'Gym' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 theme-${theme} selection:bg-solar-blue selection:text-white relative`}>
      <div className="aura-bg" />

      <header className="max-w-7xl mx-auto px-6 md:px-8 py-10 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('home')}>
          <div className="w-8 h-8 bg-solar-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${textColor}`}>
            Brain<span className="text-solar-blue">Type</span>
          </h1>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setCurrentView(link.id as View)}
              className={`text-xs font-black uppercase tracking-widest transition-all ${currentView === link.id ? 'text-solar-blue' : `${mutedTextColor} hover:${textColor}`}`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] uppercase tracking-widest font-black text-solar-blue">Cognitive Gym</span>
            <span className={`text-[8px] uppercase tracking-widest opacity-50 ${textColor}`}>Developer Edition</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-4 h-4 rounded-full border transition-all ${theme === t.id ? 'scale-125 border-solar-blue ring-2 ring-solar-blue/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                style={{ backgroundColor: t.color }}
                title={t.label}
              />
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${textColor} ${hoverColor}`} onClick={() => setCurrentView('profile')}>
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-6 h-6 rounded-full border border-solar-blue/20" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={16} />
                )}
                <span className="hidden md:inline">{user.name || user.email}</span>
              </div>
              <button onClick={handleLogout} className={`p-2 transition-colors ${textColor} ${hoverColor}`} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAuthModal(true);
                setAuthMode('signin');
                setAuthError('');
              }}
              className="flex items-center gap-2 bg-solar-blue text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-solar-blue/20"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button className={`lg:hidden p-2 ${textColor}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 lg:hidden backdrop-blur-xl ${isDark ? 'bg-navy-dark/95' : 'bg-cream-light/95'} pt-32 px-4`}
          >
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentView(link.id as View);
                    setIsMenuOpen(false);
                  }}
                  className={`text-2xl font-black uppercase tracking-widest ${currentView === link.id ? 'text-solar-blue' : textColor}`}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex gap-4 pt-8">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-8 h-8 rounded-full border ${theme === t.id ? 'border-solar-blue ring-4 ring-solar-blue/20' : 'border-transparent'}`}
                    style={{ backgroundColor: t.color }}
                  />
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-32 relative z-10">{renderView()}</main>

      <AnimatePresence>
        {showAuthModal && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={closeAuthModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${isDark ? 'bg-violet-950 border-white/15 text-white' : 'bg-white border-violet-900/10 text-violet-900'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight">
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className={`mt-2 text-sm ${isDark ? 'text-white/70' : 'text-violet-700/80'}`}>
                  Email and password only.
                </p>
              </div>

              {authError && <p className="mb-4 text-sm text-solar-red bg-solar-red/10 border border-solar-red/20 rounded-xl px-3 py-2">{authError}</p>}

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError('');
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${authMode === 'signin' ? 'bg-solar-blue text-white' : isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-violet-100 hover:bg-violet-200'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${authMode === 'signup' ? 'bg-solar-blue text-white' : isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-violet-100 hover:bg-violet-200'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <label className="block">
                    <span className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-white/60' : 'text-violet-800/70'}`}>Full Name</span>
                    <div className={`mt-1 flex items-center gap-2 rounded-xl border px-3 ${isDark ? 'border-white/15 bg-white/5' : 'border-violet-200 bg-violet-50'}`}>
                      <UserPlus size={16} className="opacity-60" />
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="w-full py-2.5 bg-transparent outline-none"
                        autoComplete="name"
                      />
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-white/60' : 'text-violet-800/70'}`}>Email</span>
                  <div className={`mt-1 flex items-center gap-2 rounded-xl border px-3 ${isDark ? 'border-white/15 bg-white/5' : 'border-violet-200 bg-violet-50'}`}>
                    <Mail size={16} className="opacity-60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full py-2.5 bg-transparent outline-none"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-white/60' : 'text-violet-800/70'}`}>Password</span>
                  <div className={`mt-1 flex items-center gap-2 rounded-xl border px-3 ${isDark ? 'border-white/15 bg-white/5' : 'border-violet-200 bg-violet-50'}`}>
                    <Lock size={16} className="opacity-60" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full py-2.5 bg-transparent outline-none"
                      autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                      minLength={6}
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 bg-solar-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogIn size={16} />
                  {authLoading
                    ? 'Please wait...'
                    : authMode === 'signin'
                    ? 'Sign In with Email'
                    : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer
        className={`fixed bottom-0 w-full py-6 text-center text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm transition-colors z-10 ${isDark ? 'bg-black/20 text-white/30' : 'bg-white/20 text-violet-900/30'}`}
      >
        <p>&copy; 2026 Bianca Malhotra � BrainType � Cognitive Gym for Developers</p>
      </footer>
    </div>
  );
}
