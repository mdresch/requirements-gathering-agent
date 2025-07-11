/*
 * Mobile Collaboration Service
 * Enables cross-platform mobile collaboration with offline-first architecture
 */

/**
 * Mobile Device Information
 */
export interface MobileDevice {
  deviceId: string;
  deviceType: 'ios' | 'android' | 'tablet' | 'web';
  platform: string;
  version: string;
  capabilities: DeviceCapabilities;
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
}

export interface DeviceCapabilities {
  touchSupport: boolean;
  cameraAccess: boolean;
  voiceInput: boolean;
  offlineStorage: number; // MB
  pushNotifications: boolean;
  biometricAuth: boolean;
  fileSystemAccess: boolean;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'none';
  bandwidth: 'high' | 'medium' | 'low';
  latency: number; // ms
}

export interface SyncStatus {
  lastSync: Date;
  pendingChanges: number;
  conflictCount: number;
  syncInProgress: boolean;
  nextSyncScheduled?: Date;
}

/**
 * Mobile Document State
 */
export interface MobileDocument {
  documentId: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  localVersion: number;
  serverVersion: number;
  lastModified: Date;
  isOfflineAvailable: boolean;
  syncPriority: 'high' | 'medium' | 'low';
  collaborators: MobileCollaborator[];
}

export interface DocumentMetadata {
  size: number;
  wordCount: number;
  pageCount: number;
  language: string;
  tags: string[];
  projectId?: string;
  workflowStage?: string;
}

export interface MobileCollaborator {
  userId: string;
  userName: string;
  deviceType: string;
  isOnline: boolean;
  lastSeen: Date;
  currentSection?: string;
  permissions: CollaboratorPermissions;
}

export interface CollaboratorPermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canViewOffline: boolean;
}

/**
 * Offline Change Management
 */
export interface OfflineChange {
  changeId: string;
  documentId: string;
  timestamp: Date;
  type: 'insert' | 'delete' | 'format' | 'comment';
  position: number;
  content: string;
  userId: string;
  deviceId: string;
  conflictResolution?: ConflictResolution;
}

export interface ConflictResolution {
  strategy: 'merge' | 'overwrite' | 'manual';
  resolvedBy: string;
  resolvedAt: Date;
  originalChange: OfflineChange;
  resolvedChange: OfflineChange;
}

/**
 * Mobile Collaboration Service
 */
export class MobileCollaborationService {
  private device: MobileDevice;
  private offlineStorage: Map<string, MobileDocument> = new Map();
  private pendingChanges: Map<string, OfflineChange[]> = new Map();
  private syncQueue: string[] = [];
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(device: MobileDevice) {
    this.device = device;
    this.initializeOfflineStorage();
    this.setupNetworkMonitoring();
    this.startSyncScheduler();
  }

  /**
   * Initialize mobile collaboration session
   */
  async initializeMobileSession(documentId: string): Promise<MobileDocument> {
    try {
      // Check if document is available offline
      const offlineDoc = this.offlineStorage.get(documentId);
      if (offlineDoc && !this.device.networkStatus.isOnline) {
        return offlineDoc;
      }

      // Fetch document from server if online
      if (this.device.networkStatus.isOnline) {
        const serverDoc = await this.fetchDocumentFromServer(documentId);
        
        // Store for offline access
        await this.storeDocumentOffline(serverDoc);
        
        return serverDoc;
      }

      throw new Error('Document not available offline and no network connection');

    } catch (error) {
      throw new Error(`Failed to initialize mobile session: ${error.message}`);
    }
  }

  /**
   * Enable offline document access
   */
  async enableOfflineAccess(documentId: string): Promise<void> {
    try {
      if (!this.device.networkStatus.isOnline) {
        throw new Error('Network connection required to enable offline access');
      }

      // Download document and dependencies
      const document = await this.fetchDocumentFromServer(documentId);
      
      // Download related assets (images, templates, etc.)
      await this.downloadDocumentAssets(document);
      
      // Store in offline storage
      await this.storeDocumentOffline(document);
      
      // Mark as offline available
      document.isOfflineAvailable = true;
      this.offlineStorage.set(documentId, document);

      this.emit('offline-enabled', { documentId });

    } catch (error) {
      throw new Error(`Failed to enable offline access: ${error.message}`);
    }
  }

