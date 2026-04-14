import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import TypingTest from './components/TypingTest';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import About from './components/About';
import Home from './components/Home';
import Features from './components/Features';
import { LogIn, LogOut, User as UserIcon, Sun, Moon, Menu, X } from 'lucide-react';

type View = 'home' | 'test' | 'analytics' | 'profile' | 'about' | 'features';
type Theme = 'light-purple' | 'dark-purple';

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'light-purple', label: 'Light Purple', color: '#ffffff' },
  { id: 'dark-purple', label: 'Dark Purple', color: '#2e1065' },
];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light-purple';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ensure user document exists in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp(),
            role: 'user',
            settings: { testLength: 25 }
          });
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => auth.signOut();

  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const hoverColor = isDark ? 'hover:text-violet-200' : 'hover:text-violet-600';
  const mutedTextColor = isDark ? 'text-white/40' : 'text-violet-900/40';
  const bgMuted = isDark ? 'hover:bg-violet-800' : 'hover:bg-violet-100';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center theme-${theme}`}>
        <div className="w-8 h-8 border-4 border-solar-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStart={() => setCurrentView('test')} onNavigate={(view: View) => setCurrentView(view)} theme={theme} />;
      case 'features':
        return <Features onBack={() => setCurrentView('home')} theme={theme} />;
      case 'analytics':
        return <Analytics user={user} onBack={() => setCurrentView('test')} theme={theme} />;
      case 'profile':
        return <Profile user={user} onBack={() => setCurrentView('test')} theme={theme} />;
      case 'about':
        return <About onBack={() => setCurrentView('test')} theme={theme} />;
      default:
        return <TypingTest user={user} onNavigate={(view: View) => setCurrentView(view)} theme={theme} />;
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
      
      <header className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between relative z-50">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('home')}
        >
          <div className="w-8 h-8 bg-solar-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${textColor}`}>
            Brain<span className="text-solar-blue">Type</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
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
            {THEMES.map(t => (
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
              <div 
                className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${textColor} ${hoverColor}`}
                onClick={() => setCurrentView('profile')}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full border border-solar-blue/20" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={16} />
                )}
                <span className="hidden md:inline">{user.displayName || user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className={`p-2 transition-colors ${textColor} ${hoverColor}`}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-solar-blue text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-solar-blue/20"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Sign in with Google</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className={`lg:hidden p-2 ${textColor}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 lg:hidden backdrop-blur-xl ${isDark ? 'bg-navy-dark/95' : 'bg-cream-light/95'} pt-32 px-4`}
          >
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map(link => (
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
                {THEMES.map(t => (
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
      
      <main className="pb-24 relative z-10">
        {renderView()}
      </main>

      <footer className={`fixed bottom-0 w-full py-6 text-center text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm transition-colors z-10 ${isDark ? 'bg-black/20 text-white/30' : 'bg-white/20 text-violet-900/30'}`}>
        <p>&copy; 2026 Bianca Malhotra • BrainType • Cognitive Gym for Developers</p>
      </footer>
    </div>
  );
}
