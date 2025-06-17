import type { ProjectContext } from '../../ai/types';

/**
 * Integration Design Template generates comprehensive integration design documentation
 * following enterprise integration patterns and best practices.
 */
export class IntegrationdesignTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Integration Design
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Integration System';
    
    return `# Integration Design

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}  
**Integration Scope:** [Enterprise/Application/Data Integration]

## Executive Summary

${projectDescription}

This document provides a comprehensive integration design for ${projectName}, including integration patterns, system interfaces, data flows, error handling strategies, and monitoring requirements for seamless system interoperability.

## 1. Integration Overview

### 1.1 Integration Purpose
- **Business Objective:** [Define the business goals driving integration needs]
- **Integration Scope:** [Systems, applications, and data sources involved]
- **Value Proposition:** [Benefits of integration implementation]
- **Success Criteria:** [Measurable outcomes and KPIs]

### 1.2 Integration Architecture Principles
- **Loose Coupling:** Minimize dependencies between systems
- **High Cohesion:** Related functionality grouped together
- **Stateless Design:** Avoid maintaining state across interactions
- **Idempotency:** Operations can be safely retried
- **Scalability:** Support for increasing integration volumes
- **Reliability:** Fault tolerance and error recovery

### 1.3 Integration Stakeholders
- **Business Users:** End users benefiting from integrated processes
- **System Owners:** Responsible for individual system maintenance
- **Integration Team:** Implementation and maintenance of integration
- **Operations Team:** Monitoring and support of integration platform
- **Security Team:** Integration security and compliance oversight

### 1.4 Integration Standards and Frameworks
- **Enterprise Integration Patterns:** Message routing, transformation, endpoints
- **Service-Oriented Architecture (SOA):** Service design principles
- **Microservices Architecture:** Distributed system integration
- **Event-Driven Architecture:** Asynchronous event processing
- **API-First Design:** API-centric integration approach

## 2. Integration Patterns

### 2.1 Messaging Patterns

#### 2.1.1 Point-to-Point
- **Usage:** Direct communication between two systems
- **Implementation:** Queue-based messaging
- **Advantages:** Simple, reliable, guaranteed delivery
- **Disadvantages:** Tight coupling, limited scalability

#### 2.1.2 Publish-Subscribe
- **Usage:** One-to-many message distribution
- **Implementation:** Topic-based messaging
- **Advantages:** Loose coupling, scalable, flexible
- **Disadvantages:** Complex error handling, message ordering

#### 2.1.3 Request-Reply
- **Usage:** Synchronous communication requiring response
- **Implementation:** HTTP REST/SOAP, RPC
- **Advantages:** Simple programming model, immediate feedback
- **Disadvantages:** Blocking, tight coupling, timeout issues

#### 2.1.4 Message Routing
- **Content-Based Router:** Route based on message content
- **Recipient List:** Send to multiple recipients
- **Splitter/Aggregator:** Break down and recombine messages
- **Message Filter:** Filter messages based on criteria

### 2.2 Service Integration Patterns

#### 2.2.1 API Gateway Pattern
- **Purpose:** Single entry point for all client requests
- **Responsibilities:** Authentication, rate limiting, request routing
- **Implementation:** Kong, AWS API Gateway, Azure API Management
- **Benefits:** Centralized management, security, monitoring

#### 2.2.2 Service Mesh Pattern
- **Purpose:** Infrastructure layer for service-to-service communication
- **Implementation:** Istio, Linkerd, Consul Connect
- **Features:** Traffic management, security, observability
- **Benefits:** Decoupled from application code, consistent policies

#### 2.2.3 Backend for Frontend (BFF)
- **Purpose:** Customized backends for different frontend applications
- **Implementation:** Separate APIs for web, mobile, partners
- **Benefits:** Optimized for specific clients, reduced over-fetching
- **Considerations:** Code duplication, maintenance overhead

### 2.3 Data Integration Patterns

#### 2.3.1 Extract, Transform, Load (ETL)
- **Usage:** Batch data integration and warehousing
- **Process:** Extract from source, transform data, load to target
- **Tools:** Apache Airflow, Talend, Informatica
- **Benefits:** Data quality, historical analysis, reporting

#### 2.3.2 Change Data Capture (CDC)
- **Usage:** Real-time data synchronization
- **Implementation:** Database triggers, log-based capture
- **Tools:** Debezium, AWS DMS, Confluent
- **Benefits:** Near real-time updates, minimal impact on source

#### 2.3.3 Data Virtualization
- **Usage:** Unified view without moving data
- **Implementation:** Virtual data layer, federated queries
- **Benefits:** Real-time access, reduced storage, agility
- **Challenges:** Performance, complex queries, governance

## 3. System Interfaces

### 3.1 Interface Catalog

#### 3.1.1 Customer Management System (CMS)
- **Interface Type:** REST API
- **Direction:** Bidirectional
- **Data Formats:** JSON
- **Authentication:** OAuth 2.0
- **Base URL:** \`https://cms.example.com/api/v1\`
- **Key Endpoints:**
  - \`GET /customers\` - Retrieve customer list
  - \`POST /customers\` - Create new customer
  - \`PUT /customers/{id}\` - Update customer
  - \`DELETE /customers/{id}\` - Deactivate customer

#### 3.1.2 Order Management System (OMS)
- **Interface Type:** GraphQL API
- **Direction:** Inbound
- **Data Formats:** GraphQL schema
- **Authentication:** API Key
- **Base URL:** \`https://oms.example.com/graphql\`
- **Key Operations:**
  - \`createOrder\` - Create new order
  - \`updateOrderStatus\` - Update order status
  - \`getOrderDetails\` - Retrieve order information

#### 3.1.3 Payment Processing System
- **Interface Type:** SOAP Web Service
- **Direction:** Outbound
- **Data Formats:** XML
- **Authentication:** WS-Security
- **WSDL URL:** \`https://payments.example.com/service?wsdl\`
- **Key Operations:**
  - \`ProcessPayment\` - Process payment transaction
  - \`RefundPayment\` - Process refund
  - \`CheckPaymentStatus\` - Verify payment status

#### 3.1.4 Inventory Management System
- **Interface Type:** Message Queue
- **Direction:** Bidirectional
- **Message Broker:** Apache Kafka
- **Topics:**
  - \`inventory.updates\` - Stock level changes
  - \`inventory.reservations\` - Product reservations
  - \`inventory.releases\` - Reservation releases

### 3.2 Interface Standards
- **API Versioning:** Semantic versioning (v1.0.0)
- **Error Handling:** Standardized error codes and messages
- **Rate Limiting:** Configurable limits per client
- **Request/Response Logging:** Comprehensive audit trail
- **Documentation:** OpenAPI/Swagger specifications

### 3.3 Interface Governance
- **API Design Guidelines:** Consistent naming, structure, behavior
- **Change Management:** Version compatibility, deprecation policies
- **Testing Requirements:** Contract testing, integration testing
- **Monitoring Standards:** Health checks, performance metrics
- **Security Requirements:** Authentication, authorization, encryption

## 4. Data Flow Design

### 4.1 High-Level Data Flow
\`\`\`
[Web App] → [API Gateway] → [Service A] → [Message Queue] → [Service B] → [Database]
    ↓              ↓             ↓              ↓             ↓           ↓
[Mobile App]   [Auth Service] [Transform]  [Dead Letter]  [Validate]  [Audit Log]
\`\`\`

### 4.2 Data Flow Scenarios

#### 4.2.1 Customer Registration Flow
1. **Input:** Customer registration data from web/mobile app
2. **Validation:** Data validation and business rule checking
3. **Transformation:** Format conversion and data enrichment
4. **Storage:** Customer data stored in CMS database
5. **Notification:** Welcome email sent via notification service
6. **Audit:** Registration event logged for compliance

#### 4.2.2 Order Processing Flow
1. **Order Creation:** Order details received from e-commerce platform
2. **Inventory Check:** Real-time inventory availability verification
3. **Payment Processing:** Payment authorization through payment gateway
4. **Order Confirmation:** Order status updated and confirmation sent
5. **Fulfillment Trigger:** Warehouse management system notified
6. **Tracking Update:** Shipping tracking information synchronized

#### 4.2.3 Data Synchronization Flow
1. **Change Detection:** Source system changes detected via CDC
2. **Message Publishing:** Change events published to message broker
3. **Event Processing:** Downstream systems consume relevant events
4. **Data Transformation:** Event data transformed to target format
5. **Target Update:** Target systems updated with transformed data
6. **Reconciliation:** Periodic data consistency verification

### 4.3 Data Transformation Rules
- **Field Mapping:** Source field to target field relationships
- **Data Type Conversion:** String to number, date format changes
- **Business Logic:** Calculated fields, conditional transformations
- **Data Enrichment:** Lookup values, reference data injection
- **Data Cleansing:** Validation, normalization, standardization

### 4.4 Data Quality Management
- **Validation Rules:** Data format, range, and business rule validation
- **Error Handling:** Invalid data detection and routing
- **Data Lineage:** Track data origin and transformation history
- **Quality Metrics:** Data completeness, accuracy, consistency measures
- **Remediation Process:** Data quality issue resolution procedures

## 5. Error Handling

### 5.1 Error Categories
- **Transient Errors:** Temporary network, service, or resource issues
- **Business Logic Errors:** Data validation, business rule violations
- **System Errors:** Application crashes, database connection failures
- **Security Errors:** Authentication, authorization, access violations
- **Configuration Errors:** Missing configuration, invalid settings

### 5.2 Error Handling Strategies

#### 5.2.1 Retry Mechanisms
- **Exponential Backoff:** Increasing delay between retries
- **Circuit Breaker:** Prevent cascade failures
- **Retry Limits:** Maximum retry attempts before failure
- **Jitter:** Random delay to prevent thundering herd

#### 5.2.2 Dead Letter Queues
- **Purpose:** Store messages that cannot be processed
- **Retention:** Configurable message retention period
- **Monitoring:** Alert on dead letter queue accumulation
- **Reprocessing:** Manual or automated message reprocessing

#### 5.2.3 Compensation Patterns
- **Saga Pattern:** Distributed transaction management
- **Compensating Actions:** Undo operations for failed transactions
- **Timeout Handling:** Process timeout and cleanup procedures
- **Partial Failure Recovery:** Handle partial success scenarios

### 5.3 Error Response Format
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid customer data provided",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "Must be valid email format"
    },
    "timestamp": "2025-06-17T10:30:00Z",
    "request_id": "req_123456789",
    "retry_after": 30
  }
}
\`\`\`

### 5.4 Error Monitoring and Alerting
- **Error Rate Monitoring:** Track error rates per interface
- **Error Classification:** Categorize errors by type and severity
- **Alert Thresholds:** Configurable alerting rules
- **Error Dashboards:** Real-time error visualization
- **Root Cause Analysis:** Error correlation and investigation tools

## 6. Integration Points

### 6.1 Internal System Integrations

#### 6.1.1 Database Integration
- **Direct Database Access:** For legacy systems without APIs
- **Database Triggers:** Real-time change notifications
- **Stored Procedures:** Complex business logic execution
- **Views and Materialized Views:** Data abstraction and performance

#### 6.1.2 File-Based Integration
- **File Transfer Protocols:** SFTP, FTPS, AS2
- **File Formats:** CSV, XML, JSON, EDI, fixed-width
- **File Processing:** Validation, transformation, archival
- **Batch Scheduling:** Automated file processing workflows

#### 6.1.3 Message Queue Integration
- **Message Brokers:** Apache Kafka, RabbitMQ, AWS SQS
- **Topic Management:** Topic creation, partitioning, retention
- **Consumer Groups:** Scalable message consumption
- **Message Serialization:** Avro, JSON, Protocol Buffers

### 6.2 External System Integrations

#### 6.2.1 Third-Party APIs
- **Partner APIs:** Business partner system integration
- **SaaS Applications:** Cloud service integrations
- **Public APIs:** External data sources and services
- **Legacy System Modernization:** Wrapper services for legacy systems

#### 6.2.2 Cloud Service Integrations
- **Infrastructure Services:** AWS, Azure, Google Cloud Platform
- **Platform Services:** Database, messaging, storage services
- **Software Services:** CRM, ERP, analytics platforms
- **Hybrid Cloud:** On-premises and cloud system integration

### 6.3 Integration Dependencies
- **Runtime Dependencies:** Required services for operation
- **Data Dependencies:** Prerequisite data for processing
- **Security Dependencies:** Authentication and authorization services
- **Infrastructure Dependencies:** Network, hardware, platform requirements

## 7. Message Formats

### 7.1 Message Structure Standards
- **Message Headers:** Metadata for routing and processing
- **Message Body:** Actual data payload
- **Message Correlation:** Request-response correlation IDs
- **Message Versioning:** Schema evolution support

### 7.2 Data Serialization Formats

#### 7.2.1 JSON (JavaScript Object Notation)
- **Usage:** REST APIs, web services, configuration
- **Advantages:** Human-readable, widespread support, lightweight
- **Schema:** JSON Schema for validation
- **Example:**
\`\`\`json
{
  "customer_id": "12345",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "created_at": "2025-06-17T10:30:00Z"
}
\`\`\`

#### 7.2.2 XML (eXtensible Markup Language)
- **Usage:** SOAP services, enterprise systems, configuration
- **Advantages:** Rich metadata, namespace support, validation
- **Schema:** XSD (XML Schema Definition)
- **Example:**
\`\`\`xml
<Customer>
  <CustomerID>12345</CustomerID>
  <Name>John Doe</Name>
  <Email>john.doe@example.com</Email>
  <CreatedAt>2025-06-17T10:30:00Z</CreatedAt>
</Customer>
\`\`\`

#### 7.2.3 Apache Avro
- **Usage:** High-throughput data streaming, schema evolution
- **Advantages:** Compact binary format, schema evolution support
- **Schema Registry:** Centralized schema management
- **Evolution:** Forward and backward compatibility

#### 7.2.4 Protocol Buffers
- **Usage:** gRPC services, high-performance applications
- **Advantages:** Compact, fast serialization, language neutral
- **Schema Definition:** .proto files with strong typing
- **Version Management:** Field numbering for compatibility

### 7.3 Message Routing Headers
- **Correlation ID:** Link related messages across systems
- **Message Type:** Indicate message purpose and structure
- **Source System:** Identify message originator
- **Destination:** Target system or routing information
- **Timestamp:** Message creation and processing times
- **Version:** Message format version information

### 7.4 Message Validation
- **Schema Validation:** Ensure message conforms to expected structure
- **Business Rule Validation:** Verify business logic constraints
- **Data Type Validation:** Check field types and formats
- **Required Field Validation:** Ensure mandatory fields present
- **Referential Integrity:** Validate foreign key relationships

## 8. Integration Security

### 8.1 Authentication Methods

#### 8.1.1 API Key Authentication
- **Usage:** Simple service-to-service authentication
- **Implementation:** HTTP header or query parameter
- **Rotation:** Regular key rotation procedures
- **Scope:** Limited access scope per API key

#### 8.1.2 OAuth 2.0
- **Usage:** Delegated authorization for user-centric access
- **Flow Types:** Authorization code, client credentials, implicit
- **Token Management:** Access tokens, refresh tokens, expiration
- **Scope Control:** Granular permission management

#### 8.1.3 Mutual TLS (mTLS)
- **Usage:** High-security service-to-service communication
- **Implementation:** Client and server certificate validation
- **Certificate Management:** PKI infrastructure, rotation
- **Performance:** Encryption overhead considerations

#### 8.1.4 JSON Web Tokens (JWT)
- **Usage:** Stateless authentication with embedded claims
- **Structure:** Header, payload, signature
- **Validation:** Signature verification, expiration checking
- **Claims:** User identity, permissions, context information

### 8.2 Authorization and Access Control
- **Role-Based Access Control (RBAC):** Permission inheritance through roles
- **Attribute-Based Access Control (ABAC):** Context-aware access decisions
- **API-Level Permissions:** Granular endpoint access control
- **Data-Level Security:** Row and column level access restrictions

### 8.3 Data Protection
- **Encryption in Transit:** TLS/SSL for all communications
- **Encryption at Rest:** Database and file encryption
- **Data Masking:** Sensitive data obfuscation in non-production
- **Tokenization:** Replace sensitive data with non-sensitive tokens

### 8.4 Security Monitoring
- **Access Logging:** Comprehensive audit trail of all access
- **Anomaly Detection:** Unusual access pattern identification
- **Threat Detection:** Malicious activity monitoring
- **Compliance Reporting:** Regulatory compliance tracking

## 9. Performance Considerations

### 9.1 Performance Requirements
- **Latency Targets:** Maximum acceptable response times
- **Throughput Targets:** Messages or transactions per second
- **Concurrency Limits:** Maximum simultaneous connections
- **Bandwidth Requirements:** Network capacity planning

### 9.2 Performance Optimization Strategies

#### 9.2.1 Connection Management
- **Connection Pooling:** Reuse database and service connections
- **Keep-Alive:** Maintain persistent HTTP connections
- **Connection Limits:** Prevent resource exhaustion
- **Timeout Configuration:** Appropriate timeout settings

#### 9.2.2 Caching Strategies
- **Response Caching:** Cache frequently requested data
- **Connection Caching:** Cache authentication tokens
- **Metadata Caching:** Cache configuration and schema information
- **Distributed Caching:** Redis, Memcached for scalability

#### 9.2.3 Asynchronous Processing
- **Message Queues:** Decouple processing from request handling
- **Event-Driven Architecture:** React to events asynchronously
- **Batch Processing:** Group operations for efficiency
- **Background Jobs:** Non-blocking task execution

### 9.3 Scalability Patterns
- **Horizontal Scaling:** Add more instances to handle load
- **Load Balancing:** Distribute requests across instances
- **Partitioning:** Divide data and processing by key
- **Circuit Breaker:** Prevent cascade failures under load

### 9.4 Performance Monitoring
- **Response Time Tracking:** Monitor end-to-end latency
- **Throughput Monitoring:** Track transaction rates
- **Resource Utilization:** CPU, memory, network monitoring
- **Bottleneck Identification:** Identify performance constraints

## 10. Monitoring Strategy

### 10.1 Monitoring Objectives
- **Service Health:** Monitor integration service availability
- **Performance Tracking:** Track response times and throughput
- **Error Detection:** Identify and alert on integration failures
- **Capacity Planning:** Monitor resource usage and growth trends

### 10.2 Monitoring Components

#### 10.2.1 Health Checks
- **Endpoint Health:** Regular health check API calls
- **Dependency Health:** Monitor downstream service availability
- **Database Connectivity:** Verify database connection status
- **Queue Status:** Monitor message queue health and depth

#### 10.2.2 Application Performance Monitoring (APM)
- **Distributed Tracing:** End-to-end request tracking
- **Performance Metrics:** Response time, throughput, error rates
- **Code-Level Insights:** Method-level performance analysis
- **Dependency Mapping:** Visualize service dependencies

#### 10.2.3 Infrastructure Monitoring
- **System Metrics:** CPU, memory, disk, network utilization
- **Container Metrics:** Docker/Kubernetes resource usage
- **Network Monitoring:** Bandwidth, latency, packet loss
- **Storage Monitoring:** Disk space, I/O performance

### 10.3 Alerting Strategy
- **Alert Prioritization:** Critical, warning, informational levels
- **Escalation Procedures:** Define escalation paths and timeframes
- **Alert Fatigue Prevention:** Intelligent alerting and noise reduction
- **Runbook Integration:** Link alerts to resolution procedures

### 10.4 Monitoring Tools and Platforms
- **APM Solutions:** New Relic, AppDynamics, Dynatrace
- **Log Management:** ELK Stack, Splunk, Fluentd
- **Infrastructure Monitoring:** Prometheus, Grafana, DataDog
- **Synthetic Monitoring:** External monitoring services

## 11. Testing Strategy

### 11.1 Integration Testing Types
- **Unit Testing:** Individual component testing
- **Contract Testing:** API contract verification
- **Integration Testing:** End-to-end workflow testing
- **Performance Testing:** Load and stress testing
- **Security Testing:** Vulnerability and penetration testing

### 11.2 Testing Environments
- **Development:** Individual developer testing
- **Integration:** Component integration testing
- **Staging:** Production-like environment testing
- **Production:** Live system monitoring and validation

### 11.3 Test Data Management
- **Test Data Creation:** Synthetic and anonymized data
- **Data Refresh:** Regular test data updates
- **Data Privacy:** Ensure no production data in test environments
- **Data Consistency:** Maintain referential integrity across systems

### 11.4 Automated Testing
- **CI/CD Integration:** Automated testing in deployment pipeline
- **Regression Testing:** Automated test suite execution
- **Performance Testing:** Automated load testing
- **Contract Testing:** Automated API contract validation

## 12. Appendices

### Appendix A: Integration Patterns Reference
- **Enterprise Integration Patterns:** Messaging, routing, transformation
- **Microservices Patterns:** Service decomposition, data management
- **Cloud Integration Patterns:** Hybrid cloud, multi-cloud patterns
- **Event-Driven Patterns:** Event sourcing, CQRS, saga patterns

### Appendix B: Message Schema Definitions
- **JSON Schemas:** Schema definitions for JSON messages
- **XML Schemas:** XSD definitions for XML messages
- **Avro Schemas:** Schema registry entries
- **Protocol Buffer Definitions:** .proto file specifications

### Appendix C: API Documentation
- **OpenAPI Specifications:** Swagger/OpenAPI definitions
- **GraphQL Schemas:** GraphQL type definitions
- **SOAP WSDL:** Web service definitions
- **Message Queue Specifications:** Topic and queue definitions

### Appendix D: Configuration Examples
- **API Gateway Configuration:** Routing, authentication, rate limiting
- **Message Broker Configuration:** Topics, partitions, retention
- **Load Balancer Configuration:** Health checks, routing rules
- **Monitoring Configuration:** Metrics, alerts, dashboards

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Integration Team Contact:** [integration-team@example.com]
- **Version History:**
  - v1.0 - Initial comprehensive integration design document
`;
  }
}
