import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Calendar, Award, Zap, Target, ChevronLeft, LogOut } from 'lucide-react';
import { AppUser } from '../types/auth';
import { getUserMetrics, UserMetrics } from '../services/localDataService';

interface ProfileProps {
  user: AppUser | null;
  onBack: () => void;
  onLogout: () => void;
  theme: string;
}

export default function Profile({ user, onBack, onLogout, theme }: ProfileProps) {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const hoverColor = isDark ? 'hover:text-violet-200' : 'hover:text-violet-600';
  const mutedColor = isDark ? 'text-white/60' : 'text-violet-900/60';
  const cardBg = isDark ? 'bg-violet-900/30 border-white/20' : 'bg-violet-50/30 border-violet-900/20';
  const innerCardBg = isDark ? 'bg-violet-900/10 border-white/10' : 'bg-violet-50/10 border-violet-900/10';

  useEffect(() => {
    if (!user) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setMetrics(getUserMetrics(user.id));
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className={textColor}>Please sign in to view your profile.</p>
        <button onClick={onBack} className="mt-4 text-solar-blue hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <button 
        onClick={onBack}
        className={`flex items-center gap-2 transition-colors mb-8 group ${textColor} ${hoverColor}`}
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Test</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className={`rounded-3xl p-8 text-center border ${cardBg}`}>
            <div className="relative inline-block mb-6">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-24 h-24 rounded-full border-4 border-solar-blue/20 p-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-solar-blue/20 ${isDark ? 'bg-navy-light' : 'bg-cream-dark'}`}>
                  <UserIcon size={48} className={textColor} />
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-solar-cyan border-4 border-solar-navy rounded-full"></div>
            </div>
            <h2 className={`text-2xl font-black mb-1 tracking-tighter ${textColor}`}>{user.name || 'Typist'}</h2>
            <p className={`text-sm mb-8 font-medium ${mutedColor}`}>{user.email}</p>
            
            <div className={`space-y-4 text-left text-xs border-t pt-8 ${isDark ? 'border-white/10' : 'border-solar-blue/10'}`}>
              <div className={`flex items-center gap-3 ${mutedColor}`}>
                <Mail size={14} className="text-solar-blue" />
                <span>{user.email}</span>
              </div>
              <div className={`flex items-center gap-3 ${mutedColor}`}>
                <Calendar size={14} className="text-solar-blue" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="mt-10 w-full flex items-center justify-center gap-2 border border-solar-red/30 text-solar-red py-3 rounded-2xl text-sm font-bold hover:bg-solar-red/10 transition-all active:scale-95"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="md:col-span-2 space-y-6">
          <div className={`rounded-3xl p-10 border ${innerCardBg}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-12 opacity-50 ${textColor}`}>Career Statistics</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${mutedColor}`}>
                  <Award size={14} className="text-solar-blue" />
                  <span>Personal Best</span>
                </div>
                <div className={`text-6xl font-black tracking-tighter ${textColor}`}>{metrics?.maxWpm || 0} <span className={`text-xl font-normal opacity-50`}>WPM</span></div>
              </div>

              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${mutedColor}`}>
                  <Zap size={14} className="text-solar-blue" />
                  <span>Average Speed</span>
                </div>
                <div className={`text-6xl font-black tracking-tighter ${textColor}`}>{Math.round(metrics?.avgWpm || 0)} <span className={`text-xl font-normal opacity-50`}>WPM</span></div>
              </div>

              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${mutedColor}`}>
                  <Target size={14} className="text-solar-blue" />
                  <span>Avg Accuracy</span>
                </div>
                <div className={`text-6xl font-black tracking-tighter ${textColor}`}>{Math.round(metrics?.avgAccuracy || 0)} <span className={`text-xl font-normal opacity-50`}>%</span></div>
              </div>

              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${mutedColor}`}>
                  <Calendar size={14} className="text-solar-blue" />
                  <span>Total Tests</span>
                </div>
                <div className={`text-6xl font-black tracking-tighter ${textColor}`}>{metrics?.totalTests || 0}</div>
              </div>
            </div>

            <div className={`mt-16 p-6 rounded-2xl border ${isDark ? 'bg-solar-blue/5 border-solar-blue/20' : 'bg-solar-blue/5 border-solar-blue/10'}`}>
              <p className={`text-sm leading-relaxed italic text-center font-medium ${isDark ? 'text-solar-blue/80' : 'text-solar-blue/70'}`}>
                "The multidisciplinary mind is the future. Every keystroke is a step toward mastery in all fields."
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