  /**
   * Sync changes when coming back online
   */
  async syncWhenOnline(): Promise<void> {
    if (!this.device.networkStatus.isOnline) {
      return;
    }

    try {
      // Process all pending changes
      for (const [documentId, changes] of this.pendingChanges) {
        await this.syncDocumentChanges(documentId, changes);
      }

      // Clear pending changes after successful sync
      this.pendingChanges.clear();
      
      // Update sync status
      this.updateSyncStatus();

      this.emit('sync-completed', { 
        syncedDocuments: this.syncQueue.length,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('sync-failed', { error: error.message });
    }
  }

  /**
   * Handle mobile-specific editing
   */
  async handleMobileEdit(
    documentId: string,
    change: Omit<OfflineChange, 'changeId' | 'timestamp' | 'userId' | 'deviceId'>
  ): Promise<void> {
    const fullChange: OfflineChange = {
      ...change,
      changeId: 'change-' + Date.now(),
      timestamp: new Date(),
      userId: 'current-user', // Would come from auth
      deviceId: this.device.deviceId
    };

    // Apply change locally immediately
    await this.applyChangeLocally(documentId, fullChange);

    // Queue for sync if online, otherwise store for later
    if (this.device.networkStatus.isOnline) {
      await this.syncChangeImmediately(documentId, fullChange);
    } else {
      this.queueChangeForSync(documentId, fullChange);
    }

    this.emit('change-applied', { documentId, change: fullChange });
  }

  /**
   * Handle touch-based interactions
   */
  async handleTouchInteraction(
    documentId: string,
    interaction: TouchInteraction
  ): Promise<void> {
    switch (interaction.type) {
      case 'tap':
        await this.handleTap(documentId, interaction);
        break;
      case 'long-press':
        await this.handleLongPress(documentId, interaction);
        break;
      case 'swipe':
        await this.handleSwipe(documentId, interaction);
        break;
      case 'pinch':
        await this.handlePinch(documentId, interaction);
        break;
    }
  }

  /**
   * Voice input integration
   */
  async handleVoiceInput(documentId: string, audioData: Blob): Promise<void> {
    if (!this.device.capabilities.voiceInput) {
      throw new Error('Voice input not supported on this device');
    }

    try {
      // Convert speech to text
      const transcription = await this.speechToText(audioData);
      
      // Apply as text insertion
      await this.handleMobileEdit(documentId, {
        type: 'insert',
        position: this.getCurrentCursorPosition(documentId),
        content: transcription,
        documentId
      });

      this.emit('voice-input-processed', { 
        documentId, 
        transcription,
        confidence: 0.95 // Mock confidence score
      });

    } catch (error) {
      throw new Error(`Voice input failed: ${error.message}`);
    }
  }

  /**
   * Camera integration for document scanning
   */
  async scanDocumentWithCamera(): Promise<string> {
    if (!this.device.capabilities.cameraAccess) {
      throw new Error('Camera access not available on this device');
    }

    try {
      // Capture image from camera
      const imageData = await this.captureImage();
      
      // Process with OCR
      const extractedText = await this.performOCR(imageData);
      
      return extractedText;

    } catch (error) {
      throw new Error(`Document scanning failed: ${error.message}`);
    }
  }

  /**
   * Push notification handling
   */
  async setupPushNotifications(): Promise<void> {
    if (!this.device.capabilities.pushNotifications) {
      return;
    }

    try {
      // Register for push notifications
      const token = await this.registerForPushNotifications();
      
      // Send token to server
      await this.sendPushTokenToServer(token);

      this.emit('push-notifications-enabled', { token });

    } catch (error) {
      console.error('Push notification setup failed:', error);
    }
  }

  /**
   * Biometric authentication
   */
  async authenticateWithBiometrics(): Promise<boolean> {
    if (!this.device.capabilities.biometricAuth) {
      throw new Error('Biometric authentication not available');
    }

    try {
      // Trigger biometric authentication
      const result = await this.performBiometricAuth();
      
      if (result.success) {
        this.emit('biometric-auth-success', { timestamp: new Date() });
        return true;
      } else {
        this.emit('biometric-auth-failed', { reason: result.error });
        return false;
      }

    } catch (error) {
      throw new Error(`Biometric authentication failed: ${error.message}`);
    }
  }

  // Private helper methods

  private async initializeOfflineStorage(): Promise<void> {
    // Initialize local storage for offline documents
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('adpa-offline-docs');
      if (stored) {
        const docs = JSON.parse(stored);
        for (const [id, doc] of Object.entries(docs)) {
          this.offlineStorage.set(id, doc as MobileDocument);
        }
      }
    }
  }

  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.device.networkStatus.isOnline = true;
        this.syncWhenOnline();
      });

      window.addEventListener('offline', () => {
        this.device.networkStatus.isOnline = false;
      });
    }
  }

  private startSyncScheduler(): void {
    // Schedule periodic sync when online
    setInterval(() => {
      if (this.device.networkStatus.isOnline && this.pendingChanges.size > 0) {
        this.syncWhenOnline();
      }
    }, 30000); // Sync every 30 seconds
  }

  private async fetchDocumentFromServer(documentId: string): Promise<MobileDocument> {
    // Mock server fetch - would integrate with real API
    return {
      documentId,
      title: 'Sample Document',
      content: 'Document content...',
      metadata: {
        size: 1024,
        wordCount: 150,
        pageCount: 1,
        language: 'en',
        tags: ['mobile', 'collaboration']
      },
      localVersion: 1,
      serverVersion: 1,
      lastModified: new Date(),
      isOfflineAvailable: false,
      syncPriority: 'medium',
      collaborators: []
    };
  }

  private async storeDocumentOffline(document: MobileDocument): Promise<void> {
    this.offlineStorage.set(document.documentId, document);
    
    // Persist to local storage
    if (typeof window !== 'undefined' && window.localStorage) {
      const allDocs = Object.fromEntries(this.offlineStorage);
      localStorage.setItem('adpa-offline-docs', JSON.stringify(allDocs));
    }
  }

  private async downloadDocumentAssets(document: MobileDocument): Promise<void> {
    // Download and cache related assets
    // Implementation would depend on asset types and storage strategy
  }

  private async syncDocumentChanges(documentId: string, changes: OfflineChange[]): Promise<void> {
    // Sync changes with server
    // Implementation would handle conflict resolution and merging
  }

  private updateSyncStatus(): void {
    this.device.syncStatus = {
      lastSync: new Date(),
      pendingChanges: this.pendingChanges.size,
      conflictCount: 0,
      syncInProgress: false
    };
  }

  private async applyChangeLocally(documentId: string, change: OfflineChange): Promise<void> {
    const document = this.offlineStorage.get(documentId);
    if (document) {
      // Apply change to local document
      // Implementation would depend on change type
      document.localVersion++;
      this.offlineStorage.set(documentId, document);
    }
  }

  private async syncChangeImmediately(documentId: string, change: OfflineChange): Promise<void> {
    // Send change to server immediately
    // Implementation would handle real-time sync
  }

  private queueChangeForSync(documentId: string, change: OfflineChange): void {
    if (!this.pendingChanges.has(documentId)) {
      this.pendingChanges.set(documentId, []);
    }
    this.pendingChanges.get(documentId)!.push(change);
  }

  private async handleTap(documentId: string, interaction: TouchInteraction): Promise<void> {
    // Handle tap interactions (cursor positioning, selection)
  }

  private async handleLongPress(documentId: string, interaction: TouchInteraction): Promise<void> {
    // Handle long press (context menu, selection)
  }

  private async handleSwipe(documentId: string, interaction: TouchInteraction): Promise<void> {
    // Handle swipe gestures (navigation, scrolling)
  }

  private async handlePinch(documentId: string, interaction: TouchInteraction): Promise<void> {
    // Handle pinch gestures (zoom, scale)
  }

  private async speechToText(audioData: Blob): Promise<string> {
    // Mock speech-to-text conversion
    return 'Transcribed text from voice input';
  }

  private getCurrentCursorPosition(documentId: string): number {
    // Get current cursor position in document
    return 0; // Mock position
  }

  private async captureImage(): Promise<Blob> {
    // Mock camera capture
    return new Blob();
  }

  private async performOCR(imageData: Blob): Promise<string> {
    // Mock OCR processing
    return 'Extracted text from image';
  }

  private async registerForPushNotifications(): Promise<string> {
    // Mock push notification registration
    return 'mock-push-token';
  }

  private async sendPushTokenToServer(token: string): Promise<void> {
    // Send push token to server
  }

  private async performBiometricAuth(): Promise<{success: boolean, error?: string}> {
    // Mock biometric authentication
    return { success: true };
  }

  // Event handling
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }
}

/**
 * Touch Interaction Interface
 */
export interface TouchInteraction {
  type: 'tap' | 'long-press' | 'swipe' | 'pinch';
  position: { x: number; y: number };
  timestamp: Date;
  pressure?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
}

/**
 * Create mobile collaboration service instance
 */
export function createMobileCollaborationService(device: MobileDevice): MobileCollaborationService {
  return new MobileCollaborationService(device);
}
