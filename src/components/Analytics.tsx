import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Activity, Loader2, ChevronLeft } from 'lucide-react';

interface Session {
  wpm: number;
  accuracy: number;
  timestamp: any;
  testLength: number;
}

interface AnalyticsProps {
  user: FirebaseUser | null;
  onBack: () => void;
  theme: string;
}

export default function Analytics({ user, onBack, theme }: AnalyticsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const hoverColor = isDark ? 'hover:text-violet-200' : 'hover:text-violet-600';
  const cardBg = isDark ? 'bg-violet-900/30 border-white/20' : 'bg-violet-50/30 border-violet-900/20';
  const chartBg = isDark ? 'bg-violet-900/10 border-white/10' : 'bg-violet-50/10 border-violet-900/10';

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        const q = query(
          collection(db, 'sessions'),
          where('uid', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const sessionData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as Session[];
        
        // Reverse to show chronological order in chart
        setSessions(sessionData.reverse());
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className={`animate-spin ${theme === 'cream' ? 'text-solar-blue' : 'text-solar-blue'}`} size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className={theme === 'cream' ? 'text-solar-base01' : 'text-solar-base0'}>Please login to view your analytics.</p>
        <button onClick={onBack} className="mt-4 text-solar-blue hover:underline">Go Back</button>
      </div>
    );
  }

  const avgWpm = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.wpm, 0) / sessions.length) 
    : 0;
  const maxWpm = sessions.length > 0 
    ? Math.max(...sessions.map(s => s.wpm)) 
    : 0;
  const avgAcc = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length) 
    : 0;

  const chartData = sessions.map((s, i) => ({
    index: i + 1,
    wpm: s.wpm,
    accuracy: s.accuracy,
    date: s.timestamp.toLocaleDateString()
  }));

  const chartColors = {
    wpm: '#8b5cf6',
    accuracy: '#c4b5fd',
    grid: isDark ? '#4c1d95' : '#ede9fe',
    text: isDark ? '#ffffff' : '#4c1d95',
    tooltip: isDark ? '#2e1065' : '#ffffff',
    tooltipBorder: isDark ? '#4c1d95' : '#ede9fe'
  };

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

      <h2 className={`text-3xl font-bold mb-8 flex items-center gap-3 ${textColor}`}>
        <Activity className="text-solar-blue" />
        Performance Analytics
      </h2>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className={`rounded-2xl p-6 border ${cardBg}`}>
          <div className={`flex items-center gap-3 mb-2 ${textColor}`}>
            <TrendingUp size={18} />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Average WPM</span>
          </div>
          <div className="text-4xl font-black text-solar-blue tracking-tighter">{avgWpm}</div>
        </div>
        <div className={`rounded-2xl p-6 border ${cardBg}`}>
          <div className={`flex items-center gap-3 mb-2 ${textColor}`}>
            <Award size={18} />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Personal Best</span>
          </div>
          <div className="text-4xl font-black text-solar-blue tracking-tighter">{maxWpm}</div>
        </div>
        <div className={`rounded-2xl p-6 border ${cardBg}`}>
          <div className={`flex items-center gap-3 mb-2 ${textColor}`}>
            <Target size={18} />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Avg Accuracy</span>
          </div>
          <div className="text-4xl font-black text-solar-blue tracking-tighter">{avgAcc}%</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className={`rounded-2xl p-8 mb-12 h-[400px] border ${chartBg}`}>
        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-8 opacity-50 ${textColor}`}>WPM Progress (Last 50 Tests)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#268bd2" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#268bd2" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis 
              dataKey="index" 
              stroke={chartColors.text} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              opacity={0.5}
            />
            <YAxis 
              stroke={chartColors.text} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              opacity={0.5}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartColors.tooltip, 
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: '12px',
                color: chartColors.text,
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: '#268bd2' }}
            />
            <Area 
              type="monotone" 
              dataKey="wpm" 
              stroke="#268bd2" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorWpm)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Chart */}
      <div className={`rounded-2xl p-8 h-[300px] border ${chartBg}`}>
        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-8 opacity-50 ${textColor}`}>Accuracy Stability</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis 
              dataKey="index" 
              stroke={chartColors.text} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              opacity={0.5}
            />
            <YAxis 
              stroke={chartColors.text} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              opacity={0.5}
              domain={[80, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartColors.tooltip, 
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              type="stepAfter" 
              dataKey="accuracy" 
              stroke="#2aa198" 
              strokeWidth={3}
              dot={false}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
