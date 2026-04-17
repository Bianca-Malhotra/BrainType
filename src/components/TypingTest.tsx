import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Settings, BarChart2, User as UserIcon, AlertCircle, Clock, CheckCircle2, Ghost, LogIn } from 'lucide-react';
import { getBuddyTargetWpm, predictNextWpm } from '../services/mlService';
import { AppUser } from '../types/auth';
import { addSession, updateMetricsForSession } from '../services/localDataService';

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
  "Everything you've ever wanted is on the other side of fear.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Discipline is choosing between what you want now and what you want most.",
  "Do not wait for opportunity, create it.",
  "The best way out is always through.",
  "Dream big and dare to fail.",
  "Simplicity is the soul of efficiency.",
  "Quality means doing it right when no one is looking.",
  "Well done is better than well said.",
  "Consistency is harder when no one is clapping for you.",
  "Focus on progress, not perfection.",
  "A river cuts through rock not because of power but persistence.",
  "The expert in anything was once a beginner.",
  "Pressure is a privilege when you are prepared.",
  "Hard choices, easy life. Easy choices, hard life.",
  "When you feel like quitting, remember why you started.",
  "Talent is common. Discipline is rare.",
  "Read deeply, think clearly, write simply.",
  "Clarity beats complexity every time.",
  "Slow is smooth and smooth is fast.",
  "Train in silence and let your results make noise.",
  "Habits decide the future before goals do.",
  "You do not rise to your goals, you fall to your systems.",
  "No shortcuts, just reps.",
  "Good work compounds.",
  "Build it better than yesterday.",
  "Execute first, optimize second.",
  "The obstacle is the way.",
  "Action creates clarity.",
  "Better every day is still better."
];

const CODE = [
  "const result = await fetch('/api/data');",
  "export default function App() { return <div>Hello</div>; }",
  "const [state, setState] = useState(initialState);",
  "git commit -m 'feat: add multidisciplinary modes'",
  "npm install @tensorflow/tfjs",
  "const aura = document.querySelector('.aura-bg');",
  "Array.from({ length: 10 }).map((_, i) => i);",
  "const isValid = email.includes('@') && password.length >= 8;",
  "function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }",
  "const sorted = [...items].sort((a, b) => a.localeCompare(b));",
  "const response = await axios.get('/v1/sessions');",
  "const token = localStorage.getItem('auth_token');",
  "const [loading, setLoading] = useState(false);",
  "const timeoutId = setTimeout(() => setOpen(false), 1500);",
  "const reduced = values.reduce((sum, current) => sum + current, 0);",
  "if (!user) throw new Error('User is required');",
  "const payload = { id: user.id, role: 'member' };",
  "router.post('/login', async (req, res) => { res.json({ ok: true }); });",
  "const cacheKey = `stats:${userId}`;",
  "await db.collection('sessions').insertOne(session);",
  "const elapsedMs = performance.now() - startRef.current;",
  "setHistory((prev) => [nextResult, ...prev].slice(0, 20));",
  "const hasError = form.email === '' || form.password === '';",
  "const percent = Math.round((correct / total) * 100);",
  "try { await save(); } catch (err) { console.error(err); }",
  "const mode = searchParams.get('mode') || 'words';",
  "const headers = { Authorization: `Bearer ${accessToken}` };",
  "const randomIndex = Math.floor(Math.random() * prompts.length);",
  "const isDark = theme === 'dark-purple';",
  "const uniqueTags = Array.from(new Set(tags));",
  "const regex = /^[a-z0-9_]+$/i;",
  "const endpoint = `${baseUrl}/metrics`;",
  "window.addEventListener('resize', handleResize);",
  "const completed = input.length === target.length;",
  "const next = currentView === 'home' ? 'test' : 'home';",
  "const matrix = Array.from({ length: 3 }, () => Array(3).fill(0));"
];

