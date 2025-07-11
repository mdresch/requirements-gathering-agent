/*
 * Progressive Web App Service
 * Enables universal access across all platforms with offline-first architecture
 */

/**
 * PWA Configuration
 */
export interface PWAConfig {
  appName: string;
  version: string;
  scope: string;
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  themeColor: string;
  backgroundColor: string;
  icons: PWAIcon[];
  shortcuts: PWAShortcut[];
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface PWAShortcut {
  name: string;
  shortName?: string;
  description: string;
  url: string;
  icons: PWAIcon[];
}

/**
 * Service Worker Management
 */
export interface ServiceWorkerConfig {
  scriptUrl: string;
  scope: string;
  updateViaCache: 'imports' | 'all' | 'none';
  cachingStrategy: CachingStrategy;
}

export interface CachingStrategy {
  documents: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  assets: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  api: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxAge: {
    documents: number; // hours
    assets: number; // hours
    api: number; // minutes
  };
}

/**
 * Offline Storage Management
 */
export interface OfflineStorage {
  documents: Map<string, CachedDocument>;
  assets: Map<string, CachedAsset>;
  apiResponses: Map<string, CachedResponse>;
  totalSize: number;
  maxSize: number;
}

export interface CachedDocument {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  cachedAt: Date;
  lastAccessed: Date;
  size: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CachedAsset {
  url: string;
  data: Blob;
  mimeType: string;
  cachedAt: Date;
  lastAccessed: Date;
  size: number;
}

export interface CachedResponse {
  url: string;
  response: any;
  cachedAt: Date;
  expiresAt: Date;
  size: number;
}

export interface DocumentMetadata {
  title: string;
  wordCount: number;
  lastModified: Date;
  collaborators: string[];
  tags: string[];
}

/**
 * Progressive Web App Service
 */
export class ProgressiveWebAppService {
  private config: PWAConfig;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private offlineStorage: OfflineStorage;
  private installPrompt: any = null;
  private isInstalled: boolean = false;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: PWAConfig) {
    this.config = config;
    this.offlineStorage = {
      documents: new Map(),
      assets: new Map(),
      apiResponses: new Map(),
      totalSize: 0,
      maxSize: 100 * 1024 * 1024 // 100MB default
    };
    
    this.initializePWA();
  }

  /**
   * Initialize Progressive Web App
   */
  async initializePWA(): Promise<void> {
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Setup offline storage
      await this.initializeOfflineStorage();
      
      // Setup install prompt handling
      this.setupInstallPrompt();
      
      // Setup background sync
      this.setupBackgroundSync();
      
      // Setup push notifications
      await this.setupPushNotifications();

      this.emit('pwa-initialized', { config: this.config });

    } catch (error) {
      console.error('PWA initialization failed:', error);
      throw new Error(`PWA initialization failed: ${error.message}`);
    }
  }

