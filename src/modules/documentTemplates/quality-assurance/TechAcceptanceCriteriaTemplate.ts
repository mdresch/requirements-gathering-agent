import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Technical Acceptance Criteria document.
 * Provides a structured fallback template when AI generation fails.
 */
export class TechAcceptanceCriteriaTemplate {
  generate(context: ProjectContext): string {
    const projectName = context.projectName || 'Unnamed Project';
    const currentDate = new Date().toLocaleDateString();

    return `# Technical Acceptance Criteria

**Project:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${currentDate}  
**Status:** Draft

## 1. Overview

### 1.1 Purpose
This document defines the technical acceptance criteria for the ${projectName} project. These criteria establish the specific, measurable, and testable requirements that must be satisfied for the system to be considered technically acceptable for deployment and operation.

### 1.2 Scope
The technical acceptance criteria cover:
- Functional technical requirements and system behavior
- Performance, scalability, and resource utilization requirements
- Security, authentication, and data protection requirements
- Reliability, availability, and error handling requirements
- Compatibility, integration, and interoperability requirements
- Quality, maintainability, and operational requirements

### 1.3 Acceptance Framework
Each acceptance criterion includes:
- **Criterion ID:** Unique identifier for traceability
- **Description:** Clear statement of the requirement
- **Success Criteria:** Specific measurable conditions for acceptance
- **Validation Method:** How the criterion will be verified
- **Test Scenarios:** Specific test cases that validate the criterion
- **Priority:** Critical, High, Medium, or Low importance

## 2. Functional Technical Acceptance Criteria

### TAC_FUNC_001: API Endpoint Functionality
- **Description:** All API endpoints must function correctly according to specifications
- **Success Criteria:**
  - All defined API endpoints respond with correct HTTP status codes
  - Request and response formats conform to API specification
  - All required fields are validated and processed correctly
  - Error responses include meaningful error messages and codes
- **Validation Method:** Automated API testing using Postman/REST Assured
- **Test Scenarios:**
  - Valid request with all required fields returns success response
  - Invalid request returns appropriate error response with details
  - Missing required fields trigger validation errors
- **Priority:** Critical

### TAC_FUNC_002: Data Processing Accuracy
- **Description:** All data processing operations must maintain accuracy and integrity
- **Success Criteria:**
  - Data validation rules are correctly implemented and enforced
  - Data transformations produce accurate results
  - Calculated fields and derived values are mathematically correct
  - Data storage and retrieval operations maintain data integrity
- **Validation Method:** Unit testing and integration testing with test datasets
- **Test Scenarios:**
  - Input data validation correctly accepts valid data and rejects invalid data
  - Complex calculations produce expected results within acceptable tolerance
  - Data transformations maintain referential integrity
- **Priority:** Critical

### TAC_FUNC_003: Business Logic Implementation
- **Description:** All business rules and logic must be correctly implemented
- **Success Criteria:**
  - Business rules are enforced consistently across all interfaces
  - Workflow logic follows defined business processes
  - Decision trees and conditional logic produce correct outcomes
  - State transitions follow business requirements
- **Validation Method:** Business process testing and scenario validation
- **Test Scenarios:**
  - Different user roles experience appropriate business rule enforcement
  - Complex business scenarios produce expected outcomes
  - Edge cases in business logic are handled correctly
- **Priority:** Critical

### TAC_FUNC_004: Integration Point Functionality
- **Description:** All system integration points must function reliably
- **Success Criteria:**
  - External system connections are established and maintained
  - Data exchange protocols function correctly
  - Error handling for integration failures is implemented
  - Integration monitoring and alerting is functional
- **Validation Method:** Integration testing with external systems
- **Test Scenarios:**
  - Successful data exchange with all integrated systems
  - Graceful handling of external system unavailability
  - Correct error reporting and recovery mechanisms
- **Priority:** High

### TAC_FUNC_005: User Interface Technical Requirements
- **Description:** User interface must meet technical specifications
- **Success Criteria:**
  - UI components render correctly across supported browsers
  - Form validations work client-side and server-side
  - User interactions trigger appropriate system responses
  - Accessibility standards (WCAG 2.1 AA) are met
- **Validation Method:** Cross-browser testing and accessibility scanning
- **Test Scenarios:**
  - UI functions correctly on Chrome, Firefox, Safari, and Edge
  - Screen readers can navigate and interact with all UI elements
  - Keyboard navigation works for all interactive elements
- **Priority:** High

## 3. Performance Acceptance Criteria

### TAC_PERF_001: Response Time Requirements
- **Description:** System response times must meet performance specifications
- **Success Criteria:**
  - Page load times are under 2 seconds for 95% of requests
  - API response times are under 500ms for simple operations
  - Complex operations complete within 5 seconds
  - Database queries execute within acceptable time limits
- **Validation Method:** Performance testing using JMeter or similar tools
- **Test Scenarios:**
  - Load testing with typical user volumes
  - Stress testing with peak load conditions
  - Database performance testing with representative data volumes
- **Priority:** High

### TAC_PERF_002: Throughput and Concurrency
- **Description:** System must handle required throughput and concurrent users
- **Success Criteria:**
  - System supports at least 100 concurrent users without degradation
  - Transaction throughput meets minimum 50 transactions per second
  - System maintains performance under sustained load
  - Resource utilization remains within acceptable limits
- **Validation Method:** Load testing with gradually increasing user load
- **Test Scenarios:**
  - Concurrent user testing from 10 to 200 users
  - Sustained load testing for extended periods
  - Peak load simulation based on expected usage patterns
- **Priority:** High

### TAC_PERF_003: Resource Utilization
- **Description:** System resource usage must remain within defined limits
- **Success Criteria:**
  - CPU utilization stays below 80% under normal load
  - Memory usage does not exceed 80% of available memory
  - Disk I/O operations complete within performance thresholds
  - Network bandwidth usage is optimized and within limits
- **Validation Method:** System monitoring during performance testing
- **Test Scenarios:**
  - Resource monitoring during normal operations
  - Resource stress testing to identify limits
  - Memory leak detection over extended runtime
- **Priority:** Medium

### TAC_PERF_004: Scalability Requirements
- **Description:** System must demonstrate scalability characteristics
- **Success Criteria:**
  - Horizontal scaling increases capacity proportionally
  - Performance degrades gracefully as load increases
  - Auto-scaling mechanisms function correctly
  - Database scaling does not compromise data integrity
- **Validation Method:** Scalability testing with varying system configurations
- **Test Scenarios:**
  - Testing with different numbers of application instances
  - Database connection pool scaling validation
  - Load balancer effectiveness verification
- **Priority:** Medium

## 4. Security Acceptance Criteria

### TAC_SEC_001: Authentication Security
- **Description:** User authentication must meet security standards
- **Success Criteria:**
  - Password complexity requirements are enforced
  - Account lockout occurs after 5 failed login attempts
  - Session timeout is implemented and configurable
  - Multi-factor authentication is available for privileged accounts
- **Validation Method:** Security testing and penetration testing
- **Test Scenarios:**
  - Password policy enforcement testing
  - Brute force attack protection validation
  - Session management security testing
- **Priority:** Critical

### TAC_SEC_002: Authorization and Access Control
- **Description:** User authorization must be properly implemented
- **Success Criteria:**
  - Role-based access control is correctly enforced
  - Users can only access authorized resources and functions
  - Privilege escalation attempts are blocked
  - API endpoints are protected with appropriate authorization
- **Validation Method:** Authorization testing with different user roles
- **Test Scenarios:**
  - Testing access control with various user role combinations
  - Attempting unauthorized access to restricted resources
  - API security testing for authentication and authorization
- **Priority:** Critical

### TAC_SEC_003: Data Protection
- **Description:** Sensitive data must be properly protected
- **Success Criteria:**
  - Data is encrypted in transit using TLS 1.2 or higher
  - Sensitive data is encrypted at rest in the database
  - Personal identifiable information (PII) is masked in logs
  - Data backup and recovery processes maintain security
- **Validation Method:** Security scanning and data protection audit
- **Test Scenarios:**
  - Encryption verification for data transmission
  - Database encryption validation
  - Log analysis for sensitive data exposure
- **Priority:** Critical

### TAC_SEC_004: Input Validation and Sanitization
- **Description:** All user inputs must be validated and sanitized
- **Success Criteria:**
  - SQL injection attacks are prevented
  - Cross-site scripting (XSS) attacks are blocked
  - Input validation is implemented on both client and server side
  - File upload security measures are in place
- **Validation Method:** Security testing with malicious input patterns
- **Test Scenarios:**
  - SQL injection attack simulation
  - XSS attack prevention testing
  - File upload security validation
- **Priority:** Critical

## 5. Reliability and Availability Criteria

### TAC_REL_001: System Uptime Requirements
- **Description:** System must meet availability requirements
- **Success Criteria:**
  - System achieves 99.9% uptime during business hours
  - Planned maintenance windows do not exceed 4 hours per month
  - Unplanned downtime is limited to less than 1 hour per month
  - System recovery after failure occurs within 15 minutes
- **Validation Method:** Uptime monitoring and availability testing
- **Test Scenarios:**
  - Continuous uptime monitoring over 30-day periods
  - Planned maintenance window testing
  - Disaster recovery testing and timing
- **Priority:** High

### TAC_REL_002: Error Handling and Recovery
- **Description:** System must handle errors gracefully and recover appropriately
- **Success Criteria:**
  - All errors are caught and handled appropriately
  - User-friendly error messages are displayed to users
  - System logs contain detailed error information for debugging
  - Automatic recovery mechanisms function correctly
- **Validation Method:** Error injection testing and fault simulation
- **Test Scenarios:**
  - Network interruption simulation and recovery testing
  - Database connection failure and recovery testing
  - External service unavailability handling
- **Priority:** High

### TAC_REL_003: Data Integrity and Consistency
- **Description:** Data integrity must be maintained under all conditions
- **Success Criteria:**
  - Database transactions maintain ACID properties
  - Data corruption is detected and prevented
  - Backup and restore operations maintain data integrity
  - Concurrent data operations maintain consistency
- **Validation Method:** Data integrity testing and corruption simulation
- **Test Scenarios:**
  - Concurrent transaction testing
  - Backup and restore validation testing
  - Data corruption detection testing
- **Priority:** Critical

### TAC_REL_004: Fault Tolerance
- **Description:** System must continue operating despite component failures
- **Success Criteria:**
  - Single points of failure are eliminated or mitigated
  - System degrades gracefully during partial failures
  - Redundant components take over seamlessly
  - Failed components can be restored without system downtime
- **Validation Method:** Failure simulation and resilience testing
- **Test Scenarios:**
  - Component failure simulation testing
  - Load balancer failover testing
  - Database replica failover validation
- **Priority:** Medium

## 6. Compatibility and Integration Criteria

### TAC_COMP_001: Browser and Platform Compatibility
- **Description:** System must function correctly across supported platforms
- **Success Criteria:**
  - Full functionality on Chrome, Firefox, Safari, and Edge browsers
  - Responsive design works on desktop, tablet, and mobile devices
  - Operating system compatibility for desktop applications
  - Mobile app compatibility across iOS and Android versions
- **Validation Method:** Cross-platform and cross-browser testing
- **Test Scenarios:**
  - Comprehensive testing on all supported browser versions
  - Responsive design testing on various screen sizes
  - Mobile device testing on different operating system versions
- **Priority:** High

### TAC_COMP_002: API Version Compatibility
- **Description:** API versioning must maintain backward compatibility
- **Success Criteria:**
  - Previous API versions continue to function correctly
  - New API versions maintain compatibility with existing clients
  - API deprecation follows defined timeline and communication
  - Version negotiation works correctly
- **Validation Method:** API compatibility testing with different client versions
- **Test Scenarios:**
  - Testing older client applications with new API versions
  - API version negotiation validation
  - Deprecated API functionality testing
- **Priority:** Medium

### TAC_COMP_003: Third-Party Integration Compatibility
- **Description:** Third-party integrations must function reliably
- **Success Criteria:**
  - Integration with all required external services functions correctly
  - API changes in third-party services are handled gracefully
  - Fallback mechanisms work when third-party services are unavailable
  - Integration monitoring detects and reports issues
- **Validation Method:** Third-party integration testing and monitoring
- **Test Scenarios:**
  - End-to-end integration testing with all external services
  - Third-party service unavailability simulation
  - Integration error handling and recovery testing
- **Priority:** Medium

## 7. Quality and Maintainability Criteria

### TAC_QUAL_001: Code Quality Standards
- **Description:** Code must meet defined quality and maintainability standards
- **Success Criteria:**
  - Code coverage by unit tests is at least 80%
  - Cyclomatic complexity stays within acceptable limits
  - Code follows established coding standards and conventions
  - Technical debt is managed and kept within acceptable levels
- **Validation Method:** Static code analysis and code review
- **Test Scenarios:**
  - Automated code quality analysis using SonarQube or similar
  - Code review checklist validation
  - Technical debt assessment and tracking
- **Priority:** Medium

### TAC_QUAL_002: Documentation Completeness
- **Description:** Technical documentation must be complete and accurate
- **Success Criteria:**
  - API documentation is complete and up-to-date
  - System architecture documentation accurately reflects implementation
  - Installation and configuration guides are accurate and complete
  - Code comments explain complex business logic and algorithms
- **Validation Method:** Documentation review and validation
- **Test Scenarios:**
  - Following installation guides on clean environments
  - API documentation accuracy validation
  - Architecture documentation review against implementation
- **Priority:** Medium

### TAC_QUAL_003: Monitoring and Observability
- **Description:** System must provide adequate monitoring and observability
- **Success Criteria:**
  - Application logs provide sufficient detail for troubleshooting
  - Performance metrics are collected and available for analysis
  - Health check endpoints are implemented and functional
  - Alerting mechanisms notify of critical issues
- **Validation Method:** Monitoring and alerting system validation
- **Test Scenarios:**
  - Log analysis for completeness and usefulness
  - Performance metrics collection validation
  - Alert trigger testing for various scenarios
- **Priority:** Medium

### TAC_QUAL_004: Configuration Management
- **Description:** System configuration must be manageable and consistent
- **Success Criteria:**
  - Environment-specific configurations are externalized
  - Configuration changes can be applied without code changes
  - Configuration validation prevents invalid settings
  - Configuration backup and recovery procedures are implemented
- **Validation Method:** Configuration management testing
- **Test Scenarios:**
  - Environment promotion testing with different configurations
  - Configuration validation and error handling testing
  - Configuration backup and restore testing
- **Priority:** Low

## 8. Validation and Testing Framework

### 8.1 Validation Methods Summary

#### Automated Testing
- **Unit Tests:** Individual component functionality validation
- **Integration Tests:** Component interaction and data flow validation
- **API Tests:** Endpoint functionality and contract validation
- **Performance Tests:** Load, stress, and scalability validation
- **Security Tests:** Vulnerability and penetration testing

#### Manual Testing
- **Usability Testing:** User experience and interface validation
- **Exploratory Testing:** Ad-hoc testing for edge cases and issues
- **Acceptance Testing:** Business stakeholder validation
- **Compatibility Testing:** Cross-platform and cross-browser validation

### 8.2 Test Data Requirements
- **Functional Test Data:** Representative data covering all business scenarios
- **Performance Test Data:** Large datasets for scalability and performance testing
- **Security Test Data:** Malicious input patterns for security validation
- **Integration Test Data:** Data for end-to-end workflow validation

### 8.3 Test Environment Requirements
- **Development Environment:** Unit testing and initial integration testing
- **Test Environment:** System testing and integration testing
- **Staging Environment:** Performance testing and user acceptance testing
- **Production-like Environment:** Final validation before production deployment

### 8.4 Acceptance Tracking
- **Criteria Status:** Track completion status of each acceptance criterion
- **Test Results:** Document test execution results and evidence
- **Issue Resolution:** Track and resolve issues preventing criterion acceptance
- **Sign-off Process:** Formal acceptance sign-off by stakeholders

---

**Document Control:**
- **Author:** Technical Lead / Solution Architect
- **Reviewers:** Development Team, QA Team, Business Analyst
- **Approval:** Project Manager, Technical Director
- **Next Review Date:** [Date + 2 weeks]
- **Distribution:** All project team members, stakeholders

**Revision History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | ${currentDate} | Technical Lead | Initial technical acceptance criteria |

**Acceptance Criteria Summary:**
- **Total Criteria:** 20
- **Critical Priority:** 8
- **High Priority:** 8
- **Medium Priority:** 3
- **Low Priority:** 1
- **Automated Validation:** 15 criteria (75%)
- **Manual Validation:** 5 criteria (25%)

`;
  }
}