const FACTS = [
  "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.",
  "A day on Venus is longer than a year on Venus.",
  "Bananas are berries, but strawberries are not.",
  "Octopuses have three hearts and blue blood.",
  "The Eiffel Tower can be 15 cm taller during the summer.",
  "A single cloud can weigh more than a million pounds.",
  "Sharks existed before trees appeared on Earth.",
  "Your brain uses about twenty percent of your body's energy.",
  "Lightning is five times hotter than the surface of the Sun.",
  "There are more possible chess games than atoms in the observable universe.",
  "A group of flamingos is called a flamboyance.",
  "Some bamboo species can grow almost one meter in a single day.",
  "The fingerprints of a koala are very similar to human fingerprints.",
  "The human nose can detect over one trillion different scents.",
  "Hot water can freeze faster than cold water under specific conditions.",
  "The shortest war in history lasted less than forty minutes.",
  "Wombat poop is cube shaped.",
  "The Pacific Ocean is wider than the Moon.",
  "A bolt of lightning contains enough energy to toast thousands of slices of bread.",
  "A day on Mercury lasts about fifty nine Earth days.",
  "Crows can recognize individual human faces.",
  "Sea otters hold hands while sleeping so they do not drift apart.",
  "Some turtles can breathe through their rear end.",
  "The Great Wall of China is not clearly visible from space with the naked eye.",
  "Blue whales have hearts that can weigh as much as a small car.",
  "The Amazon rainforest creates much of its own rainfall.",
  "A strawberry has around two hundred seeds on its surface.",
  "Dolphins have unique signature whistles similar to names.",
  "Saturn could float in water because it is mostly gas and very low density.",
  "Ants do not have lungs.",
  "An adult human has fewer bones than a baby.",
  "A teaspoon of neutron star matter would weigh billions of tons on Earth.",
  "Jellyfish have existed for hundreds of millions of years.",
  "The hottest chili peppers can be over one hundred times hotter than jalapenos.",
  "Many languages do not use words for left and right, but for cardinal directions."
];

type Mode = 'words' | 'quotes' | 'code' | 'facts';

function buildTextFromPool(pool: string[], targetWordCount: number): string {
  if (targetWordCount <= 0) {
    return pool[Math.floor(Math.random() * pool.length)] || '';
  }

  let result = '';

  while (result.split(/\s+/).filter(Boolean).length < targetWordCount) {
    const next = pool[Math.floor(Math.random() * pool.length)] || '';
    if (!next) {
      break;
    }

    if (result.length === 0) {
      result = next;
    } else {
      result += ` ${next}`;
    }
  }

  const words = result.split(/\s+/).filter(Boolean).slice(0, targetWordCount);
  return words.join(' ');
}

interface SessionResult {
  wpm: number;
  accuracy: number;
  timestamp: number;
}

interface TypingTestProps {
  user: AppUser | null;
  onNavigate: (view: 'test' | 'analytics' | 'profile' | 'about') => void;
  onRequireLogin: () => void;
  theme: string;
}

