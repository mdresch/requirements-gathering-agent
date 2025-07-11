/*
 * Real-Time Collaboration Service
 * Enables multi-user document editing with AI-powered assistance
 */

import { ADPA_BRAND_GUIDELINES } from '../templates/brand-guidelines';

/**
 * User Session Information
 */
export interface UserSession {
  userId: string;
  userName: string;
  email: string;
  role: 'editor' | 'reviewer' | 'admin' | 'viewer';
  cursor: CursorPosition;
  lastActivity: Date;
  permissions: UserPermissions;
  aiPreferences: AIPreferences;
}

export interface CursorPosition {
  documentId: string;
  sectionId?: string;
  position: number;
  selection?: TextSelection;
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export interface UserPermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canApprove: boolean;
  canUseAI: boolean;
}

export interface AIPreferences {
  enableRealTimeSuggestions: boolean;
  shareAIInsights: boolean;
  autoAcceptSuggestions: boolean;
  preferredAIStyle: 'conservative' | 'aggressive' | 'balanced';
}

/**
 * Collaborative Document State
 */
export interface CollaborativeDocument {
  documentId: string;
  title: string;
  content: string;
  version: number;
  lastModified: Date;
  activeUsers: UserSession[];
  pendingChanges: DocumentChange[];
  aiRecommendations: SharedAIRecommendation[];
  workflowStatus: WorkflowStatus;
}

export interface DocumentChange {
  changeId: string;
  userId: string;
  timestamp: Date;
  type: 'insert' | 'delete' | 'format' | 'ai-suggestion';
  position: number;
  content: string;
  metadata: ChangeMetadata;
}

export interface ChangeMetadata {
  aiGenerated: boolean;
  confidence?: number;
  reasoning?: string;
  reviewRequired: boolean;
}

export interface SharedAIRecommendation {
  recommendationId: string;
  type: 'content' | 'structure' | 'diagram' | 'template';
  title: string;
  description: string;
  confidence: number;
  applicableUsers: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  votes: RecommendationVote[];
}

export interface RecommendationVote {
  userId: string;
  vote: 'approve' | 'reject' | 'neutral';
  comment?: string;
  timestamp: Date;
}

export interface WorkflowStatus {
  stage: 'draft' | 'review' | 'approval' | 'published' | 'archived';
  assignedReviewers: string[];
  approvers: string[];
  deadline?: Date;
  comments: WorkflowComment[];
}

export interface WorkflowComment {
  commentId: string;
  userId: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  aiGenerated: boolean;
}

/**
 * Real-Time Collaboration Service
 */
