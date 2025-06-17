import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Performance Test Plan document.
 * Provides a structured fallback template when AI generation fails.
 */
export class PerformanceTestPlanTemplate {
  generate(context: ProjectContext): string {
    const projectName = context.projectName || 'Unnamed Project';
    const currentDate = new Date().toLocaleDateString();

    return `# Performance Test Plan

**Project:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${currentDate}  
**Status:** Draft

## 1. Performance Test Overview

### 1.1 Purpose
This performance test plan defines the strategy, approach, and execution methodology for performance testing of the ${projectName} system. The plan ensures the system meets performance requirements and can handle expected user loads while maintaining acceptable response times and resource utilization.

### 1.2 Objectives
- Validate system performance meets specified requirements under various load conditions
- Identify performance bottlenecks and system capacity limits
- Verify system scalability and resource utilization efficiency
- Establish performance baselines for future releases
- Ensure system stability under sustained load conditions

### 1.3 Success Criteria
- **Response Time:** 95% of transactions complete within 2 seconds
- **Throughput:** System supports minimum 100 concurrent users
- **Resource Utilization:** CPU and memory usage remain below 80%
- **Error Rate:** Less than 1% error rate under normal load
- **Availability:** System maintains 99.9% uptime during testing

### 1.4 Scope and Limitations
**In Scope:**
- Web application performance testing
- Database performance validation
- API endpoint performance verification
- Load balancer and infrastructure performance
- Critical business process performance

**Out of Scope:**
- Third-party service performance (external dependencies)
- Network infrastructure outside application control
- Client-side performance optimization
- Mobile application performance (if not part of current release)

## 2. Performance Requirements

### 2.1 Response Time Requirements

#### Web Application Response Times
- **Page Load Time:** < 2 seconds for 95% of page requests
- **Form Submission:** < 1 second for simple forms, < 3 seconds for complex forms
- **Search Operations:** < 3 seconds for typical search queries
- **Report Generation:** < 10 seconds for standard reports
- **Dashboard Loading:** < 2 seconds for dashboard display

#### API Response Times
- **Simple API Calls:** < 500ms for CRUD operations
- **Complex API Calls:** < 2 seconds for data aggregation
- **Authentication:** < 1 second for login/logout operations
- **File Upload:** < 5 seconds for files up to 10MB
- **Data Export:** < 30 seconds for typical dataset exports

### 2.2 Throughput Requirements

#### Concurrent User Support
- **Normal Load:** 100 concurrent users with no performance degradation
- **Peak Load:** 200 concurrent users with acceptable performance
- **Maximum Load:** 300 concurrent users before system failure

#### Transaction Throughput
- **Minimum Throughput:** 50 transactions per second
- **Target Throughput:** 100 transactions per second
- **Peak Throughput:** 150 transactions per second

### 2.3 Resource Utilization Limits

#### Application Server Resources
- **CPU Utilization:** Maximum 80% under normal load
- **Memory Usage:** Maximum 80% of available memory
- **Disk I/O:** Maximum 70% disk utilization
- **Network Bandwidth:** Maximum 60% of available bandwidth

#### Database Server Resources
- **CPU Utilization:** Maximum 75% under normal load
- **Memory Usage:** Maximum 85% of available memory
- **Connection Pool:** Maximum 80% of available connections
- **Query Response Time:** 95% of queries complete within 100ms

### 2.4 Scalability Requirements
- **Horizontal Scaling:** Performance scales linearly with additional application instances
- **Database Scaling:** Read replicas improve read performance proportionally
- **Load Distribution:** Load balancer distributes traffic evenly across instances
- **Auto-scaling:** System automatically scales based on performance metrics

## 3. Performance Test Types and Strategy

### 3.1 Load Testing

#### Normal Load Testing
- **Objective:** Validate system performance under expected normal load
- **User Load:** 100 concurrent users
- **Duration:** 2 hours sustained load
- **Scenarios:** Typical user workflows and business processes
- **Success Criteria:** All response time requirements met

#### Expected Peak Load Testing
- **Objective:** Validate system performance under expected peak load
- **User Load:** 200 concurrent users
- **Duration:** 1 hour sustained load
- **Scenarios:** Heavy usage patterns and high-volume transactions
- **Success Criteria:** Performance degradation within acceptable limits

### 3.2 Stress Testing

#### Stress Point Identification
- **Objective:** Identify system breaking point and maximum capacity
- **User Load:** Gradually increase from 100 to 500 users
- **Duration:** Load increase every 15 minutes until system failure
- **Scenarios:** Standard user workflows under increasing load
- **Success Criteria:** System fails gracefully without data corruption

#### Recovery Testing
- **Objective:** Validate system recovery after stress conditions
- **Process:** Load system to failure point, then reduce load
- **Duration:** 30 minutes recovery observation
- **Scenarios:** System behavior during and after load reduction
- **Success Criteria:** System recovers to normal performance levels

### 3.3 Volume Testing

#### Large Dataset Testing
- **Objective:** Validate performance with large amounts of data
- **Data Volume:** 10x expected production data volume
- **Duration:** 4 hours with large dataset
- **Scenarios:** Data-intensive operations and queries
- **Success Criteria:** Performance degradation within 20% of baseline

#### Bulk Operation Testing
- **Objective:** Test system performance during bulk operations
- **Operations:** Bulk data import, export, and processing
- **Volume:** 100,000 record batch operations
- **Scenarios:** Large file uploads, batch processing, data migration
- **Success Criteria:** Operations complete within acceptable timeframes

### 3.4 Spike Testing

#### Sudden Load Increase
- **Objective:** Test system response to sudden traffic spikes
- **Load Pattern:** Instant increase from 50 to 300 users
- **Duration:** 15 minutes spike duration
- **Scenarios:** Flash sale simulation, breaking news traffic
- **Success Criteria:** System handles spike without crashes

#### Load Fluctuation Testing
- **Objective:** Test system stability with fluctuating load
- **Load Pattern:** Alternating high and low load every 30 minutes
- **Duration:** 4 hours total test duration
- **Scenarios:** Variable user activity throughout the day
- **Success Criteria:** Consistent performance despite load changes

### 3.5 Endurance Testing

#### Extended Load Testing
- **Objective:** Validate system stability over extended periods
- **User Load:** 150 concurrent users
- **Duration:** 24 hours continuous testing
- **Scenarios:** Realistic user patterns over extended time
- **Success Criteria:** No memory leaks or performance degradation

#### Weekend Load Simulation
- **Objective:** Test system behavior during low-activity periods
- **User Load:** 25 concurrent users
- **Duration:** 48 hours (weekend simulation)
- **Scenarios:** Minimal user activity with scheduled batch jobs
- **Success Criteria:** System maintains stability and responsiveness

## 4. Test Environment and Infrastructure

### 4.1 Test Environment Specifications

#### Hardware Configuration
- **Application Servers:** 3 servers, 8 CPU cores, 16GB RAM each
- **Database Server:** 1 server, 16 CPU cores, 32GB RAM, SSD storage
- **Load Balancer:** Hardware load balancer or software equivalent
- **Network:** Gigabit Ethernet connectivity between components

#### Software Configuration
- **Operating System:** Production-equivalent OS versions
- **Application Stack:** Identical to production configuration
- **Database:** Same version and configuration as production
- **Monitoring Tools:** APM tools for performance monitoring

### 4.2 Test Data Requirements

#### Data Volume and Characteristics
- **User Accounts:** 10,000 test user accounts with realistic profiles
- **Transaction Data:** 1 million historical transactions
- **Product Catalog:** 50,000 products with full metadata
- **Content Data:** Representative content matching production patterns

#### Data Management Strategy
- **Data Generation:** Automated scripts for test data creation
- **Data Refresh:** Daily refresh of test data from production subset
- **Data Privacy:** All sensitive data anonymized or synthetic
- **Data Cleanup:** Automated cleanup after test completion

### 4.3 Network and Infrastructure

#### Network Configuration
- **Bandwidth:** Minimum 100 Mbps connection to internet
- **Latency:** Sub-10ms latency between test components
- **Firewall:** Production-equivalent security configuration
- **DNS:** Local DNS resolution for faster response times

#### Monitoring and Instrumentation
- **Application Performance Monitoring:** New Relic, AppDynamics, or Dynatrace
- **System Monitoring:** CPU, memory, disk, and network monitoring
- **Database Monitoring:** Query performance and resource utilization
- **Log Aggregation:** Centralized logging for issue investigation

## 5. Performance Test Scenarios

### 5.1 User Journey Scenarios

#### Scenario 1: New User Registration and First Purchase
- **Steps:** 
  1. Navigate to registration page
  2. Complete registration form
  3. Email verification
  4. Login to system
  5. Browse product catalog
  6. Add items to cart
  7. Complete checkout process
- **Expected Users:** 20% of concurrent load
- **Duration:** 15 minutes average session
- **Success Criteria:** All steps complete within response time requirements

#### Scenario 2: Returning User Shopping Session
- **Steps:**
  1. Login to existing account
  2. Search for specific products
  3. Compare product features
  4. Add multiple items to cart
  5. Apply discount codes
  6. Complete purchase
- **Expected Users:** 60% of concurrent load
- **Duration:** 10 minutes average session
- **Success Criteria:** Purchase completion rate > 95%

#### Scenario 3: Administrative User Management
- **Steps:**
  1. Admin login
  2. Generate sales reports
  3. Manage user accounts
  4. Update product catalog
  5. Monitor system performance
- **Expected Users:** 5% of concurrent load
- **Duration:** 30 minutes average session
- **Success Criteria:** All admin functions responsive

### 5.2 Business Process Scenarios

#### High-Volume Transaction Processing
- **Process:** Peak hour transaction processing
- **Volume:** 200 transactions per minute
- **Duration:** 2 hours sustained processing
- **Validation:** All transactions processed accurately

#### Batch Job Performance
- **Process:** Daily report generation and data processing
- **Volume:** 1 million records processed
- **Duration:** Maximum 4 hours processing window
- **Validation:** All reports generated correctly

#### Real-time Data Synchronization
- **Process:** Live data updates and notifications
- **Volume:** 1000 updates per minute
- **Duration:** Continuous during business hours
- **Validation:** Real-time updates delivered within 1 second

## 6. Test Tools and Technologies

### 6.1 Performance Testing Tools

#### Primary Load Testing Tool: Apache JMeter
- **Capabilities:** HTTP/HTTPS protocol testing, distributed load generation
- **Configuration:** Master-slave setup for distributed testing
- **Scripts:** Parameterized test scripts for realistic user simulation
- **Reporting:** Real-time monitoring and comprehensive result reports

#### Alternative Tools
- **LoadRunner:** Enterprise-grade performance testing (if budget allows)
- **Gatling:** High-performance testing tool for advanced scenarios
- **Artillery:** Modern load testing toolkit for API testing
- **k6:** Developer-friendly performance testing tool

### 6.2 Monitoring and Analysis Tools

#### Application Performance Monitoring (APM)
- **New Relic:** Full-stack application monitoring
- **AppDynamics:** Business transaction monitoring
- **Dynatrace:** AI-powered performance monitoring
- **Custom Dashboards:** Real-time performance visualization

#### System Monitoring
- **Grafana + Prometheus:** Time-series monitoring and alerting
- **Datadog:** Cloud-scale monitoring and analytics
- **Nagios:** Infrastructure monitoring and alerting
- **ELK Stack:** Log analysis and performance investigation

### 6.3 Test Data and Environment Management

#### Test Data Generation
- **Faker Libraries:** Realistic test data generation
- **Database Scripts:** Automated test data population
- **API Mocking:** External service simulation for testing
- **Data Masking:** Production data anonymization tools

#### Environment Management
- **Docker/Kubernetes:** Containerized test environment deployment
- **Infrastructure as Code:** Terraform for environment provisioning
- **CI/CD Integration:** Automated performance testing in pipeline
- **Environment Monitoring:** Health checks and environment validation

## 7. Test Execution Strategy

### 7.1 Test Execution Schedule

#### Phase 1: Baseline Testing (Week 1)
- **Day 1-2:** Environment setup and validation
- **Day 3-4:** Baseline performance measurement
- **Day 5:** Initial load testing with small user base

#### Phase 2: Load Testing (Week 2)
- **Day 1-2:** Normal load testing scenarios
- **Day 3-4:** Peak load testing and validation
- **Day 5:** Load test result analysis and reporting

#### Phase 3: Stress and Volume Testing (Week 3)
- **Day 1-2:** Stress testing to identify breaking points
- **Day 3-4:** Volume testing with large datasets
- **Day 5:** Recovery testing and system validation

#### Phase 4: Specialized Testing (Week 4)
- **Day 1-2:** Spike testing and load fluctuation
- **Day 3-4:** Endurance testing setup and execution
- **Day 5:** Final validation and test closure

### 7.2 Resource Allocation

#### Performance Testing Team
- **Performance Test Lead:** Overall test strategy and coordination
- **Performance Test Engineers:** Test script development and execution
- **System Administrators:** Environment setup and monitoring
- **Developers:** Performance issue investigation and resolution

#### Infrastructure Resources
- **Test Environment:** Dedicated performance testing environment
- **Load Generation:** Multiple machines for distributed load generation
- **Monitoring Infrastructure:** APM tools and monitoring dashboards
- **Data Storage:** Adequate storage for test results and logs

### 7.3 Test Result Collection and Analysis

#### Metrics Collection
- **Response Time Metrics:** Min, max, average, percentile distributions
- **Throughput Metrics:** Transactions per second, requests per minute
- **Error Metrics:** Error rate, error distribution, error types
- **Resource Metrics:** CPU, memory, disk, network utilization

#### Data Analysis Process
- **Real-time Monitoring:** Live performance dashboard during testing
- **Post-test Analysis:** Detailed analysis of collected metrics
- **Trend Analysis:** Performance trends over time
- **Correlation Analysis:** Performance correlation with system resources

## 8. Performance Metrics and KPIs

### 8.1 Response Time Metrics

#### Web Application Metrics
- **Page Load Time:** Time from request to complete page render
- **Time to First Byte (TTFB):** Server response initiation time
- **Time to Interactive:** Time until page becomes fully interactive
- **Resource Load Time:** Individual asset loading times

#### API Performance Metrics
- **API Response Time:** Time from request to response completion
- **Database Query Time:** Individual query execution time
- **Service Processing Time:** Business logic processing duration
- **External Service Call Time:** Third-party service response time

### 8.2 Throughput and Capacity Metrics

#### System Throughput
- **Requests Per Second (RPS):** HTTP request processing rate
- **Transactions Per Second (TPS):** Business transaction completion rate
- **Data Transfer Rate:** Network data transmission rate
- **Batch Processing Rate:** Bulk operation processing speed

#### User Capacity Metrics
- **Concurrent User Capacity:** Maximum simultaneous users supported
- **Session Capacity:** Maximum active user sessions
- **Connection Pool Utilization:** Database connection usage efficiency
- **Resource Scaling Efficiency:** Performance improvement with additional resources

### 8.3 System Resource Metrics

#### Server Resource Utilization
- **CPU Utilization:** Processor usage percentage
- **Memory Usage:** RAM consumption and efficiency
- **Disk I/O:** Read/write operations and throughput
- **Network I/O:** Network traffic and bandwidth utilization

#### Application Metrics
- **Thread Pool Utilization:** Application thread usage
- **Memory Pool Usage:** Application memory allocation
- **Cache Hit Ratio:** Caching effectiveness measurement
- **Garbage Collection Impact:** GC frequency and duration

### 8.4 Error and Availability Metrics

#### Error Rate Metrics
- **HTTP Error Rate:** Percentage of failed HTTP requests
- **Transaction Error Rate:** Business transaction failure percentage
- **Timeout Rate:** Request timeout frequency
- **System Error Rate:** Application and system error occurrence

#### Availability Metrics
- **System Uptime:** Percentage of time system is available
- **Mean Time Between Failures (MTBF):** Average time between system failures
- **Mean Time to Recovery (MTTR):** Average time to restore service
- **Service Level Agreement (SLA) Compliance:** Meeting availability commitments

## 9. Success Criteria and Acceptance Thresholds

### 9.1 Performance Benchmarks

#### Response Time Benchmarks
- **Excellent:** < 1 second response time
- **Good:** 1-2 seconds response time
- **Acceptable:** 2-3 seconds response time
- **Poor:** > 3 seconds response time

#### Throughput Benchmarks
- **Minimum Acceptable:** 50 TPS with 100 concurrent users
- **Target Performance:** 100 TPS with 200 concurrent users
- **Optimal Performance:** 150 TPS with 300 concurrent users

### 9.2 Pass/Fail Criteria

#### Critical Performance Criteria (Must Pass)
- All response time requirements met under normal load
- System supports minimum concurrent user capacity
- Error rate remains below 1% under normal conditions
- No data corruption or loss during testing

#### Important Performance Criteria (Should Pass)
- Peak load performance within acceptable degradation limits
- Resource utilization remains within defined thresholds
- System recovers properly after stress conditions
- Performance scales appropriately with additional resources

### 9.3 Business Impact Assessment

#### Performance Impact on Business Operations
- **Customer Experience:** Response time impact on user satisfaction
- **Revenue Impact:** Performance effect on conversion rates
- **Operational Efficiency:** System performance impact on business processes
- **Competitive Advantage:** Performance comparison with industry standards

#### Risk Assessment
- **High Risk:** Performance failures that impact critical business functions
- **Medium Risk:** Performance issues that affect user experience
- **Low Risk:** Minor performance degradation within acceptable limits

## 10. Risk Management and Contingency Planning

### 10.1 Performance Risks

#### Technical Risks
- **Database Bottlenecks:** Poor query performance or connection limits
- **Application Bottlenecks:** Inefficient code or resource contention
- **Infrastructure Limitations:** Hardware or network capacity constraints
- **Third-party Dependencies:** External service performance issues

#### Process Risks
- **Test Environment Differences:** Environment not representative of production
- **Test Data Issues:** Insufficient or unrealistic test data
- **Resource Availability:** Testing resources unavailable when needed
- **Timeline Constraints:** Insufficient time for comprehensive testing

### 10.2 Risk Mitigation Strategies

#### Technical Mitigation
- **Database Optimization:** Query optimization and indexing strategies
- **Application Tuning:** Code optimization and caching implementation
- **Infrastructure Scaling:** Additional resources and load balancing
- **Monitoring Enhancement:** Improved observability and alerting

#### Process Mitigation
- **Environment Validation:** Thorough environment setup verification
- **Test Data Management:** Automated test data generation and management
- **Resource Planning:** Advance resource allocation and backup plans
- **Timeline Management:** Realistic scheduling with buffer time

### 10.3 Contingency Plans

#### Performance Issue Resolution
- **Issue Escalation:** Clear escalation path for performance problems
- **Expert Consultation:** Access to performance specialists and vendors
- **Alternative Solutions:** Backup approaches for critical performance issues
- **Release Decision Process:** Go/no-go criteria based on performance results

#### Emergency Procedures
- **Critical Issue Response:** Immediate response for severe performance problems
- **Communication Protocol:** Stakeholder notification and status updates
- **Rollback Procedures:** Plans for reverting changes if performance degrades
- **Business Continuity:** Ensuring business operations continue during testing

---

**Document Control:**
- **Author:** Performance Test Lead
- **Reviewers:** QA Manager, System Architect, Development Lead
- **Approval:** Project Manager, Technical Director
- **Next Review Date:** [Date + 2 weeks]
- **Distribution:** Performance testing team, development team, stakeholders

**Revision History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | ${currentDate} | Performance Test Lead | Initial performance test plan |

**Test Plan Summary:**
- **Total Test Scenarios:** 15
- **Test Duration:** 4 weeks
- **Performance Metrics:** 25 KPIs
- **Test Tools:** 8 different tools
- **Resource Requirements:** 12 infrastructure components
- **Success Criteria:** 20 performance benchmarks

`;
  }
}
