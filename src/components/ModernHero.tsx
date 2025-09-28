'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Code2, 
  Database,
  Shield,
  Cpu,
  Globe,
  TrendingUp
} from 'lucide-react';

interface ModernHeroProps {
  onLaunchWebInterface: () => void;
  onShowStats: () => void;
}

export default function ModernHero({ onLaunchWebInterface, onShowStats }: ModernHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div 
      className="relative overflow-hidden bg-gradient-to-br from-electric-50 via-white to-neon-50 rounded-4xl p-12 mb-12 shadow-2xl border border-white/20"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-electric-500/20 to-neon-600/20 rounded-full blur-3xl animate-levitate"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-cyber-500/20 to-electric-600/20 rounded-full blur-3xl animate-levitate"
          style={{ animationDelay: '1s' }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: -360 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        />
        
        {/* Floating geometric shapes */}
        <motion.div 
          className="absolute top-20 right-32 w-16 h-16 bg-gradient-to-br from-electric-500/30 to-neon-600/30 rounded-2xl blur-sm animate-morphing"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-32 right-16 w-12 h-12 bg-gradient-to-br from-cyber-500/30 to-electric-600/30 rounded-full blur-sm animate-breath"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
        {/* Left Content */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-electric-200 text-electric-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Next.js 14 • Tailwind CSS</span>
          </motion.div>

          <motion.h1 
            className="text-5xl lg:text-6xl font-bold"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.span 
              className="bg-gradient-to-r from-electric-600 via-neon-600 to-cyber-600 bg-clip-text text-transparent animate-text-glow"
              style={{ backgroundSize: '200% 200%' }}
            >
              ADPA Enterprise
            </motion.span>
            <br />
            <motion.span 
              className="text-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Platform
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl lg:text-2xl text-gray-600 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Advanced requirements gathering with AI-powered insights, 
            real-time collaboration, and enterprise-grade security.
          </motion.p>

          {/* Status Indicators */}
          <motion.div
            className="flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            {[
              { icon: Database, label: 'API Server', status: 'online' },
              { icon: Shield, label: 'Security', status: 'active' },
              { icon: Cpu, label: 'AI Processing', status: 'ready' },
              { icon: Globe, label: 'Global CDN', status: 'optimized' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <span className="text-sm text-gray-700">
                  {item.label} <span className="text-emerald-600 font-medium">{item.status}</span>
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content - Action Buttons */}
        <motion.div 
          className="flex flex-col space-y-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.button
            onClick={onLaunchWebInterface}
            className="group relative overflow-hidden bg-gradient-to-r from-electric-600 via-neon-600 to-cyber-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl transition-all duration-500 animate-gradient-shift"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <span className="relative z-10 flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Launch Web Interface</span>
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>

          <motion.button
            onClick={onShowStats}
            className="group relative bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 px-8 py-4 rounded-2xl font-semibold shadow-lg border border-gray-200 hover:border-electric-300 transition-all duration-300 hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <span className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-electric-600" />
              <span>View Analytics</span>
            </span>
          </motion.button>

          <motion.div
            className="flex items-center space-x-2 text-sm text-gray-500 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
          >
            <Zap className="w-4 h-4" />
            <span>Powered by AI & Modern Web Tech</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}