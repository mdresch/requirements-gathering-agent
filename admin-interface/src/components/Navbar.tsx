'use client';

import { useState } from 'react';
import { Settings, FileText, BarChart3, Users, HelpCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '#templates', icon: FileText, label: 'Templates', active: true },
    { href: '#analytics', icon: BarChart3, label: 'Analytics', active: false },
    { href: '#users', icon: Users, label: 'Users', active: false },
    { href: '#settings', icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex-shrink-0 flex items-center">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-glow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
              <div className="ml-4">
                <motion.h1 
                  className="text-xl font-bold gradient-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  ADPA Template Admin
                </motion.h1>
                <motion.p 
                  className="text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  Enterprise Framework Management
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all duration-300 ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Right Side Actions */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <motion.button
              className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all duration-300"
              title="Help & Documentation"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <HelpCircle className="w-5 h-5" />
            </motion.button>
            
            <div className="relative">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-sm font-bold">A</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
