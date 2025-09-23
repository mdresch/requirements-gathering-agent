'use client';

import React from 'react';
import DocumentAuditTrail from '@/components/DocumentAuditTrail';

export default function AuditTrailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Audit Trail</h1>
          <p className="text-gray-600 mt-2">
            Complete audit trail of all document activities, changes, and interactions
          </p>
        </div>
        
        <DocumentAuditTrail />
      </div>
    </div>
  );
}

