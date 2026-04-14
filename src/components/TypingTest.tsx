import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Settings, BarChart2, User as UserIcon, AlertCircle, Clock, CheckCircle2, Ghost, LogIn } from 'lucide-react';
import { db, auth } from '../firebase';
import { getBuddyTargetWpm, predictNextWpm } from '../services/mlService';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Stay hungry, stay foolish.",
  "Innovation distinguishes between a leader and a follower.",
  "Your time is limited, so don't waste it living someone else's life.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you've ever wanted is on the other side of fear."
];

const CODE = [
  "const result = await fetch('/api/data');",
  "export default function App() { return <div>Hello</div>; }",
  "const [state, setState] = useState(initialState);",
  "git commit -m 'feat: add multidisciplinary modes'",
  "npm install @tensorflow/tfjs",
  "const aura = document.querySelector('.aura-bg');",
  "Array.from({ length: 10 }).map((_, i) => i);"
];

const FACTS = [
  "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.",
  "A day on Venus is longer than a year on Venus.",
  "Bananas are berries, but strawberries are not.",
  "Octopuses have three hearts and blue blood.",
  "The Eiffel Tower can be 15 cm taller during the summer.",
  "A single cloud can weigh more than a million pounds."
];

type Mode = 'words' | 'quotes' | 'code' | 'facts';

interface SessionResult {
  wpm: number;
  accuracy: number;
  timestamp: number;
}