export default function TypingTest({ user, onNavigate, onRequireLogin, theme }: TypingTestProps) {
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
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(testLength);

  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const hoverColor = isDark ? 'hover:text-violet-200' : 'hover:text-violet-600';
  const mutedTextColor = isDark ? 'text-white/40' : 'text-violet-900/40';
  const cardBg = isDark ? 'bg-violet-900/10 border-white/10' : 'bg-violet-50/10 border-violet-900/10';
  const settingsBg = isDark ? 'bg-violet-900/50 border-white/20' : 'bg-white/50 border-violet-900/20';
  const isZenActive = zenMode && startTime && !isFinished;
  
  const inputRef = useRef<HTMLInputElement>(null);

  const generateText = useCallback(async (customText?: string, length?: number) => {
    const len = length || testLength;
    let newText = "";
    
    if (customText) {
      newText = customText;
    } else {
      switch (mode) {
        case 'quotes':
          newText = buildTextFromPool(QUOTES, len);
          break;
        case 'code':
          newText = buildTextFromPool(CODE, len);
          break;
        case 'facts':
          newText = buildTextFromPool(FACTS, len);
          break;
        default:
          newText = buildTextFromPool(WORDS, len);
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
    setTimeRemainingSeconds(len);

    // Update predictions
    if (history.length > 0) {
      const predicted = await predictNextWpm(history);
      const buddy = await getBuddyTargetWpm(history);
      setPredictedWpm(predicted);
      setBuddyWpm(buddy);
    }

    if (inputRef.current) inputRef.current.focus();
  }, [mode, testLength, history]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  useEffect(() => {
    if (!startTime || isFinished) {
      setTimeRemainingSeconds(testLength);
    }
  }, [testLength, startTime, isFinished]);

  const completeTest = useCallback((finalWpm: number, finalAccuracy: number) => {
    if (isFinished) {
      return;
    }

    setIsFinished(true);
    const result: SessionResult = { wpm: finalWpm, accuracy: finalAccuracy, timestamp: Date.now() };

    if (history.length >= 3) {
      const avgWpm = history.slice(0, 3).reduce((acc, curr) => acc + curr.wpm, 0) / 3;
      if (finalWpm < avgWpm * 0.8) {
        setFatigueAlert(true);
      }
    }

    setHistory(prev => [result, ...prev].slice(0, 10));
    saveSession(finalWpm, finalAccuracy);

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
  }, [history, isFinished, keyStats]);

  useEffect(() => {
    if (!isZenActive || !startTime || isFinished) {
      return;
    }

    const interval = window.setInterval(() => {
      const elapsed = Math.floor((performance.now() - startTime) / 1000);
      const remaining = Math.max(testLength - elapsed, 0);
      setTimeRemainingSeconds(remaining);

      if (remaining === 0) {
        window.clearInterval(interval);
        completeTest(wpm, accuracy);
      }
    }, 200);

    return () => window.clearInterval(interval);
  }, [isZenActive, startTime, isFinished, testLength, wpm, accuracy, completeTest]);

  const saveSession = async (finalWpm: number, finalAccuracy: number) => {
    if (!user) return;

    try {
      addSession({
        uid: user.id,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        timestamp: Date.now(),
        testLength,
      });
      updateMetricsForSession(user.id, finalWpm, finalAccuracy);
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

    let currentWpm = wpm;
    let currentAccuracy = accuracy;

    // Calculate WPM
    if (value.length > 0 && startTime) {
      const timeElapsed = (now - startTime) / 1000 / 60; // in minutes
      const wordsTyped = value.length / 5;
      currentWpm = Math.round(wordsTyped / timeElapsed);
      setWpm(currentWpm);

      const errors = value.split("").filter((char, i) => char !== text[i]).length;
      currentAccuracy = Math.round(((value.length - errors) / value.length) * 100);
      setAccuracy(currentAccuracy);
    }

    if (value.length === text.length) {
      completeTest(currentWpm, currentAccuracy);
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

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
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
      <div className={`flex justify-between items-end mb-12 transition-opacity duration-500 ${isZenActive ? 'opacity-0' : 'opacity-100'}`}>
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
            <p className="text-sm font-medium opacity-80">Sign in to save your progress and unlock ML predictions.</p>
          </div>
          <button 
            onClick={onRequireLogin}
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
                <span className={`text-[10px] uppercase tracking-widest font-bold opacity-50 ${textColor}`}>Test Length (Words):</span>
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

              <p className={`text-xs leading-relaxed ${mutedTextColor}`}>
                Zen Mode hides non-essential UI while you type, helping you stay focused. The countdown equals your selected test length in seconds (15, 25, 50, or 100).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fatigue Alert */}
      <AnimatePresence>
        {!isZenActive && fatigueAlert && isFinished && (
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
        {isZenActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className={`px-5 py-2 rounded-full border text-sm font-black tracking-[0.2em] ${isDark ? 'bg-violet-900/30 border-white/15 text-white/90' : 'bg-violet-100/70 border-violet-300 text-violet-900'}`}>
              ZEN TIMER {formatElapsed(timeRemainingSeconds)}
            </div>
          </motion.div>
        )}

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
      {!isZenActive && (
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
      )}

      {/* Bottom Nav */}
      {!isZenActive && (
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
      )}
    </div>
  );
}
