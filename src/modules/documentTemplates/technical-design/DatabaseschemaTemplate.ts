import type { ProjectContext } from '../../ai/types';

/**
 * Database Schema Template generates comprehensive database schema design documentation
 * following database design best practices and normalization principles.
 */
export class DatabaseschemaTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Database Schema Design
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Database System';
    
    return `# Database Schema Design

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}

## Executive Summary

${projectDescription}

This document provides a comprehensive database schema design for ${projectName}, including entity relationships, table definitions, constraints, indexing strategies, and performance considerations.

## 1. Database Overview

### 1.1 Database Purpose
- **Primary Function:** [Define the main purpose of the database]
- **Business Context:** [How the database supports business operations]
- **Data Scope:** [Types of data stored and managed]
- **Performance Goals:** [Response time and throughput targets]

### 1.2 Database Management System
- **DBMS:** [PostgreSQL, MySQL, Oracle, SQL Server, MongoDB, etc.]
- **Version:** [Specific version requirements]
- **Licensing:** [Commercial or open source considerations]
- **Rationale:** [Why this DBMS was chosen]

### 1.3 Database Environment
- **Development:** [Development database configuration]
- **Testing:** [Test database setup]
- **Staging:** [Pre-production environment]
- **Production:** [Live database specifications]

## 2. Entity Relationship Diagram (ERD)

### 2.1 Conceptual ERD
\`\`\`
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Entity A  │──────│   Entity B  │──────│   Entity C  │
│             │ 1:M  │             │ M:N  │             │
│ - id (PK)   │      │ - id (PK)   │      │ - id (PK)   │
│ - name      │      │ - entity_a_id│      │ - name      │
│ - created_at│      │ - name      │      │ - status    │
└─────────────┘      │ - created_at│      │ - created_at│
                     └─────────────┘      └─────────────┘
\`\`\`

### 2.2 Logical ERD
- **Entities:** [List of main entities and their purposes]
- **Relationships:** [Description of entity relationships]
- **Cardinality:** [One-to-one, one-to-many, many-to-many relationships]
- **Business Rules:** [Constraints derived from business requirements]

### 2.3 Physical ERD
- **Table Names:** [Actual table names with naming conventions]
- **Column Details:** [Data types, constraints, defaults]
- **Foreign Keys:** [Reference relationships between tables]
- **Indexes:** [Performance optimization indexes]

## 3. Table Definitions

### 3.1 Core Tables

#### 3.1.1 [Table Name 1]
\`\`\`sql
CREATE TABLE table_name_1 (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'pending'))
);
\`\`\`

**Purpose:** [Description of what this table stores]
**Business Rules:**
- [Rule 1: e.g., Name must be unique within organization]
- [Rule 2: e.g., Status can only be changed by authorized users]
- [Rule 3: e.g., Soft delete only - no physical deletion]

#### 3.1.2 [Table Name 2]
\`\`\`sql
CREATE TABLE table_name_2 (
    id BIGSERIAL PRIMARY KEY,
    table_name_1_id BIGINT NOT NULL REFERENCES table_name_1(id),
    value DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_value_positive CHECK (value >= 0),
    CONSTRAINT uq_table1_category UNIQUE (table_name_1_id, category)
);
\`\`\`

**Purpose:** [Description of what this table stores]
**Business Rules:**
- [Rule 1: e.g., Value must be positive]
- [Rule 2: e.g., Category must be from predefined set]
- [Rule 3: e.g., Each record must be linked to parent entity]

#### 3.1.3 [Junction Table Name]
\`\`\`sql
CREATE TABLE table_name_1_table_name_3 (
    table_name_1_id BIGINT NOT NULL REFERENCES table_name_1(id),
    table_name_3_id BIGINT NOT NULL REFERENCES table_name_3(id),
    relationship_type VARCHAR(50) DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    
    PRIMARY KEY (table_name_1_id, table_name_3_id, relationship_type)
);
\`\`\`

**Purpose:** [Many-to-many relationship management]
**Business Rules:**
- [Rule 1: e.g., One entity can have multiple relationships]
- [Rule 2: e.g., Relationship type determines access level]

### 3.2 Lookup Tables

#### 3.2.1 Status Codes
\`\`\`sql
CREATE TABLE status_codes (
    code VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### 3.2.2 Configuration Settings
\`\`\`sql
CREATE TABLE configuration_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    data_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES users(id)
);
\`\`\`

### 3.3 Audit Tables

#### 3.3.1 Audit Log
\`\`\`sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by BIGINT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);
\`\`\`

## 4. Data Types and Domains

### 4.1 Standard Data Types
- **String Types:**
  - \`VARCHAR(n)\` - Variable length strings
  - \`TEXT\` - Unlimited length text
  - \`CHAR(n)\` - Fixed length strings
- **Numeric Types:**
  - \`BIGINT\` - Large integers (primary keys)
  - \`INTEGER\` - Standard integers
  - \`DECIMAL(p,s)\` - Precise decimal numbers
  - \`REAL\` - Floating point numbers
- **Date/Time Types:**
  - \`TIMESTAMP\` - Date and time with timezone
  - \`DATE\` - Date only
  - \`TIME\` - Time only
- **Boolean Type:**
  - \`BOOLEAN\` - True/false values
- **JSON Types:**
  - \`JSONB\` - Binary JSON (PostgreSQL)
  - \`JSON\` - Text JSON

### 4.2 Custom Domains
\`\`\`sql
-- Email domain
CREATE DOMAIN email_address AS VARCHAR(320)
CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Phone number domain
CREATE DOMAIN phone_number AS VARCHAR(20)
CHECK (VALUE ~* '^\+?[1-9]\d{1,14}$');

-- Currency amount domain
CREATE DOMAIN currency_amount AS DECIMAL(15,2)
CHECK (VALUE >= 0);
\`\`\`

### 4.3 Enumerated Types
\`\`\`sql
-- Status enumeration
CREATE TYPE status_enum AS ENUM ('active', 'inactive', 'pending', 'archived');

-- Priority enumeration
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- User role enumeration
CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'user', 'guest');
\`\`\`

## 5. Indexes and Keys

### 5.1 Primary Keys
- **Purpose:** Unique identification of each record
- **Implementation:** BIGSERIAL auto-incrementing integers
- **Naming Convention:** \`pk_table_name\`

### 5.2 Foreign Keys
\`\`\`sql
-- Foreign key constraints
ALTER TABLE table_name_2 
ADD CONSTRAINT fk_table2_table1 
FOREIGN KEY (table_name_1_id) REFERENCES table_name_1(id);

-- Cascading delete example
ALTER TABLE order_items 
ADD CONSTRAINT fk_orderitems_order 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
\`\`\`

### 5.3 Indexes for Performance

#### 5.3.1 Single Column Indexes
\`\`\`sql
-- Frequently searched columns
CREATE INDEX idx_table1_name ON table_name_1(name);
CREATE INDEX idx_table1_status ON table_name_1(status);
CREATE INDEX idx_table1_created_at ON table_name_1(created_at);
\`\`\`

#### 5.3.2 Composite Indexes
\`\`\`sql
-- Multi-column searches
CREATE INDEX idx_table2_table1_category ON table_name_2(table_name_1_id, category);
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
\`\`\`

#### 5.3.3 Partial Indexes
\`\`\`sql
-- Index only active records
CREATE INDEX idx_table1_active_name ON table_name_1(name) WHERE status = 'active';
\`\`\`

#### 5.3.4 Functional Indexes
\`\`\`sql
-- Case-insensitive searches
CREATE INDEX idx_table1_name_lower ON table_name_1(LOWER(name));
\`\`\`

### 5.4 Unique Constraints
\`\`\`sql
-- Business uniqueness rules
ALTER TABLE table_name_1 ADD CONSTRAINT uq_table1_name UNIQUE (name);
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
\`\`\`

## 6. Constraints and Business Rules

### 6.1 Check Constraints
\`\`\`sql
-- Data validation constraints
ALTER TABLE products 
ADD CONSTRAINT chk_price_positive CHECK (price > 0);

ALTER TABLE users 
ADD CONSTRAINT chk_age_valid CHECK (age >= 18 AND age <= 120);

ALTER TABLE orders 
ADD CONSTRAINT chk_order_date CHECK (order_date <= CURRENT_DATE);
\`\`\`

### 6.2 Not Null Constraints
- **Required Fields:** All primary keys and essential business fields
- **Optional Fields:** Description, notes, and supplementary information
- **Default Values:** Timestamps, status fields, and configuration settings

### 6.3 Referential Integrity
- **Foreign Key Constraints:** Ensure data consistency across related tables
- **Cascade Rules:** Define behavior for dependent records
- **Orphan Prevention:** Prevent deletion of referenced records

### 6.4 Business Rule Implementation
\`\`\`sql
-- Complex business rules via triggers
CREATE OR REPLACE FUNCTION validate_business_rule()
RETURNS TRIGGER AS $$
BEGIN
    -- Business logic validation
    IF NEW.status = 'active' AND NEW.approval_date IS NULL THEN
        RAISE EXCEPTION 'Active records must have approval date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_business_rule
    BEFORE INSERT OR UPDATE ON table_name_1
    FOR EACH ROW EXECUTE FUNCTION validate_business_rule();
\`\`\`

## 7. Normalization Strategy

### 7.1 Normalization Levels Applied
- **First Normal Form (1NF):** Atomic values, no repeating groups
- **Second Normal Form (2NF):** Remove partial dependencies
- **Third Normal Form (3NF):** Remove transitive dependencies
- **Boyce-Codd Normal Form (BCNF):** Advanced normalization where needed

### 7.2 Denormalization Decisions
- **Performance Optimization:** Calculated fields for reporting
- **Read Performance:** Redundant data for frequently accessed information
- **Caching Strategy:** Materialized views for complex queries

### 7.3 Data Warehousing Considerations
- **OLTP vs OLAP:** Transaction processing vs analytical processing
- **Star Schema:** Dimensional modeling for reporting
- **ETL Processes:** Data extraction, transformation, and loading

## 8. Performance Considerations

### 8.1 Query Optimization
- **Index Strategy:** Covering indexes for frequently used queries
- **Query Plans:** Analyze and optimize execution plans
- **Statistics:** Maintain current table statistics for optimizer

### 8.2 Partitioning Strategy
\`\`\`sql
-- Time-based partitioning
CREATE TABLE sales_data (
    id BIGSERIAL,
    sale_date DATE NOT NULL,
    amount DECIMAL(10,2),
    -- other columns
) PARTITION BY RANGE (sale_date);

-- Create partitions
CREATE TABLE sales_2024_q1 PARTITION OF sales_data
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
\`\`\`

### 8.3 Connection Pooling
- **Pool Size:** Optimal connection pool configuration
- **Connection Limits:** Maximum concurrent connections
- **Timeout Settings:** Connection and query timeout values

### 8.4 Monitoring and Metrics
- **Performance Metrics:** Response times, throughput, resource utilization
- **Slow Query Monitoring:** Identify and optimize problematic queries
- **Index Usage Analysis:** Monitor index effectiveness

## 9. Data Migration Strategy

### 9.1 Migration Planning
- **Current State Analysis:** Assessment of existing data
- **Gap Analysis:** Differences between old and new schema
- **Migration Timeline:** Phased approach to data migration
- **Rollback Plan:** Recovery strategy if migration fails

### 9.2 Migration Scripts
\`\`\`sql
-- Data transformation example
INSERT INTO new_table (id, name, status, created_at)
SELECT 
    old_id,
    TRIM(old_name),
    CASE 
        WHEN old_status = 'A' THEN 'active'
        WHEN old_status = 'I' THEN 'inactive'
        ELSE 'pending'
    END,
    old_created_date
FROM old_table
WHERE old_created_date IS NOT NULL;
\`\`\`

### 9.3 Data Validation
- **Row Count Verification:** Ensure all records migrated
- **Data Integrity Checks:** Validate relationships and constraints
- **Business Rule Verification:** Confirm business logic compliance
- **Performance Testing:** Validate performance post-migration

### 9.4 Cutover Strategy
- **Maintenance Window:** Planned downtime for migration
- **Parallel Running:** Side-by-side operation during transition
- **Incremental Migration:** Gradual data transfer approach
- **Monitoring:** Real-time migration progress tracking

## 10. Backup and Recovery

### 10.1 Backup Strategy
- **Full Backups:** Complete database backup schedule
- **Incremental Backups:** Changed data backup frequency
- **Transaction Log Backups:** Point-in-time recovery capability
- **Backup Retention:** How long backups are maintained

### 10.2 Recovery Procedures
- **Recovery Time Objective (RTO):** Maximum acceptable downtime
- **Recovery Point Objective (RPO):** Maximum acceptable data loss
- **Disaster Recovery:** Geographic backup and failover procedures
- **Testing Schedule:** Regular recovery testing procedures

### 10.3 High Availability
- **Replication:** Master-slave or master-master configuration
- **Failover:** Automatic failover procedures
- **Load Balancing:** Read replica distribution
- **Monitoring:** Health checks and alerting

### 10.4 Security Considerations
- **Backup Encryption:** Encrypted backup storage
- **Access Control:** Backup access permissions
- **Offsite Storage:** Secure remote backup location
- **Compliance:** Regulatory backup requirements

## 11. Security and Access Control

### 11.1 Database Security
- **Authentication:** User authentication methods
- **Authorization:** Role-based access control
- **Encryption:** Data at rest and in transit
- **Auditing:** Security event logging

### 11.2 User Roles and Permissions
\`\`\`sql
-- Role definitions
CREATE ROLE db_admin;
CREATE ROLE db_developer;
CREATE ROLE db_readonly;
CREATE ROLE db_application;

-- Permission grants
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO db_developer;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_readonly;
GRANT SELECT, INSERT, UPDATE ON specific_tables TO db_application;
\`\`\`

### 11.3 Data Privacy
- **Sensitive Data Identification:** PII and confidential information
- **Data Masking:** Anonymization for non-production environments
- **Retention Policies:** Data lifecycle management
- **Compliance:** GDPR, HIPAA, or other regulatory requirements

## 12. Documentation and Maintenance

### 12.1 Schema Documentation
- **Data Dictionary:** Comprehensive table and column documentation
- **Relationship Diagrams:** Visual representation of data relationships
- **Business Rules:** Documentation of implemented business logic
- **Change Log:** History of schema modifications

### 12.2 Maintenance Procedures
- **Regular Maintenance:** Index rebuilding, statistics updates
- **Monitoring:** Performance and health monitoring
- **Capacity Planning:** Growth projections and scaling plans
- **Version Control:** Schema versioning and change management

### 12.3 Development Guidelines
- **Naming Conventions:** Consistent naming standards
- **Code Standards:** SQL coding best practices
- **Testing Procedures:** Unit and integration testing
- **Deployment Process:** Change deployment procedures

## 13. Appendices

### Appendix A: Glossary
- **ACID:** Atomicity, Consistency, Isolation, Durability
- **ERD:** Entity Relationship Diagram
- **OLTP:** Online Transaction Processing
- **OLAP:** Online Analytical Processing
- **ETL:** Extract, Transform, Load

### Appendix B: SQL Scripts
- **Schema Creation Scripts:** Complete database setup
- **Sample Data Scripts:** Test data for development
- **Migration Scripts:** Data transformation procedures
- **Maintenance Scripts:** Routine maintenance procedures

### Appendix C: Performance Benchmarks
- **Baseline Metrics:** Initial performance measurements
- **Load Testing Results:** Performance under various loads
- **Optimization History:** Performance improvement tracking
- **Capacity Planning:** Future growth projections

### Appendix D: Compliance Documentation
- **Regulatory Requirements:** Applicable compliance standards
- **Audit Trail:** Data access and modification tracking
- **Data Retention:** Policies for data lifecycle management
- **Security Controls:** Implemented security measures

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Database Administrator:** [DBA name and contact]
- **Version History:**
  - v1.0 - Initial database schema design
`;
  }
}
