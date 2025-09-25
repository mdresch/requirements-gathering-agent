-- Phase 1: Enhanced Data Integration - Database Schema
-- Migration: 001_create_compliance_tables.sql
-- Description: Create compliance metrics, issues, and history tables

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create compliance_metrics table
CREATE TABLE compliance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    standard_type VARCHAR(50) NOT NULL CHECK (standard_type IN ('BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL')),
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    data_source VARCHAR(100) NOT NULL DEFAULT 'api',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT unique_project_standard_time UNIQUE (project_id, standard_type, calculated_at)
);

-- Create compliance_issues table
CREATE TABLE compliance_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    standard_type VARCHAR(50) NOT NULL CHECK (standard_type IN ('BABOK', 'PMBOK', 'DMBOK', 'ISO')),
    issue_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL')),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assignee_id VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_compliance_issues_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create compliance_history table
CREATE TABLE compliance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('OVERALL', 'BABOK', 'PMBOK', 'DMBOK', 'ISO')),
    value DECIMAL(5,2) NOT NULL,
    change_percentage DECIMAL(5,2),
    previous_value DECIMAL(5,2),
    change_reason TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT unique_project_metric_time UNIQUE (project_id, metric_type, recorded_at)
);

-- Create compliance_categories table
CREATE TABLE compliance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    standard_type VARCHAR(50) NOT NULL CHECK (standard_type IN ('BABOK', 'PMBOK', 'DMBOK', 'ISO')),
    severity_weight DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_category_standard UNIQUE (name, standard_type)
);

-- Create compliance_workflows table
CREATE TABLE compliance_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    standard_type VARCHAR(50) NOT NULL CHECK (standard_type IN ('BABOK', 'PMBOK', 'DMBOK', 'ISO')),
    workflow_steps JSONB NOT NULL,
    transitions JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_workflow_standard UNIQUE (name, standard_type)
);

-- Create data_quality_metrics table
CREATE TABLE data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(255) NOT NULL,
    data_source VARCHAR(100) NOT NULL,
    quality_score DECIMAL(5,2) NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
    completeness_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    timeliness_score DECIMAL(5,2),
    validity_score DECIMAL(5,2),
    quality_level VARCHAR(20) NOT NULL CHECK (quality_level IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    issues_found INTEGER DEFAULT 0,
    last_validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_project_source_time UNIQUE (project_id, data_source, last_validated_at)
);

-- Create indexes for performance optimization
CREATE INDEX idx_compliance_metrics_project_id ON compliance_metrics(project_id);
CREATE INDEX idx_compliance_metrics_standard_type ON compliance_metrics(standard_type);
CREATE INDEX idx_compliance_metrics_calculated_at ON compliance_metrics(calculated_at);
CREATE INDEX idx_compliance_metrics_project_standard ON compliance_metrics(project_id, standard_type);

CREATE INDEX idx_compliance_issues_project_id ON compliance_issues(project_id);
CREATE INDEX idx_compliance_issues_standard_type ON compliance_issues(standard_type);
CREATE INDEX idx_compliance_issues_severity ON compliance_issues(severity);
CREATE INDEX idx_compliance_issues_status ON compliance_issues(status);
CREATE INDEX idx_compliance_issues_assignee ON compliance_issues(assignee_id);
CREATE INDEX idx_compliance_issues_due_date ON compliance_issues(due_date);

CREATE INDEX idx_compliance_history_project_id ON compliance_history(project_id);
CREATE INDEX idx_compliance_history_metric_type ON compliance_history(metric_type);
CREATE INDEX idx_compliance_history_recorded_at ON compliance_history(recorded_at);

CREATE INDEX idx_data_quality_project_id ON data_quality_metrics(project_id);
CREATE INDEX idx_data_quality_source ON data_quality_metrics(data_source);
CREATE INDEX idx_data_quality_score ON data_quality_metrics(quality_score);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_compliance_metrics_updated_at 
    BEFORE UPDATE ON compliance_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_issues_updated_at 
    BEFORE UPDATE ON compliance_issues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_categories_updated_at 
    BEFORE UPDATE ON compliance_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_workflows_updated_at 
    BEFORE UPDATE ON compliance_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default compliance categories
