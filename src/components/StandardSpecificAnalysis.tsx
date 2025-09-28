// Phase 2: Interactive Drill-down Features - Standard-Specific Analysis
// Detailed analysis view for specific standards (BABOK, PMBOK, DMBOK, ISO)

'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Briefcase, 
  Database, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Target,
  Award,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface StandardAnalysis {
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  overallScore: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  trendPercentage: number;
  categories: {
    name: string;
    score: number;
    weight: number;
    issues: number;
    status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
  }[];
  recentActivity: {
    id: string;
    type: 'ISSUE_CREATED' | 'ISSUE_RESOLVED' | 'SCORE_UPDATED' | 'REVIEW_COMPLETED';
    description: string;
    timestamp: Date;
    user: string;
  }[];
  recommendations: {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    description: string;
    impact: string;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  complianceMetrics: {
    totalRequirements: number;
    compliantRequirements: number;
    partiallyCompliantRequirements: number;
    nonCompliantRequirements: number;
    lastReviewDate: Date;
    nextReviewDate: Date;
  };
}

interface StandardSpecificAnalysisProps {
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  projectId?: string;
  onClose?: () => void;
}

export default function StandardSpecificAnalysis({ 
  standardType, 
  projectId = 'current-project',
  onClose 
}: StandardSpecificAnalysisProps) {
  const [analysis, setAnalysis] = useState<StandardAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'activity' | 'recommendations'>('overview');

  useEffect(() => {
    loadStandardAnalysis();
  }, [standardType, projectId]);

  const loadStandardAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load real analysis from API
      const response = await fetch(`/api/v1/standards/analysis?standardType=${standardType}&projectId=${projectId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setAnalysis(result.data);
      } else {
        // Fallback to mock data
        setAnalysis(generateMockAnalysis());
      }
    } catch (error) {
      console.error('❌ Error loading standard analysis:', error);
      setError('Failed to load analysis');
      // Use mock data as fallback
      setAnalysis(generateMockAnalysis());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalysis = (): StandardAnalysis => {
    const mockData: Record<string, StandardAnalysis> = {
      BABOK: {
        standardType: 'BABOK',
        overallScore: 94,
        trend: 'IMPROVING',
        trendPercentage: 2.5,
        categories: [
          { name: 'Requirements Analysis', score: 96, weight: 0.25, issues: 1, status: 'COMPLIANT' },
          { name: 'Business Analysis Planning', score: 92, weight: 0.20, issues: 2, status: 'COMPLIANT' },
          { name: 'Elicitation and Collaboration', score: 95, weight: 0.20, issues: 0, status: 'COMPLIANT' },
          { name: 'Requirements Life Cycle Management', score: 88, weight: 0.15, issues: 3, status: 'PARTIALLY_COMPLIANT' },
          { name: 'Strategy Analysis', score: 90, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Solution Evaluation', score: 98, weight: 0.10, issues: 0, status: 'COMPLIANT' }
        ],
        recentActivity: [
          { id: '1', type: 'SCORE_UPDATED', description: 'Requirements Analysis score updated to 96%', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: 'system' },
          { id: '2', type: 'ISSUE_RESOLVED', description: 'Issue #123 resolved: Missing requirements documentation', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), user: 'user-1' },
          { id: '3', type: 'REVIEW_COMPLETED', description: 'Monthly BABOK compliance review completed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), user: 'user-2' }
        ],
        recommendations: [
          { priority: 'MEDIUM', category: 'Requirements Life Cycle Management', description: 'Implement automated requirements traceability', impact: 'Improve compliance by 5-8%', effort: 'MEDIUM' },
          { priority: 'LOW', category: 'Business Analysis Planning', description: 'Update planning templates', impact: 'Improve consistency', effort: 'LOW' }
        ],
        complianceMetrics: {
          totalRequirements: 156,
          compliantRequirements: 147,
          partiallyCompliantRequirements: 8,
          nonCompliantRequirements: 1,
          lastReviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextReviewDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
        }
      },
      PMBOK: {
        standardType: 'PMBOK',
        overallScore: 89,
        trend: 'IMPROVING',
        trendPercentage: 5.2,
        categories: [
          { name: 'Project Integration Management', score: 92, weight: 0.15, issues: 1, status: 'COMPLIANT' },
          { name: 'Project Scope Management', score: 85, weight: 0.10, issues: 3, status: 'PARTIALLY_COMPLIANT' },
          { name: 'Project Schedule Management', score: 88, weight: 0.10, issues: 2, status: 'COMPLIANT' },
          { name: 'Project Cost Management', score: 91, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Project Quality Management', score: 87, weight: 0.10, issues: 2, status: 'COMPLIANT' },
          { name: 'Project Resource Management', score: 90, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Project Communications Management', score: 86, weight: 0.10, issues: 2, status: 'COMPLIANT' },
          { name: 'Project Risk Management', score: 88, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Project Procurement Management', score: 92, weight: 0.10, issues: 0, status: 'COMPLIANT' },
          { name: 'Project Stakeholder Management', score: 89, weight: 0.05, issues: 1, status: 'COMPLIANT' }
        ],
        recentActivity: [
          { id: '1', type: 'ISSUE_CREATED', description: 'New issue: Scope creep detected in Project Alpha', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), user: 'user-3' },
          { id: '2', type: 'SCORE_UPDATED', description: 'Project Cost Management score improved to 91%', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), user: 'system' },
          { id: '3', type: 'REVIEW_COMPLETED', description: 'Weekly PMBOK compliance review completed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), user: 'user-1' }
        ],
        recommendations: [
          { priority: 'HIGH', category: 'Project Scope Management', description: 'Implement scope change control process', impact: 'Reduce scope creep by 40%', effort: 'MEDIUM' },
          { priority: 'MEDIUM', category: 'Project Communications Management', description: 'Standardize communication templates', impact: 'Improve stakeholder satisfaction', effort: 'LOW' }
        ],
        complianceMetrics: {
          totalRequirements: 89,
          compliantRequirements: 79,
          partiallyCompliantRequirements: 9,
          nonCompliantRequirements: 1,
          lastReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          nextReviewDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        }
      },
      DMBOK: {
        standardType: 'DMBOK',
        overallScore: 78,
        trend: 'STABLE',
        trendPercentage: 0.0,
        categories: [
          { name: 'Data Governance', score: 75, weight: 0.15, issues: 4, status: 'PARTIALLY_COMPLIANT' },
          { name: 'Data Architecture', score: 80, weight: 0.10, issues: 2, status: 'COMPLIANT' },
          { name: 'Data Modeling and Design', score: 82, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Data Storage and Operations', score: 76, weight: 0.10, issues: 3, status: 'PARTIALLY_COMPLIANT' },
          { name: 'Data Security', score: 85, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Data Integration and Interoperability', score: 72, weight: 0.10, issues: 4, status: 'PARTIALLY_COMPLIANT' },
          { name: 'Documents and Content', score: 78, weight: 0.10, issues: 2, status: 'COMPLIANT' },
          { name: 'Reference and Master Data', score: 80, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Data Warehousing and Business Intelligence', score: 75, weight: 0.10, issues: 3, status: 'PARTIALLY_COMPLIANT' },
          { name: 'Data Quality', score: 70, weight: 0.05, issues: 5, status: 'PARTIALLY_COMPLIANT' }
        ],
        recentActivity: [
          { id: '1', type: 'ISSUE_CREATED', description: 'New issue: Data quality metrics below threshold', timestamp: new Date(Date.now() - 30 * 60 * 1000), user: 'user-2' },
          { id: '2', type: 'ISSUE_RESOLVED', description: 'Issue #456 resolved: Data integration pipeline fixed', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: 'user-4' },
          { id: '3', type: 'SCORE_UPDATED', description: 'Data Security score improved to 85%', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), user: 'system' }
        ],
        recommendations: [
          { priority: 'HIGH', category: 'Data Quality', description: 'Implement automated data quality monitoring', impact: 'Improve data quality by 15-20%', effort: 'HIGH' },
          { priority: 'HIGH', category: 'Data Integration and Interoperability', description: 'Standardize data integration patterns', impact: 'Reduce integration issues by 50%', effort: 'MEDIUM' },
          { priority: 'MEDIUM', category: 'Data Governance', description: 'Establish data governance committee', impact: 'Improve governance compliance', effort: 'MEDIUM' }
        ],
        complianceMetrics: {
          totalRequirements: 67,
          compliantRequirements: 52,
          partiallyCompliantRequirements: 13,
          nonCompliantRequirements: 2,
          lastReviewDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          nextReviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      },
      ISO: {
        standardType: 'ISO',
        overallScore: 85,
        trend: 'IMPROVING',
        trendPercentage: 1.8,
        categories: [
          { name: 'Security Management', score: 88, weight: 0.15, issues: 1, status: 'COMPLIANT' },
          { name: 'Risk Assessment', score: 82, weight: 0.10, issues: 2, status: 'COMPLIANT' },
          { name: 'Access Control', score: 90, weight: 0.10, issues: 0, status: 'COMPLIANT' },
          { name: 'Cryptography', score: 85, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Physical Security', score: 87, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Operations Security', score: 83, weight: 0.10, issues: 2, status: 'COMPLIANT' },
          { name: 'Communications Security', score: 86, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'System Acquisition', score: 84, weight: 0.10, issues: 1, status: 'COMPLIANT' },
          { name: 'Supplier Relationships', score: 88, weight: 0.10, issues: 0, status: 'COMPLIANT' },
          { name: 'Information Security Incident Management', score: 85, weight: 0.05, issues: 1, status: 'COMPLIANT' }
        ],
        recentActivity: [
          { id: '1', type: 'ISSUE_RESOLVED', description: 'Issue #789 resolved: Security policy updated', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), user: 'user-1' },
          { id: '2', type: 'SCORE_UPDATED', description: 'Access Control score improved to 90%', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), user: 'system' },
          { id: '3', type: 'REVIEW_COMPLETED', description: 'Quarterly ISO compliance review completed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), user: 'user-3' }
        ],
        recommendations: [
          { priority: 'MEDIUM', category: 'Risk Assessment', description: 'Implement automated risk assessment tools', impact: 'Improve risk identification by 25%', effort: 'MEDIUM' },
          { priority: 'LOW', category: 'Operations Security', description: 'Update security procedures documentation', impact: 'Improve procedural compliance', effort: 'LOW' }
        ],
        complianceMetrics: {
          totalRequirements: 45,
          compliantRequirements: 38,
          partiallyCompliantRequirements: 6,
          nonCompliantRequirements: 1,
          lastReviewDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          nextReviewDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
        }
      }
    };

    return mockData[standardType];
  };

  const getStandardIcon = (type: string) => {
    switch (type) {
      case 'BABOK': return <BookOpen className="w-6 h-6" />;
      case 'PMBOK': return <Briefcase className="w-6 h-6" />;
      case 'DMBOK': return <Database className="w-6 h-6" />;
      case 'ISO': return <Shield className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getStandardColor = (type: string) => {
    switch (type) {
      case 'BABOK': return 'text-blue-600 bg-blue-50';
      case 'PMBOK': return 'text-green-600 bg-green-50';
      case 'DMBOK': return 'text-purple-600 bg-purple-50';
      case 'ISO': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'text-green-600 bg-green-50';
      case 'PARTIALLY_COMPLIANT': return 'text-yellow-600 bg-yellow-50';
      case 'NON_COMPLIANT': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-gray-600">Loading {standardType} analysis...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Unavailable</h3>
        <p className="text-gray-600 mb-4">{error || 'Failed to load analysis'}</p>
        <button
          onClick={loadStandardAnalysis}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStandardColor(standardType)}`}>
            {getStandardIcon(standardType)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {standardType} Detailed Analysis
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive compliance analysis and recommendations
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadStandardAnalysis}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{analysis.overallScore}%</div>
              <div className="text-blue-100">Overall Score</div>
            </div>
            <Award className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{analysis.complianceMetrics.compliantRequirements}</div>
              <div className="text-green-100">Compliant</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{analysis.complianceMetrics.partiallyCompliantRequirements}</div>
              <div className="text-yellow-100">Partial</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{analysis.complianceMetrics.nonCompliantRequirements}</div>
              <div className="text-red-100">Non-Compliant</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'categories', label: 'Categories', icon: PieChart },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'recommendations', label: 'Recommendations', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Trend Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Trend Analysis</h3>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                analysis.trend === 'IMPROVING' ? 'text-green-600' : 
                analysis.trend === 'DECLINING' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analysis.trend === 'IMPROVING' ? <TrendingUp className="w-5 h-5" /> : 
                 analysis.trend === 'DECLINING' ? <TrendingDown className="w-5 h-5" /> : 
                 <Activity className="w-5 h-5" />}
                <span className="font-medium">{analysis.trend}</span>
                <span className="text-sm">({analysis.trendPercentage > 0 ? '+' : ''}{analysis.trendPercentage}%)</span>
              </div>
              <div className="text-sm text-gray-600">
                Last review: {analysis.complianceMetrics.lastReviewDate.toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">
                Next review: {analysis.complianceMetrics.nextReviewDate.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Compliance Breakdown */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Compliance Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((analysis.complianceMetrics.compliantRequirements / analysis.complianceMetrics.totalRequirements) * 100)}%
                </div>
                <div className="text-sm text-green-600">Fully Compliant</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round((analysis.complianceMetrics.partiallyCompliantRequirements / analysis.complianceMetrics.totalRequirements) * 100)}%
                </div>
                <div className="text-sm text-yellow-600">Partially Compliant</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round((analysis.complianceMetrics.nonCompliantRequirements / analysis.complianceMetrics.totalRequirements) * 100)}%
                </div>
                <div className="text-sm text-red-600">Non-Compliant</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'categories' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Category Analysis</h3>
          <div className="space-y-3">
            {analysis.categories.map((category, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-600">
                        Weight: {Math.round(category.weight * 100)}% • Issues: {category.issues}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{category.score}%</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                      {category.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                {selectedCategory === category.name && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Compliance Score</h5>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${category.score}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{category.score}% compliant</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Weight</h5>
                        <p className="text-sm text-gray-600">{Math.round(category.weight * 100)}% of overall score</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Issues</h5>
                        <p className="text-sm text-gray-600">{category.issues} open issues</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="space-y-3">
            {analysis.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                  <div className="text-sm text-gray-600">{activity.user}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'recommendations' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.description}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Expected Impact</h5>
                    <p className="text-sm text-gray-600">{rec.impact}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Implementation Effort</h5>
                    <p className="text-sm text-gray-600">{rec.effort} effort required</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
