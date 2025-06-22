using TypeSpec.Http;
using TypeSpec.Rest;

/**
 * Health status for individual service components
 */
model HealthStatus {
  /**
   * Component health status
   */
  status: "healthy" | "degraded" | "unhealthy";

  /**
   * Response time in milliseconds
   */
  responseTime?: int32;

  /**
   * Status message or error description
   */
  message?: string;

  /**
   * Last check timestamp
   */
  lastChecked: utcDateTime;

  /**
   * Additional component-specific details
   */
  details?: Record<unknown>;
}

/**
 * Comprehensive health check response
 */
model HealthCheckResponse {
  /**
   * Overall service health status
   */
  status: "healthy" | "degraded" | "unhealthy";

  /**
   * Service version
   */
  version: string;

  /**
   * Service uptime in seconds
   */
  uptime: int64;

  /**
   * Health check timestamp
   */
  timestamp: utcDateTime;

  /**
   * Individual component health checks
   */
  checks: {
    /**
     * Database connectivity and performance
     */
    database: HealthStatus;

    /**
     * Message queue status
     */
    queue: HealthStatus;

    /**
     * File storage accessibility
     */
    storage: HealthStatus;

    /**
     * Adobe Services integration status
     */
    adobe: HealthStatus;

    /**
     * External API dependencies
     */
    externalApis: HealthStatus;

    /**
     * Memory usage and performance
     */
    memory: HealthStatus;

    /**
     * CPU usage and performance
     */
    cpu: HealthStatus;
  };

  /**
   * Service metrics
   */
  metrics?: {
    /**
     * Total requests processed
     */
    totalRequests: int64;

    /**
     * Requests per minute
     */
    requestsPerMinute: float32;

    /**
     * Average response time in milliseconds
     */
    averageResponseTime: float32;

    /**
     * Error rate percentage
     */
    errorRate: float32;

    /**
     * Active connections
     */
    activeConnections: int32;

    /**
     * Memory usage in MB
     */
    memoryUsage: float32;

    /**
     * CPU usage percentage
     */
    cpuUsage: float32;
  };
}

/**
 * Service readiness response
 */
model ReadinessResponse {
  /**
   * Whether service is ready to accept requests
   */
  ready: boolean;

  /**
   * Readiness check timestamp
   */
  timestamp: utcDateTime;

  /**
   * Service initialization status
   */
  initialized: boolean;

  /**
   * Database connection status
   */
  databaseReady: boolean;

  /**
   * Required dependencies status
   */
  dependenciesReady: boolean;

  /**
   * Reason if not ready
   */
  reason?: string;
}

/**
 * Service liveness response
 */
model LivenessResponse {
  /**
   * Whether service is alive and responding
   */
  alive: boolean;

  /**
   * Liveness check timestamp
   */
  timestamp: utcDateTime;

  /**
   * Process ID
   */
  processId: int32;

  /**
   * Service start time
   */
  startTime: utcDateTime;

  /**
   * Last heartbeat timestamp
   */
  lastHeartbeat: utcDateTime;
}

/**
 * Health monitoring and system status API
 */
@tag("Health & Monitoring")
@route("/api/v1/health")
interface HealthAPI {
  /**
   * Get comprehensive service health status
   * 
   * Returns detailed health information for all service components
   * including database, queue, storage, and external dependencies.
   */
  @get
  @summary("Get Health Status")
  getHealth(): HealthCheckResponse | ServiceUnavailableError;

  /**
   * Get service readiness status
   * 
   * Returns whether the service is ready to accept and process requests.
   * Used by Kubernetes readiness probes and load balancers.
   */
  @get
  @route("/ready")
  @summary("Get Readiness Status")
  getReadiness(): ReadinessResponse | ServiceUnavailableError;

  /**
   * Get service liveness status
   * 
   * Returns whether the service is alive and responsive.
   * Used by Kubernetes liveness probes and monitoring systems.
   */
  @get
  @route("/live")
  @summary("Get Liveness Status")
  getLiveness(): LivenessResponse | ServiceUnavailableError;

  /**
   * Get detailed system metrics
   * 
   * Returns comprehensive system performance metrics
   * for monitoring and alerting purposes.
   */
  @get
  @route("/metrics")
  @summary("Get System Metrics")
  getMetrics(): ApiResponse<{
    /**
     * System performance metrics
     */
    system: {
      /**
       * Memory usage statistics
       */
      memory: {
        /**
         * Total memory in MB
         */
        total: float32;
        
        /**
         * Used memory in MB
         */
        used: float32;
        
        /**
         * Free memory in MB
         */
        free: float32;
        
        /**
         * Memory usage percentage
         */
        percentage: float32;
      };

      /**
       * CPU usage statistics
       */
      cpu: {
        /**
         * CPU usage percentage
         */
        percentage: float32;
        
        /**
         * Load average (1 minute)
         */
        loadAverage: float32;
        
        /**
         * Number of CPU cores
         */
        cores: int32;
      };

      /**
       * Disk usage statistics
       */
      disk: {
        /**
         * Total disk space in GB
         */
        total: float32;
        
        /**
         * Used disk space in GB
         */
        used: float32;
        
        /**
         * Free disk space in GB
         */
        free: float32;
        
        /**
         * Disk usage percentage
         */
        percentage: float32;
      };
    };

    /**
     * Application-specific metrics
     */
    application: {
      /**
       * Document processing metrics
       */
      processing: {
        /**
         * Jobs currently processing
         */
        activeJobs: int32;
        
        /**
         * Jobs in queue
         */
        queuedJobs: int32;
        
        /**
         * Jobs processed in last hour
         */
        jobsLastHour: int32;
        
        /**
         * Average processing time
         */
        averageProcessingTime: float32;
      };

      /**
       * API request metrics
       */
      api: {
        /**
         * Requests per minute
         */
        requestsPerMinute: float32;
        
        /**
         * Average response time
         */
        averageResponseTime: float32;
        
        /**
         * Error rate percentage
         */
        errorRate: float32;
        
        /**
         * Active connections
         */
        activeConnections: int32;
      };

      /**
       * Cache metrics
       */
      cache: {
        /**
         * Cache hit rate percentage
         */
        hitRate: float32;
        
        /**
         * Cache size in MB
         */
        size: float32;
        
        /**
         * Number of cached items
         */
        itemCount: int32;
      };
    };

    /**
     * Metrics collection timestamp
     */
    timestamp: utcDateTime;
  }> | ServiceUnavailableError;

  /**
   * Get service version information
   * 
   * Returns detailed version and build information
   * for the service and its dependencies.
   */
  @get
  @route("/version")
  @summary("Get Version Information")
  getVersion(): ApiResponse<{
    /**
     * Service version
     */
    version: string;

    /**
     * Build information
     */
    build: {
      /**
       * Git commit hash
       */
      commit: string;
      
      /**
       * Build timestamp
       */
      timestamp: utcDateTime;
      
      /**
       * Build number
       */
      number: string;
      
      /**
       * Build environment
       */
      environment: string;
    };

    /**
     * Runtime information
     */
    runtime: {
      /**
       * Node.js version
       */
      nodeVersion: string;
      
      /**
       * Operating system
       */
      platform: string;
      
      /**
       * Architecture
       */
      architecture: string;
    };

    /**
     * Dependency versions
     */
    dependencies: Record<string>;
  }> | ServiceUnavailableError;
}
