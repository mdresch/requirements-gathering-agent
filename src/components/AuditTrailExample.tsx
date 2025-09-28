/**
 * Example component demonstrating audit trail usage
 * This shows how to integrate audit trail logging into any component
 */

'use client';

import React from 'react';
import { Button } from './ui/button';
import { useAuditTrail } from '../hooks/useAuditTrail';
import { toast } from 'sonner';

interface AuditTrailExampleProps {
  projectId?: string;
  projectName?: string;
}

const AuditTrailExample: React.FC<AuditTrailExampleProps> = ({
  projectId = 'example-project',
  projectName = 'Example Project'
}) => {
  const auditTrail = useAuditTrail();

  const handleDocumentView = async () => {
    const success = await auditTrail.logDocumentViewed({
      documentId: 'example-doc-123',
      documentName: 'Example Document',
      documentType: 'requirements',
      projectId,
      projectName
    });

    if (success) {
      toast.success('Document view logged to audit trail');
    } else {
      toast.error('Failed to log document view');
    }
  };

  const handleDocumentDownload = async () => {
    const success = await auditTrail.logDocumentDownloaded({
      documentId: 'example-doc-123',
      documentName: 'Example Document',
      documentType: 'requirements',
      projectId,
      projectName,
      format: 'PDF'
    });

    if (success) {
      toast.success('Document download logged to audit trail');
    } else {
      toast.error('Failed to log document download');
    }
  };

  const handleProjectUpdate = async () => {
    const success = await auditTrail.logProjectUpdated({
      projectId,
      projectName,
      previousValues: { status: 'planning' },
      newValues: { status: 'active' },
      changedFields: ['status']
    });

    if (success) {
      toast.success('Project update logged to audit trail');
    } else {
      toast.error('Failed to log project update');
    }
  };

  const handleProjectView = async () => {
    const success = await auditTrail.logProjectViewed({
      projectId,
      projectName
    });

    if (success) {
      toast.success('Project view logged to audit trail');
    } else {
      toast.error('Failed to log project view');
    }
  };

  const handleTemplateView = async () => {
    const success = await auditTrail.logTemplateViewed({
      templateId: 'example-template-123',
      templateName: 'Example Template',
      templateType: 'requirements'
    });

    if (success) {
      toast.success('Template view logged to audit trail');
    } else {
      toast.error('Failed to log template view');
    }
  };

  const handleTemplateUsage = async () => {
    const success = await auditTrail.logTemplateUsed({
      templateId: 'example-template-123',
      templateName: 'Example Template',
      templateType: 'requirements',
      projectId,
      projectName,
      contextData: {
        usageType: 'document-generation',
        aiProvider: 'openai',
        aiModel: 'gpt-4'
      }
    });

    if (success) {
      toast.success('Template usage logged to audit trail');
    } else {
      toast.error('Failed to log template usage');
    }
  };

  const handleCustomAction = async () => {
    const success = await auditTrail.logUserAction({
      action: 'quality_assessed',
      description: 'Quality assessment completed for project',
      contextData: {
        assessmentType: 'compliance',
        score: 85,
        standards: ['BABOK', 'PMBOK']
      },
      severity: 'medium',
      category: 'quality',
      tags: ['quality-assessment', 'compliance']
    });

    if (success) {
      toast.success('Custom action logged to audit trail');
    } else {
      toast.error('Failed to log custom action');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Audit Trail Example</h3>
      <p className="text-sm text-gray-600">
        Click the buttons below to create audit trail entries and see them in the audit trail dashboard.
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={handleDocumentView} variant="outline" size="sm">
          Log Document View
        </Button>
        
        <Button onClick={handleDocumentDownload} variant="outline" size="sm">
          Log Document Download
        </Button>
        
        <Button onClick={handleProjectView} variant="outline" size="sm">
          Log Project View
        </Button>
        
        <Button onClick={handleProjectUpdate} variant="outline" size="sm">
          Log Project Update
        </Button>
        
        <Button onClick={handleTemplateView} variant="outline" size="sm">
          Log Template View
        </Button>
        
        <Button onClick={handleTemplateUsage} variant="outline" size="sm">
          Log Template Usage
        </Button>
        
        <Button onClick={handleCustomAction} variant="outline" size="sm">
          Log Custom Action
        </Button>
      </div>
    </div>
  );
};

export default AuditTrailExample;