interface TypingTestProps {
  user: FirebaseUser | null;
  onNavigate: (view: 'test' | 'analytics' | 'profile' | 'about') => void;
  theme: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function TypingTest({ user, onNavigate, theme }: TypingTestProps) {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [testLength, setTestLength] = useState(25);
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [fatigueAlert, setFatigueAlert] = useState(false);
  const [buddyWpm, setBuddyWpm] = useState(60);
  const [buddyProgress, setBuddyProgress] = useState(0);
  const [predictedWpm, setPredictedWpm] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('words');
  const [zenMode, setZenMode] = useState(false);
  const [keyStats, setKeyStats] = useState<Record<string, { delay: number, errors: number, count: number }>>({});
  const [problemKeys, setProblemKeys] = useState<string[]>([]);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number | null>(null);

  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const hoverColor = isDark ? 'hover:text-violet-200' : 'hover:text-violet-600';
  const mutedTextColor = isDark ? 'text-white/40' : 'text-violet-900/40';
  const cardBg = isDark ? 'bg-violet-900/10 border-white/10' : 'bg-violet-50/10 border-violet-900/10';
  const settingsBg = isDark ? 'bg-violet-900/50 border-white/20' : 'bg-white/50 border-violet-900/20';
  
  const inputRef = useRef<HTMLInputElement>(null);

  const generateText = useCallback(async (customText?: string, length?: number) => {
    const len = length || testLength;
    let newText = "";
    
    if (customText) {
      newText = customText;
    } else {
      switch (mode) {
        case 'quotes':
          newText = QUOTES[Math.floor(Math.random() * QUOTES.length)];
          break;
        case 'code':
          newText = CODE[Math.floor(Math.random() * CODE.length)];
          break;
        case 'facts':
          newText = FACTS[Math.floor(Math.random() * FACTS.length)];
          break;
        default:
          newText = Array.from({ length: len }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(" ");
      }
    }
    
    setText(newText);
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setFatigueAlert(false);
    setBuddyProgress(0);
    setKeyStats({});
    setProblemKeys([]);

    // Update predictions
    if (history.length > 0) {
      const predicted = await predictNextWpm(history);
      const buddy = await getBuddyTargetWpm(history);
      setPredictedWpm(predicted);
      setBuddyWpm(buddy);
    }

    if (inputRef.current) inputRef.current.focus();
  }, [testLength, history]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  const saveSession = async (finalWpm: number, finalAccuracy: number) => {
    if (!user) return;

    try {
      // Save session
      const sessionsPath = 'sessions';
      try {
        await addDoc(collection(db, sessionsPath), {
          uid: user.uid,
          wpm: finalWpm,
          accuracy: finalAccuracy,
          timestamp: serverTimestamp(),
          testLength
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, sessionsPath);
      }

      // Update metrics
      const metricsPath = `metrics/${user.uid}`;
      try {
        const metricsRef = doc(db, 'metrics', user.uid);
        const metricsSnap = await getDoc(metricsRef);

        if (metricsSnap.exists()) {
          const data = metricsSnap.data();
          const newTotal = data.totalTests + 1;
          const newAvgWpm = (data.avgWpm * data.totalTests + finalWpm) / newTotal;
          const newAvgAcc = (data.avgAccuracy * data.totalTests + finalAccuracy) / newTotal;
          
          await updateDoc(metricsRef, {
            avgWpm: newAvgWpm,
            avgAccuracy: newAvgAcc,
            maxWpm: Math.max(data.maxWpm, finalWpm),
            totalTests: increment(1),
            lastUpdated: serverTimestamp()
          });
        } else {
          await setDoc(metricsRef, {
            uid: user.uid,
            avgWpm: finalWpm,
            maxWpm: finalWpm,
            avgAccuracy: finalAccuracy,
            totalTests: 1,
            lastUpdated: serverTimestamp()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, metricsPath);
      }
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const now = performance.now();

    if (!startTime && value.length > 0) {
      setStartTime(now);
    }

    setUserInput(value);

    // Track key performance
    const lastChar = value[value.length - 1]?.toLowerCase();
    if (lastChar && /^[a-z0-9]$/.test(lastChar)) {
      const delay = lastKeystrokeTime ? now - lastKeystrokeTime : 0;
      const isError = value[value.length - 1] !== text[value.length - 1];
      
      setKeyStats(prev => {
        const current = prev[lastChar] || { delay: 0, errors: 0, count: 0 };
        return {
          ...prev,
          [lastChar]: {
            delay: current.delay + delay,
            errors: current.errors + (isError ? 1 : 0),
            count: current.count + 1
          }
        };
      });
    }
    setLastKeystrokeTime(now);

    // Calculate WPM
    if (value.length > 0 && startTime) {
      const timeElapsed = (now - startTime) / 1000 / 60; // in minutes
      const wordsTyped = value.length / 5;
      const currentWpm = Math.round(wordsTyped / timeElapsed);
      setWpm(currentWpm);

      const errors = value.split("").filter((char, i) => char !== text[i]).length;
      setAccuracy(Math.round(((value.length - errors) / value.length) * 100));
    }

    if (value.length === text.length) {
      setIsFinished(true);
      const result: SessionResult = { wpm, accuracy, timestamp: Date.now() };
      
      // Fatigue Detection
      if (history.length >= 3) {
        const avgWpm = history.slice(0, 3).reduce((acc, curr) => acc + curr.wpm, 0) / 3;
        if (wpm < avgWpm * 0.8) {
          setFatigueAlert(true);
        }
      }

      setHistory(prev => [result, ...prev].slice(0, 10));
      
      // Save to Firebase
      saveSession(wpm, accuracy);

      // Identify Problem Keys (high error rate or high delay)
      const problems = Object.entries(keyStats)
        .map(([key, stats]) => ({
          key,
          avgDelay: stats.delay / stats.count,
          errorRate: stats.errors / stats.count
        }))
        .filter(k => k.errorRate > 0.2 || k.avgDelay > 300)
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 5)
        .map(k => k.key);
      
      setProblemKeys(problems);
    }
  };

  // Buddy Movement Logic
  useEffect(() => {
    let rafId: number;
    if (startTime && !isFinished) {
      const charsPerSecond = (buddyWpm * 5) / 60;
      
      const update = () => {
        const now = performance.now();
        const elapsedSeconds = (now - startTime) / 1000;
        const currentProgress = elapsedSeconds * charsPerSecond;
        
        setBuddyProgress(Math.min(currentProgress, text.length - 1));
        
        if (currentProgress < text.length - 1) {
          rafId = requestAnimationFrame(update);
        }
      };
      
      rafId = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(rafId);
  }, [startTime, isFinished, buddyWpm, text.length]);
  const renderText = () => {
    return text.split("").map((char, index) => {
      let color = mutedTextColor;

      if (index < userInput.length) {
        if (userInput[index] === char) {
          color = textColor;
        } else {
          color = "text-solar-red bg-solar-red/10";
        }
      }

      const isCaret = index === userInput.length;
      const isBuddy = index === Math.floor(buddyProgress) && startTime && !isFinished;

      return (
        <span key={index} className="relative inline-block">
          {isCaret && (
            <motion.div
              layoutId="caret"
              className="absolute left-0 top-0 bottom-0 w-[2px] bg-solar-blue z-10"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ 
                layout: { type: "spring", stiffness: 500, damping: 40 },
                opacity: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          )}
          {isBuddy && (
            <motion.div
              layoutId="buddy"
              className="absolute left-0 top-0 bottom-0 w-[2px] bg-solar-cyan/50 z-0"
              initial={false}
              transition={{ 
                layout: { type: "tween", ease: "linear", duration: 0.1 } 
              }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Ghost size={12} className="text-solar-cyan/50" />
              </div>
            </motion.div>
          )}
          <span className={`${color} transition-colors duration-100`}>
            {char}
          </span>
        </span>
      );
    });
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 font-sans ${textColor}`}>
      {/* Speed-Reactive Aura Intensity */}
      <style dangerouslySetInnerHTML={{ __html: `
        .aura-bg { 
          animation-duration: ${Math.max(2, 15 - (wpm / 10))}s !important;
          opacity: ${0.1 + (wpm / 500)} !important;
        }
      `}} />

      {/* Header Stats */}
      <div className={`flex justify-between items-end mb-12 transition-opacity duration-500 ${zenMode && startTime && !isFinished ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">WPM</span>
            <span className="text-6xl font-black text-solar-blue tracking-tighter leading-none">{wpm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Accuracy</span>
            <span className="text-6xl font-black text-solar-blue tracking-tighter leading-none">
              {accuracy}%
            </span>
          </div>
          {predictedWpm && !startTime && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col border-l border-solar-blue/20 pl-12"
            >
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Performance Forecast</span>
              <span className="text-4xl font-black text-solar-cyan tracking-tighter leading-none">{predictedWpm}</span>
            </motion.div>
          )}
        </div>
        <div className="flex flex-col items-end gap-4">
          {!startTime && history.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50">
              <Ghost size={12} />
              <span>Buddy Target: {buddyWpm} WPM</span>
            </div>
          )}
          <div className="flex gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-navy-light' : 'hover:bg-cream-dark'} ${showSettings ? 'text-solar-blue' : textColor}`}
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={() => generateText()} 
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-navy-light' : 'hover:bg-cream-dark'} ${textColor}`}
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {!user && !startTime && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-12 p-4 rounded-xl border border-solar-blue/20 bg-solar-blue/5 flex items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-solar-blue/10 rounded-lg flex items-center justify-center text-solar-blue">
              <LogIn size={16} />
            </div>
            <p className="text-sm font-medium opacity-80">Sign in with Google to save your progress and unlock ML predictions.</p>
          </div>
          <button 
            onClick={() => {
              const provider = new GoogleAuthProvider();
              signInWithPopup(auth, provider);
            }}
            className="text-xs font-bold uppercase tracking-widest text-solar-blue hover:underline"
          >
            Sign In Now
          </button>
        </motion.div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-8 p-6 rounded-2xl border backdrop-blur-md ${settingsBg}`}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className={`text-[10px] uppercase tracking-widest font-bold opacity-50 ${textColor}`}>Mode:</span>
                <div className="flex flex-wrap gap-6">
                  {(['words', 'quotes', 'code', 'facts'] as Mode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setShowSettings(false);
                      }}
                      className={`text-sm font-bold transition-all capitalize ${mode === m ? 'text-solar-blue scale-110' : `${mutedTextColor} hover:${textColor}`}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className={`text-[10px] uppercase tracking-widest font-bold opacity-50 ${textColor}`}>Test Length:</span>
                <div className="flex gap-6">
                  {[15, 25, 50, 100].map(len => (
                    <button
                      key={len}
                      onClick={() => {
                        setTestLength(len);
                        setShowSettings(false);
                      }}
                      className={`text-sm font-bold transition-all ${testLength === len ? 'text-solar-blue scale-110' : `${mutedTextColor} hover:${textColor}`}`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className={`text-[10px] uppercase tracking-widest font-bold opacity-50 ${textColor}`}>Zen Mode:</span>
                <button
                  onClick={() => setZenMode(!zenMode)}
                  className={`text-sm font-bold transition-all ${zenMode ? 'text-solar-blue' : `${mutedTextColor} hover:${textColor}`}`}
                >
                  {zenMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fatigue Alert */}
      <AnimatePresence>
        {fatigueAlert && isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 bg-solar-red/10 border border-solar-red/30 rounded-xl p-4 flex items-center gap-3 text-solar-red"
          >
            <AlertCircle size={20} />
            <div className="text-sm">
              <span className="font-bold">Fatigue Detected:</span> Your speed has dropped significantly. Consider taking a short break!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing Area */}
      <div className="relative mb-24 min-h-[120px]">
        <div 
          className="relative text-3xl leading-relaxed cursor-text select-none mb-12 min-h-[160px] outline-none font-typing"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            className="absolute inset-0 opacity-0 cursor-default"
            value={userInput}
            onChange={handleInputChange}
            disabled={isFinished}
            autoFocus
          />
          <div className="flex flex-wrap gap-x-[0.25em] gap-y-[0.4em]">
            {renderText()}
          </div>
        </div>
      </div>

      {/* Problem Keys & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <AnimatePresence>
          {isFinished && problemKeys.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl p-8 border ${cardBg}`}
            >
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-50 ${textColor}`}>Problem Keys</h3>
              <div className="flex flex-wrap gap-3">
                {problemKeys.map(key => (
                  <div key={key} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-solar-blue/5 border-solar-blue/10'}`}>
                    {key.toUpperCase()}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs opacity-50 leading-relaxed">
                These keys are slowing you down or causing errors. Focus on them in your next session.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-8 border ${cardBg}`}
          >
            <div className={`flex items-center gap-2 mb-6 ${textColor}`}>
              <Clock size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">Recent Sessions</h3>
            </div>
            <div className="space-y-4">
              {history.map((res, i) => (
                <div key={i} className={`flex justify-between items-center text-xs border-b pb-3 last:border-0 ${isDark ? 'border-white/10' : 'border-solar-blue/10'}`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-solar-cyan/50" />
                    <span className={mutedTextColor}>{new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-solar-blue font-bold">{res.wpm} WPM</span>
                    <span className={textColor}>{res.accuracy}% ACC</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className={`mt-24 flex justify-center gap-12 text-sm ${textColor}`}>
        <div 
          onClick={() => onNavigate('analytics')}
          className={`flex items-center gap-2 ${hoverColor} cursor-pointer transition-colors group`}
        >
          <BarChart2 size={16} className="group-hover:scale-110 transition-transform" />
          <span>Analytics</span>
        </div>
        <div 
          onClick={() => onNavigate('profile')}
          className={`flex items-center gap-2 ${hoverColor} cursor-pointer transition-colors group`}
        >
          <UserIcon size={16} className="group-hover:scale-110 transition-transform" />
          <span>Profile</span>
        </div>
        <div 
          onClick={() => onNavigate('about')}
          className={`flex items-center gap-2 ${hoverColor} cursor-pointer transition-colors group`}
        >
          <AlertCircle size={16} className="group-hover:scale-110 transition-transform" />
          <span>About</span>
        </div>
      </div>
    </div>
  );
}