INSERT INTO compliance_categories (name, description, standard_type, severity_weight) VALUES
-- BABOK Categories
('Requirements Analysis', 'Requirements gathering and analysis activities', 'BABOK', 1.0),
('Business Analysis Planning', 'Planning and monitoring business analysis work', 'BABOK', 1.0),
('Elicitation and Collaboration', 'Eliciting, confirming, and communicating requirements', 'BABOK', 1.0),
('Requirements Life Cycle Management', 'Managing requirements throughout their lifecycle', 'BABOK', 1.0),
('Strategy Analysis', 'Analyzing business needs and recommending solutions', 'BABOK', 1.0),
('Solution Evaluation', 'Evaluating solution performance and value', 'BABOK', 1.0),

-- PMBOK Categories
('Project Integration Management', 'Coordinating all project management processes', 'PMBOK', 1.0),
('Project Scope Management', 'Defining and controlling project scope', 'PMBOK', 1.0),
('Project Schedule Management', 'Managing project timeline and activities', 'PMBOK', 1.0),
('Project Cost Management', 'Planning and controlling project costs', 'PMBOK', 1.0),
('Project Quality Management', 'Ensuring project quality standards', 'PMBOK', 1.0),
('Project Resource Management', 'Managing project team and resources', 'PMBOK', 1.0),
('Project Communications Management', 'Managing project communications', 'PMBOK', 1.0),
('Project Risk Management', 'Identifying and managing project risks', 'PMBOK', 1.0),
('Project Procurement Management', 'Managing project procurement activities', 'PMBOK', 1.0),
('Project Stakeholder Management', 'Managing project stakeholders', 'PMBOK', 1.0),

-- DMBOK Categories
('Data Governance', 'Managing data assets and policies', 'DMBOK', 1.0),
('Data Architecture', 'Designing data structures and systems', 'DMBOK', 1.0),
('Data Modeling and Design', 'Creating data models and designs', 'DMBOK', 1.0),
('Data Storage and Operations', 'Managing data storage and operations', 'DMBOK', 1.0),
('Data Security', 'Protecting data assets and privacy', 'DMBOK', 1.0),
('Data Integration and Interoperability', 'Integrating data across systems', 'DMBOK', 1.0),
('Documents and Content', 'Managing documents and content', 'DMBOK', 1.0),
('Reference and Master Data', 'Managing reference and master data', 'DMBOK', 1.0),
('Data Warehousing and Business Intelligence', 'Data warehousing and BI activities', 'DMBOK', 1.0),
('Data Quality', 'Ensuring data quality standards', 'DMBOK', 1.0),
('Big Data and Analytics', 'Managing big data and analytics', 'DMBOK', 1.0),
('Data Management Maturity', 'Assessing data management maturity', 'DMBOK', 1.0),

-- ISO Categories
('Security Management', 'Information security management', 'ISO', 1.0),
('Risk Assessment', 'Security risk assessment activities', 'ISO', 1.0),
('Access Control', 'Managing access to information systems', 'ISO', 1.0),
('Cryptography', 'Cryptographic controls and implementation', 'ISO', 1.0),
('Physical Security', 'Physical and environmental security', 'ISO', 1.0),
('Operations Security', 'Operational security procedures', 'ISO', 1.0),
('Communications Security', 'Network and communications security', 'ISO', 1.0),
('System Acquisition', 'Security in system acquisition', 'ISO', 1.0),
('Supplier Relationships', 'Managing supplier security', 'ISO', 1.0),
('Information Security Incident Management', 'Incident response and management', 'ISO', 1.0),
('Business Continuity', 'Business continuity planning', 'ISO', 1.0),
('Compliance', 'Regulatory and compliance management', 'ISO', 1.0);