  /**
   * Register service worker for offline functionality
   */
  async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: this.config.scope
      });

      this.serviceWorker = registration;

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.emit('update-available', { registration });
            }
          });
        }
      });

      this.emit('service-worker-registered', { registration });

    } catch (error) {
      throw new Error(`Service Worker registration failed: ${error.message}`);
    }
  }

  /**
   * Enable offline document access
   */
  async enableOfflineDocument(documentId: string): Promise<void> {
    try {
      // Fetch document data
      const documentData = await this.fetchDocumentData(documentId);
      
      // Cache document
      await this.cacheDocument(documentData);
      
      // Cache related assets
      await this.cacheDocumentAssets(documentData);

      this.emit('document-cached', { documentId });

    } catch (error) {
      throw new Error(`Failed to enable offline access: ${error.message}`);
    }
  }

  /**
   * Sync offline changes when online
   */
  async syncOfflineChanges(): Promise<void> {
    if (!navigator.onLine) {
      return;
    }

    try {
      // Get pending changes from IndexedDB
      const pendingChanges = await this.getPendingChanges();
      
      // Sync each change
      for (const change of pendingChanges) {
        await this.syncChange(change);
      }

      // Clear synced changes
      await this.clearSyncedChanges(pendingChanges);

      this.emit('sync-completed', { 
        changesCount: pendingChanges.length,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('sync-failed', { error: error.message });
    }
  }

  /**
   * Handle app installation
   */
  async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      throw new Error('App installation not available');
    }

    try {
      // Show install prompt
      this.installPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.isInstalled = true;
        this.installPrompt = null;
        this.emit('app-installed', { timestamp: new Date() });
        return true;
      } else {
        this.emit('app-install-declined', { timestamp: new Date() });
        return false;
      }

    } catch (error) {
      throw new Error(`App installation failed: ${error.message}`);
    }
  }

  /**
   * Update app to latest version
   */
  async updateApp(): Promise<void> {
    if (!this.serviceWorker) {
      throw new Error('Service Worker not available');
    }

    try {
      // Update service worker
      await this.serviceWorker.update();
      
      // Reload to activate new version
      if (this.serviceWorker.waiting) {
        this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }

      this.emit('app-updated', { timestamp: new Date() });

    } catch (error) {
      throw new Error(`App update failed: ${error.message}`);
    }
  }

  /**
   * Manage offline storage
   */
  async manageOfflineStorage(): Promise<void> {
    try {
      // Calculate current storage usage
      const usage = await this.calculateStorageUsage();
      
      // Clean up if approaching limit
      if (usage.used > this.offlineStorage.maxSize * 0.8) {
        await this.cleanupOldCache();
      }

      this.emit('storage-managed', { usage });

    } catch (error) {
      console.error('Storage management failed:', error);
    }
  }

  /**
   * Handle background sync
   */
  async handleBackgroundSync(tag: string): Promise<void> {
    switch (tag) {
      case 'document-sync':
        await this.syncOfflineChanges();
        break;
      case 'asset-sync':
        await this.syncAssets();
        break;
      case 'collaboration-sync':
        await this.syncCollaborationData();
        break;
    }
  }

  /**
   * Get offline capabilities status
   */
  getOfflineStatus(): {
    isOnline: boolean;
    hasOfflineDocuments: boolean;
    pendingChanges: number;
    storageUsage: number;
    lastSync?: Date;
  } {
    return {
      isOnline: navigator.onLine,
      hasOfflineDocuments: this.offlineStorage.documents.size > 0,
      pendingChanges: 0, // Would be calculated from IndexedDB
      storageUsage: this.offlineStorage.totalSize,
      lastSync: new Date() // Would be retrieved from storage
    };
  }

  /**
   * Generate PWA manifest
   */
  generateManifest(): any {
    return {
      name: this.config.appName,
      short_name: this.config.appName,
      version: this.config.version,
      start_url: this.config.startUrl,
      scope: this.config.scope,
      display: this.config.display,
      orientation: this.config.orientation,
      theme_color: this.config.themeColor,
      background_color: this.config.backgroundColor,
      icons: this.config.icons,
      shortcuts: this.config.shortcuts,
      categories: ['productivity', 'business', 'collaboration'],
      lang: 'en',
      dir: 'ltr'
    };
  }

  // Private helper methods

  private async initializeOfflineStorage(): Promise<void> {
    // Initialize IndexedDB for offline storage
    if ('indexedDB' in window) {
      // Setup IndexedDB structure
      // Implementation would create object stores for documents, assets, etc.
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.emit('install-prompt-available', { prompt: e });
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      this.emit('app-installed', { timestamp: new Date() });
    });
  }

  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Register background sync events
      navigator.serviceWorker.ready.then((registration) => {
        // Background sync would be handled by service worker
      });
    }
  }

  private async setupPushNotifications(): Promise<void> {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.emit('push-notifications-enabled', { permission });
      }
    }
  }

  private async fetchDocumentData(documentId: string): Promise<CachedDocument> {
    // Mock document fetch - would integrate with real API
    return {
      id: documentId,
      content: 'Document content...',
      metadata: {
        title: 'Sample Document',
        wordCount: 150,
        lastModified: new Date(),
        collaborators: ['user1', 'user2'],
        tags: ['pwa', 'offline']
      },
      cachedAt: new Date(),
      lastAccessed: new Date(),
      size: 1024,
      priority: 'high'
    };
  }

  private async cacheDocument(document: CachedDocument): Promise<void> {
    this.offlineStorage.documents.set(document.id, document);
    this.offlineStorage.totalSize += document.size;
  }

  private async cacheDocumentAssets(document: CachedDocument): Promise<void> {
    // Cache related assets (images, fonts, etc.)
    // Implementation would extract and cache asset URLs from document
  }

  private async getPendingChanges(): Promise<any[]> {
    // Get pending changes from IndexedDB
    return []; // Mock implementation
  }

  private async syncChange(change: any): Promise<void> {
    // Sync individual change with server
    // Implementation would handle API calls and conflict resolution
  }

  private async clearSyncedChanges(changes: any[]): Promise<void> {
    // Remove synced changes from IndexedDB
  }

  private async calculateStorageUsage(): Promise<{used: number, available: number}> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      };
    }
    return { used: 0, available: 0 };
  }

  private async cleanupOldCache(): Promise<void> {
    // Remove least recently used documents and assets
    const sortedDocs = Array.from(this.offlineStorage.documents.values())
      .sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());

    // Remove oldest 20% of documents
    const toRemove = Math.floor(sortedDocs.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const doc = sortedDocs[i];
      this.offlineStorage.documents.delete(doc.id);
      this.offlineStorage.totalSize -= doc.size;
    }
  }

  private async syncAssets(): Promise<void> {
    // Sync cached assets with server
  }

  private async syncCollaborationData(): Promise<void> {
    // Sync collaboration data (comments, cursors, etc.)
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
 * Create Progressive Web App service instance
 */
export function createProgressiveWebAppService(config: PWAConfig): ProgressiveWebAppService {
  return new ProgressiveWebAppService(config);
}

/**
 * Default PWA configuration for ADPA
 */
export const defaultPWAConfig: PWAConfig = {
  appName: 'ADPA - AI Document Platform',
  version: '6.0.0',
  scope: '/',
  startUrl: '/',
  display: 'standalone',
  orientation: 'any',
  themeColor: '#2563eb',
  backgroundColor: '#ffffff',
  icons: [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-maskable-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    }
  ],
  shortcuts: [
    {
      name: 'New Document',
      description: 'Create a new document',
      url: '/new',
      icons: [
        {
          src: '/icons/new-doc-96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'Collaborate',
      description: 'Start collaboration session',
      url: '/collaborate',
      icons: [
        {
          src: '/icons/collaborate-96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    }
  ]
};
