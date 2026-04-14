import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Info, Zap, Shield, Github, Linkedin, Globe, Target, BarChart3 } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
  theme: string;
}

export default function About({ onBack, theme }: AboutProps) {
  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const hoverColor = isDark ? 'hover:text-violet-200' : 'hover:text-violet-600';
  const mutedColor = isDark ? 'text-white/80' : 'text-violet-900/80';
  const subMutedColor = isDark ? 'text-white/70' : 'text-violet-900/70';
  const cardBg = isDark ? 'bg-violet-900/30 border-white/20' : 'bg-violet-50/30 border-violet-900/20';

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

      <div className="space-y-12">
        <div className="text-center">
          <div className="inline-block p-3 bg-solar-blue/10 rounded-2xl mb-4">
            <Info size={32} className="text-solar-blue" />
          </div>
          <h2 className={`text-4xl font-bold mb-4 tracking-tight ${textColor}`}>About BrainType</h2>
          <p className={`max-w-2xl mx-auto leading-relaxed ${mutedColor}`}>
            BrainType is a high-performance typing gym for developers. 
            We go beyond standard typing clones to train your speed, 
            accuracy, and technical vocabulary under pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-2xl p-6 border ${cardBg}`}>
            <Zap size={24} className="text-solar-blue mb-4" />
            <h3 className={`text-lg font-bold mb-2 ${textColor}`}>Technical Modes</h3>
            <p className={`text-sm leading-relaxed ${subMutedColor}`}>
              From Code Snippets to Industry Facts, train your ability to process and type technical information instantly.
            </p>
          </div>

          <div className={`rounded-2xl p-6 border ${cardBg}`}>
            <BarChart3 size={24} className="text-solar-blue mb-4" />
            <h3 className={`text-lg font-bold mb-2 ${textColor}`}>Performance Analytics</h3>
            <p className={`text-sm leading-relaxed ${subMutedColor}`}>
              Get real-time feedback on your WPM and accuracy, with historical tracking to visualize your growth over time.
            </p>
          </div>

          <div className={`rounded-2xl p-6 border ${cardBg}`}>
            <Shield size={24} className="text-solar-blue mb-4" />
            <h3 className={`text-lg font-bold mb-2 ${textColor}`}>Zen & Aura</h3>
            <p className={`text-sm leading-relaxed ${subMutedColor}`}>
              Focus with Zen Mode and a dynamic "Aura" that pulses faster as your WPM increases.
            </p>
          </div>

          <div className={`rounded-2xl p-6 border ${cardBg}`}>
            <Target size={24} className="text-solar-blue mb-4" />
            <h3 className={`text-lg font-bold mb-2 ${textColor}`}>Key Insights</h3>
            <p className={`text-sm leading-relaxed ${subMutedColor}`}>
              Identify "Problem Keys" that slow you down. We track per-key delay and error rates for deep analysis.
            </p>
          </div>
        </div>

        <div className={`border-t pt-12 ${isDark ? 'border-white/20' : 'border-violet-900/20'}`}>
          <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 text-center ${textColor}`}>Developer</h3>
          <p className={`text-center text-xl font-black mb-8 ${textColor}`}>Bianca Malhotra</p>
          
          <div className="flex justify-center gap-8 mb-12">
            <a href="https://github.com/Bianca-Malhotra" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}>
              <Github size={20} />
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/bianca-malhotra/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}>
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>
            <a href="mailto:biancamalhotra2004@gmail.com" className={`flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}>
              <Globe size={20} />
              <span>Gmail</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
            <div className={`p-6 rounded-2xl border ${cardBg}`}>
              <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${textColor}`}>Terms of Service</h4>
              <p className={`text-[10px] leading-relaxed ${subMutedColor}`}>
                By using BrainType, you agree to our training protocols. All content is for educational purposes. We prioritize fair use and intellectual growth.
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardBg}`}>
              <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${textColor}`}>Privacy Policy</h4>
              <p className={`text-[10px] leading-relaxed ${subMutedColor}`}>
                Your data is yours. We store your session results securely to track your progress. We never sell your cognitive data to third parties.
              </p>
            </div>
          </div>
        </div>

        <div className={`text-center text-[10px] uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-violet-900/40'}`}>
          Version 2.0.0 • © 2026 Bianca Malhotra • Built with ❤️ for the Cognitive Mind
        </div>
      </div>
    </motion.div>
  );
}
