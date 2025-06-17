import type { ProjectContext } from '../../ai/types';

/**
 * Technical Stack Template generates comprehensive technology stack documentation
 * covering all aspects of the technical architecture and tooling.
 */
export class TechnicalstackTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Technical Stack Overview
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Software Project';
    
    return `# Technical Stack Overview

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}  
**Architecture:** [Monolithic/Microservices/Serverless/Hybrid]

## Executive Summary

${projectDescription}

This document provides a comprehensive overview of the technology stack for ${projectName}, including frontend technologies, backend services, databases, infrastructure components, development tools, and deployment strategies. The stack has been carefully selected to meet scalability, maintainability, and performance requirements.

## 1. Technology Stack Overview

### 1.1 Stack Selection Criteria
- **Performance:** Technologies that meet performance requirements
- **Scalability:** Support for horizontal and vertical scaling
- **Maintainability:** Code quality, documentation, and community support
- **Security:** Built-in security features and best practices
- **Team Expertise:** Alignment with team skills and experience
- **Cost Effectiveness:** Total cost of ownership considerations
- **Vendor Lock-in:** Preference for open standards and portability

### 1.2 Architecture Pattern
- **Architecture Style:** [Microservices/Monolithic/Serverless/Event-Driven]
- **Communication Pattern:** [REST APIs/GraphQL/Message Queues/Event Streaming]
- **Data Management:** [Single Database/Database per Service/Event Sourcing]
- **Deployment Model:** [Container-based/Serverless/Traditional]

### 1.3 Technology Stack Diagram
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Web App    │  Mobile App  │  Admin Portal │  API Gateway   │
│  (React)    │  (React Native) │  (Vue.js)  │  (Kong)        │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  User Service │ Order Service │ Payment Service │ Notification│
│  (Node.js)    │ (Python)      │ (Java)          │ (Go)        │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL   │  Redis Cache  │  MongoDB      │  S3 Storage │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 2. Frontend Technologies

### 2.1 Web Application Framework
- **Primary Framework:** [React/Vue.js/Angular/Svelte]
- **Version:** [Latest stable version]
- **Key Features:**
  - Component-based architecture
  - Virtual DOM for performance
  - Rich ecosystem and community
  - TypeScript support
  - Hot reload development experience

### 2.2 UI Component Library
- **Library:** [Material-UI/Ant Design/Chakra UI/Tailwind UI]
- **Version:** [Version number]
- **Benefits:**
  - Consistent design system
  - Accessibility compliance
  - Responsive components
  - Theming capabilities
  - Developer productivity

### 2.3 State Management
- **Solution:** [Redux/Vuex/Zustand/Context API]
- **Version:** [Version number]
- **Architecture:**
  - Centralized state management
  - Predictable state updates
  - Time-travel debugging
  - Middleware support

### 2.4 Build Tools and Bundlers
- **Bundler:** [Webpack/Vite/Rollup/Parcel]
- **Build Tool:** [Create React App/Vue CLI/Angular CLI]
- **Features:**
  - Hot module replacement
  - Code splitting
  - Tree shaking
  - Asset optimization
  - Development server

### 2.5 Mobile Application
- **Framework:** [React Native/Flutter/Ionic/Native]
- **Target Platforms:** iOS, Android
- **Key Libraries:**
  - Navigation: [React Navigation/Flutter Navigator]
  - State Management: [Redux/Provider/Bloc]
  - HTTP Client: [Axios/Dio/Fetch]
  - Push Notifications: [Firebase/OneSignal]

## 3. Backend Technologies

### 3.1 Programming Language
- **Primary Language:** [Node.js/Python/Java/Go/C#]
- **Version:** [Language version]
- **Rationale:**
  - Performance characteristics
  - Developer productivity
  - Library ecosystem
  - Community support
  - Team expertise

### 3.2 Web Framework
- **Framework:** [Express.js/FastAPI/Spring Boot/Gin/ASP.NET Core]
- **Version:** [Framework version]
- **Features:**
  - RESTful API development
  - Middleware support
  - Request/response handling
  - Error handling
  - Security features

### 3.3 API Design
- **API Style:** [REST/GraphQL/gRPC/Hybrid]
- **Documentation:** [OpenAPI/Swagger/GraphQL Schema]
- **Authentication:** [JWT/OAuth 2.0/API Keys]
- **Rate Limiting:** [Token bucket/Fixed window/Sliding window]
- **Versioning Strategy:** [URL versioning/Header versioning/Content negotiation]

### 3.4 Microservices (if applicable)
- **Service Discovery:** [Consul/Eureka/Kubernetes DNS]
- **Load Balancing:** [Nginx/HAProxy/AWS ALB/Istio]
- **Circuit Breaker:** [Hystrix/resilience4j/Circuit Breaker Pattern]
- **Distributed Tracing:** [Jaeger/Zipkin/AWS X-Ray]

## 4. Database Technologies

### 4.1 Primary Database
- **Database:** [PostgreSQL/MySQL/MongoDB/DynamoDB]
- **Version:** [Database version]
- **Use Cases:**
  - Transactional data storage
  - ACID compliance requirements
  - Complex queries and relationships
  - Data consistency guarantees

### 4.2 Caching Layer
- **Cache Solution:** [Redis/Memcached/Hazelcast]
- **Version:** [Cache version]
- **Caching Strategies:**
  - Application-level caching
  - Database query caching
  - Session storage
  - Distributed caching

### 4.3 Search Engine
- **Search Technology:** [Elasticsearch/Solr/Amazon CloudSearch]
- **Version:** [Search engine version]
- **Capabilities:**
  - Full-text search
  - Faceted search
  - Real-time indexing
  - Analytics and aggregations

### 4.4 Data Warehouse (if applicable)
- **Data Warehouse:** [Amazon Redshift/Google BigQuery/Snowflake]
- **ETL Tools:** [Apache Airflow/Talend/AWS Glue]
- **Business Intelligence:** [Tableau/Power BI/Looker]

## 5. Infrastructure Components

### 5.1 Cloud Provider
- **Provider:** [AWS/Azure/Google Cloud/Multi-cloud]
- **Region:** [Primary and secondary regions]
- **Services Used:**
  - Compute: [EC2/Azure VMs/Compute Engine]
  - Storage: [S3/Azure Blob/Cloud Storage]
  - Database: [RDS/Azure SQL/Cloud SQL]
  - Networking: [VPC/Virtual Network/VPC]

### 5.2 Containerization
- **Container Runtime:** [Docker/containerd/CRI-O]
- **Container Registry:** [Docker Hub/ECR/ACR/GCR]
- **Base Images:** [Alpine Linux/Ubuntu/Distroless]
- **Security Scanning:** [Clair/Trivy/Snyk]

### 5.3 Container Orchestration
- **Orchestrator:** [Kubernetes/Docker Swarm/Amazon ECS]
- **Version:** [Orchestrator version]
- **Components:**
  - Ingress Controller: [Nginx/Traefik/AWS ALB]
  - Service Mesh: [Istio/Linkerd/Consul Connect]
  - Secrets Management: [Kubernetes Secrets/Vault/AWS Secrets Manager]

### 5.4 Message Queuing
- **Message Broker:** [Apache Kafka/RabbitMQ/Amazon SQS]
- **Version:** [Broker version]
- **Patterns:**
  - Publish-Subscribe
  - Point-to-Point
  - Request-Reply
  - Dead Letter Queues

## 6. Development Tools

### 6.1 Integrated Development Environment
- **IDE/Editor:** [Visual Studio Code/IntelliJ IDEA/WebStorm]
- **Extensions/Plugins:**
  - Language support
  - Debugging tools
  - Code formatting
  - Git integration
  - Docker support

### 6.2 Code Quality Tools
- **Linting:** [ESLint/Pylint/SonarQube/Checkstyle]
- **Code Formatting:** [Prettier/Black/Google Java Format]
- **Static Analysis:** [SonarQube/CodeClimate/Veracode]
- **Security Scanning:** [Snyk/OWASP Dependency Check/Bandit]

### 6.3 Package Management
- **Frontend:** [npm/yarn/pnpm]
- **Backend:** [npm/pip/Maven/Go modules]
- **Container:** [Docker/Buildah/Podman]
- **Infrastructure:** [Helm/Terraform/CloudFormation]

## 7. Testing Tools

### 7.1 Unit Testing
- **Framework:** [Jest/PyTest/JUnit/Go Test]
- **Coverage Tools:** [Istanbul/Coverage.py/JaCoCo]
- **Mocking:** [Sinon/unittest.mock/Mockito]
- **Test Runners:** [Jest/pytest/Maven Surefire]

### 7.2 Integration Testing
- **API Testing:** [Supertest/Requests/RestAssured]
- **Database Testing:** [Testcontainers/SQLAlchemy Testing]
- **Contract Testing:** [Pact/Spring Cloud Contract]

### 7.3 End-to-End Testing
- **Framework:** [Cypress/Playwright/Selenium]
- **Mobile Testing:** [Appium/Detox/XCUITest]
- **Visual Regression:** [Percy/Chromatic/BackstopJS]

### 7.4 Performance Testing
- **Load Testing:** [Apache JMeter/k6/Artillery]
- **Stress Testing:** [Gatling/NBomber/LoadRunner]
- **Monitoring:** [New Relic/DataDog/Application Insights]

## 8. Monitoring and Observability

### 8.1 Application Performance Monitoring
- **APM Solution:** [New Relic/DataDog/AppDynamics/Dynatrace]
- **Metrics Collection:** [Prometheus/StatsD/CloudWatch]
- **Alerting:** [PagerDuty/Slack/Email notifications]

### 8.2 Logging
- **Log Aggregation:** [ELK Stack/Splunk/Fluentd]
- **Log Format:** [JSON structured logging/Plain text]
- **Log Levels:** Debug, Info, Warning, Error, Critical
- **Log Retention:** [Retention policies and archival]

### 8.3 Distributed Tracing
- **Tracing System:** [Jaeger/Zipkin/AWS X-Ray]
- **Instrumentation:** [OpenTelemetry/Application-specific]
- **Trace Sampling:** [Probabilistic/Rate-limited/Adaptive]

### 8.4 Health Checks and Uptime
- **Health Check Endpoints:** [/health, /ready, /live]
- **Uptime Monitoring:** [Pingdom/UptimeRobot/StatusPage]
- **Synthetic Monitoring:** [External monitoring services]

## 9. Security Tools

### 9.1 Authentication and Authorization
- **Identity Provider:** [Auth0/Okta/AWS Cognito/Azure AD]
- **Authentication Methods:** [OAuth 2.0/OpenID Connect/SAML]
- **Session Management:** [JWT tokens/Server-side sessions]
- **Multi-Factor Authentication:** [TOTP/SMS/Hardware tokens]

### 9.2 Security Scanning
- **Vulnerability Scanning:** [Snyk/OWASP ZAP/Nessus]
- **Dependency Scanning:** [GitHub Security/WhiteSource/Black Duck]
- **Container Scanning:** [Clair/Anchore/Twistlock]
- **Code Security:** [SonarQube/Veracode/Checkmarx]

### 9.3 Secrets Management
- **Secrets Store:** [HashiCorp Vault/AWS Secrets Manager/Azure Key Vault]
- **Environment Variables:** [Encrypted environment variables]
- **Certificate Management:** [Let's Encrypt/AWS Certificate Manager]

## 10. Deployment and DevOps

### 10.1 Version Control
- **Repository:** [Git/GitHub/GitLab/Bitbucket]
- **Branching Strategy:** [Git Flow/GitHub Flow/GitLab Flow]
- **Code Review:** [Pull Requests/Merge Requests]
- **Branch Protection:** [Required reviews/Status checks]

### 10.2 Continuous Integration
- **CI Platform:** [GitHub Actions/GitLab CI/Jenkins/Azure DevOps]
- **Build Pipeline:**
  - Code checkout
  - Dependency installation
  - Unit tests
  - Code quality checks
  - Security scanning
  - Build artifacts

### 10.3 Continuous Deployment
- **CD Platform:** [GitHub Actions/GitLab CI/ArgoCD/Spinnaker]
- **Deployment Strategies:**
  - Rolling deployment
  - Blue-green deployment
  - Canary deployment
  - Feature flags

### 10.4 Infrastructure as Code
- **IaC Tool:** [Terraform/CloudFormation/Pulumi/ARM Templates]
- **Configuration Management:** [Ansible/Chef/Puppet]
- **GitOps:** [ArgoCD/Flux/Jenkins X]

## 11. Development Workflow

### 11.1 Local Development Setup
- **Prerequisites:**
  - [Programming language and version]
  - [Database installation]
  - [Docker/Docker Compose]
  - [IDE/Editor setup]

### 11.2 Development Process
1. **Feature Development:**
   - Create feature branch
   - Implement changes
   - Write/update tests
   - Run local testing
   - Code review process

2. **Testing Strategy:**
   - Unit tests (>80% coverage)
   - Integration tests
   - End-to-end tests
   - Performance tests (critical paths)

3. **Deployment Process:**
   - Automated testing
   - Security scanning
   - Staging deployment
   - Production deployment
   - Post-deployment monitoring

## 12. Performance Considerations

### 12.1 Performance Targets
- **Response Time:** < 200ms for API calls
- **Throughput:** 1000+ requests per second
- **Availability:** 99.9% uptime
- **Scalability:** Auto-scaling based on metrics

### 12.2 Optimization Strategies
- **Caching:** Multi-level caching strategy
- **Database:** Query optimization and indexing
- **CDN:** Content delivery network for static assets
- **Compression:** Gzip/Brotli compression
- **Lazy Loading:** On-demand resource loading

## 13. Cost Optimization

### 13.1 Cost Management
- **Resource Monitoring:** Track usage and costs
- **Auto-scaling:** Scale resources based on demand
- **Reserved Instances:** Long-term capacity planning
- **Spot Instances:** Cost-effective compute for non-critical workloads

### 13.2 Cost Optimization Tools
- **Cloud Cost Management:** [AWS Cost Explorer/Azure Cost Management]
- **Right-sizing:** [AWS Trusted Advisor/Azure Advisor]
- **Cost Alerts:** Budget monitoring and alerts

## 14. Migration and Upgrade Strategy

### 14.1 Technology Upgrade Path
- **Language Versions:** Regular updates to latest stable versions
- **Framework Updates:** Gradual migration to new versions
- **Database Upgrades:** Planned maintenance windows
- **Infrastructure Updates:** Rolling updates with zero downtime

### 14.2 Legacy System Integration
- **API Wrappers:** Modernize legacy system interfaces
- **Data Migration:** Gradual data migration strategies
- **Parallel Running:** Run old and new systems in parallel
- **Feature Parity:** Ensure feature completeness before cutover

## 15. Risk Assessment

### 15.1 Technology Risks
- **Single Points of Failure:** Critical dependency identification
- **Vendor Lock-in:** Mitigation strategies for vendor dependencies
- **Security Vulnerabilities:** Regular security updates and patches
- **Performance Bottlenecks:** Capacity planning and monitoring

### 15.2 Mitigation Strategies
- **Redundancy:** Multi-region deployments
- **Backup and Recovery:** Automated backup strategies
- **Disaster Recovery:** RTO and RPO planning
- **Monitoring and Alerting:** Proactive issue detection

## 16. Appendices

### Appendix A: Technology Comparison Matrix
| Criteria | Option 1 | Option 2 | Option 3 | Selected |
|----------|----------|----------|----------|----------|
| Performance | High | Medium | High | Option 1 |
| Scalability | Excellent | Good | Excellent | Option 1 |
| Community | Large | Medium | Large | Option 1 |
| Learning Curve | Medium | Low | High | Option 1 |

### Appendix B: Dependency Management
- **Direct Dependencies:** Core libraries and frameworks
- **Transitive Dependencies:** Dependencies of dependencies
- **Security Updates:** Regular dependency updates
- **License Compliance:** Open source license tracking

### Appendix C: Environment Configuration
- **Development:** Local development setup
- **Testing:** Automated testing environment
- **Staging:** Production-like testing environment
- **Production:** Live production environment

### Appendix D: Disaster Recovery Plan
- **Backup Strategy:** Data backup procedures
- **Recovery Procedures:** Step-by-step recovery process
- **Business Continuity:** Minimal disruption planning
- **Testing:** Regular disaster recovery testing

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Architecture Team Contact:** [architecture-team@example.com]
- **Version History:**
  - v1.0 - Initial comprehensive technical stack documentation
`;
  }
}
