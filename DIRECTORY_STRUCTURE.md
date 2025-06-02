# Directory Structure Created by Requirements Gathering Agent

When you run the Requirements Gathering Agent in your project, it creates the following directory structure in your **project root** (not inside a nested requirements-gathering-agent folder):

## Output Directory Structure

```
your-project-root/
├── requirements/                           # Initial project analysis & requirements
│   ├── 01_project_context_from_readme.md
│   ├── 02_project_metadata_and_dependencies.md
│   ├── 03_ai_project_summary_and_goals.md
│   ├── 04_ai_generated_user_stories.md
│   ├── 05_ai_generated_personas.md
│   ├── 06_ai_generated_acceptance_criteria.md
│   ├── 07_ai_strategic_statements.md
│   ├── 08_ai_core_values_and_purpose.md
│   ├── 09_ai_key_roles_and_needs.md
│   ├── 10_ai_tech_stack_analysis.md
│   ├── 11_ai_data_model_suggestions.md
│   ├── 12_ai_process_flow_suggestions.md
│   ├── 13_ai_risk_analysis.md
│   ├── 14_ai_compliance_considerations.md
│   ├── 15_ai_ui_ux_considerations.md
│   └── 16_ai_project_kickoff_checklist.md
│
└── PMBOK_Documents/                        # PMBOK-aligned project management docs
    ├── Initiating/                         # Project initiation documents
    │   ├── 01_Project_Charter.md
    │   └── 02_Stakeholder_Register.md
    │
    └── Planning/                           # Project planning documents
        ├── 01_Scope_Management_Plan.md
        ├── 02_Requirements_Management_Plan.md
        ├── 03_Project_Scope_Statement.md
        ├── 04_Work_Breakdown_Structure.md
        ├── 05_WBS_Dictionary.md
        ├── 06_Activity_List.md
        ├── 07_Activity_Attributes.md
        ├── 08_Activity_Duration_Estimates.md
        ├── 09_Activity_Resource_Estimates.md
        ├── 10_Schedule_Network_Diagram.md
        ├── 11_Milestone_List.md
        ├── 12_Develop_Schedule_Input.md
        ├── 13_Project_Schedule.md
        ├── 14_Communications_Management_Plan.md
        ├── 15_Quality_Management_Plan.md
        ├── 16_Resource_Management_Plan.md
        ├── 17_Cost_Management_Plan.md
        ├── 18_Risk_Management_Plan.md
        ├── 19_Procurement_Management_Plan.md
        └── 20_Stakeholder_Engagement_Plan.md
```

## Key Points

### ✅ Correct Behavior
- **Files are created in YOUR project root** - where you run the command
- **Two main directories**: `requirements/` and `PMBOK_Documents/`
- **Subdirectories** are automatically created as needed
- **Organized by PMBOK process groups** (Initiating, Planning)

### ❌ Common Misconception
- Files are **NOT** created inside a nested `requirements-gathering-agent/` folder
- Files are **NOT** created inside the npm package directory
- There is **NO** need to manually create these directories

## Usage Examples

### When installed as npm package:
```bash
cd your-project
npx requirements-gathering-agent
# Creates: your-project/requirements/ and your-project/PMBOK_Documents/
```

### When copied to project:
```bash
cd your-project
node requirements-gathering-agent/dist/cli.js
# Creates: your-project/requirements/ and your-project/PMBOK_Documents/
```

### When using programmatically:
```typescript
import { RequirementsAgent } from 'requirements-gathering-agent';

const agent = new RequirementsAgent({
  projectName: 'My Project',
  outputDir: './custom-docs'  // Optional: customize output location
});
```

## Directory Purposes

### `requirements/` Directory
- **Purpose**: Initial project analysis and requirements gathering
- **Contains**: Basic project context, user stories, technical analysis
- **Generated from**: README.md, package.json, and AI analysis

### `PMBOK_Documents/` Directory  
- **Purpose**: Comprehensive project management documentation
- **Contains**: Complete PMBOK-aligned project management plans
- **Organized by**: PMBOK process groups (Initiating, Planning, etc.)
- **Generated from**: AI analysis using requirements as input

## Customization

You can customize the output directory by:

1. **Environment Variables**:
   ```bash
   export REQUIREMENTS_OUTPUT_DIR="./custom-requirements"
   export PMBOK_OUTPUT_DIR="./custom-pmbok"
   ```

2. **Programmatic API**:
   ```typescript
   const agent = new RequirementsAgent({
     projectName: 'My Project',
     outputDir: './docs'  // Custom base directory
   });
   ```

3. **CLI Arguments** (if implemented):
   ```bash
   npx requirements-gathering-agent --output-dir ./docs
   ```
