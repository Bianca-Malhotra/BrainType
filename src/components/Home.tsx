import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Cpu, Target, ArrowRight, Shield, BarChart3, MessageSquare, Code2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface HomeProps {
  onStart: () => void;
  onNavigate: (view: any) => void;
  theme: string;
}

export default function Home({ onStart, onNavigate, theme }: HomeProps) {
  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const mutedColor = isDark ? 'text-white/60' : 'text-violet-900/60';
  const cardBg = isDark ? 'bg-violet-900/10 border-white/10' : 'bg-violet-50/10 border-violet-900/10';

  return (
    <div className="space-y-40 md:space-y-44">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-24 md:pt-28 pb-40 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-blue/10 border border-solar-blue/20 text-solar-blue text-xs font-bold uppercase tracking-widest mb-8"
        >
          <Zap size={14} />
          <span>BrainType 2.0 is here</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-10 ${textColor}`}
        >
          Train how you <span className="text-solar-blue">think</span>,<br />
          not just how you <span className="text-solar-blue">code</span>.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`max-w-3xl text-xl md:text-2xl leading-relaxed mb-14 ${mutedColor}`}
        >
          The high-performance typing gym for developers. Master speed, 
          accuracy, and focus under pressure.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8"
        >
          <button 
            onClick={onStart}
            className="group flex items-center gap-3 bg-solar-blue text-white px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-solar-blue/30"
          >
            Start Training
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onNavigate('features')}
            className={`px-8 py-4 rounded-2xl font-black text-lg border transition-all ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-solar-blue/20 hover:bg-solar-blue/5'} ${textColor}`}
          >
            Explore Modes
          </button>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-36 border-t border-solar-blue/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-14">
          <ScrollReveal className={`space-y-5 p-6 md:p-8 rounded-3xl border ${cardBg}`} delay={0.05}>
            <div className="w-12 h-12 bg-solar-blue/10 rounded-xl flex items-center justify-center text-solar-blue">
              <Zap size={24} />
            </div>
            <h3 className={`text-2xl font-bold ${textColor}`}>Speed</h3>
            <p className={`leading-relaxed ${mutedColor}`}>
              Push your limits with high-speed typing drills designed for technical vocabulary and syntax.
            </p>
          </ScrollReveal>
          <ScrollReveal className={`space-y-5 p-6 md:p-8 rounded-3xl border ${cardBg}`} delay={0.15}>
            <div className="w-12 h-12 bg-solar-blue/10 rounded-xl flex items-center justify-center text-solar-blue">
              <Target size={24} />
            </div>
            <h3 className={`text-2xl font-bold ${textColor}`}>Accuracy</h3>
            <p className={`leading-relaxed ${mutedColor}`}>
              Eliminate typos in your code and documentation with precision-focused training modes.
            </p>
          </ScrollReveal>
          <ScrollReveal className={`space-y-5 p-6 md:p-8 rounded-3xl border ${cardBg}`} delay={0.25}>
            <div className="w-12 h-12 bg-solar-blue/10 rounded-xl flex items-center justify-center text-solar-blue">
              <BarChart3 size={24} />
            </div>
            <h3 className={`text-2xl font-bold ${textColor}`}>Analytics</h3>
            <p className={`leading-relaxed ${mutedColor}`}>
              Track your progress with detailed performance metrics and predictive forecasting.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <ScrollReveal>
        <section className={`py-36 ${isDark ? 'bg-white/5' : 'bg-solar-blue/5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 text-center">
          <div>
            <div className="text-4xl font-black text-solar-blue mb-2">10k+</div>
            <div className={`text-xs uppercase tracking-widest font-bold ${mutedColor}`}>Sessions</div>
          </div>
          <div>
            <div className="text-4xl font-black text-solar-blue mb-2">98%</div>
            <div className={`text-xs uppercase tracking-widest font-bold ${mutedColor}`}>Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-black text-solar-blue mb-2">120+</div>
            <div className={`text-xs uppercase tracking-widest font-bold ${mutedColor}`}>Avg WPM</div>
          </div>
          <div>
            <div className="text-4xl font-black text-solar-blue mb-2">24/7</div>
            <div className={`text-xs uppercase tracking-widest font-bold ${mutedColor}`}>Available</div>
          </div>
        </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal>
        <section className="max-w-5xl mx-auto px-6 md:px-8 py-36 text-center">
        <h2 className={`text-4xl md:text-6xl font-black tracking-tighter mb-8 ${textColor}`}>
          Ready to level up your<br />
          <span className="text-solar-blue">developer communication?</span>
        </h2>
        <button 
          onClick={onStart}
          className="bg-solar-blue text-white px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-solar-blue/30"
        >
          Enter the Gym
        </button>
        </section>
      </ScrollReveal>
    </div>
  );
}