-- Insert default workflows
INSERT INTO compliance_workflows (name, standard_type, workflow_steps, transitions, is_default) VALUES
('Standard Compliance Workflow', 'BABOK', 
 '["OPEN", "ASSIGNED", "IN_PROGRESS", "REVIEW", "RESOLVED", "CLOSED"]'::jsonb,
 '{"OPEN": ["ASSIGNED"], "ASSIGNED": ["IN_PROGRESS", "OPEN"], "IN_PROGRESS": ["REVIEW", "ASSIGNED"], "REVIEW": ["RESOLVED", "IN_PROGRESS"], "RESOLVED": ["CLOSED", "REVIEW"], "CLOSED": []}'::jsonb,
 true),
('Standard Compliance Workflow', 'PMBOK', 
 '["OPEN", "ASSIGNED", "IN_PROGRESS", "REVIEW", "RESOLVED", "CLOSED"]'::jsonb,
 '{"OPEN": ["ASSIGNED"], "ASSIGNED": ["IN_PROGRESS", "OPEN"], "IN_PROGRESS": ["REVIEW", "ASSIGNED"], "REVIEW": ["RESOLVED", "IN_PROGRESS"], "RESOLVED": ["CLOSED", "REVIEW"], "CLOSED": []}'::jsonb,
 true),
('Standard Compliance Workflow', 'DMBOK', 
 '["OPEN", "ASSIGNED", "IN_PROGRESS", "REVIEW", "RESOLVED", "CLOSED"]'::jsonb,
 '{"OPEN": ["ASSIGNED"], "ASSIGNED": ["IN_PROGRESS", "OPEN"], "IN_PROGRESS": ["REVIEW", "ASSIGNED"], "REVIEW": ["RESOLVED", "IN_PROGRESS"], "RESOLVED": ["CLOSED", "REVIEW"], "CLOSED": []}'::jsonb,
 true),
('Standard Compliance Workflow', 'ISO', 
 '["OPEN", "ASSIGNED", "IN_PROGRESS", "REVIEW", "RESOLVED", "CLOSED"]'::jsonb,
 '{"OPEN": ["ASSIGNED"], "ASSIGNED": ["IN_PROGRESS", "OPEN"], "IN_PROGRESS": ["REVIEW", "ASSIGNED"], "REVIEW": ["RESOLVED", "IN_PROGRESS"], "RESOLVED": ["CLOSED", "REVIEW"], "CLOSED": []}'::jsonb,
 true);

-- Create views for common queries
CREATE VIEW compliance_dashboard_summary AS
SELECT 
    cm.project_id,
    cm.standard_type,
    AVG(cm.score) as avg_score,
    MAX(cm.score) as max_score,
    MIN(cm.score) as min_score,
    COUNT(cm.id) as metric_count,
    MAX(cm.calculated_at) as last_calculated
FROM compliance_metrics cm
WHERE cm.calculated_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY cm.project_id, cm.standard_type;

CREATE VIEW compliance_issues_summary AS
SELECT 
    ci.project_id,
    ci.standard_type,
    ci.severity,
    ci.status,
    COUNT(ci.id) as issue_count,
    AVG(CASE WHEN ci.due_date IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (ci.due_date - ci.created_at))/86400 
    END) as avg_days_to_due
FROM compliance_issues ci
GROUP BY ci.project_id, ci.standard_type, ci.severity, ci.status;

CREATE VIEW data_quality_summary AS
SELECT 
    dqm.project_id,
    dqm.data_source,
    AVG(dqm.quality_score) as avg_quality_score,
    COUNT(dqm.id) as quality_check_count,
    MAX(dqm.last_validated_at) as last_validated
FROM data_quality_metrics dqm
WHERE dqm.last_validated_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY dqm.project_id, dqm.data_source;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO compliance_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO compliance_user;