export class RealTimeCollaborationService {
  private websocket: WebSocket | null = null;
  private documentId: string | null = null;
  private currentUser: UserSession | null = null;
  private collaborators: Map<string, UserSession> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize collaboration session
   */
  async initializeCollaboration(
    documentId: string,
    user: UserSession,
    serverUrl: string = 'wss://adpa-collaboration.azure.com'
  ): Promise<void> {
    this.documentId = documentId;
    this.currentUser = user;

    try {
      // Establish WebSocket connection
      this.websocket = new WebSocket(`${serverUrl}/collaborate/${documentId}`);
      
      this.websocket.onopen = () => {
        this.sendMessage({
          type: 'user-join',
          userId: user.userId,
          userInfo: user
        });
      };

      this.websocket.onmessage = (event) => {
        this.handleIncomingMessage(JSON.parse(event.data));
      };

      this.websocket.onclose = () => {
        this.handleDisconnection();
      };

      this.websocket.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error);
      };

    } catch (error) {
      throw new Error(`Failed to initialize collaboration: ${error.message}`);
    }
  }

  /**
   * Enable real-time AI assistance for the team
   */
  async enableTeamAI(): Promise<void> {
    if (!this.currentUser?.permissions.canUseAI) {
      throw new Error('User does not have permission to use AI features');
    }

    const aiRequest = {
      type: 'enable-team-ai',
      userId: this.currentUser.userId,
      preferences: this.currentUser.aiPreferences
    };

    this.sendMessage(aiRequest);
    this.emit('team-ai-enabled', { user: this.currentUser });
  }

  /**
   * Share AI insights with team members
   */
  async shareAIInsights(insights: any[]): Promise<void> {
    const shareRequest = {
      type: 'share-ai-insights',
      userId: this.currentUser?.userId,
      insights: insights.map(insight => ({
        ...insight,
        sharedBy: this.currentUser?.userName,
        timestamp: new Date().toISOString()
      }))
    };

    this.sendMessage(shareRequest);
    this.emit('ai-insights-shared', { insights, user: this.currentUser });
  }

  /**
   * Send document change to collaborators
   */
  async broadcastChange(change: DocumentChange): Promise<void> {
    const changeMessage = {
      type: 'document-change',
      documentId: this.documentId,
      change: {
        ...change,
        userId: this.currentUser?.userId
      }
    };

    this.sendMessage(changeMessage);
    this.emit('change-broadcasted', { change });
  }

  /**
   * Update cursor position for real-time collaboration
   */
  async updateCursorPosition(position: CursorPosition): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser.cursor = position;
    this.currentUser.lastActivity = new Date();

    const cursorMessage = {
      type: 'cursor-update',
      userId: this.currentUser.userId,
      position
    };

    this.sendMessage(cursorMessage);
  }

  /**
   * Request AI recommendation for current context
   */
  async requestTeamAIRecommendation(context: any): Promise<SharedAIRecommendation[]> {
    const request = {
      type: 'request-ai-recommendation',
      userId: this.currentUser?.userId,
      context,
      timestamp: new Date().toISOString()
    };

    this.sendMessage(request);

    // Return promise that resolves when AI recommendations are received
    return new Promise((resolve) => {
      this.once('ai-recommendations-received', (data) => {
        resolve(data.recommendations);
      });
    });
  }

  /**
   * Vote on AI recommendation
   */
  async voteOnRecommendation(
    recommendationId: string,
    vote: 'approve' | 'reject' | 'neutral',
    comment?: string
  ): Promise<void> {
    const voteMessage = {
      type: 'vote-recommendation',
      recommendationId,
      vote: {
        userId: this.currentUser?.userId,
        vote,
        comment,
        timestamp: new Date()
      }
    };

    this.sendMessage(voteMessage);
    this.emit('recommendation-voted', { recommendationId, vote });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleIncomingMessage(message: any): void {
    switch (message.type) {
      case 'user-joined':
        this.handleUserJoined(message.user);
        break;
      
      case 'user-left':
        this.handleUserLeft(message.userId);
        break;
      
      case 'document-change':
        this.handleDocumentChange(message.change);
        break;
      
      case 'cursor-update':
        this.handleCursorUpdate(message.userId, message.position);
        break;
      
      case 'ai-recommendation':
        this.handleAIRecommendation(message.recommendation);
        break;
      
      case 'ai-insights-shared':
        this.handleSharedAIInsights(message.insights);
        break;
      
      case 'workflow-update':
        this.handleWorkflowUpdate(message.workflow);
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Handle user joining collaboration session
   */
  private handleUserJoined(user: UserSession): void {
    this.collaborators.set(user.userId, user);
    this.emit('user-joined', { user, totalUsers: this.collaborators.size + 1 });
  }

  /**
   * Handle user leaving collaboration session
   */
  private handleUserLeft(userId: string): void {
    this.collaborators.delete(userId);
    this.emit('user-left', { userId, totalUsers: this.collaborators.size + 1 });
  }

  /**
   * Handle document changes from other users
   */
  private handleDocumentChange(change: DocumentChange): void {
    this.emit('document-changed', { change });
  }

  /**
   * Handle cursor position updates from other users
   */
  private handleCursorUpdate(userId: string, position: CursorPosition): void {
    const user = this.collaborators.get(userId);
    if (user) {
      user.cursor = position;
      user.lastActivity = new Date();
      this.emit('cursor-updated', { userId, position });
    }
  }

  /**
   * Handle AI recommendations from the server
   */
  private handleAIRecommendation(recommendation: SharedAIRecommendation): void {
    this.emit('ai-recommendation-received', { recommendation });
  }

  /**
   * Handle shared AI insights from team members
   */
  private handleSharedAIInsights(insights: any[]): void {
    this.emit('ai-insights-received', { insights });
  }

  /**
   * Handle workflow status updates
   */
  private handleWorkflowUpdate(workflow: WorkflowStatus): void {
    this.emit('workflow-updated', { workflow });
  }

  /**
   * Handle disconnection and cleanup
   */
  private handleDisconnection(): void {
    this.emit('disconnected', { documentId: this.documentId });
    this.cleanup();
  }

  /**
   * Send message through WebSocket
   */
  private sendMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Event handling
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  once(event: string, handler: Function): void {
    const onceHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.collaborators.clear();
    this.eventHandlers.clear();
  }

  /**
   * Get current collaboration status
   */
  getCollaborationStatus(): {
    isConnected: boolean;
    activeUsers: number;
    currentUser: UserSession | null;
    collaborators: UserSession[];
  } {
    return {
      isConnected: this.websocket?.readyState === WebSocket.OPEN,
      activeUsers: this.collaborators.size + (this.currentUser ? 1 : 0),
      currentUser: this.currentUser,
      collaborators: Array.from(this.collaborators.values())
    };
  }
}

/**
 * Create real-time collaboration service instance
 */
export function createCollaborationService(): RealTimeCollaborationService {
  return new RealTimeCollaborationService();
}
