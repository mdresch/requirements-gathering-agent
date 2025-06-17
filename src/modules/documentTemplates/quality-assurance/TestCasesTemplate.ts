import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Test Cases document.
 * Provides a structured fallback template when AI generation fails.
 */
export class TestCasesTemplate {
  generate(context: ProjectContext): string {
    const projectName = context.projectName || 'Unnamed Project';
    const currentDate = new Date().toLocaleDateString();

    return `# Test Cases

**Project:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${currentDate}  
**Status:** Draft

## 1. Test Case Overview

### 1.1 Purpose
This document contains comprehensive test cases for the ${projectName} project. These test cases are designed to validate all functional and non-functional requirements, ensuring the system meets quality standards and business expectations.

### 1.2 Scope
The test cases cover:
- Functional testing of all user stories and requirements
- User interface and user experience validation
- Integration testing between system components
- Performance and security testing scenarios
- Error handling and edge case validation

### 1.3 Test Case Structure
Each test case includes:
- **Test Case ID:** Unique identifier for traceability
- **Test Case Title:** Descriptive name of the test scenario
- **Objective:** Purpose and goal of the test
- **Preconditions:** Setup requirements before test execution
- **Test Steps:** Detailed step-by-step actions
- **Expected Results:** Expected system behavior
- **Test Data:** Required input data and values
- **Priority:** Critical, High, Medium, or Low
- **Requirements Traceability:** Link to specific requirements

### 1.4 Test Case Categories
- **Functional Test Cases:** Core business functionality
- **UI/UX Test Cases:** User interface and experience
- **Integration Test Cases:** Component and system integration
- **Performance Test Cases:** Load, stress, and performance validation
- **Security Test Cases:** Authentication, authorization, and data protection
- **Negative Test Cases:** Error handling and edge cases

## 2. Functional Test Cases

### TC_FUNC_001: User Login - Valid Credentials
- **Objective:** Verify successful user login with valid credentials
- **Priority:** Critical
- **Preconditions:** User account exists in the system
- **Test Steps:**
  1. Navigate to login page
  2. Enter valid username in the username field
  3. Enter valid password in the password field
  4. Click the "Login" button
- **Expected Results:** 
  - User is successfully authenticated
  - User is redirected to the dashboard
  - Welcome message is displayed
- **Test Data:** 
  - Username: testuser@example.com
  - Password: ValidPass123!
- **Requirements Traceability:** REQ_AUTH_001

### TC_FUNC_002: User Login - Invalid Credentials
- **Objective:** Verify appropriate error handling for invalid login credentials
- **Priority:** High
- **Preconditions:** Login page is accessible
- **Test Steps:**
  1. Navigate to login page
  2. Enter invalid username in the username field
  3. Enter invalid password in the password field
  4. Click the "Login" button
- **Expected Results:** 
  - Authentication fails
  - Error message "Invalid username or password" is displayed
  - User remains on login page
- **Test Data:** 
  - Username: invalid@example.com
  - Password: WrongPassword
- **Requirements Traceability:** REQ_AUTH_002

### TC_FUNC_003: User Registration - Valid Data
- **Objective:** Verify successful user registration with valid information
- **Priority:** Critical
- **Preconditions:** Registration page is accessible
- **Test Steps:**
  1. Navigate to registration page
  2. Enter valid first name
  3. Enter valid last name
  4. Enter valid email address
  5. Enter valid password
  6. Confirm password
  7. Accept terms and conditions
  8. Click "Register" button
- **Expected Results:** 
  - User account is created successfully
  - Confirmation message is displayed
  - Verification email is sent
- **Test Data:** 
  - First Name: John
  - Last Name: Doe
  - Email: johndoe@example.com
  - Password: SecurePass123!
- **Requirements Traceability:** REQ_REG_001

### TC_FUNC_004: Data Entry - Form Validation
- **Objective:** Verify form validation for required fields
- **Priority:** High
- **Preconditions:** User is logged in and form is accessible
- **Test Steps:**
  1. Navigate to data entry form
  2. Leave required fields empty
  3. Enter data in optional fields
  4. Click "Save" button
- **Expected Results:** 
  - Validation errors are displayed for required fields
  - Form is not submitted
  - Error messages are clear and helpful
- **Test Data:** 
  - Required fields: Name, Email, Phone
  - Optional fields: Address, Notes
- **Requirements Traceability:** REQ_VAL_001

### TC_FUNC_005: Data Search and Filter
- **Objective:** Verify search and filter functionality
- **Priority:** Medium
- **Preconditions:** User is logged in, test data exists in system
- **Test Steps:**
  1. Navigate to search page
  2. Enter search criteria in search field
  3. Apply additional filters if available
  4. Click "Search" button
- **Expected Results:** 
  - Search results are displayed correctly
  - Results match the search criteria
  - Pagination works correctly if applicable
- **Test Data:** 
  - Search term: "test data"
  - Filters: Date range, Category
- **Requirements Traceability:** REQ_SEARCH_001

## 3. User Interface Test Cases

### TC_UI_001: Navigation Menu Functionality
- **Objective:** Verify all navigation menu items work correctly
- **Priority:** High
- **Preconditions:** User is logged in
- **Test Steps:**
  1. Verify main navigation menu is visible
  2. Click each menu item
  3. Verify correct page loads for each menu item
  4. Check submenu functionality if applicable
- **Expected Results:** 
  - All menu items are clickable
  - Correct pages load for each menu item
  - Navigation is consistent across pages
- **Test Data:** N/A
- **Requirements Traceability:** REQ_NAV_001

### TC_UI_002: Responsive Design Validation
- **Objective:** Verify application works correctly on different screen sizes
- **Priority:** Medium
- **Preconditions:** Application is accessible
- **Test Steps:**
  1. Open application in desktop browser
  2. Resize browser window to tablet size
  3. Resize browser window to mobile size
  4. Test key functionality at each size
- **Expected Results:** 
  - Layout adjusts correctly for each screen size
  - All functionality remains accessible
  - Text remains readable at all sizes
- **Test Data:** 
  - Desktop: 1920x1080
  - Tablet: 768x1024
  - Mobile: 375x667
- **Requirements Traceability:** REQ_RESP_001

### TC_UI_003: Form Input Validation Display
- **Objective:** Verify form validation messages are displayed correctly
- **Priority:** High
- **Preconditions:** Form with validation is accessible
- **Test Steps:**
  1. Navigate to form with validation
  2. Enter invalid data in various fields
  3. Attempt to submit form
  4. Verify validation messages
- **Expected Results:** 
  - Validation messages appear for invalid fields
  - Messages are clear and specific
  - Visual indicators highlight invalid fields
- **Test Data:** 
  - Invalid email: "notanemail"
  - Invalid phone: "123"
  - Invalid date: "32/13/2023"
- **Requirements Traceability:** REQ_VAL_002

## 4. Integration Test Cases

### TC_INT_001: Database Operations
- **Objective:** Verify CRUD operations work correctly with database
- **Priority:** Critical
- **Preconditions:** Database is accessible, test data available
- **Test Steps:**
  1. Create new record through application
  2. Read/retrieve the created record
  3. Update the record with new information
  4. Delete the record
  5. Verify record no longer exists
- **Expected Results:** 
  - All CRUD operations complete successfully
  - Data integrity is maintained
  - No orphaned records remain
- **Test Data:** 
  - Test record with all required fields
- **Requirements Traceability:** REQ_DB_001

### TC_INT_002: API Integration Testing
- **Objective:** Verify integration with external APIs
- **Priority:** High
- **Preconditions:** External API is available, authentication configured
- **Test Steps:**
  1. Make API call from application
  2. Verify request is properly formatted
  3. Verify response is received
  4. Verify response data is processed correctly
- **Expected Results:** 
  - API calls are successful
  - Data is exchanged correctly
  - Error handling works for API failures
- **Test Data:** 
  - Valid API endpoints and test data
- **Requirements Traceability:** REQ_API_001

### TC_INT_003: Third-Party Service Integration
- **Objective:** Verify integration with third-party services
- **Priority:** Medium
- **Preconditions:** Third-party service is configured and accessible
- **Test Steps:**
  1. Trigger integration with third-party service
  2. Verify data is sent correctly
  3. Verify response is received and processed
  4. Check error handling for service unavailability
- **Expected Results:** 
  - Integration works as expected
  - Data exchange is accurate
  - Graceful degradation when service unavailable
- **Test Data:** 
  - Service configuration and test payloads
- **Requirements Traceability:** REQ_INT_001

## 5. Performance Test Cases

### TC_PERF_001: Page Load Time
- **Objective:** Verify page load times meet performance requirements
- **Priority:** High
- **Preconditions:** Application is deployed in test environment
- **Test Steps:**
  1. Clear browser cache
  2. Navigate to application pages
  3. Measure page load times
  4. Record performance metrics
- **Expected Results:** 
  - Pages load within 2 seconds
  - Performance is consistent across browsers
  - No performance degradation over time
- **Test Data:** 
  - Various page types and sizes
- **Requirements Traceability:** REQ_PERF_001

### TC_PERF_002: Concurrent User Load
- **Objective:** Verify system handles concurrent users appropriately
- **Priority:** High
- **Preconditions:** Load testing tools configured
- **Test Steps:**
  1. Configure load test for 100 concurrent users
  2. Execute typical user workflows
  3. Monitor system performance
  4. Gradually increase load to 500 users
- **Expected Results:** 
  - System maintains performance under load
  - Response times remain within limits
  - No system crashes or errors
- **Test Data:** 
  - User scenarios and test accounts
- **Requirements Traceability:** REQ_PERF_002

### TC_PERF_003: Database Query Performance
- **Objective:** Verify database queries perform within acceptable limits
- **Priority:** Medium
- **Preconditions:** Database with representative data volume
- **Test Steps:**
  1. Execute complex database queries
  2. Measure query execution times
  3. Test with various data volumes
  4. Monitor database resource usage
- **Expected Results:** 
  - Queries complete within 1 second
  - Performance scales appropriately with data volume
  - Database resources are used efficiently
- **Test Data:** 
  - Large datasets for testing
- **Requirements Traceability:** REQ_PERF_003

## 6. Security Test Cases

### TC_SEC_001: Authentication Security
- **Objective:** Verify authentication mechanisms are secure
- **Priority:** Critical
- **Preconditions:** Security testing tools available
- **Test Steps:**
  1. Test password complexity requirements
  2. Verify account lockout after failed attempts
  3. Test session timeout functionality
  4. Verify secure password storage
- **Expected Results:** 
  - Strong password policies are enforced
  - Accounts lock after 5 failed attempts
  - Sessions timeout after inactivity
  - Passwords are properly hashed
- **Test Data:** 
  - Various password combinations
- **Requirements Traceability:** REQ_SEC_001

### TC_SEC_002: Authorization Testing
- **Objective:** Verify user authorization and access controls
- **Priority:** Critical
- **Preconditions:** Multiple user roles configured
- **Test Steps:**
  1. Login with different user roles
  2. Attempt to access restricted resources
  3. Verify role-based permissions
  4. Test privilege escalation attempts
- **Expected Results:** 
  - Users can only access authorized resources
  - Role-based permissions work correctly
  - Unauthorized access attempts are blocked
- **Test Data:** 
  - User accounts with different roles
- **Requirements Traceability:** REQ_SEC_002

### TC_SEC_003: Data Protection
- **Objective:** Verify sensitive data is properly protected
- **Priority:** High
- **Preconditions:** Application handles sensitive data
- **Test Steps:**
  1. Submit sensitive data through application
  2. Verify data encryption in transit
  3. Verify data encryption at rest
  4. Test data masking in logs and displays
- **Expected Results:** 
  - Data is encrypted during transmission
  - Sensitive data is encrypted in database
  - Data is masked in logs and error messages
- **Test Data:** 
  - Sensitive test data (PII, financial)
- **Requirements Traceability:** REQ_SEC_003

## 7. Negative Test Cases

### TC_NEG_001: Invalid Input Handling
- **Objective:** Verify system handles invalid input appropriately
- **Priority:** High
- **Preconditions:** Forms and input fields are accessible
- **Test Steps:**
  1. Enter invalid data in input fields
  2. Submit forms with invalid data
  3. Test boundary conditions
  4. Verify error handling
- **Expected Results:** 
  - Invalid input is rejected
  - Appropriate error messages are displayed
  - System remains stable
- **Test Data:** 
  - SQL injection strings, XSS payloads, invalid formats
- **Requirements Traceability:** REQ_ERR_001

### TC_NEG_002: Error Recovery Testing
- **Objective:** Verify system recovers gracefully from errors
- **Priority:** Medium
- **Preconditions:** System components can be disrupted
- **Test Steps:**
  1. Simulate network interruption
  2. Simulate database connection loss
  3. Simulate service unavailability
  4. Verify system recovery
- **Expected Results:** 
  - System detects errors appropriately
  - Error messages are user-friendly
  - System recovers when conditions improve
- **Test Data:** 
  - Various error scenarios
- **Requirements Traceability:** REQ_ERR_002

### TC_NEG_003: Resource Exhaustion
- **Objective:** Verify system behavior under resource constraints
- **Priority:** Low
- **Preconditions:** Ability to limit system resources
- **Test Steps:**
  1. Limit available memory
  2. Limit disk space
  3. Limit network bandwidth
  4. Monitor system behavior
- **Expected Results:** 
  - System degrades gracefully
  - Appropriate warnings are generated
  - Critical functions remain available
- **Test Data:** 
  - Resource limitation scenarios
- **Requirements Traceability:** REQ_ERR_003

## 8. Test Execution Guidelines

### 8.1 Pre-Execution Setup
- Verify test environment is properly configured
- Ensure test data is available and current
- Confirm all required tools and access are available
- Review test case updates and dependencies

### 8.2 Execution Process
- Execute test cases in the specified order
- Document actual results for each test step
- Capture screenshots for UI-related tests
- Log any deviations from expected results

### 8.3 Result Documentation
- Mark test cases as Pass, Fail, or Blocked
- Provide detailed comments for failed tests
- Attach supporting evidence (screenshots, logs)
- Update test case status in test management tool

### 8.4 Defect Reporting
- Create defect reports for failed test cases
- Include detailed reproduction steps
- Attach supporting evidence and logs
- Assign appropriate severity and priority

---

**Document Control:**
- **Author:** Test Analyst Team
- **Reviewers:** Senior Test Analyst, Business Analyst, Development Lead
- **Approval:** Test Manager
- **Next Review Date:** [Date + 2 weeks]
- **Distribution:** All testing team members, development team

**Revision History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | ${currentDate} | Test Analyst | Initial test cases document |

**Test Case Statistics:**
- Total Test Cases: 18
- Critical Priority: 6
- High Priority: 8
- Medium Priority: 3
- Low Priority: 1

`;
  }
}
