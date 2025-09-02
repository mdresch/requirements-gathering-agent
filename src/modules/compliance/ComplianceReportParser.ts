// ComplianceReportParser.ts
// Parses compliance review markdown files and extracts actionable findings

import * as fs from 'fs';
import * as path from 'path';

export interface ComplianceFinding {
    criteria: string;
    recommendation: string;
    affectedSection: string;
    severity: string;
    score?: string;
    sourceFile: string;
    timestamp: string;
}

export class ComplianceReportParser {
    static parseReport(filePath: string): ComplianceFinding[] {
        const content = fs.readFileSync(filePath, 'utf-8');
        const findings: ComplianceFinding[] = [];
        // Simple regex-based parsing for demo purposes
        const failedCriteriaRegex = /### Failed Criteria[\s\S]*?(- .+?)(?=\n###|$)/g;
        const recommendationsRegex = /### Recommendations[\s\S]*?(- .+?)(?=\n###|$)/g;
        const scoreRegex = /### Score[\s\S]*?(\d+)/;
        const auditFindingsRegex = /### Audit Findings[\s\S]*?(- .+?)(?=\n###|$)/g;

        // Extract failed criteria
        const failedCriteriaMatches = content.match(failedCriteriaRegex);
        if (failedCriteriaMatches) {
            failedCriteriaMatches.forEach(section => {
                const lines = section.split('\n').filter(l => l.startsWith('- '));
                lines.forEach(line => {
                    findings.push({
                        criteria: line.replace('- ', ''),
                        recommendation: '',
                        affectedSection: '',
                        severity: 'high',
                        sourceFile: filePath,
                        timestamp: new Date().toISOString()
                    });
                });
            });
        }
        // Extract recommendations
        const recommendationsMatches = content.match(recommendationsRegex);
        if (recommendationsMatches) {
            recommendationsMatches.forEach(section => {
                const lines = section.split('\n').filter(l => l.startsWith('- '));
                lines.forEach((line, idx) => {
                    if (findings[idx]) {
                        findings[idx].recommendation = line.replace('- ', '');
                    } else {
                        findings.push({
                            criteria: '',
                            recommendation: line.replace('- ', ''),
                            affectedSection: '',
                            severity: 'medium',
                            sourceFile: filePath,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            });
        }
        // Extract score
        const scoreMatch = content.match(scoreRegex);
        if (scoreMatch) {
            findings.forEach(f => f.score = scoreMatch[1]);
        }
        // Extract audit findings
        const auditFindingsMatches = content.match(auditFindingsRegex);
        if (auditFindingsMatches) {
            auditFindingsMatches.forEach(section => {
                const lines = section.split('\n').filter(l => l.startsWith('- '));
                lines.forEach(line => {
                    findings.push({
                        criteria: '',
                        recommendation: '',
                        affectedSection: line.replace('- ', ''),
                        severity: 'info',
                        sourceFile: filePath,
                        timestamp: new Date().toISOString()
                    });
                });
            });
        }
        return findings;
    }

    static parseAllReports(reportDir: string): ComplianceFinding[] {
        const files = fs.readdirSync(reportDir).filter(f => f.endsWith('.md'));
        let allFindings: ComplianceFinding[] = [];
        files.forEach(file => {
            const filePath = path.join(reportDir, file);
            allFindings = allFindings.concat(this.parseReport(filePath));
        });
        return allFindings;
    }
}
