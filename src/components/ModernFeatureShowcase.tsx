'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  Workflow,
  Users,
  Shield,
  Zap,
  Code,
  Database,
  Cloud,
  Eye,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react';

const features = [
  {
    id: 'ai-powered',
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze requirements and suggest optimizations.',
    color: 'from-purple-500 to-pink-500',
    details: [
      'Natural language processing for requirement extraction',
      'Automated compliance checking',
      'Intelligent categorization and tagging',
      'Risk assessment and mitigation suggestions'
    ]
  },
  {
    id: 'workflow',
    icon: Workflow,
    title: 'Streamlined Workflow',
    description: 'Automated processes reduce manual work and increase efficiency by 300%.',
    color: 'from-blue-500 to-cyan-500',
    details: [
      'Drag-and-drop workflow builder',
      'Custom approval processes',
      'Automated notifications',
      'Progress tracking and analytics'
    ]
  },
  {
    id: 'collaboration',
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Teams work together seamlessly with live updates and instant feedback.',
    color: 'from-green-500 to-emerald-500',
    details: [
      'Live document editing',
      'Comment and review system',
      'Team workspace organization',
      'Activity timeline and history'
    ]
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance with industry standards.',
    color: 'from-red-500 to-orange-500',
    details: [
      'End-to-end encryption',
      'Role-based access control',
      'Audit logging and compliance',
      'Data sovereignty options'
    ]
  }
];

export default function ModernFeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.id}
          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200/50 hover:border-white/80 transition-all duration-500 cursor-pointer overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ y: -8, scale: 1.02 }}
          onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Icon and Title */}
            <div className="flex items-start space-x-4 mb-4">
              <motion.div 
                className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
              <motion.div
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
                animate={{ rotate: activeFeature === feature.id ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {activeFeature === feature.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-200/50">
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <Zap className="w-4 h-4 text-electric-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.div>
      ))}
    </motion.div>
  );
}