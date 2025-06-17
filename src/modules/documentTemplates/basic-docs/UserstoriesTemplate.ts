import type { ProjectContext } from '../../ai/types';

/**
 * Userstories Template generates the content for the Userstories document.
 */
export class UserstoriesTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for User Stories
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Project';
    const projectType = this.context.projectType || 'Application';
    const description = this.context.description || 'No description provided';

    return `# User Stories

## Project Overview
**Project:** ${projectName}
**Type:** ${projectType}
**Description:** ${description}

## User Story Format
Each user story follows the format: "As a [user type], I want [functionality] so that [benefit]."

## Epic: Core Functionality

### User Registration and Authentication
- **US001:** As a new user, I want to create an account so that I can access the system
- **US002:** As a registered user, I want to log in securely so that I can access my personal data
- **US003:** As a user, I want to reset my password so that I can regain access if I forget it

### Main User Journey
- **US004:** As a user, I want an intuitive dashboard so that I can quickly understand the system's capabilities
- **US005:** As a user, I want to easily navigate between features so that I can efficiently complete my tasks
- **US006:** As a user, I want clear feedback on my actions so that I know when operations succeed or fail

## Epic: Data Management

### Data Input
- **US007:** As a user, I want to input data through forms so that I can provide necessary information
- **US008:** As a user, I want to validate my input in real-time so that I can correct errors immediately
- **US009:** As a user, I want to save drafts so that I don't lose my work

### Data Viewing
- **US010:** As a user, I want to view my data in organized lists so that I can find information quickly
- **US011:** As a user, I want to search and filter data so that I can locate specific items
- **US012:** As a user, I want to export data so that I can use it in other systems

## Epic: System Administration

### User Management
- **US013:** As an administrator, I want to manage user accounts so that I can control system access
- **US014:** As an administrator, I want to assign user roles so that I can control permissions
- **US015:** As an administrator, I want to monitor system usage so that I can ensure optimal performance

## Acceptance Criteria Framework

Each user story should include:
- **Given** - the initial context
- **When** - the action performed
- **Then** - the expected outcome

## Priority Classification
- **High Priority:** Core functionality required for MVP
- **Medium Priority:** Important features for user satisfaction
- **Low Priority:** Nice-to-have features for future releases

## Dependencies and Assumptions
- User stories assume basic internet connectivity
- Stories may depend on third-party integrations
- Technical implementation details will be defined separately

## Definition of Done
- User story is implemented and tested
- Acceptance criteria are met
- Code review is completed
- Documentation is updated`;
  }
}
