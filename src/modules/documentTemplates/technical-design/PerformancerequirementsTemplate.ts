import type { ProjectContext } from '../../ai/types';

/**
 * Performance Requirements Template generates comprehensive performance requirements documentation
 * following performance engineering best practices and measurable metrics standards.
 */
export class PerformancerequirementsTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Performance Requirements
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Software System';
    
    return `# Performance Requirements

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}  
**Performance Standard:** [Industry benchmark or internal standard]

## Executive Summary

${projectDescription}

This document defines comprehensive performance requirements for ${projectName}, including response time targets, throughput expectations, scalability requirements, resource utilization limits, and monitoring specifications.

## 1. Performance Goals

### 1.1 Overall Performance Objectives
- **User Experience:** Provide responsive and smooth user interactions
- **System Efficiency:** Optimize resource utilization and operational costs
- **Scalability:** Support business growth and increasing user loads
- **Reliability:** Maintain consistent performance under various conditions
- **Availability:** Ensure high system uptime and accessibility

### 1.2 Performance Success Criteria
- **Response Time:** 95% of requests completed within target times
- **Throughput:** Handle specified transaction volumes per time unit
- **Concurrent Users:** Support defined number of simultaneous users
- **Error Rate:** Maintain error rates below acceptable thresholds
- **Resource Efficiency:** Stay within defined resource consumption limits

### 1.3 Performance Benchmarks
- **Industry Standards:** [Comparison with industry benchmarks]
- **Competitor Analysis:** [Performance relative to competitors]
- **Historical Performance:** [Baseline from previous system versions]
- **User Expectations:** [Performance levels expected by users]

## 2. Response Time Requirements

### 2.1 User Interface Response Times
- **Page Load Time:** 
  - Target: ≤ 2 seconds for 95% of requests
  - Acceptable: ≤ 4 seconds for 99% of requests
  - Critical Threshold: > 8 seconds is unacceptable
- **Form Submission:**
  - Target: ≤ 1 second for simple forms
  - Target: ≤ 3 seconds for complex forms
  - Target: ≤ 5 seconds for file uploads
- **Search Operations:**
  - Simple Search: ≤ 0.5 seconds
  - Advanced Search: ≤ 2 seconds
  - Full-text Search: ≤ 3 seconds

### 2.2 API Response Times
- **Authentication Endpoints:**
  - Login: ≤ 500ms for 95% of requests
  - Token Validation: ≤ 100ms for 95% of requests
  - Password Reset: ≤ 1 second
- **Data Retrieval APIs:**
  - Simple Queries: ≤ 200ms
  - Complex Queries: ≤ 1 second
  - Reports: ≤ 5 seconds
- **Data Modification APIs:**
  - Create Operations: ≤ 500ms
  - Update Operations: ≤ 300ms
  - Delete Operations: ≤ 200ms

### 2.3 Database Response Times
- **Simple Queries:** ≤ 50ms for 95% of queries
- **Complex Joins:** ≤ 500ms for 95% of queries
- **Aggregation Queries:** ≤ 2 seconds
- **Bulk Operations:** ≤ 30 seconds for large datasets
- **Backup Operations:** ≤ 4 hours for full backup

### 2.4 Third-Party Integration Response Times
- **Payment Processing:** ≤ 3 seconds
- **Email Delivery:** ≤ 5 seconds for queuing
- **SMS Delivery:** ≤ 10 seconds for queuing
- **External API Calls:** ≤ 2 seconds with 3 retry attempts

## 3. Throughput Expectations

### 3.1 Transaction Throughput
- **Peak Load Capacity:**
  - Transactions per Second (TPS): [X] TPS during peak hours
  - Transactions per Minute (TPM): [X] TPM sustained load
  - Daily Transaction Volume: [X] transactions per day
- **Sustained Load:**
  - Normal Operations: [X] TPS average
  - Business Hours: [X] TPS sustained
  - Off-Peak Hours: [X] TPS minimum

### 3.2 Data Throughput
- **Data Processing Rate:**
  - Batch Processing: [X] GB/hour
  - Real-time Processing: [X] MB/second
  - File Uploads: [X] files/minute
  - Data Export: [X] records/minute
- **Network Throughput:**
  - Inbound Data: [X] Mbps
  - Outbound Data: [X] Mbps
  - Internal Communication: [X] Mbps

### 3.3 API Throughput
- **REST API Calls:**
  - Read Operations: [X] requests/second
  - Write Operations: [X] requests/second
  - Authentication: [X] requests/second
- **GraphQL Queries:**
  - Simple Queries: [X] queries/second
  - Complex Queries: [X] queries/second
  - Mutations: [X] mutations/second

## 4. Scalability Requirements

### 4.1 Horizontal Scalability
- **Auto-scaling Triggers:**
  - CPU Utilization: Scale out at 70%, scale in at 30%
  - Memory Utilization: Scale out at 80%, scale in at 40%
  - Request Queue Length: Scale out at 100 queued requests
  - Response Time: Scale out when avg response > target + 50%

### 4.2 Vertical Scalability
- **Resource Scaling Limits:**
  - Maximum CPU: [X] cores per instance
  - Maximum Memory: [X] GB per instance
  - Maximum Storage: [X] TB per instance
  - Network Bandwidth: [X] Gbps per instance

### 4.3 Growth Projections
- **User Growth:**
  - Year 1: [X] concurrent users
  - Year 2: [X] concurrent users
  - Year 3: [X] concurrent users
  - Peak Growth: [X] concurrent users
- **Data Growth:**
  - Annual Data Growth: [X]% per year
  - Storage Requirements: [X] GB/TB per year
  - Backup Storage: [X] GB/TB per year

### 4.4 Geographic Scalability
- **Multi-Region Support:**
  - Primary Region: [Region name and capacity]
  - Secondary Regions: [List of regions and capacities]
  - Content Delivery: CDN performance requirements
  - Data Replication: Cross-region replication latency

## 5. Resource Utilization

### 5.1 CPU Utilization
- **Target Utilization:**
  - Normal Load: 40-60% average CPU usage
  - Peak Load: 70-80% maximum CPU usage
  - Critical Threshold: 90% CPU usage triggers alerts
- **CPU Efficiency:**
  - CPU per Transaction: [X] CPU seconds per transaction
  - CPU per User: [X] CPU cores per 1000 concurrent users

### 5.2 Memory Utilization
- **Memory Requirements:**
  - Application Memory: [X] GB base + [X] MB per user
  - Database Memory: [X] GB for cache + [X] GB buffer
  - System Memory: [X] GB reserved for OS and services
- **Memory Efficiency:**
  - Memory per User: [X] MB per concurrent user
  - Memory per Transaction: [X] KB per transaction

### 5.3 Storage Utilization
- **Storage Performance:**
  - Disk I/O: [X] IOPS for database storage
  - Read Throughput: [X] MB/s sustained
  - Write Throughput: [X] MB/s sustained
- **Storage Capacity:**
  - Application Storage: [X] GB/TB
  - Database Storage: [X] GB/TB
  - Backup Storage: [X] GB/TB
  - Log Storage: [X] GB with rotation

### 5.4 Network Utilization
- **Bandwidth Requirements:**
  - Inbound Bandwidth: [X] Mbps/Gbps
  - Outbound Bandwidth: [X] Mbps/Gbps
  - Internal Bandwidth: [X] Mbps/Gbps
- **Network Efficiency:**
  - Bandwidth per User: [X] Kbps per concurrent user
  - Bandwidth per Transaction: [X] KB per transaction

## 6. Load Handling

### 6.1 Concurrent User Capacity
- **User Load Levels:**
  - Normal Load: [X] concurrent users
  - Peak Load: [X] concurrent users
  - Stress Test Load: [X] concurrent users
  - Breaking Point: > [X] concurrent users

### 6.2 Load Distribution
- **Load Balancing:**
  - Algorithm: [Round Robin/Least Connections/Weighted]
  - Health Checks: [X] second intervals
  - Failover Time: ≤ [X] seconds
  - Session Affinity: [Enabled/Disabled]

### 6.3 Peak Load Scenarios
- **Business Peak Times:**
  - Daily Peak: [Time range] with [X]% increased load
  - Weekly Peak: [Day] with [X]% increased load
  - Monthly Peak: [Period] with [X]% increased load
  - Seasonal Peak: [Season/Event] with [X]% increased load

### 6.4 Load Testing Scenarios
- **Load Test Types:**
  - Baseline Testing: Normal expected load
  - Stress Testing: 150% of expected peak load
  - Spike Testing: Sudden 300% load increase
  - Volume Testing: Large data volumes
  - Endurance Testing: Extended period testing

## 7. Caching Strategy

### 7.1 Cache Hierarchy
- **Browser Cache:**
  - Static Assets: 1 year expiration
  - Dynamic Content: 5 minutes expiration
  - API Responses: 1 minute expiration
- **CDN Cache:**
  - Images/CSS/JS: 30 days
  - API Responses: 5 minutes
  - HTML Pages: 1 hour

### 7.2 Application-Level Caching
- **Memory Cache:**
  - Frequently Accessed Data: Redis/Memcached
  - Session Data: In-memory or Redis
  - Computation Results: Application cache
- **Database Cache:**
  - Query Result Cache: [X] minutes/hours
  - Connection Pool: [X] connections
  - Prepared Statement Cache: Enabled

### 7.3 Cache Performance Requirements
- **Cache Hit Ratio:**
  - Application Cache: ≥ 80% hit ratio
  - Database Cache: ≥ 90% hit ratio
  - CDN Cache: ≥ 95% hit ratio
- **Cache Response Times:**
  - Memory Cache: ≤ 1ms
  - Redis Cache: ≤ 5ms
  - CDN Cache: ≤ 50ms

### 7.4 Cache Invalidation
- **Invalidation Strategies:**
  - Time-based: TTL (Time To Live) expiration
  - Event-based: Triggered by data changes
  - Manual: Administrative cache clearing
- **Cache Consistency:**
  - Eventual Consistency: Acceptable for [X] seconds
  - Strong Consistency: Required for critical data

## 8. Performance Metrics

### 8.1 Key Performance Indicators (KPIs)
- **Response Time Metrics:**
  - Average Response Time
  - 95th Percentile Response Time
  - 99th Percentile Response Time
  - Maximum Response Time
- **Throughput Metrics:**
  - Requests per Second (RPS)
  - Transactions per Second (TPS)
  - Pages per Second (PPS)
  - Data Transfer Rate (MB/s)

### 8.2 Availability Metrics
- **Uptime Requirements:**
  - System Availability: 99.9% (8.76 hours downtime/year)
  - Service Availability: 99.95% (4.38 hours downtime/year)
  - Critical Functions: 99.99% (52.56 minutes downtime/year)
- **Recovery Metrics:**
  - Mean Time to Recovery (MTTR): ≤ 4 hours
  - Mean Time Between Failures (MTBF): ≥ 720 hours
  - Recovery Point Objective (RPO): ≤ 1 hour data loss
  - Recovery Time Objective (RTO): ≤ 2 hours downtime

### 8.3 Error Rate Metrics
- **Acceptable Error Rates:**
  - HTTP 4xx Errors: ≤ 1% of requests
  - HTTP 5xx Errors: ≤ 0.1% of requests
  - Database Errors: ≤ 0.01% of queries
  - Application Errors: ≤ 0.1% of transactions

### 8.4 Resource Efficiency Metrics
- **Cost Efficiency:**
  - Cost per Transaction: $[X] per 1000 transactions
  - Cost per User: $[X] per 1000 monthly active users
  - Infrastructure Efficiency: [X]% resource utilization
- **Energy Efficiency:**
  - Power Usage Effectiveness (PUE): ≤ 1.5
  - Carbon Footprint: [X] kg CO2 per transaction

## 9. Monitoring Requirements

### 9.1 Real-Time Monitoring
- **Application Performance Monitoring (APM):**
  - Response time tracking
  - Error rate monitoring
  - Transaction tracing
  - Code-level diagnostics
- **Infrastructure Monitoring:**
  - CPU, memory, disk, network utilization
  - Service health checks
  - Database performance metrics
  - Cache performance metrics

### 9.2 Alerting Thresholds
- **Critical Alerts:**
  - Response time > 2x target for 5 minutes
  - Error rate > 5% for 2 minutes
  - CPU utilization > 90% for 10 minutes
  - Memory utilization > 95% for 5 minutes
- **Warning Alerts:**
  - Response time > 1.5x target for 10 minutes
  - Error rate > 2% for 5 minutes
  - CPU utilization > 80% for 15 minutes
  - Memory utilization > 85% for 10 minutes

### 9.3 Performance Dashboards
- **Executive Dashboard:**
  - High-level KPIs and trends
  - SLA compliance status
  - Business impact metrics
  - Historical performance comparison
- **Operations Dashboard:**
  - Real-time system metrics
  - Alert status and trends
  - Resource utilization
  - Performance bottleneck identification

### 9.4 Reporting Requirements
- **Performance Reports:**
  - Daily Performance Summary
  - Weekly Performance Analysis
  - Monthly SLA Compliance Report
  - Quarterly Performance Review
- **Capacity Planning Reports:**
  - Resource utilization trends
  - Growth projection analysis
  - Capacity recommendations
  - Infrastructure planning

## 10. Performance Testing Plan

### 10.1 Testing Types and Objectives
- **Load Testing:**
  - Objective: Verify normal expected load handling
  - Duration: 30 minutes sustained load
  - Success Criteria: All requirements met under normal load
- **Stress Testing:**
  - Objective: Determine system breaking point
  - Load Level: 150% of expected peak load
  - Success Criteria: Graceful degradation, no data corruption
- **Spike Testing:**
  - Objective: Test sudden load increases
  - Scenario: 300% load spike for 10 minutes
  - Success Criteria: System recovery within 5 minutes
- **Volume Testing:**
  - Objective: Test with large data volumes
  - Data Size: 10x normal data volume
  - Success Criteria: Performance within acceptable limits

### 10.2 Test Environment Requirements
- **Environment Specifications:**
  - Production-like hardware configuration
  - Identical software stack and versions
  - Representative data volumes
  - Network topology matching production
- **Test Data Management:**
  - Synthetic data generation
  - Data privacy compliance
  - Data refresh procedures
  - Test data cleanup

### 10.3 Performance Testing Tools
- **Load Testing Tools:**
  - JMeter, LoadRunner, Gatling
  - Cloud-based testing platforms
  - Custom testing scripts
  - Monitoring and profiling tools
- **Monitoring During Testing:**
  - Application performance metrics
  - Infrastructure resource usage
  - Database performance statistics
  - Network utilization tracking

### 10.4 Testing Schedule and Criteria
- **Testing Phases:**
  - Unit Performance Tests: Per development cycle
  - Integration Performance Tests: Per release candidate
  - System Performance Tests: Pre-production deployment
  - Production Performance Validation: Post-deployment
- **Pass/Fail Criteria:**
  - All response time requirements met
  - Throughput targets achieved
  - Resource utilization within limits
  - No critical errors or data corruption
  - Recovery time objectives met

## 11. Performance Optimization

### 11.1 Code-Level Optimizations
- **Algorithm Efficiency:**
  - Time complexity optimization
  - Space complexity optimization
  - Database query optimization
  - Caching strategy implementation
- **Resource Management:**
  - Connection pooling
  - Memory management
  - Thread pool optimization
  - Garbage collection tuning

### 11.2 Database Optimization
- **Query Optimization:**
  - Index strategy optimization
  - Query execution plan analysis
  - Stored procedure optimization
  - Database schema design review
- **Database Configuration:**
  - Buffer pool sizing
  - Connection pool configuration
  - Query cache optimization
  - Replication optimization

### 11.3 Infrastructure Optimization
- **Server Configuration:**
  - Operating system tuning
  - Web server optimization
  - Application server tuning
  - Load balancer configuration
- **Network Optimization:**
  - Bandwidth optimization
  - Latency reduction
  - Compression strategies
  - CDN optimization

### 11.4 Continuous Performance Improvement
- **Performance Review Process:**
  - Regular performance audits
  - Bottleneck identification
  - Optimization prioritization
  - Implementation tracking
- **Performance Culture:**
  - Performance-aware development
  - Regular performance training
  - Performance metrics in development
  - Performance testing automation

## 12. Service Level Agreements (SLAs)

### 12.1 Availability SLA
- **System Availability:** 99.9% uptime (excluding planned maintenance)
- **Planned Maintenance:** Maximum 4 hours per month during off-peak hours
- **Service Credits:** [X]% service credit for each 0.1% below SLA
- **Measurement Period:** Monthly measurement and reporting

### 12.2 Performance SLA
- **Response Time SLA:** 95% of requests completed within defined targets
- **Throughput SLA:** System handles specified transaction volumes
- **Error Rate SLA:** Less than 1% error rate for user-facing operations
- **Recovery SLA:** Service restoration within RTO objectives

### 12.3 Scalability SLA
- **Auto-scaling Response:** New capacity available within 5 minutes
- **Manual Scaling:** Additional resources provisioned within 2 hours
- **Peak Load Handling:** System handles 2x normal load without degradation
- **Growth Support:** Annual capacity planning and scaling

## 13. Appendices

### Appendix A: Performance Testing Scripts
- **Load Testing Scripts:** JMeter/Gatling test plans
- **Monitoring Scripts:** Performance data collection scripts
- **Automation Scripts:** CI/CD performance testing integration
- **Reporting Scripts:** Automated performance report generation

### Appendix B: Performance Benchmarks
- **Industry Benchmarks:** Comparison with industry standards
- **Competitive Analysis:** Performance relative to competitors
- **Historical Performance:** Baseline performance metrics
- **Best Practices:** Performance optimization guidelines

### Appendix C: Tools and Technologies
- **Monitoring Tools:** APM solutions, infrastructure monitoring
- **Testing Tools:** Load testing and performance analysis tools
- **Optimization Tools:** Profilers, analyzers, and optimization utilities
- **Reporting Tools:** Dashboard and reporting solutions

### Appendix D: Performance Glossary
- **Response Time:** Time taken to process a single request
- **Throughput:** Number of transactions processed per unit time
- **Latency:** Time delay in system response
- **Scalability:** Ability to handle increased load
- **Availability:** Percentage of time system is operational
- **MTTR:** Mean Time To Recovery from failures
- **RPO/RTO:** Recovery Point/Time Objectives

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Performance Team Contact:** [performance-team@example.com]
- **Version History:**
  - v1.0 - Initial comprehensive performance requirements document
`;
  }
}
