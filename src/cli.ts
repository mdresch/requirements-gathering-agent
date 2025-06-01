#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import { getReadmeContent } from './modules/projectAnalyzer.js';
import { generateMarkdownFile } from './modules/documentGenerator.js';
import { getProjectPackageJson } from './modules/projectAnalyzer.js';
import { getAiSummaryAndGoals, getAiUserStories, getAiPersonas, getAiAcceptanceCriteria, getAiStrategicStatements, getAiCoreValuesAndPurpose, getAiKeyRolesAndNeeds, getAiTechStackAnalysis, getAiDataModelSuggestions, getAiProcessFlowSuggestions, getAiRiskAnalysis, getAiComplianceConsiderations, getAiUiUxConsiderations, getAiProjectKickoffChecklist, getAiProjectCharter, getAiStakeholderRegister, getAiScopeManagementPlan, getAiRequirementsManagementPlan, getAiProjectScopeStatement, getAiWbs, getAiWbsDictionary, getAiActivityList, getAiActivityAttributes, getAiMilestoneList, getAiScheduleNetworkDiagram, getAiActivityDurationEstimates, getAiActivityResourceEstimates, getAiDevelopScheduleInput, getAiScheduleManagementPlan, getAiQualityManagementPlan, getAiResourceManagementPlan, getAiRiskManagementPlan, getAiStakeholderEngagementPlan, getAiCostManagementPlan, getAiCommunicationsManagementPlan } from './modules/llmProcessor.js';

