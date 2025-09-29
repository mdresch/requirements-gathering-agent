'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, FileText, TrendingUp, Users, Clock, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import type { Stakeholder, RecruitmentStatus } from '../types/stakeholder';

interface ReportData {
  stakeholders: Stakeholder[];
  recruitmentStatus: RecruitmentStatus;
  metrics: {
    totalPlaceholders: number;
    totalRecruited: number;
    successRate: number;
    averageRecruitmentTime: number;
    priorityBreakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    statusBreakdown: {
      identified: number;
      contacted: number;
      recruited: number;
      declined: number;
    };
  };
  timeline: Array<{
    date: string;
    placeholdersCreated: number;
    stakeholdersRecruited: number;
    milestones: number;
  }>;
}

interface AdvancedReportingProps {
  projectId: string;
}

export default function AdvancedReporting({ projectId }: AdvancedReportingProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    role: 'all'
  });
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'timeline'>('summary');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const [stakeholdersResponse, recruitmentResponse] = await Promise.all([
          apiClient.getProjectStakeholders(projectId),
          apiClient.getRecruitmentStatus(projectId)
        ]);

        if (stakeholdersResponse.success && recruitmentResponse.success) {
          const stakeholders = stakeholdersResponse.data.stakeholders || [];
          const recruitmentStatus = recruitmentResponse.data;

          // Filter stakeholders based on criteria
          const filteredStakeholders = stakeholders.filter((stakeholder: any) => {
            if (filters.status !== 'all' && stakeholder.status !== filters.status) return false;
            if (filters.priority !== 'all' && stakeholder.recruitmentPriority !== filters.priority) return false;
            if (filters.role !== 'all' && stakeholder.role !== filters.role) return false;
            return true;
          });

          // Calculate metrics
          const metrics = calculateMetrics(filteredStakeholders, recruitmentStatus);
          
          // Generate timeline data
          const timeline = generateTimelineData(filteredStakeholders, dateRange);

          setReportData({
            stakeholders: filteredStakeholders,
            recruitmentStatus,
            metrics,
            timeline
          });
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    loadReportData();
  }, [projectId, dateRange, filters, reportType]);


  const calculateMetrics = (stakeholders: Stakeholder[], recruitmentStatus: RecruitmentStatus) => {
    const totalPlaceholders = stakeholders.filter(s => s.status === 'placeholder').length;
    const totalRecruited = stakeholders.filter(s => s.status === 'recruited').length;
    const successRate = totalPlaceholders > 0 ? (totalRecruited / totalPlaceholders) * 100 : 0;
    
    // Calculate average recruitment time (mock data for now)
    const averageRecruitmentTime = 14; // days

    const priorityBreakdown = {
      critical: stakeholders.filter(s => s.recruitmentPriority === 'critical').length,
      high: stakeholders.filter(s => s.recruitmentPriority === 'high').length,
      medium: stakeholders.filter(s => s.recruitmentPriority === 'medium').length,
      low: stakeholders.filter(s => s.recruitmentPriority === 'low').length,
    };

    const statusBreakdown = {
      identified: stakeholders.filter(s => s.recruitmentStatus === 'identified').length,
      contacted: stakeholders.filter(s => s.recruitmentStatus === 'contacted').length,
      recruited: stakeholders.filter(s => s.recruitmentStatus === 'recruited').length,
      declined: stakeholders.filter(s => s.recruitmentStatus === 'declined').length,
    };

    return {
      totalPlaceholders,
      totalRecruited,
      successRate,
      averageRecruitmentTime,
      priorityBreakdown,
      statusBreakdown
    };
  };

  const generateTimelineData = (stakeholders: Stakeholder[], dateRange: { start: string; end: string }) => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const timeline = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayStakeholders = stakeholders.filter(s => {
        const createdDate = new Date(s.createdAt || '').toISOString().split('T')[0];
        return createdDate === dateStr;
      });

      timeline.push({
        date: dateStr,
        placeholdersCreated: dayStakeholders.filter(s => s.status === 'placeholder').length,
        stakeholdersRecruited: dayStakeholders.filter(s => s.status === 'recruited').length,
        milestones: Math.floor(Math.random() * 3) // Mock milestone data
      });
    }

    return timeline;
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) return;

    try {
      const reportContent = generateReportContent(reportData, reportType);
      
      if (format === 'csv') {
        exportToCSV(reportContent);
      } else if (format === 'excel') {
        exportToExcel(reportContent);
      } else {
        exportToPDF(reportContent);
      }
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const generateReportContent = (data: ReportData, type: string) => {
    const headers = ['Date Range', 'Project ID', 'Generated At'];
    const values = [
      `${dateRange.start} to ${dateRange.end}`,
      projectId,
      new Date().toLocaleString()
    ];

    let content = '';
    
    if (type === 'summary') {
      content = `
        RECRUITMENT SUMMARY REPORT
        
        Key Metrics:
        - Total Placeholders: ${data.metrics.totalPlaceholders}
        - Total Recruited: ${data.metrics.totalRecruited}
        - Success Rate: ${data.metrics.successRate.toFixed(1)}%
        - Average Recruitment Time: ${data.metrics.averageRecruitmentTime} days
        
        Priority Breakdown:
        - Critical: ${data.metrics.priorityBreakdown.critical}
        - High: ${data.metrics.priorityBreakdown.high}
        - Medium: ${data.metrics.priorityBreakdown.medium}
        - Low: ${data.metrics.priorityBreakdown.low}
        
        Status Breakdown:
        - Identified: ${data.metrics.statusBreakdown.identified}
        - Contacted: ${data.metrics.statusBreakdown.contacted}
        - Recruited: ${data.metrics.statusBreakdown.recruited}
        - Declined: ${data.metrics.statusBreakdown.declined}
      `;
    } else if (type === 'detailed') {
      content = `DETAILED STAKEHOLDER REPORT\n\n`;
      data.stakeholders.forEach((stakeholder, index) => {
        content += `${index + 1}. ${stakeholder.name || 'Role Placeholder'}\n`;
        content += `   Role: ${stakeholder.role}\n`;
        content += `   Status: ${stakeholder.status}\n`;
        content += `   Priority: ${stakeholder.recruitmentPriority}\n`;
        content += `   Created: ${new Date(stakeholder.createdAt || '').toLocaleDateString()}\n\n`;
      });
    }

    return { headers, values, content };
  };

  const exportToCSV = (reportContent: any) => {
    const csvContent = [
      reportContent.headers.join(','),
      reportContent.values.join(','),
      '',
      reportContent.content.replace(/\n/g, ',').replace(/\s+/g, ' ')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-report-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = (reportContent: any) => {
    // For now, export as CSV with .xlsx extension
    // In a real implementation, you'd use a library like xlsx
    const csvContent = [
      reportContent.headers.join('\t'),
      reportContent.values.join('\t'),
      '',
      reportContent.content.replace(/\n/g, '\t').replace(/\s+/g, ' ')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-report-${Date.now()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (reportContent: any) => {
    // For now, export as text file
    // In a real implementation, you'd use a library like jsPDF
    const textContent = `
      RECRUITMENT REPORT
      =================
      
      ${reportContent.headers.map((h: string, i: number) => `${h}: ${reportContent.values[i]}`).join('\n')}
      
      ${reportContent.content}
    `;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-report-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Advanced Reporting</h2>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Export:</span>
            <button
              onClick={() => exportReport('csv')}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              CSV
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Excel
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="placeholder">Placeholder</option>
              <option value="recruited">Recruited</option>
              <option value="active">Active</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Placeholders</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.metrics.totalPlaceholders}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recruited</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.metrics.totalRecruited}</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.metrics.successRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Time</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.metrics.averageRecruitmentTime} days</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Priority and Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical</span>
              <span className="text-sm font-medium text-red-600">{reportData.metrics.priorityBreakdown.critical}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High</span>
              <span className="text-sm font-medium text-orange-600">{reportData.metrics.priorityBreakdown.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium</span>
              <span className="text-sm font-medium text-yellow-600">{reportData.metrics.priorityBreakdown.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low</span>
              <span className="text-sm font-medium text-green-600">{reportData.metrics.priorityBreakdown.low}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Identified</span>
              <span className="text-sm font-medium text-blue-600">{reportData.metrics.statusBreakdown.identified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Contacted</span>
              <span className="text-sm font-medium text-purple-600">{reportData.metrics.statusBreakdown.contacted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recruited</span>
              <span className="text-sm font-medium text-green-600">{reportData.metrics.statusBreakdown.recruited}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Declined</span>
              <span className="text-sm font-medium text-red-600">{reportData.metrics.statusBreakdown.declined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {reportType === 'timeline' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Timeline</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {reportData.timeline.slice(-14).map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div className="w-full bg-gray-100 rounded-t" style={{ height: `${(day.placeholdersCreated / Math.max(...reportData.timeline.map(d => d.placeholdersCreated))) * 100}%` }}></div>
                <div className="text-xs text-gray-500">{new Date(day.date).getDate()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}