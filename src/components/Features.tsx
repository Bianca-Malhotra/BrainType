import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap, MessageSquare, Target, Cpu, Code2, Clock, Shield, BarChart3 } from 'lucide-react';

interface FeaturesProps {
  onBack: () => void;
  theme: string;
}

export default function Features({ onBack, theme }: FeaturesProps) {
  const isDark = theme === 'dark-purple';
  const textColor = isDark ? 'text-white' : 'text-violet-900';
  const mutedColor = isDark ? 'text-white/60' : 'text-violet-900/60';
  const cardBg = isDark ? 'bg-violet-900/20 border-white/10' : 'bg-violet-50/20 border-violet-900/10';

  const features = [
    {
      icon: <Code2 size={24} />,
      title: "Code Mode",
      description: "Practice typing real-world code snippets, from React hooks to system commands. Master the syntax of modern development.",
      metrics: ["WPM", "Accuracy", "Keystroke Delay"]
    },
    {
      icon: <Target size={24} />,
      title: "Facts Mode",
      description: "Type interesting facts and trivia. A great way to build muscle memory while learning something new.",
      metrics: ["WPM", "Accuracy", "Consistency"]
    },
    {
      icon: <Shield size={24} />,
      title: "Zen Mode",
      description: "Eliminate distractions. Hide all stats and UI elements during the test to focus purely on the flow of typing.",
      metrics: ["Focus", "Rhythm", "Immersion"]
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Performance Insights",
      description: "Deep-dive into your typing habits. Identify problem keys, speed drops, and accuracy trends over time.",
      metrics: ["Heatmaps", "Trend Lines", "Key Stats"]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-12"
    >
      <button 
        onClick={onBack}
        className={`flex items-center gap-2 transition-colors mb-12 group ${textColor} hover:text-solar-blue`}
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs">Back to Home</span>
      </button>

      <div className="space-y-24">
        <div className="text-center space-y-4">
          <h2 className={`text-5xl md:text-7xl font-black tracking-tighter ${textColor}`}>
            The <span className="text-solar-blue">Modes</span> of BrainType
          </h2>
          <p className={`max-w-2xl mx-auto text-xl ${mutedColor}`}>
            Every mode is designed to isolate and train a specific cognitive skill essential for modern software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-10 rounded-3xl border ${cardBg} backdrop-blur-md space-y-6`}
            >
              <div className="w-14 h-14 bg-solar-blue/10 rounded-2xl flex items-center justify-center text-solar-blue">
                {f.icon}
              </div>
              <div className="space-y-2">
                <h3 className={`text-3xl font-bold ${textColor}`}>{f.title}</h3>
                <p className={`text-lg leading-relaxed ${mutedColor}`}>{f.description}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                {f.metrics.map((m, mi) => (
                  <span key={mi} className="px-3 py-1 rounded-full bg-solar-blue/5 border border-solar-blue/10 text-[10px] font-black uppercase tracking-widest text-solar-blue">
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`p-12 rounded-3xl border ${isDark ? 'bg-solar-blue/10 border-solar-blue/20' : 'bg-solar-blue/5 border-solar-blue/10'} text-center space-y-8`}>
          <h3 className={`text-3xl font-bold ${textColor}`}>Why Cognitive Training?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <div className="text-solar-blue font-black text-4xl">01</div>
              <h4 className={`font-bold ${textColor}`}>Better PR Reviews</h4>
              <p className={`text-sm ${mutedColor}`}>Articulate your changes clearly to speed up the review process.</p>
            </div>
            <div className="space-y-2">
              <div className="text-solar-blue font-black text-4xl">02</div>
              <h4 className={`font-bold ${textColor}`}>Clearer Documentation</h4>
              <p className={`text-sm ${mutedColor}`}>Write docs that people actually want to read and can understand.</p>
            </div>
            <div className="space-y-2">
              <div className="text-solar-blue font-black text-4xl">03</div>
              <h4 className={`font-bold ${textColor}`}>Faster Onboarding</h4>
              <p className={`text-sm ${mutedColor}`}>Explain complex systems to new team members without the fluff.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