async function main() {
  console.log('Requirements Gathering Agent Initializing...');
  const targetDir = process.cwd();
  const requirementsDir = path.join(targetDir, 'requirements');

  try {
    // Ensure requirements directory exists
    await fs.mkdir(requirementsDir, { recursive: true });
    console.log(`Ensured '/requirements' folder exists in ${targetDir}`);

    // 1. Analyze: Get README content
    console.log('Attempting to read README.md...');
    const readmeContent = await getReadmeContent(targetDir);

    if (readmeContent) {
      console.log('README.md found and read successfully.');
      // 2. Generate: Create markdown file from README content
      const outputFileName = '01_project_context_from_readme.md';
      const fileTitle = 'Project Context from README.md';
      await generateMarkdownFile(requirementsDir, outputFileName, fileTitle, readmeContent);
      console.log(`Generated ${outputFileName} in ${requirementsDir}`);
    } else {
      console.log('README.md not found in the target directory.');
    }

    // --- New: Analyze package.json ---
    const pkgJson = await getProjectPackageJson(targetDir);
    if (pkgJson) {
      console.log('package.json found and read successfully.');
      // Prepare content for markdown
      let pkgContent = `# Project Metadata and Dependencies (from package.json)\n\n`;
      pkgContent += `## Core Information\n`;
      pkgContent += `- **Name:** \`${pkgJson.name || ''}\`\n`;
      pkgContent += `- **Version:** \`${pkgJson.version || ''}\`\n`;
      pkgContent += `- **Description:** \`${pkgJson.description || ''}\`\n`;
      if (pkgJson.main) {
        pkgContent += `- **Main Entry Point:** \`${pkgJson.main}\`\n`;
      }
      pkgContent += `\n## Dependencies\n`;
      if (pkgJson.dependencies && Object.keys(pkgJson.dependencies).length > 0) {
        for (const [dep, ver] of Object.entries(pkgJson.dependencies)) {
          pkgContent += `- \`${dep}\`: \`${ver}\`\n`;
        }
      } else {
        pkgContent += '_None_\n';
      }
      pkgContent += `\n## Development Dependencies\n`;
      if (pkgJson.devDependencies && Object.keys(pkgJson.devDependencies).length > 0) {
        for (const [dep, ver] of Object.entries(pkgJson.devDependencies)) {
          pkgContent += `- \`${dep}\`: \`${ver}\`\n`;
        }
      } else {
        pkgContent += '_None_\n';
      }
      await generateMarkdownFile(requirementsDir, '02_project_metadata_and_dependencies.md', 'Project Metadata and Dependencies (from package.json)', pkgContent);
      console.log('Generated 02_project_metadata_and_dependencies.md in', requirementsDir);
    } else {
      console.log('package.json not found in the target directory.');
    }

    // --- AI-Powered Project Summary and Goals ---
    let aiSummary;
    if (readmeContent) {
      aiSummary = await getAiSummaryAndGoals(readmeContent);
      if (aiSummary) {
        console.log('AI-generated project summary and business goals created.');
        await generateMarkdownFile(
          requirementsDir,
          '03_ai_project_summary_and_goals.md',
          'AI-Generated Project Summary and Business Goals',
          aiSummary
        );
        console.log('Generated 03_ai_project_summary_and_goals.md in', requirementsDir);
      } else {
        console.log('AI summary could not be generated (API key missing or error).');
      }
    }

    let aiUserStories: string | null = null;
    // --- AI-Generated User Stories ---
    // Prefer aiSummary if available, else fallback to readmeContent
    const userStoriesContext = aiSummary || readmeContent;
    if (userStoriesContext) {
      aiUserStories = await getAiUserStories(userStoriesContext);
      if (aiUserStories) {
        console.log('AI-generated user stories created.');
        await generateMarkdownFile(
          requirementsDir,
          '04_ai_generated_user_stories.md',
          'AI-Generated User Stories',
          aiUserStories
        );
        console.log('Generated 04_ai_generated_user_stories.md in', requirementsDir);
      } else {
        console.log('AI user stories could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated User Personas ---
    const personasContext = aiSummary || readmeContent;
    // aiUserStories is the string content generated by getAiUserStories
    let aiPersonas: string | null = null;
    if (personasContext) {
      aiPersonas = await getAiPersonas(personasContext, aiUserStories);
      if (aiPersonas) {
        console.log('AI-generated user personas created.');
        await generateMarkdownFile(
          requirementsDir,
          '05_ai_generated_personas.md',
          'AI-Generated User Personas',
          aiPersonas
        );
        console.log('Generated 05_ai_generated_personas.md in', requirementsDir);
      } else {
        console.log('AI personas could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Key User Roles and Needs ---
    let aiKeyRolesAndNeeds: string | null = null;
    if (aiSummary && aiUserStories && aiPersonas) {
      aiKeyRolesAndNeeds = await getAiKeyRolesAndNeeds(aiSummary, aiUserStories, aiPersonas);
      if (aiKeyRolesAndNeeds) {
        console.log('AI-generated key user roles and needs created.');
        await generateMarkdownFile(
          requirementsDir,
          '09_ai_key_roles_and_needs.md',
          'AI-Generated Key User Roles and Needs',
          aiKeyRolesAndNeeds
        );
        console.log('Generated 09_ai_key_roles_and_needs.md in', requirementsDir);
      } else {
        console.log('AI key user roles and needs could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Acceptance Criteria ---
    if (aiUserStories) {
      const aiAcceptanceCriteria = await getAiAcceptanceCriteria(aiUserStories);
      if (aiAcceptanceCriteria) {
        console.log('AI-generated acceptance criteria created.');
        await generateMarkdownFile(
          requirementsDir,
          '06_ai_generated_acceptance_criteria.md',
          'AI-Generated Acceptance Criteria',
          aiAcceptanceCriteria
        );
        console.log('Generated 06_ai_generated_acceptance_criteria.md in', requirementsDir);
      } else {
        console.log('AI acceptance criteria could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Strategic Statements (Vision & Mission) ---
    let aiStrategicStatements: string | null = null;
    if (aiSummary) {
      aiStrategicStatements = await getAiStrategicStatements(aiSummary);
      if (aiStrategicStatements) {
        console.log('AI-generated strategic statements created.');
        await generateMarkdownFile(
          requirementsDir,
          '07_ai_strategic_statements.md',
          'AI-Generated Strategic Statements (Vision & Mission)',
          aiStrategicStatements
        );
        console.log('Generated 07_ai_strategic_statements.md in', requirementsDir);
      } else {
        console.log('AI strategic statements could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Core Values and Project Purpose ---
    let aiCoreValuesAndPurpose: string | null = null;
    if (aiSummary && aiStrategicStatements) {
      aiCoreValuesAndPurpose = await getAiCoreValuesAndPurpose(aiSummary, aiStrategicStatements);
      if (aiCoreValuesAndPurpose) {
        console.log('AI-generated core values and project purpose created.');
        await generateMarkdownFile(
          requirementsDir,
          '08_ai_core_values_and_purpose.md',
          'AI-Generated Core Values and Project Purpose',
          aiCoreValuesAndPurpose
        );
        console.log('Generated 08_ai_core_values_and_purpose.md in', requirementsDir);
      } else {
        console.log('AI core values and project purpose could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Technology Stack Analysis ---
    let aiTechStackAnalysis: string | null = null;
    if (pkgJson && aiSummary) {
      aiTechStackAnalysis = await getAiTechStackAnalysis(pkgJson, aiSummary);
      if (aiTechStackAnalysis) {
        console.log('AI-generated technology stack analysis created.');
        await generateMarkdownFile(
          requirementsDir,
          '10_ai_tech_stack_analysis.md',
          'AI-Generated Technology Stack Analysis',
          aiTechStackAnalysis
        );
        console.log('Generated 10_ai_tech_stack_analysis.md in', requirementsDir);
      } else {
        console.log('AI tech stack analysis could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Data Model Suggestions ---
    let aiDataModelSuggestions: string | null = null;
    if (aiSummary && aiUserStories && aiPersonas) {
      aiDataModelSuggestions = await getAiDataModelSuggestions(aiSummary, aiUserStories, aiPersonas);
      if (aiDataModelSuggestions) {
        console.log('AI-generated data model suggestions created.');
        await generateMarkdownFile(
          requirementsDir,
          '11_ai_data_model_suggestions.md',
          'AI-Generated Data Model Suggestions',
          aiDataModelSuggestions
        );
        console.log('Generated 11_ai_data_model_suggestions.md in', requirementsDir);
      } else {
        console.log('AI data model suggestions could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Process Flow Suggestions ---
    let aiProcessFlowSuggestions: string | null = null;
    if (aiSummary && aiUserStories && aiKeyRolesAndNeeds) {
      aiProcessFlowSuggestions = await getAiProcessFlowSuggestions(aiSummary, aiUserStories, aiKeyRolesAndNeeds);
      if (aiProcessFlowSuggestions) {
        console.log('AI-generated process flow suggestions created.');
        await generateMarkdownFile(
          requirementsDir,
          '12_ai_process_flow_suggestions.md',
          'AI-Generated Process Flow Suggestions',
          aiProcessFlowSuggestions
        );
        console.log('Generated 12_ai_process_flow_suggestions.md in', requirementsDir);
      } else {
        console.log('AI process flow suggestions could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Initial Risk Analysis ---
    let aiRiskAnalysis: string | null = null;
    if (aiSummary) {
      aiRiskAnalysis = await getAiRiskAnalysis(
        aiSummary,
        aiTechStackAnalysis,
        aiDataModelSuggestions,
        aiProcessFlowSuggestions
      );
      if (aiRiskAnalysis) {
        console.log('AI-generated initial risk analysis created.');
        await generateMarkdownFile(
          requirementsDir,
          '13_ai_risk_analysis.md',
          'AI-Generated Initial Risk Analysis',
          aiRiskAnalysis
        );
        console.log('Generated 13_ai_risk_analysis.md in', requirementsDir);
      } else {
        console.log('AI risk analysis could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Compliance Considerations ---
    if (aiSummary && aiDataModelSuggestions && aiPersonas && aiKeyRolesAndNeeds) {
      const aiComplianceConsiderations = await getAiComplianceConsiderations(
        aiSummary,
        aiDataModelSuggestions,
        aiPersonas,
        aiKeyRolesAndNeeds
      );
      if (aiComplianceConsiderations) {
        console.log('AI-generated compliance considerations created.');
        await generateMarkdownFile(
          requirementsDir,
          '14_ai_compliance_considerations.md',
          'AI-Generated Compliance Considerations',
          aiComplianceConsiderations
        );
        console.log('Generated 14_ai_compliance_considerations.md in', requirementsDir);
      } else {
        console.log('AI compliance considerations could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated UI/UX Considerations ---
    if (aiSummary && aiUserStories && aiPersonas && aiKeyRolesAndNeeds) {
      const aiUiUxConsiderations = await getAiUiUxConsiderations(
        aiSummary,
        aiUserStories,
        aiPersonas,
        aiKeyRolesAndNeeds
      );
      if (aiUiUxConsiderations) {
        console.log('AI-generated UI/UX considerations created.');
        await generateMarkdownFile(
          requirementsDir,
          '15_ai_ui_ux_considerations.md',
          'AI-Generated UI/UX Considerations',
          aiUiUxConsiderations
        );
        console.log('Generated 15_ai_ui_ux_considerations.md in', requirementsDir);
      } else {
        console.log('AI UI/UX considerations could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated Project Kickoff Checklist ---
    if (aiSummary && aiUserStories && aiKeyRolesAndNeeds && aiTechStackAnalysis && aiRiskAnalysis) {
      const aiProjectKickoffChecklist = await getAiProjectKickoffChecklist(
        aiSummary,
        aiUserStories,
        aiKeyRolesAndNeeds,
        aiTechStackAnalysis,
        aiRiskAnalysis
      );
      if (aiProjectKickoffChecklist) {
        console.log('AI-generated project kickoff checklist created.');
        await generateMarkdownFile(
          requirementsDir,
          '16_ai_project_kickoff_checklist.md',
          'AI-Generated Project Kickoff Checklist',
          aiProjectKickoffChecklist
        );
        console.log('Generated 16_ai_project_kickoff_checklist.md in', requirementsDir);
      } else {
        console.log('AI project kickoff checklist could not be generated (API key missing or error).');
      }
    }

    // --- AI-Generated PMBOK Project Charter ---
    const projectCharterContext = {
      summaryAndGoals: aiSummary || '',
      strategicStatements: aiStrategicStatements,
      coreValuesAndPurpose: aiCoreValuesAndPurpose,
      keyRolesAndNeeds: aiKeyRolesAndNeeds,
      riskAnalysis: aiRiskAnalysis,
      personas: aiPersonas,
      techStackAnalysis: aiTechStackAnalysis
    };
    const aiProjectCharter = await getAiProjectCharter(projectCharterContext);
    if (aiProjectCharter) {
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Initiating'),
        '01_Project_Charter.md',
        'PMBOK® Project Charter (AI-Generated Draft)',
        aiProjectCharter
      );
      console.log('Generated PMBOK/Initiating/01_Project_Charter.md');
    } else {
      console.log('AI Project Charter could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Stakeholder Register ---
    const stakeholderRegisterContext = {
      aiPersonasOutput: aiPersonas,
      aiKeyRolesAndNeedsOutput: aiKeyRolesAndNeeds,
      aiSummaryAndGoalsOutput: aiSummary,
      projectCharterOutput: aiProjectCharter,
      readmeContent: readmeContent
    };
    const aiStakeholderRegister = await getAiStakeholderRegister(stakeholderRegisterContext);
    if (aiStakeholderRegister) {
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Initiating'),
        '02_Stakeholder_Register.md',
        'AI-Generated Stakeholder Register',
        aiStakeholderRegister
      );
      console.log('Generated PMBOK/Initiating/02_Stakeholder_Register.md');
    } else {
      console.log('AI Stakeholder Register could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Scope Management Plan ---
    const scopeManagementPlanContext = {
      projectCharterOutput: aiProjectCharter,
      stakeholderRegisterOutput: aiStakeholderRegister,
      aiSummaryAndGoalsOutput: aiSummary
    };
    const aiScopeManagementPlan = await getAiScopeManagementPlan(scopeManagementPlanContext);
    if (aiScopeManagementPlan) {
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '01_Scope_Management_Plan.md',
        'AI-Generated Scope Management Plan',
        aiScopeManagementPlan
      );
      console.log('Generated PMBOK/Planning/01_Scope_Management_Plan.md');
    } else {
      console.log('AI Scope Management Plan could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Requirements Management Plan ---
    const requirementsManagementPlanContext = {
      projectCharterOutput: aiProjectCharter,
      stakeholderRegisterOutput: aiStakeholderRegister,
      scopeManagementPlanOutput: aiScopeManagementPlan,
      aiSummaryAndGoalsOutput: aiSummary
    };
    const aiRequirementsManagementPlan = await getAiRequirementsManagementPlan(requirementsManagementPlanContext);
    if (aiRequirementsManagementPlan) {
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '02_Requirements_Management_Plan.md',
        'AI-Generated Requirements Management Plan',
        aiRequirementsManagementPlan
      );
      console.log('Generated PMBOK/Planning/02_Requirements_Management_Plan.md');
    } else {
      console.log('AI Requirements Management Plan could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Project Scope Statement ---
    const projectScopeStatementContext = {
      projectCharterOutput: aiProjectCharter,
      stakeholderRegisterOutput: aiStakeholderRegister,
      scopeManagementPlanOutput: aiScopeManagementPlan,
      requirementsManagementPlanOutput: aiRequirementsManagementPlan,
      aiSummaryAndGoalsOutput: aiSummary,
      aiUserStoriesOutput: aiUserStories,
      aiAcceptanceCriteriaOutput: null, // If you want to include acceptance criteria, pass it here
      aiKeyRolesAndNeedsOutput: aiKeyRolesAndNeeds,
      aiUiUxConsiderationsOutput: null, // If you want to include UI/UX, pass it here
      aiRiskAnalysisOutput: aiRiskAnalysis
    };
    const aiProjectScopeStatement = await getAiProjectScopeStatement(projectScopeStatementContext);
    if (aiProjectScopeStatement) {
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '03_Project_Scope_Statement.md',
        'AI-Generated Project Scope Statement',
        aiProjectScopeStatement
      );
      console.log('Generated PMBOK/Planning/03_Project_Scope_Statement.md');
    } else {
      console.log('AI Project Scope Statement could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Work Breakdown Structure (WBS) ---
    const wbsContext = {
      projectScopeStatementOutput: aiProjectScopeStatement,
      aiUserStoriesOutput: aiUserStories,
      aiProcessFlowsOutput: aiProcessFlowSuggestions
    };
    const aiWbs = await getAiWbs(wbsContext);
    if (aiWbs) {
      console.log('AI-generated Work Breakdown Structure (WBS) created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '04_Work_Breakdown_Structure.md',
        'AI-Generated Work Breakdown Structure (WBS)',
        aiWbs
      );
      console.log('Generated PMBOK/Planning/04_Work_Breakdown_Structure.md');
    } else {
      console.log('AI Work Breakdown Structure could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK WBS Dictionary ---
    const wbsDictionaryContext = {
      wbsOutput: aiWbs,
      projectScopeStatementOutput: aiProjectScopeStatement,
      aiUserStoriesOutput: aiUserStories,
      aiAcceptanceCriteriaOutput: null, // If you want to include acceptance criteria, pass it here
      aiKeyRolesAndNeedsOutput: aiKeyRolesAndNeeds,
      stakeholderRegisterOutput: aiStakeholderRegister
    };
    const aiWbsDictionary = await getAiWbsDictionary(wbsDictionaryContext);
    if (aiWbsDictionary) {
      console.log('AI-generated WBS Dictionary created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '05_WBS_Dictionary.md',
        'AI-Generated WBS Dictionary',
        aiWbsDictionary
      );
      console.log('Generated PMBOK/Planning/05_WBS_Dictionary.md');
    } else {
      console.log('AI WBS Dictionary could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Activity List ---
    const activityListContext = {
      wbsOutput: aiWbs,
      wbsDictionaryOutput: aiWbsDictionary,
      projectScopeStatementOutput: aiProjectScopeStatement,
      aiUserStoriesOutput: aiUserStories
    };
    const aiActivityList = await getAiActivityList(activityListContext);
    if (aiActivityList) {
      console.log('AI-generated Activity List created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '06_Activity_List.md',
        'AI-Generated Activity List',
        aiActivityList
      );
      console.log('Generated PMBOK/Planning/06_Activity_List.md');
    } else {
      console.log('AI Activity List could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Activity Attributes ---
    const activityAttributesContext = {
      activityListOutput: aiActivityList,
      wbsDictionaryOutput: aiWbsDictionary,
      projectScopeStatementOutput: aiProjectScopeStatement,
      aiRiskAnalysisOutput: aiRiskAnalysis,
      aiTechStackAnalysisOutput: aiTechStackAnalysis
    };
    const aiActivityAttributes = await getAiActivityAttributes(activityAttributesContext);
    if (aiActivityAttributes) {
      console.log('AI-generated Activity Attributes created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '07_Activity_Attributes.md',
        'AI-Generated Activity Attributes',
        aiActivityAttributes
      );
      console.log('Generated PMBOK/Planning/07_Activity_Attributes.md');
    } else {
      console.log('AI Activity Attributes could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Milestone List ---
    const milestoneListContext = {
      activityListOutput: aiActivityList,
      activityAttributesOutput: aiActivityAttributes,
      wbsOutput: aiWbs,
      projectScopeStatementOutput: aiProjectScopeStatement,
      projectCharterOutput: aiProjectCharter
    };
    const aiMilestoneList = await getAiMilestoneList(milestoneListContext);
    if (aiMilestoneList) {
      console.log('AI-generated Milestone List created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '08_Milestone_List.md',
        'AI-Generated Milestone List',
        aiMilestoneList
      );
      console.log('Generated PMBOK/Planning/08_Milestone_List.md');
    } else {
      console.log('AI Milestone List could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Schedule Network Diagram ---
    const scheduleNetworkDiagramContext = {
      activityListOutput: aiActivityList,
      activityAttributesOutput: aiActivityAttributes,
      milestoneListOutput: aiMilestoneList
    };
    const aiScheduleNetworkDiagram = await getAiScheduleNetworkDiagram(scheduleNetworkDiagramContext);
    if (aiScheduleNetworkDiagram) {
      console.log('AI-generated Project Schedule Network Diagram created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '09_Schedule_Network_Diagram.md',
        'AI-Generated Project Schedule Network Diagram (Description & Mermaid)',
        aiScheduleNetworkDiagram
      );
      console.log('Generated PMBOK/Planning/09_Schedule_Network_Diagram.md');
    } else {
      console.log('AI Schedule Network Diagram could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Activity Duration Estimates ---
    const activityDurationEstimatesContext = {
      activityListOutput: aiActivityList,
      activityAttributesOutput: aiActivityAttributes,
      wbsDictionaryOutput: aiWbsDictionary,
      aiRiskAnalysisOutput: aiRiskAnalysis,
      aiTechStackAnalysisOutput: aiTechStackAnalysis
    };
    const aiActivityDurationEstimates = await getAiActivityDurationEstimates(activityDurationEstimatesContext);
    if (aiActivityDurationEstimates) {
      console.log('AI-generated Activity Duration Estimates (Initial Assessment) created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '10_Activity_Duration_Estimates.md',
        'AI-Generated Activity Duration Estimates (Initial Assessment)',
        aiActivityDurationEstimates
      );
      console.log('Generated PMBOK/Planning/10_Activity_Duration_Estimates.md');
    } else {
      console.log('AI Activity Duration Estimates could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Activity Resource Estimates ---
    const activityResourceEstimatesContext = {
      activityListOutput: aiActivityList,
      activityAttributesOutput: aiActivityAttributes,
      wbsDictionaryOutput: aiWbsDictionary,
      activityDurationEstimatesOutput: aiActivityDurationEstimates,
      aiTechStackAnalysisOutput: aiTechStackAnalysis,
      stakeholderRegisterOutput: aiStakeholderRegister
    };
    const aiActivityResourceEstimates = await getAiActivityResourceEstimates(activityResourceEstimatesContext);
    if (aiActivityResourceEstimates) {
      console.log('AI-generated Activity Resource Estimates (Initial Assessment) created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '11_Activity_Resource_Estimates.md',
        'AI-Generated Activity Resource Estimates (Initial Assessment)',
        aiActivityResourceEstimates
      );
      console.log('Generated PMBOK/Planning/11_Activity_Resource_Estimates.md');
    } else {
      console.log('AI Activity Resource Estimates could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Develop Schedule Input Document ---
    const developScheduleContext = {
      activityListOutput: aiActivityList,
      activityAttributesOutput: aiActivityAttributes,
      activityDurationEstimatesOutput: aiActivityDurationEstimates,
      activityResourceEstimatesOutput: aiActivityResourceEstimates,
      scheduleNetworkDiagramOutput: aiScheduleNetworkDiagram,
      milestoneListOutput: aiMilestoneList,
      projectScopeStatementOutput: aiProjectScopeStatement
    };
    const aiDevelopScheduleInput = await getAiDevelopScheduleInput(developScheduleContext);
    if (aiDevelopScheduleInput) {
      console.log('AI-generated Develop Schedule Input document created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '12_Develop_Schedule_Input.md',
        'AI-Generated Develop Schedule Input (PMBOK Planning)',
        aiDevelopScheduleInput
      );
      console.log('Generated PMBOK/Planning/12_Develop_Schedule_Input.md');
    } else {
      console.log('AI Develop Schedule Input could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Schedule Management Plan ---
    const scheduleManagementPlanContext = {
      projectCharterOutput: aiProjectCharter,
      projectScopeStatementOutput: aiProjectScopeStatement,
      developScheduleInputOutput: aiDevelopScheduleInput,
      aiSummaryAndGoalsOutput: aiSummary
    };
    const aiScheduleManagementPlan = await getAiScheduleManagementPlan(scheduleManagementPlanContext);
    if (aiScheduleManagementPlan) {
      console.log('AI-generated Schedule Management Plan created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '13_Schedule_Management_Plan.md',
        'AI-Generated Schedule Management Plan',
        aiScheduleManagementPlan
      );
      console.log('Generated PMBOK/Planning/13_Schedule_Management_Plan.md');
    } else {
      console.log('AI Schedule Management Plan could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Cost Management Plan ---
    const costManagementPlanContext = {
      projectCharterOutput: aiProjectCharter,
      projectScopeStatementOutput: aiProjectScopeStatement,
      scheduleManagementPlanOutput: aiScheduleManagementPlan,
      wbsOutput: aiWbs,
      wbsDictionaryOutput: aiWbsDictionary,
      activityResourceEstimatesOutput: aiActivityResourceEstimates,
      aiRiskAnalysisOutput: aiRiskAnalysis,
      aiSummaryAndGoalsOutput: aiSummary
    };
    const aiCostManagementPlan = await getAiCostManagementPlan(costManagementPlanContext);
    if (aiCostManagementPlan) {
      console.log('AI-generated Cost Management Plan created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '14_Cost_Management_Plan.md',
        'AI-Generated Cost Management Plan',
        aiCostManagementPlan
      );
      console.log('Generated PMBOK/Planning/14_Cost_Management_Plan.md');
    } else {
      console.log('AI Cost Management Plan could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Communications Management Plan ---
    const communicationsManagementPlanContext = {
      projectCharterOutput: aiProjectCharter,
      projectScopeStatementOutput: aiProjectScopeStatement,
      stakeholderRegisterOutput: aiStakeholderRegister,
      aiSummaryAndGoalsOutput: aiSummary
    };
    const aiCommunicationsManagementPlan = await getAiCommunicationsManagementPlan(communicationsManagementPlanContext);
    if (aiCommunicationsManagementPlan) {
      console.log('AI-generated Communications Management Plan created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '17_Communications_Management_Plan.md',
        'AI-Generated Communications Management Plan',
        aiCommunicationsManagementPlan
      );
      console.log('Generated PMBOK/Planning/17_Communications_Management_Plan.md');
    } else {
      console.log('AI Communications Management Plan could not be generated (API key missing or error).');
    }

    // --- AI-Generated PMBOK Stakeholder Engagement Plan ---
    const aiResourceManagementPlan = null; // Placeholder, as there is no AI Resource Management Plan function
    const stakeholderEngagementPlanContext = {
      stakeholderRegisterOutput: aiStakeholderRegister,
      communicationsManagementPlanOutput: aiCommunicationsManagementPlan,
      projectCharterOutput: aiProjectCharter,
      resourceManagementPlanOutput: aiResourceManagementPlan,
      aiKeyRolesAndNeedsOutput: aiKeyRolesAndNeeds,
      aiSummaryAndGoalsOutput: aiSummary
    };
    const aiStakeholderEngagementPlan = await getAiStakeholderEngagementPlan(stakeholderEngagementPlanContext);
    if (aiStakeholderEngagementPlan) {
      console.log('AI-generated Stakeholder Engagement Plan created.');
      await generateMarkdownFile(
        path.join(process.cwd(), 'PMBOK_Documents/Planning'),
        '20_Stakeholder_Engagement_Plan.md',
        'AI-Generated Stakeholder Engagement Plan',
        aiStakeholderEngagementPlan
      );
      console.log('Generated PMBOK/Planning/20_Stakeholder_Engagement_Plan.md');
    } else {
      console.log('AI Stakeholder Engagement Plan could not be generated (API key missing or error).');
    }

    console.log('Requirements Gathering Agent finished.');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();
