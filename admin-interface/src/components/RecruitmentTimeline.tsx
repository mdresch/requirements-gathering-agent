'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  UserCheck, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import type { Stakeholder } from '../types/stakeholder';

interface RecruitmentTimelineProps {
  projectId: string;
  stakeholderId?: string;
}

interface TimelineEvent {
  id: string;
  type: 'identified' | 'contacted' | 'interviewed' | 'offered' | 'recruited' | 'declined';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  metadata?: any;
}

interface RecruitmentProcess {
  stakeholderId: string;
  stakeholder: Stakeholder;
  currentStatus: string;
  timeline: TimelineEvent[];
  nextSteps: string[];
  notes: string;
  estimatedCompletion: string;
}

export default function RecruitmentTimeline({ projectId, stakeholderId }: RecruitmentTimelineProps) {
  const [recruitmentProcesses, setRecruitmentProcesses] = useState<RecruitmentProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<RecruitmentProcess | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    type: 'contacted',
    title: '',
    description: '',
    status: 'completed'
  });

  useEffect(() => {
    loadRecruitmentProcesses();
  }, [projectId]);

  const loadRecruitmentProcesses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjectStakeholders(projectId);
      
      if (response.success && response.data) {
        const placeholders = response.data.stakeholders.filter((s: Stakeholder) => 
          s.status === 'placeholder' || s.status === 'recruited'
        );
        
        // Generate mock timeline data for each placeholder
        const processes: RecruitmentProcess[] = placeholders.map((stakeholder: Stakeholder) => ({
          stakeholderId: stakeholder.id,
          stakeholder,
          currentStatus: stakeholder.recruitmentStatus,
          timeline: generateMockTimeline(stakeholder),
          nextSteps: generateNextSteps(stakeholder),
          notes: stakeholder.recruitmentNotes || '',
          estimatedCompletion: stakeholder.recruitmentDeadline || ''
        }));
        
        setRecruitmentProcesses(processes);
        
        if (stakeholderId) {
          const process = processes.find(p => p.stakeholderId === stakeholderId);
          setSelectedProcess(process || null);
        }
      }
    } catch (error) {
      console.error('Error loading recruitment processes:', error);
      toast.error('Failed to load recruitment timeline');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTimeline = (stakeholder: Stakeholder): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: '1',
        type: 'identified',
        title: 'Role Identified',
        description: `Identified need for ${stakeholder.role} role`,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ];

    if (stakeholder.recruitmentStatus !== 'identified') {
      events.push({
        id: '2',
        type: 'contacted',
        title: 'Initial Contact',
        description: 'Reached out to potential candidates',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      });
    }

    if (stakeholder.recruitmentStatus === 'recruited') {
      events.push(
        {
          id: '3',
          type: 'interviewed',
          title: 'Interview Completed',
          description: 'Conducted technical and cultural fit interview',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '4',
          type: 'offered',
          title: 'Offer Extended',
          description: 'Extended formal offer to candidate',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '5',
          type: 'recruited',
          title: 'Successfully Recruited',
          description: 'Candidate accepted offer and joined project',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      );
    }

    return events;
  };

  const generateNextSteps = (stakeholder: Stakeholder): string[] => {
    switch (stakeholder.recruitmentStatus) {
      case 'identified':
        return ['Research potential candidates', 'Prepare job description', 'Schedule initial outreach'];
      case 'contacted':
        return ['Schedule interviews', 'Prepare interview questions', 'Review candidate profiles'];
      case 'recruited':
        return ['Complete onboarding', 'Schedule team introductions', 'Set up project access'];
      default:
        return ['Continue recruitment process', 'Update stakeholders', 'Monitor progress'];
    }
  };

  const getEventIcon = (type: string, status: string) => {
    const iconClass = status === 'completed' ? 'text-green-500' : 
                     status === 'pending' ? 'text-yellow-500' : 'text-red-500';
    
    switch (type) {
      case 'identified': return <Target className={`w-5 h-5 ${iconClass}`} />;
      case 'contacted': return <Mail className={`w-5 h-5 ${iconClass}`} />;
      case 'interviewed': return <UserCheck className={`w-5 h-5 ${iconClass}`} />;
      case 'offered': return <CheckCircle className={`w-5 h-5 ${iconClass}`} />;
      case 'recruited': return <UserCheck className={`w-5 h-5 ${iconClass}`} />;
      case 'declined': return <XCircle className={`w-5 h-5 ${iconClass}`} />;
      default: return <Clock className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddEvent = async () => {
    if (!selectedProcess || !newEvent.title || !newEvent.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // In a real implementation, this would call an API to add the event
      const event: TimelineEvent = {
        id: Date.now().toString(),
        type: newEvent.type as any,
        title: newEvent.title,
        description: newEvent.description,
        date: new Date().toISOString(),
        status: newEvent.status as any
      };

      setSelectedProcess(prev => prev ? {
        ...prev,
        timeline: [...prev.timeline, event]
      } : null);

      setNewEvent({
        type: 'contacted',
        title: '',
        description: '',
        status: 'completed'
      });
      setShowAddEvent(false);
      
      toast.success('Timeline event added successfully');
    } catch (error) {
      console.error('Error adding timeline event:', error);
      toast.error('Failed to add timeline event');
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading recruitment timeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recruitment Timeline</h2>
          <p className="text-gray-600 mt-1">Track individual recruitment processes</p>
        </div>
        {selectedProcess && (
          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        )}
      </div>

      {/* Process Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recruitmentProcesses.map((process) => (
          <div
            key={process.stakeholderId}
            onClick={() => setSelectedProcess(process)}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedProcess?.stakeholderId === process.stakeholderId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                {process.stakeholder.name || formatRole(process.stakeholder.role)}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(process.currentStatus)}`}>
                {process.currentStatus}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{formatRole(process.stakeholder.role)}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {process.timeline.length} events
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Display */}
      {selectedProcess ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedProcess.stakeholder.name || formatRole(selectedProcess.stakeholder.role)}
              </h3>
              <p className="text-gray-600">{formatRole(selectedProcess.stakeholder.role)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Priority</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                selectedProcess.stakeholder.recruitmentPriority === 'critical' ? 'bg-red-100 text-red-800' :
                selectedProcess.stakeholder.recruitmentPriority === 'high' ? 'bg-orange-100 text-orange-800' :
                selectedProcess.stakeholder.recruitmentPriority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedProcess.stakeholder.recruitmentPriority.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {selectedProcess.timeline.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  {getEventIcon(event.type, event.status)}
                  {index < selectedProcess.timeline.length - 1 && (
                    <div className="w-px h-8 bg-gray-300 mt-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
            <ul className="space-y-2">
              {selectedProcess.nextSteps.map((step, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes */}
          {selectedProcess.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Recruitment Notes</h4>
              <p className="text-gray-600">{selectedProcess.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a recruitment process to view timeline</p>
          <p className="text-sm">Choose from the processes above to see detailed timeline</p>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Timeline Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="contacted">Contacted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="recruited">Recruited</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddEvent(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
