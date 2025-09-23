'use client';

import React from 'react';
import ContextUtilizationDashboard from '@/components/ContextUtilizationDashboard';

export default function ContextUtilizationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ContextUtilizationDashboard />
      </div>
    </div>
  );
}