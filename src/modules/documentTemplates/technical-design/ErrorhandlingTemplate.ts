import type { ProjectContext } from '../../ai/types';

/**
 * Error Handling Template generates comprehensive error handling guidelines
 * covering error strategies, logging, recovery, and monitoring procedures.
 */
export class ErrorhandlingTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Error Handling Guidelines
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Software Project';
    
    return `# Error Handling Guidelines

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}  
**Error Handling Strategy:** [Defensive/Fail-Fast/Graceful Degradation]

## Executive Summary

${projectDescription}

This document provides comprehensive error handling guidelines for ${projectName}, including error handling strategies, logging standards, recovery procedures, and monitoring approaches. The guidelines ensure system reliability, maintainability, and optimal user experience during error conditions.

## 1. Error Handling Strategy

### 1.1 Error Handling Philosophy
- **Fail-Fast Principle:** Detect and report errors as early as possible
- **Graceful Degradation:** Provide reduced functionality when errors occur
- **User-Centric Design:** Prioritize user experience during error scenarios
- **Defensive Programming:** Anticipate and handle potential error conditions
- **Transparency:** Provide clear error information for debugging and resolution
- **Recovery-Oriented:** Design for automatic recovery where possible

### 1.2 Error Handling Objectives
- **System Reliability:** Maintain system stability during error conditions
- **User Experience:** Provide meaningful error messages to users
- **Operational Visibility:** Enable quick identification and resolution of issues
- **Data Integrity:** Prevent data corruption during error scenarios
- **Security:** Avoid exposing sensitive information in error messages
- **Performance:** Minimize performance impact of error handling

### 1.3 Error Handling Principles
- **Separation of Concerns:** Centralize error handling logic
- **Consistency:** Standardize error handling patterns across the system
- **Observability:** Ensure all errors are logged and monitored
- **Recoverability:** Design for both automatic and manual recovery
- **Testing:** Comprehensive testing of error scenarios
- **Documentation:** Clear documentation of error handling procedures

## 2. Error Categories

### 2.1 System Errors

#### 2.1.1 Infrastructure Errors
- **Network Errors:** Connection timeouts, DNS resolution failures
- **Server Errors:** HTTP 5xx errors, service unavailability
- **Database Errors:** Connection failures, query timeouts, deadlocks
- **Storage Errors:** Disk full, permission denied, file corruption
- **Memory Errors:** Out of memory, memory leaks
- **CPU Errors:** Process timeouts, resource exhaustion

#### 2.1.2 Application Errors
- **Configuration Errors:** Missing configuration, invalid settings
- **Dependency Errors:** Missing dependencies, version conflicts
- **Runtime Errors:** Null pointer exceptions, array bounds errors
- **Logic Errors:** Business rule violations, calculation errors
- **State Errors:** Invalid state transitions, concurrent access issues

### 2.2 Business Logic Errors

#### 2.2.1 Validation Errors
- **Input Validation:** Invalid data format, missing required fields
- **Business Rule Validation:** Constraint violations, policy breaches
- **Data Consistency:** Referential integrity violations
- **Authorization Errors:** Insufficient permissions, access denied
- **Authentication Errors:** Invalid credentials, expired sessions

#### 2.2.2 Processing Errors
- **Workflow Errors:** Invalid state transitions, process failures
- **Integration Errors:** External service failures, API errors
- **Transformation Errors:** Data conversion failures, mapping errors
- **Calculation Errors:** Mathematical errors, precision issues

### 2.3 User Errors

#### 2.3.1 Input Errors
- **Format Errors:** Invalid data format, incorrect syntax
- **Range Errors:** Values outside acceptable ranges
- **Required Field Errors:** Missing mandatory information
- **Duplicate Errors:** Duplicate entries where uniqueness required

#### 2.3.2 Interaction Errors
- **Navigation Errors:** Invalid page requests, broken links
- **Session Errors:** Session timeouts, invalid session state
- **Permission Errors:** Unauthorized access attempts
- **Rate Limiting:** Too many requests in short time period

## 3. Error Logging Standards

### 3.1 Logging Framework
- **Framework:** [Winston/Log4j/Serilog/Python Logging]
- **Format:** Structured JSON logging for consistency
- **Levels:** DEBUG, INFO, WARN, ERROR, FATAL
- **Correlation:** Request correlation IDs for distributed tracing
- **Context:** Relevant context information for debugging

### 3.2 Log Entry Structure
\`\`\`json
{
  "timestamp": "2025-06-17T10:30:00.000Z",
  "level": "ERROR",
  "message": "Database connection failed",
  "correlationId": "req_123456789",
  "userId": "user_12345",
  "sessionId": "session_abcd1234",
  "component": "UserService",
  "method": "getUserById",
  "errorCode": "DB_CONNECTION_FAILED",
  "errorType": "InfrastructureError",
  "stackTrace": "...",
  "additionalContext": {
    "userId": "12345",
    "retryAttempt": 2,
    "dbHost": "db.example.com"
  }
}
\`\`\`

### 3.3 Logging Best Practices
- **Structured Logging:** Use consistent JSON structure for all logs
- **Sensitive Data:** Never log passwords, tokens, or personal information
- **Performance Impact:** Minimize logging overhead in production
- **Log Levels:** Use appropriate log levels for different error types
- **Correlation IDs:** Track requests across distributed systems
- **Context Information:** Include relevant context for troubleshooting

### 3.4 Log Retention and Management
- **Retention Policy:** 
  - DEBUG/INFO: 7 days
  - WARN: 30 days
  - ERROR/FATAL: 90 days
- **Archival:** Long-term storage for compliance and analysis
- **Rotation:** Automatic log rotation based on size and time
- **Compression:** Compress archived logs to save storage
- **Security:** Encrypt logs containing sensitive information

## 4. Error Reporting

### 4.1 Internal Error Reporting

#### 4.1.1 Real-Time Alerts
- **Critical Errors:** Immediate notification via SMS/email/Slack
- **Error Rate Thresholds:** Alert when error rates exceed baselines
- **Service Health:** Monitor service availability and performance
- **Custom Metrics:** Application-specific error monitoring

#### 4.1.2 Error Dashboards
- **Executive Dashboard:** High-level error metrics and trends
- **Operations Dashboard:** Real-time error monitoring and resolution
- **Development Dashboard:** Error analysis and debugging information
- **Business Dashboard:** Impact of errors on business metrics

### 4.2 External Error Reporting

#### 4.2.1 User Error Reporting
- **In-App Reporting:** Allow users to report issues within the application
- **Error Tracking:** Automatic client-side error reporting
- **Feedback Collection:** Gather user feedback on error experiences
- **Support Integration:** Link error reports to support ticket system

#### 4.2.2 Partner/API Error Reporting
- **API Error Responses:** Standardized error response format
- **Status Pages:** Public status page for service availability
- **Partner Notifications:** Notify partners of service disruptions
- **SLA Reporting:** Service level agreement compliance reporting

### 4.3 Error Reporting Tools
- **APM Tools:** [New Relic/DataDog/AppDynamics/Dynatrace]
- **Error Tracking:** [Sentry/Rollbar/Bugsnag/Airbrake]
- **Log Management:** [ELK Stack/Splunk/Sumo Logic/Papertrail]
- **Monitoring:** [Prometheus/Grafana/CloudWatch/Azure Monitor]

## 5. Recovery Procedures

### 5.1 Automatic Recovery

#### 5.1.1 Retry Mechanisms
- **Exponential Backoff:** Increasing delay between retry attempts
- **Jitter:** Random delay to prevent thundering herd problems
- **Circuit Breaker:** Prevent cascade failures
- **Retry Limits:** Maximum number of retry attempts
- **Idempotency:** Ensure operations can be safely retried

#### 5.1.2 Failover Procedures
- **Health Checks:** Automated health monitoring
- **Load Balancer Failover:** Automatic traffic rerouting
- **Database Failover:** Master-slave failover procedures
- **Service Discovery:** Automatic service instance discovery
- **Graceful Shutdown:** Proper service shutdown procedures

### 5.2 Manual Recovery

#### 5.2.1 Incident Response
- **Incident Classification:** Severity levels and response procedures
- **Response Team:** Defined roles and responsibilities
- **Communication Plan:** Internal and external communication procedures
- **Escalation Procedures:** When and how to escalate incidents

#### 5.2.2 Recovery Procedures
- **System Restart:** Safe system restart procedures
- **Data Recovery:** Database and file recovery procedures
- **Configuration Recovery:** Configuration restoration procedures
- **Service Recovery:** Service-specific recovery procedures

### 5.3 Recovery Testing
- **Disaster Recovery Drills:** Regular testing of recovery procedures
- **Chaos Engineering:** Deliberately introduce failures to test resilience
- **Recovery Time Objectives (RTO):** Target recovery time for different scenarios
- **Recovery Point Objectives (RPO):** Acceptable data loss in recovery scenarios

## 6. Retry Mechanisms

### 6.1 Retry Strategies

#### 6.1.1 Fixed Interval Retry
- **Use Case:** Simple operations with consistent failure patterns
- **Implementation:** Fixed delay between retry attempts
- **Configuration:** \`retryInterval: 1000ms, maxRetries: 3\`
- **Considerations:** May cause thundering herd problems

#### 6.1.2 Exponential Backoff
- **Use Case:** Network and service failures
- **Implementation:** Exponentially increasing delay between retries
- **Configuration:** \`initialDelay: 100ms, multiplier: 2, maxDelay: 30s\`
- **Benefits:** Reduces load on failing services

#### 6.1.3 Exponential Backoff with Jitter
- **Use Case:** High-concurrency scenarios
- **Implementation:** Add random component to exponential backoff
- **Configuration:** \`jitterFactor: 0.1, jitterType: 'full'\`
- **Benefits:** Prevents synchronized retry attempts

### 6.2 Retry Configuration
\`\`\`javascript
const retryConfig = {
  maxRetries: 3,
  initialDelay: 100,
  maxDelay: 30000,
  multiplier: 2,
  jitter: true,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVICE_UNAVAILABLE'
  ],
  nonRetryableErrors: [
    'AUTHENTICATION_ERROR',
    'AUTHORIZATION_ERROR',
    'VALIDATION_ERROR'
  ]
};
\`\`\`

### 6.3 Retry Best Practices
- **Idempotency:** Ensure operations can be safely retried
- **Error Classification:** Only retry transient errors
- **Resource Management:** Implement timeouts and resource limits
- **Monitoring:** Track retry attempts and success rates
- **Circuit Breaking:** Prevent infinite retry loops

## 7. Circuit Breaker Pattern

### 7.1 Circuit Breaker States

#### 7.1.1 Closed State
- **Behavior:** Allow all requests to pass through
- **Monitoring:** Count failures and successes
- **Transition:** Move to Open state when failure threshold exceeded
- **Configuration:** \`failureThreshold: 5, timeWindow: 60s\`

#### 7.1.2 Open State
- **Behavior:** Reject all requests immediately
- **Response:** Return cached response or default value
- **Transition:** Move to Half-Open state after timeout period
- **Configuration:** \`openTimeout: 60s\`

#### 7.1.3 Half-Open State
- **Behavior:** Allow limited number of test requests
- **Monitoring:** Monitor success rate of test requests
- **Transition:** Move to Closed (success) or Open (failure)
- **Configuration:** \`testRequestCount: 3\`

### 7.2 Circuit Breaker Implementation
\`\`\`javascript
class CircuitBreaker {
  constructor(options) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.monitor = options.monitor || this.defaultMonitor;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
\`\`\`

### 7.3 Circuit Breaker Configuration
- **Failure Threshold:** Number of failures before opening circuit
- **Reset Timeout:** Time to wait before attempting reset
- **Success Threshold:** Successes needed to close circuit in half-open state
- **Monitoring:** Health check function for service availability

## 8. User Error Messages

### 8.1 Error Message Design Principles
- **Clarity:** Use clear, understandable language
- **Actionability:** Provide specific actions users can take
- **Context:** Include relevant context for the error
- **Empathy:** Use empathetic tone in error messages
- **Brevity:** Keep messages concise but informative
- **Consistency:** Use consistent messaging patterns

### 8.2 Error Message Categories

#### 8.2.1 Validation Error Messages
- **Format:** "Please enter a valid email address"
- **Required:** "Name is required"
- **Range:** "Password must be between 8-50 characters"
- **Pattern:** "Phone number must be in format (xxx) xxx-xxxx"

#### 8.2.2 System Error Messages
- **Generic:** "We're experiencing technical difficulties. Please try again later."
- **Specific:** "Unable to save changes. Please check your connection and try again."
- **Maintenance:** "System is currently under maintenance. Expected completion: 2:00 PM EST"

#### 8.2.3 Business Logic Error Messages
- **Constraint:** "This email address is already registered"
- **Permission:** "You don't have permission to perform this action"
- **State:** "Order cannot be cancelled after it has been shipped"
- **Availability:** "Selected item is currently out of stock"

### 8.3 Error Message Localization
- **Multi-Language Support:** Translate error messages to user's language
- **Cultural Sensitivity:** Adapt messages for cultural context
- **Technical Translation:** Ensure technical accuracy in translations
- **Maintenance:** Keep translations up-to-date with message changes

### 8.4 Error Message Testing
- **User Testing:** Test error messages with real users
- **A/B Testing:** Compare different error message approaches
- **Accessibility:** Ensure error messages are accessible
- **Consistency Testing:** Verify consistent messaging patterns

## 9. Monitoring and Alerting

### 9.1 Error Monitoring Strategy

#### 9.1.1 Metrics Collection
- **Error Rate:** Percentage of requests resulting in errors
- **Error Count:** Absolute number of errors over time
- **Response Time:** Impact of errors on response time
- **User Impact:** Number of users affected by errors
- **Recovery Time:** Time to resolve error conditions

#### 9.1.2 Monitoring Dashboards
- **Real-Time Dashboard:** Live error monitoring and system health
- **Trend Analysis:** Historical error patterns and trends
- **Component Health:** Error rates by system component
- **User Journey:** Error impact on user workflows

### 9.2 Alerting Strategy

#### 9.2.1 Alert Levels
- **Critical (P1):** System down, immediate response required
- **High (P2):** Significant impact, response within 1 hour
- **Medium (P3):** Moderate impact, response within 4 hours
- **Low (P4):** Minor impact, response within 24 hours

#### 9.2.2 Alert Configuration
- **Threshold-Based:** Alert when error rate exceeds threshold
- **Anomaly Detection:** Alert on unusual error patterns
- **Composite Alerts:** Multiple conditions triggering single alert
- **Alert Suppression:** Prevent alert fatigue with intelligent grouping

### 9.3 Alert Response Procedures
- **Acknowledgment:** Acknowledge alerts within defined timeframes
- **Investigation:** Standard investigation procedures for each alert type
- **Communication:** Notify stakeholders of ongoing issues
- **Resolution:** Document resolution steps and lessons learned

### 9.4 Monitoring Tools Integration
- **APM Integration:** Application performance monitoring tools
- **Log Aggregation:** Centralized logging for error analysis
- **Incident Management:** Integration with incident management systems
- **Communication Tools:** Slack, PagerDuty, email notifications

## 10. Troubleshooting Guide

### 10.1 Common Error Scenarios

#### 10.1.1 Database Connection Errors
- **Symptoms:** Connection timeout, authentication failures
- **Causes:** Network issues, credential problems, connection pool exhaustion
- **Investigation Steps:**
  1. Check database server status
  2. Verify network connectivity
  3. Validate connection credentials
  4. Monitor connection pool usage
- **Resolution:** Restart connections, scale connection pool, fix network issues

#### 10.1.2 API Integration Errors
- **Symptoms:** HTTP errors, timeout exceptions, malformed responses
- **Causes:** Service unavailability, rate limiting, API changes
- **Investigation Steps:**
  1. Check external service status
  2. Verify API credentials and permissions
  3. Review request/response logs
  4. Test API endpoints manually
- **Resolution:** Implement retry logic, update API integration, contact service provider

#### 10.1.3 Memory and Performance Errors
- **Symptoms:** Out of memory errors, slow response times, timeouts
- **Causes:** Memory leaks, inefficient algorithms, resource contention
- **Investigation Steps:**
  1. Monitor memory usage patterns
  2. Profile application performance
  3. Analyze garbage collection logs
  4. Review resource utilization
- **Resolution:** Optimize code, increase memory allocation, implement caching

### 10.2 Diagnostic Tools
- **Application Profilers:** CPU and memory profiling tools
- **Network Analyzers:** Network traffic analysis tools
- **Database Monitors:** Database performance monitoring tools
- **Log Analysis:** Log parsing and analysis tools

### 10.3 Troubleshooting Workflow
1. **Error Detection:** Identify and classify the error
2. **Impact Assessment:** Determine scope and severity
3. **Initial Investigation:** Gather initial diagnostic information
4. **Hypothesis Formation:** Develop theories about root cause
5. **Testing:** Test hypotheses systematically
6. **Resolution Implementation:** Apply fix and verify resolution
7. **Documentation:** Document findings and resolution steps
8. **Prevention:** Implement measures to prevent recurrence

### 10.4 Knowledge Base Management
- **Error Catalog:** Comprehensive catalog of known errors and solutions
- **Solution Database:** Searchable database of resolution procedures
- **Best Practices:** Documented troubleshooting best practices
- **Team Knowledge:** Share troubleshooting expertise across team

## 11. Performance Impact

### 11.1 Error Handling Performance Considerations
- **Exception Overhead:** Minimize performance impact of exception handling
- **Logging Performance:** Optimize logging to reduce system overhead
- **Retry Logic:** Balance retry attempts with performance impact
- **Circuit Breaker:** Fail fast to preserve system performance
- **Resource Cleanup:** Proper resource cleanup in error scenarios

### 11.2 Performance Optimization Strategies
- **Lazy Evaluation:** Defer expensive operations until needed
- **Caching:** Cache error responses to avoid repeated processing
- **Batch Processing:** Group error handling operations for efficiency
- **Asynchronous Processing:** Handle errors asynchronously when possible
- **Resource Pooling:** Reuse resources to minimize allocation overhead

### 11.3 Performance Monitoring
- **Error Processing Time:** Monitor time spent handling errors
- **System Impact:** Measure overall system performance impact
- **Resource Utilization:** Track resource usage during error conditions
- **Throughput Impact:** Monitor impact on system throughput

## 12. Testing Error Handling

### 12.1 Error Testing Strategies
- **Unit Testing:** Test individual error handling components
- **Integration Testing:** Test error propagation across components
- **Chaos Engineering:** Deliberately introduce failures to test resilience
- **Load Testing:** Test error handling under high load conditions
- **Security Testing:** Test error handling security implications

### 12.2 Test Scenarios
- **Network Failures:** Simulate network connectivity issues
- **Service Outages:** Test behavior when dependencies are unavailable
- **Resource Exhaustion:** Test handling of memory and CPU limits
- **Data Corruption:** Test recovery from corrupted data scenarios
- **Configuration Errors:** Test handling of misconfiguration

### 12.3 Automated Error Testing
- **Continuous Testing:** Automated error scenario testing in CI/CD
- **Regression Testing:** Ensure error handling doesn't regress
- **Synthetic Monitoring:** Automated testing of error scenarios
- **Canary Testing:** Test error handling in production with limited traffic

## 13. Security Considerations

### 13.1 Error Information Security
- **Information Disclosure:** Prevent sensitive information in error messages
- **Stack Trace Security:** Sanitize stack traces in production
- **Log Security:** Secure error logs containing sensitive information
- **Error Response Security:** Standardize error responses to prevent information leakage

### 13.2 Attack Vector Prevention
- **Error-Based Attacks:** Prevent attacks exploiting error conditions
- **Denial of Service:** Protect against DoS attacks using error conditions
- **Information Gathering:** Prevent attackers from gathering system information
- **Privilege Escalation:** Prevent error conditions from elevating privileges

### 13.3 Compliance Considerations
- **Data Protection:** Ensure error handling complies with data protection regulations
- **Audit Requirements:** Maintain audit trails for security-related errors
- **Incident Reporting:** Report security incidents according to regulations
- **Privacy Protection:** Protect user privacy in error scenarios

## 14. Documentation and Training

### 14.1 Error Handling Documentation
- **Development Guidelines:** Error handling standards for developers
- **Operations Runbooks:** Procedures for operations team
- **User Guides:** Help users understand and resolve errors
- **API Documentation:** Document API error responses and handling

### 14.2 Team Training
- **Error Handling Best Practices:** Train team on error handling principles
- **Tool Training:** Training on error monitoring and debugging tools
- **Incident Response:** Training on incident response procedures
- **Troubleshooting Skills:** Develop systematic troubleshooting skills

### 14.3 Knowledge Sharing
- **Post-Incident Reviews:** Learn from error incidents
- **Best Practice Sharing:** Share successful error handling patterns
- **Case Studies:** Document complex error resolution cases
- **Cross-Team Learning:** Share knowledge across different teams

## 15. Appendices

### Appendix A: Error Code Reference
| Error Code | Category | Description | Resolution |
|------------|----------|-------------|------------|
| ERR_001 | Authentication | Invalid credentials provided | Verify username and password |
| ERR_002 | Authorization | Insufficient permissions | Contact administrator for access |
| ERR_003 | Validation | Required field missing | Provide all required information |
| ERR_004 | System | Database connection failed | Check database status and connectivity |
| ERR_005 | Integration | External service unavailable | Retry request or use cached data |

### Appendix B: Logging Configuration Examples
\`\`\`yaml
# Example Winston configuration
winston:
  level: info
  format: json
  transports:
    - type: file
      filename: error.log
      level: error
    - type: console
      level: debug
  exceptionHandlers:
    - type: file
      filename: exceptions.log
\`\`\`

### Appendix C: Monitoring Alert Templates
\`\`\`yaml
# Example Prometheus alert rules
groups:
  - name: error_handling
    rules:
      - alert: HighErrorRate
        expr: error_rate > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}%"
\`\`\`

### Appendix D: Recovery Procedures Checklist
- [ ] Identify error scope and impact
- [ ] Implement immediate containment
- [ ] Notify relevant stakeholders
- [ ] Execute recovery procedures
- [ ] Verify system restoration
- [ ] Document incident and lessons learned
- [ ] Implement preventive measures

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Development Team Contact:** [dev-team@example.com]
- **Version History:**
  - v1.0 - Initial comprehensive error handling guidelines
`;
  }
}
