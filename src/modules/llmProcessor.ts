import OpenAI from 'openai';

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
} else {
    console.warn('OPENAI_API_KEY environment variable not set. LLM functionalities will be skipped.');
}

/**
 * Uses OpenAI to generate a project summary and business goals from text content.
 * @param textContent - The README.md or project description text.
 * @returns The AI-generated summary and goals, or null if unavailable.
 */
export async function getAiSummaryAndGoals(textContent: string): Promise<string | null> {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI summary.');
        return null;
    }

    const prompt = `\nAnalyze the following project description extracted from its README.md file.\nProvide a concise summary of the project.\nThen, identify and list its main business goals or objectives.\nFormat the output clearly with headings for \"Project Summary\" and \"Business Goals\".\n\nProject Description:\n---\n${textContent}\n---\n`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return null;
    }
}

/**
 * Uses OpenAI to generate user stories from project context.
 * @param projectContext - The project summary or description.
 * @returns The AI-generated user stories, or null if unavailable.
 */
export async function getAiUserStories(projectContext: string): Promise<string | null> {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI user stories.');
        return null;
    }

    const prompt = `Based on the following project description, please generate a list of user stories.\nTry to identify 2-4 potential key user roles for this project and generate 2-3 user stories for each role.\nFormat each user story as: \"As a [type of user], I want [an action] so that [a benefit/value].\"\n\nProject Description:\n---\n${projectContext}\n---\n\nUser Stories:`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
        console.error('Error calling OpenAI API for user stories:', error);
        return null;
    }
}

/**
 * Uses OpenAI to generate user personas from project context and user stories.
 * @param projectContext - The project summary or description.
 * @param userStoriesContent - The user stories content (optional, for richer context).
 * @returns The AI-generated user personas, or null if unavailable.
 */
export async function getAiPersonas(
  projectContext: string,
  userStoriesContent?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI personas.');
    return null;
  }

  const prompt = `Based on the following project description and user stories (if provided), please generate 2-4 detailed user personas.\nFor each persona, include:\n- Fictional Name: [Name]\n- Role: [Role]\n- Description/Background: [1-2 sentences]\n- Key Goals (related to this project):\n  - [Goal 1]\n  - [Goal 2]\n- Potential Frustrations/Pain Points (this project could address):\n  - [Frustration 1]\n  - [Frustration 2]\n\nProject Description:\n---\n${projectContext}\n---\n\n${userStoriesContent ? `User Stories (for context on roles and needs):\n---\n${userStoriesContent}\n---\n` : ''}\nUser Personas:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for personas:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate acceptance criteria for user stories.
 * @param userStoriesContent - The user stories content.
 * @returns The AI-generated acceptance criteria, or null if unavailable.
 */
export async function getAiAcceptanceCriteria(userStoriesContent: string): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI acceptance criteria.');
    return null;
  }

  const prompt = `For each of the following user stories, please generate 3-5 specific and testable acceptance criteria.\nPlease format the acceptance criteria clearly under each user story.\nWhere possible, use the "Given [context or precondition], When [action is performed], Then [expected outcome]" format.\nIf the Given-When-Then format is not a natural fit for a specific criterion, use a clear, actionable bullet point.\n\nUser Stories:\n---\n${userStoriesContent}\n---\n\nAcceptance Criteria:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for acceptance criteria:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate Vision and Mission statements from project summary and goals.
 * @param projectSummaryAndGoals - The AI-generated project summary and business goals.
 * @returns The AI-generated Vision and Mission statements, or null if unavailable.
 */
export async function getAiStrategicStatements(projectSummaryAndGoals: string): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI strategic statements.');
    return null;
  }

  const prompt = `Based on the following project summary and business goals, please generate a Vision Statement and a Mission Statement for the project.\n\nProject Summary and Business Goals:\n---\n${projectSummaryAndGoals}\n---\n\nGenerated Statements:\n## Vision Statement\n[LLM generates Vision Statement here]\n\n## Mission Statement\n[LLM generates Mission Statement here]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for strategic statements:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate Core Values and Project Purpose from project summary, goals, vision, and mission.
 * @param projectSummaryAndGoals - The AI-generated project summary and business goals.
 * @param visionAndMission - The AI-generated vision and mission statements.
 * @returns The AI-generated Core Values and Project Purpose, or null if unavailable.
 */
export async function getAiCoreValuesAndPurpose(
  projectSummaryAndGoals: string,
  visionAndMission: string
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI core values and purpose.');
    return null;
  }

  const prompt = `Based on the following project summary, business goals, vision, and mission statements, please:\n1. Generate a list of 3-5 Core Values that should guide this project. For each value, provide a short phrase and a brief explanation.\n2. Generate a Project Purpose statement that articulates the fundamental 'why' behind this project's existence, focusing on its intended impact or contribution.\n\nProject Summary and Business Goals:\n---\n${projectSummaryAndGoals}\n---\n\nVision and Mission Statements:\n---\n${visionAndMission}\n---\n\nGenerated Core Values and Project Purpose:\n## Core Values\n- **[Value 1 Title]:** [Brief explanation]\n- **[Value 2 Title]:** [Brief explanation]\n- ...\n\n## Project Purpose\n[LLM generates Project Purpose statement here]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for core values and purpose:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate key user roles and their needs from project context, user stories, and personas.
 * @param projectContext - The AI-generated project summary and business goals.
 * @param userStories - The AI-generated user stories (optional).
 * @param personas - The AI-generated user personas (optional).
 * @returns The AI-generated key roles and needs, or null if unavailable.
 */
export async function getAiKeyRolesAndNeeds(
  projectContext: string,
  userStories?: string | null,
  personas?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI key roles and needs.');
    return null;
  }

  const prompt = `Based on the provided project context, user stories, and user personas, please:\n1. Identify the distinct key user roles involved in or interacting with this project.\n2. For each identified role, summarize their primary needs, objectives, or key interactions related to this project.\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${userStories ? `User Stories:\n---\n${userStories}\n---\n` : ''}${personas ? `User Personas:\n---\n${personas}\n---\n` : ''}\nIdentified Roles and Their Needs:\n## Key User Roles and Needs\n\n### [Role Name 1 e.g., End User]\n- [Primary Need/Objective 1 for this role]\n- [Primary Need/Objective 2 for this role]\n\n### [Role Name 2 e.g., Administrator]\n- [Primary Need/Objective 1 for this role]\n- [Primary Need/Objective 2 for this role]\n\n(And so on for other identified roles)`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for key roles and needs:', error);
    return null;
  }
}

/**
 * Uses OpenAI to analyze and describe the technology stack from package.json and project summary.
 * @param packageJsonData - The parsed package.json object.
 * @param projectSummary - The AI-generated project summary and goals (optional).
 * @returns The AI-generated tech stack analysis, or null if unavailable.
 */
export async function getAiTechStackAnalysis(
  packageJsonData: Record<string, any>,
  projectSummary?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI tech stack analysis.');
    return null;
  }

  const prompt = `Based on the following package.json data and the project summary (if provided), please analyze and describe the project's technology stack.\n\nPackage.json Dependencies:\n---\nDependencies: ${JSON.stringify(packageJsonData.dependencies || {})}\nDevDependencies: ${JSON.stringify(packageJsonData.devDependencies || {})}\n---\n\n${projectSummary ? `Project Summary & Goals:\n---\n${projectSummary}\n---\n` : ''}\nTechnology Stack Analysis:\nPlease provide:\n1.  A list of key technologies, libraries, and frameworks used.\n2.  Categorize them (e.g., Frontend, Backend, Database, Testing, Build Tools, Linting/Formatting, etc.).\n3.  A brief explanation of the role of the main technologies, particularly how they might support the project's goals as described in the summary.\n\nOutput should be structured with headings for categories. For example:\n\n## Technology Stack Overview\n\n### Frontend\n- **[Technology Name e.g., React]:** [Brief explanation of its role in this project]\n- ...\n\n### Backend\n- **[Technology Name e.g., Express.js]:** [Brief explanation of its role in this project]\n- ...\n\n### Database\n- (If identifiable from drivers or common patterns, e.g., "Likely uses a NoSQL database like MongoDB due to [driver] or common pairing with [framework]")\n- ...\n\n### Testing\n- **[Technology Name e.g., Jest]:** [Explanation]\n- ...\n\n### Build Tools & Utilities\n- **[Technology Name e.g., Webpack, ESLint]:** [Explanation]\n- ...\n\n### Overall Architecture Notes (Optional):\n[Any LLM inferences about how these components might work together or architectural patterns suggested by the stack and project summary.]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for tech stack analysis:', error);
    return null;
  }
}

/**
 * Uses OpenAI to suggest a conceptual data model from project context, user stories, and personas.
 * @param projectContext - The AI-generated project summary and business goals.
 * @param userStories - The AI-generated user stories (optional).
 * @param personas - The AI-generated user personas (optional).
 * @returns The AI-generated data model suggestions, or null if unavailable.
 */
export async function getAiDataModelSuggestions(
  projectContext: string,
  userStories?: string | null,
  personas?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI data model suggestions.');
    return null;
  }

  const prompt = `Based on the following project context, user stories, and user personas, please suggest a conceptual data model.\nFor this model:\n1.  Identify the key data entities.\n2.  For each entity, list its important attributes and suggest basic data types (e.g., String, Number, Boolean, Date, Array of [Type], Reference to [OtherEntity]).\n3.  Describe the primary relationships between these entities (e.g., one-to-one, one-to-many, many-to-many).\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${userStories ? `User Stories:\n---\n${userStories}\n---\n` : ''}${personas ? `User Personas:\n---\n${personas}\n---\n` : ''}\nSuggested Data Model:\n## Data Entities and Attributes\n\n### [Entity Name 1 e.g., User]\n- Attributes:\n    - id: String (Primary Key)\n    - ...\n- Relationships:\n    - ...\n\n### [Entity Name 2 e.g., Post]\n- Attributes:\n    - id: String (Primary Key)\n    - ...\n- Relationships:\n    - ...\n\n(And so on for other identified entities)\n\n## Summary of Relationships\n- ...`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for data model suggestions:', error);
    return null;
  }
}

/**
 * Uses OpenAI to suggest key process flows from project context, user stories, and key roles/needs.
 * @param projectContext - The AI-generated project summary and business goals.
 * @param userStories - The AI-generated user stories (optional).
 * @param keyRolesAndNeeds - The AI-generated key roles and needs (optional).
 * @returns The AI-generated process flow suggestions, or null if unavailable.
 */
export async function getAiProcessFlowSuggestions(
  projectContext: string,
  userStories?: string | null,
  keyRolesAndNeeds?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI process flow suggestions.');
    return null;
  }

  const prompt = `Based on the following project context, user stories, and key roles/needs, please:\n1.  Identify 2-3 key high-level user flows or system processes.\n2.  For each identified process, provide a step-by-step textual description of how it works.\n3.  For one or two of these processes, also generate a simple flowchart representation using Mermaid.js syntax (e.g., using 'graph TD').\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${userStories ? `User Stories:\n---\n${userStories}\n---\n` : ''}${keyRolesAndNeeds ? `Key Roles and Needs:\n---\n${keyRolesAndNeeds}\n---\n` : ''}\nSuggested Process Flows:\n## Key Process Flow 1: [Name of Process e.g., User Registration]\n\n**Textual Description:**\n1. ...\n\n**Mermaid Flowchart (Optional):**\n\n\`\`\`mermaid\ngraph TD\n    ...\n\`\`\`\n\n## Key Process Flow 2: [Name of Process e.g., Submitting a New Item]\n... (similar structure) ...`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for process flow suggestions:', error);
    return null;
  }
}

/**
 * Uses OpenAI to perform an initial risk analysis from project context, tech stack, data model, and process flows.
 * @param projectContext - The AI-generated project summary and business goals.
 * @param techStackAnalysis - The AI-generated tech stack analysis (optional).
 * @param dataModelSuggestions - The AI-generated data model suggestions (optional).
 * @param processFlows - The AI-generated process flow suggestions (optional).
 * @returns The AI-generated risk analysis, or null if unavailable.
 */
export async function getAiRiskAnalysis(
  projectContext: string,
  techStackAnalysis?: string | null,
  dataModelSuggestions?: string | null,
  processFlows?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI risk analysis.');
    return null;
  }

  const prompt = `Based on the following project information (summary, goals, tech stack, data model, and process flows if provided), please perform an initial risk analysis.\nFor this analysis:\n1.  Identify potential risks associated with the project.\n2.  Categorize these risks (e.g., Technical, Project Management, Security, Data-related, External, Scope).\n3.  For each risk, provide a brief description.\n4.  Where possible, suggest a mitigation strategy or an area for further investigation.\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${techStackAnalysis ? `Technology Stack Analysis:\n---\n${techStackAnalysis}\n---\n` : ''}${dataModelSuggestions ? `Data Model Suggestions:\n---\n${dataModelSuggestions}\n---\n` : ''}${processFlows ? `Process Flow Suggestions:\n---\n${processFlows}\n---\n` : ''}\nInitial Risk Analysis:\n## Risk Analysis\n\n### Technical Risks\n- **Risk:** [e.g., Complexity of integrating new AI model]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Conduct a proof-of-concept, allocate extra time for R&D]\n- ...\n\n### Project Management Risks\n- **Risk:** [e.g., Unclear scope for advanced features]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Prioritize features using MoSCoW, phased rollout]\n- ...\n\n### Security Risks\n- **Risk:** [e.g., Handling sensitive user data]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Implement encryption, conduct security audit, ensure compliance with data privacy regulations like GDPR/CCPA]\n- ...\n\n(And so on for other identified risk categories and risks)`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for risk analysis:', error);
    return null;
  }
}

/**
 * Uses OpenAI to suggest compliance considerations from project context, data model, personas, and key roles/needs.
 * @param projectContext - The AI-generated project summary and business goals.
 * @param dataModelSuggestions - The AI-generated data model suggestions (optional).
 * @param personas - The AI-generated user personas (optional).
 * @param keyRolesAndNeeds - The AI-generated key roles and needs (optional).
 * @returns The AI-generated compliance considerations, or null if unavailable.
 */
export async function getAiComplianceConsiderations(
  projectContext: string,
  dataModelSuggestions?: string | null,
  personas?: string | null,
  keyRolesAndNeeds?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI compliance considerations.');
    return null;
  }

  const prompt = `Based on the following project information (summary, goals, data model, personas, and roles/needs if provided), please identify potential compliance considerations.\nFor each area, briefly explain its relevance and suggest key aspects to investigate for this project.\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${dataModelSuggestions ? `Data Model Suggestions:\n---\n${dataModelSuggestions}\n---\n` : ''}${personas ? `User Personas:\n---\n${personas}\n---\n` : ''}${keyRolesAndNeeds ? `Key Roles and Needs:\n---\n${keyRolesAndNeeds}\n---\n` : ''}\nPotential Compliance Considerations:\n## Compliance Considerations\n\n### [e.g., Data Privacy - GDPR/CCPA]\n- **Relevance:** [e.g., If the project handles personal data of users, especially from Europe or California.]\n- **Key Aspects to Investigate:**\n    - [e.g., Data minimization principles.]\n    - [e.g., User consent mechanisms for data collection and processing.]\n    - [e.g., Data subject rights (access, rectification, erasure).]\n    - [e.g., Secure storage and transmission of personal data.]\n    - [e.g., Data breach notification procedures.]\n\n### [e.g., Accessibility - WCAG]\n- **Relevance:** [e.g., If the project involves a user interface, ensuring it's usable by people with disabilities.]\n- **Key Aspects to Investigate:**\n    - [e.g., Keyboard navigability.]\n    - [e.g., Screen reader compatibility.]\n    - [e.g., Sufficient color contrast.]\n    - [e.g., Alt text for images.]\n\n### [e.g., Industry-Specific Regulation - if inferable, like HIPAA for a health app]\n- **Relevance:** [Brief explanation]\n- **Key Aspects to Investigate:**\n    - ...\n\n(And so on for other potential compliance areas)`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for compliance considerations:', error);
    return null;
  }
}

/**
 * Uses OpenAI to suggest UI/UX considerations from project context, user stories, personas, and key roles/needs.
 * @param projectContext - The AI-generated project summary and business goals.
 * @param userStories - The AI-generated user stories (optional).
 * @param personas - The AI-generated user personas (optional).
 * @param keyRolesAndNeeds - The AI-generated key roles and needs (optional).
 * @returns The AI-generated UI/UX considerations, or null if unavailable.
 */
export async function getAiUiUxConsiderations(
  projectContext: string,
  userStories?: string | null,
  personas?: string | null,
  keyRolesAndNeeds?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI UI/UX considerations.');
    return null;
  }

  const prompt = `Based on the following project context, user stories, personas, and key roles/needs, please provide high-level UI/UX considerations for this project.\nInclude:\n1.  Key UI Screens/Views/Components: List the major screens or interactive parts the system will likely need.\n2.  General UI/UX Principles: Suggest 2-3 guiding principles for the design (e.g., clarity, efficiency, accessibility).\n3.  Persona-Specific Needs: Highlight any UI/UX considerations derived from the personas or user stories.\n4.  Non-Functional UI/UX Aspects: Mention important qualities like responsiveness, intuitiveness, etc.\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${userStories ? `User Stories:\n---\n${userStories}\n---\n` : ''}${personas ? `User Personas:\n---\n${personas}\n---\n` : ''}${keyRolesAndNeeds ? `Key Roles and Needs:\n---\n${keyRolesAndNeeds}\n---\n` : ''}\nUI/UX Considerations:\n## UI/UX Considerations\n\n### Key UI Screens/Views/Components\n- ...\n\n### General UI/UX Principles\n- **[Principle 1]:** ...\n- **[Principle 2]:** ...\n\n### Persona-Specific UI/UX Needs\n- ...\n\n### Non-Functional UI/UX Aspects\n- **Responsiveness:** ...\n- **Intuitiveness:** ...\n- **Consistency:** ...\n- **Performance:** ...\n- **Accessibility:** ...`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for UI/UX considerations:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a tailored project kickoff / requirements gathering checklist.
 * @param projectContext - The AI-generated project summary and business goals.
 * @param userStories - The AI-generated user stories (optional).
 * @param keyRolesAndNeeds - The AI-generated key roles and needs (optional).
 * @param techStackAnalysis - The AI-generated tech stack analysis (optional).
 * @param riskAnalysis - The AI-generated risk analysis (optional).
 * @returns The AI-generated project kickoff checklist, or null if unavailable.
 */
export async function getAiProjectKickoffChecklist(
  projectContext: string,
  userStories?: string | null,
  keyRolesAndNeeds?: string | null,
  techStackAnalysis?: string | null,
  riskAnalysis?: string | null
): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI project kickoff checklist.');
    return null;
  }

  const prompt = `Based on the provided project summary, user stories, roles/needs, tech stack, and risk analysis, please generate a tailored Project Kickoff / Requirements Gathering Checklist.\nThis checklist should guide the team on essential next steps and considerations to ensure a successful project start.\nStructure it as a markdown checklist.\n\nProject Context & Summary:\n---\n${projectContext}\n---\n${userStories ? `User Stories:\n---\n${userStories}\n---\n` : ''}${keyRolesAndNeeds ? `Key Roles and Needs:\n---\n${keyRolesAndNeeds}\n---\n` : ''}${techStackAnalysis ? `Technology Stack Analysis:\n---\n${techStackAnalysis}\n---\n` : ''}${riskAnalysis ? `Risk Analysis:\n---\n${riskAnalysis}\n---\n` : ''}\n\nProject Kickoff / Requirements Gathering Checklist:\n## Project Kickoff & Requirements Gathering Checklist\n\n### I. Stakeholder Engagement & Alignment\n- [ ] Identify all key stakeholders (refer to Personas and Roles & Needs documents).\n- [ ] Schedule initial interviews/workshops with key stakeholders to validate and elaborate on generated requirements.\n- [ ] Confirm project vision, mission, and core values with stakeholders (refer to generated strategic documents).\n- [ ] Establish a communication plan and regular check-in cadence.\n\n### II. Scope Definition & Validation\n- [ ] Review and refine the AI-generated Project Summary and Business Goals.\n- [ ] Validate User Stories and Acceptance Criteria with stakeholders and domain experts.\n- [ ] Clearly define what is in scope and out of scope for the initial phase/MVP.\n- [ ] Discuss and confirm project priorities (e.g., using MoSCoW with User Stories).\n\n### III. Technical & Resource Planning\n- [ ] Review the AI-generated Tech Stack Analysis. Conduct deeper feasibility checks for key technologies.\n- [ ] Validate the AI-generated Data Model Suggestions and plan for detailed data modeling.\n- [ ] Discuss and plan for system integrations if any are implied by the project context.\n- [ ] Assess team skills against the proposed tech stack and identify any gaps.\n- [ ] High-level estimation of effort and resources for initial phases.\n\n### IV. Risk & Compliance Review\n- [ ] Review the AI-generated Risk Analysis. Brainstorm additional risks and refine mitigation strategies.\n- [ ] Review the AI-generated Compliance Considerations. Plan for necessary legal/expert consultations.\n- [ ] Discuss security requirements based on data sensitivity and project nature.\n\n### V. Design & Development Preparation\n- [ ] Review AI-generated UI/UX Considerations. Plan for initial wireframing or prototyping.\n- [ ] Review AI-generated Process Flow Suggestions. Detail out critical workflows.\n- [ ] Set up development, testing, and staging environments.\n- [ ] Define coding standards and development practices.\n\n### VI. Defining Success & Next Steps\n- [ ] Define measurable success metrics or KPIs for the project or its initial phase.\n- [ ] Outline a high-level project roadmap or timeline.\n- [ ] Assign action items and owners for next steps coming out of the kickoff.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for project kickoff checklist:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned Project Charter from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Project Charter, or null if unavailable.
 */
export async function getAiProjectCharter(contextBundle: {
  summaryAndGoals: string,
  strategicStatements?: string | null,
  coreValuesAndPurpose?: string | null,
  keyRolesAndNeeds?: string | null,
  riskAnalysis?: string | null,
  personas?: string | null,
  techStackAnalysis?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Project Charter.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a draft Project Charter according to the PMBOK® Guide (Initiating Process Group).

**Instructions:**
- Structure the charter using standard PMBOK section headings.
- For each section, use clear, concise, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder (e.g., "**TBD by Project Manager**").
- Where appropriate, reference related documents by name and path, e.g., (Refer to 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md' for detailed stakeholder information).

**Required Sections:**
1. Project Purpose/Justification
2. Measurable Project Objectives and Success Criteria
3. High-Level Requirements
4. High-Level Project Description and Boundaries
5. Overall Project Risk
6. Key Stakeholder List (Refer to 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md' for details)
7. Milestone Schedule (If no specific milestones are inferable from the context, state **TBD by Project Manager**. Otherwise, list any very high-level, logical milestones suggested by the project summary or goals, clearly marking them as preliminary.)
8. Summary Budget/Financial Resources (**TBD by Project Manager** or provide high-level suggestions)

**Project Documentation Provided:**
- Project Summary and Goals:
---
${contextBundle.summaryAndGoals}
---
${contextBundle.strategicStatements ? `Strategic Statements:\n---\n${contextBundle.strategicStatements}\n---\n` : ''}${contextBundle.coreValuesAndPurpose ? `Core Values and Purpose:\n---\n${contextBundle.coreValuesAndPurpose}\n---\n` : ''}${contextBundle.keyRolesAndNeeds ? `Key Roles and Needs:\n---\n${contextBundle.keyRolesAndNeeds}\n---\n` : ''}${contextBundle.riskAnalysis ? `Risk Analysis:\n---\n${contextBundle.riskAnalysis}\n---\n` : ''}${contextBundle.personas ? `Personas:\n---\n${contextBundle.personas}\n---\n` : ''}${contextBundle.techStackAnalysis ? `Tech Stack Analysis:\n---\n${contextBundle.techStackAnalysis}\n---\n` : ''}

**Output Format:**
- Markdown with clear section headings.
- Explicitly label any placeholders or items requiring further input.

If any required section cannot be completed with the provided information, include the section with a "**TBD by Project Manager**" note.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Project Charter:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned Stakeholder Register from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Stakeholder Register, or null if unavailable.
 */
export async function getAiStakeholderRegister(contextBundle: {
  aiPersonasOutput?: string | null,
  aiKeyRolesAndNeedsOutput?: string | null,
  aiSummaryAndGoalsOutput?: string | null,
  projectCharterOutput?: string | null,
  readmeContent?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Stakeholder Register.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a draft Stakeholder Register according to the PMBOK® Guide (Initiating Process Group).

**Instructions:**
- For each identified stakeholder or stakeholder group, provide the information below.
- Use clear, concise, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder: "**TBD by Project Manager**".
- Where appropriate, reference related documents by name and path, e.g., (Refer to 'PMBOK_Documents/Initiating/01_Project_Charter.md' for project purpose and objectives).

**Required Fields for Each Stakeholder:**
- **Name/Role:** (Identify the stakeholder or role)
- **Title/Position:** (Their job title or position, if inferable)
- **Project Role:** (Their specific role in relation to THIS project, e.g., Sponsor, Key User, Technical Expert)
- **Key Expectations/Interests:** (What are their main concerns, hopes, or requirements for this project?)
- **Influence Level (High/Medium/Low):** (Estimate their ability to impact the project)
- **Engagement Strategy (Initial Thoughts):** (Suggest how to engage them, e.g., Keep Informed, Consult Regularly, Manage Closely)
- **Classification (e.g., Internal/External, Supporter/Neutral):** (Initial assessment of their standing)

**Contextual Documents Provided:**
- Project Summary & Goals:
---
${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}
---
- User Personas:
---
${contextBundle.aiPersonasOutput || 'Not provided.'}
---
- Key Roles and Needs:
---
${contextBundle.aiKeyRolesAndNeedsOutput || 'Not provided.'}
---
- Project Charter (Refer to 'PMBOK_Documents/Initiating/01_Project_Charter.md' for details):
---
${contextBundle.projectCharterOutput || 'Not provided.'}
---
- README Content:
---
${contextBundle.readmeContent || 'Not provided.'}
---

**Output Format:**
- Markdown. For each stakeholder, use a sub-heading (e.g., ### [Stakeholder Name/Role]) followed by a bulleted list for each of the 'Required Fields'.
- Explicitly label any placeholders or items requiring further input.

If any required field cannot be completed with the provided information, include "**TBD by Project Manager**" in that field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Stakeholder Register:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned Scope Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Scope Management Plan, or null if unavailable.
 */
export async function getAiScopeManagementPlan(contextBundle: {
  projectCharterOutput?: string | null,
  stakeholderRegisterOutput?: string | null,
  aiSummaryAndGoalsOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Scope Management Plan.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a draft Scope Management Plan according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Structure the plan using standard PMBOK section headings.
- For each section, use clear, concise, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder: "**TBD by Project Manager**".
- Where appropriate, reference related documents by name and path, e.g., (Refer to 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md' for stakeholder roles).

**Required Sections:**
1. Introduction (Purpose of the Scope Management Plan)
2. Process for Preparing a Detailed Project Scope Statement
3. Process for Creating the Work Breakdown Structure (WBS)
4. Process for Maintaining and Approving the WBS
5. Process for Obtaining Formal Acceptance of Deliverables
6. Process for Controlling Scope Change Requests
7. Roles and Responsibilities (Reference 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md' for key roles)

**Contextual Documents Provided:**
- Project Charter:
---
${contextBundle.projectCharterOutput || 'Not provided.'}
---
- Stakeholder Register (Refer to 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md' for details):
---
${contextBundle.stakeholderRegisterOutput || 'Not provided.'}
---
- Project Summary & Goals:
---
${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}
---
- Note: Initial AI-generated requirements (User Stories, Personas, Acceptance Criteria, etc.) are available and should be referenced as inputs to the processes described in this plan.

**Output Format:**
- Markdown with clear section headings.
- Explicitly label any placeholders or items requiring further input.

If any required section cannot be completed with the provided information, include the section with a "**TBD by Project Manager**" note.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Scope Management Plan:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned Requirements Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Requirements Management Plan, or null if unavailable.
 */
export async function getAiRequirementsManagementPlan(contextBundle: {
  projectCharterOutput?: string | null,
  stakeholderRegisterOutput?: string | null,
  scopeManagementPlanOutput?: string | null,
  aiSummaryAndGoalsOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Requirements Management Plan.');
    return null;
  }
  const prompt = `Using the following project documentation, generate a draft Requirements Management Plan according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Structure the plan using standard PMBOK section headings.
- For each section, use clear, concise, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder: "**TBD by Project Manager**".
- Where appropriate, reference related documents by name and path, e.g., (Refer to 'PMBOK_Documents/Planning/01_Scope_Management_Plan.md' for scope processes).

**Required Sections:**
1. Introduction (Purpose of the Requirements Management Plan)
2. Requirements Activities (Elicitation, Analysis, Documentation, Validation; reference AI-generated documents like 04_ai_generated_user_stories.md, 05_ai_generated_personas.md, 06_ai_generated_acceptance_criteria.md as starting points for these activities)
3. Configuration Management for Requirements (Change control process, tracking, approval)
4. Requirements Prioritization Process (Methods for prioritizing requirements)
5. Product Metrics for Requirements (How fulfillment will be measured)
6. Traceability Structure (How requirements will be traced; describe the Requirements Traceability Matrix)
7. Roles and Responsibilities (Reference 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md' for key roles)

**Contextual Documents Provided:**
- Project Charter:
---
${contextBundle.projectCharterOutput || 'Not provided.'}
---
- Stakeholder Register (Refer to 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md' for details):
---
${contextBundle.stakeholderRegisterOutput || 'Not provided.'}
---
- Scope Management Plan (Refer to 'PMBOK_Documents/Planning/01_Scope_Management_Plan.md' for details):
---
${contextBundle.scopeManagementPlanOutput || 'Not provided.'}
---
- Project Summary & Goals:
---
${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}
---
- Note: Initial AI-generated requirements (User Stories, Personas, Acceptance Criteria, etc.) are available and should be referenced as inputs to the processes described in this plan.

**Output Format:**
- Markdown with clear section headings.
- Explicitly label any placeholders or items requiring further input.

If any required section cannot be completed with the provided information, include the section with a "**TBD by Project Manager**" note.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Requirements Management Plan:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned Project Scope Statement from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Project Scope Statement, or null if unavailable.
 */
export async function getAiProjectScopeStatement(contextBundle: {
  projectCharterOutput?: string | null,
  stakeholderRegisterOutput?: string | null,
  scopeManagementPlanOutput?: string | null,
  requirementsManagementPlanOutput?: string | null,
  aiSummaryAndGoalsOutput?: string | null,
  aiUserStoriesOutput?: string | null,
  aiAcceptanceCriteriaOutput?: string | null,
  aiKeyRolesAndNeedsOutput?: string | null,
  aiUiUxConsiderationsOutput?: string | null,
  aiRiskAnalysisOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Project Scope Statement.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a detailed Project Scope Statement according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Structure the statement using standard PMBOK section headings.
- For each section, use clear, concise, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder (e.g., "**TBD by Project Manager**").
- Where appropriate, reference related documents by name and path, e.g., (Refer to 'PMBOK_Documents/Initiating/01_Project_Charter.md' for project purpose and objectives).

**Required Sections:**
1. Product Scope Description
2. Project Deliverables
3. Project Exclusions
4. Acceptance Criteria
5. Constraints
6. Assumptions
7. (If possible, reference or summarize key requirements, user stories, and UI/UX considerations. Reference '04_ai_generated_user_stories.md', '05_ai_generated_personas.md', and '15_ai_ui_ux_considerations.md' as appropriate.)

**Contextual Documents Provided:**
- Project Charter (Refer to 'PMBOK_Documents/Initiating/01_Project_Charter.md'):
---
${contextBundle.projectCharterOutput}
---
- Stakeholder Register (Key Stakeholders; see 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md'):
---
${contextBundle.stakeholderRegisterOutput}
---
- Scope Management Plan (Refer to 'PMBOK_Documents/Planning/01_Scope_Management_Plan.md'):
---
${contextBundle.scopeManagementPlanOutput || 'Not provided.'}
---
- Requirements Management Plan (Refer to 'PMBOK_Documents/Planning/02_Requirements_Management_Plan.md'):
---
${contextBundle.requirementsManagementPlanOutput || 'Not provided.'}
---
- Project Summary and Goals:
---
${contextBundle.aiSummaryAndGoalsOutput}
---
- User Stories (see '04_ai_generated_user_stories.md'):
---
${contextBundle.aiUserStoriesOutput}
---
- Acceptance Criteria (see '06_ai_generated_acceptance_criteria.md'):
---
${contextBundle.aiAcceptanceCriteriaOutput}
---
- Key Roles and Needs / Personas (see '05_ai_generated_personas.md'):
---
${contextBundle.aiKeyRolesAndNeedsOutput}
---
- UI/UX Considerations (see '15_ai_ui_ux_considerations.md'):
---
${contextBundle.aiUiUxConsiderationsOutput}
---
- Risk Analysis:
---
${contextBundle.aiRiskAnalysisOutput}
---

**Output Format:**
- Markdown with clear section headings.
- Explicitly label any placeholders or items requiring further input.

If any required section cannot be completed with the provided information, include the section with a "**TBD by Project Manager**" note.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Project Scope Statement:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned Work Breakdown Structure (WBS) from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated WBS as a hierarchical Markdown list, or null if unavailable.
 */
export async function getAiWbs(contextBundle: {
  projectScopeStatementOutput?: string | null,
  aiUserStoriesOutput?: string | null,
  aiProcessFlowsOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI WBS generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a detailed Work Breakdown Structure (WBS) according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Decompose the total project scope into a hierarchical structure of deliverables and work packages (at least 2-3 levels deep).
- For each lowest-level work package, provide a concise description of the work involved.
- Use clear, consistent, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder (e.g., "**TBD by Project Manager**").
- Reference related documents by name and path where appropriate (e.g., (Refer to 'PMBOK_Documents/Planning/03_Project_Scope_Statement.md')).
- For each work package in the nested Markdown list, include: WBS Code/ID (if inferable), Name of Work Package, and a Brief Description.

**Contextual Documents Provided:**
- Project Scope Statement (see 'PMBOK_Documents/Planning/03_Project_Scope_Statement.md'):
---
${contextBundle.projectScopeStatementOutput || 'Not provided.'}
---
- User Stories (see '04_ai_generated_user_stories.md'):
---
${contextBundle.aiUserStoriesOutput || 'Not provided.'}
---
- Process Flows (see '12_ai_process_flow_suggestions.md'):
---
${contextBundle.aiProcessFlowsOutput || 'Not provided.'}
---

**Output Format:**
- Markdown with clear hierarchy and section headings.
- Explicitly label any placeholders or items requiring further input.

If any required section cannot be completed with the provided information, include the section with a "**TBD by Project Manager**" note.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for WBS:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned WBS Dictionary from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated WBS Dictionary as markdown, or null if unavailable.
 */
export async function getAiWbsDictionary(contextBundle: {
  wbsOutput?: string | null,
  projectScopeStatementOutput?: string | null,
  aiUserStoriesOutput?: string | null,
  aiAcceptanceCriteriaOutput?: string | null,
  aiKeyRolesAndNeedsOutput?: string | null,
  stakeholderRegisterOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI WBS Dictionary generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a detailed WBS Dictionary according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- For each Work Package (lowest-level WBS element), create a detailed dictionary entry.
- For each entry, include the following fields (insert a clearly labeled placeholder: "**TBD by Project Manager**" if information is missing or not inferable):
  - WBS Code/ID (from the WBS)
  - Name of WBS Element
  - Description of Work (draw from WBS, Scope Statement, and User Stories)
  - Assigned Resources/Responsible Role (suggest a role or use placeholder)
  - Key Deliverables for this WBS Element
  - Acceptance Criteria (summarize or reference acceptance criteria, or use placeholder)
  - Schedule Milestones (high-level, or reference Project Schedule)
  - Cost Estimate (high-level, or reference Cost Baseline)
  - Quality Requirements (high-level, e.g., coding standards, testing)
  - Technical References (e.g., User Story IDs, design docs)
- Use clear, consistent, and professional language.
- Reference related documents by name and path where appropriate (e.g., (Refer to 'PMBOK_Documents/Planning/04_Work_Breakdown_Structure.md')).

**Contextual Documents Provided:**
- Work Breakdown Structure (see 'PMBOK_Documents/Planning/04_Work_Breakdown_Structure.md'):
---
${contextBundle.wbsOutput || 'Not provided.'}
---
- Project Scope Statement (see 'PMBOK_Documents/Planning/03_Project_Scope_Statement.md'):
---
${contextBundle.projectScopeStatementOutput || 'Not provided.'}
---
- User Stories (see '04_ai_generated_user_stories.md'):
---
${contextBundle.aiUserStoriesOutput || 'Not provided.'}
---
- Acceptance Criteria (see '06_ai_generated_acceptance_criteria.md'):
---
${contextBundle.aiAcceptanceCriteriaOutput || 'Not provided.'}
---
- Key Roles and Needs (see '09_ai_key_roles_and_needs.md') / Stakeholder Register (see 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md'):
---
${contextBundle.aiKeyRolesAndNeedsOutput || contextBundle.stakeholderRegisterOutput || 'Not provided.'}
---

**Output Format:**
- Markdown with a clear section for each Work Package.
- Use sub-headings for each WBS element and a bulleted list for the required fields.
- Explicitly label any placeholders or items requiring further input.

If any required field cannot be completed with the provided information, include "**TBD by Project Manager**" in that field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for WBS Dictionary:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a PMBOK-aligned Activity List from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity List as markdown, or null if unavailable.
 */
export async function getAiActivityList(contextBundle: {
  wbsOutput?: string | null,
  wbsDictionaryOutput?: string | null,
  projectScopeStatementOutput?: string | null,
  aiUserStoriesOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Activity List generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a detailed Activity List according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Decompose each Work Package (lowest-level WBS element) into a list of specific activities required for its completion.
- For each activity, include:
  - Activity ID (a unique identifier, e.g., WP[WBS_ID]-A[n])
  - Activity Name/Description (concise and actionable)
  - WBS ID Reference (the WBS code of the parent work package)
- Use clear, consistent, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder: "**TBD by Project Manager**".
- Reference related documents by name and path where appropriate (e.g., (Refer to 'PMBOK_Documents/Planning/04_Work_Breakdown_Structure.md')).

**Contextual Documents Provided:**
- Work Breakdown Structure (see 'PMBOK_Documents/Planning/04_Work_Breakdown_Structure.md'):
---
${contextBundle.wbsOutput || 'Not provided.'}
---
- WBS Dictionary (see 'PMBOK_Documents/Planning/05_WBS_Dictionary.md'):
---
${contextBundle.wbsDictionaryOutput || 'Not provided.'}
---
- Project Scope Statement (see 'PMBOK_Documents/Planning/03_Project_Scope_Statement.md'):
---
${contextBundle.projectScopeStatementOutput || 'Not provided.'}
---
- User Stories (see '04_ai_generated_user_stories.md'):
---
${contextBundle.aiUserStoriesOutput || 'Not provided.'}
---

**Output Format:**
- Present the output as a structured Markdown table with columns for Activity ID, WBS ID Reference, and Activity Name/Description.
- Explicitly label any placeholders or items requiring further input.

If any required field cannot be completed with the provided information, include "**TBD by Project Manager**" in that field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Activity List:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate Activity Attributes for each activity in the Activity List, using all relevant project context.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity Attributes as markdown, or null if unavailable.
 */
export async function getAiActivityAttributes(contextBundle: {
  activityListOutput?: string | null,
  wbsDictionaryOutput?: string | null,
  projectScopeStatementOutput?: string | null,
  aiRiskAnalysisOutput?: string | null,
  aiTechStackAnalysisOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Activity Attributes generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate detailed Activity Attributes for each activity according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- For each activity in the Activity List, expand on the information and include the following attributes (insert a clearly labeled placeholder: "**TBD by Project Manager**" if information is missing or not inferable):
  - Activity ID (from Activity List)
  - WBS ID Reference (from Activity List)
  - Activity Name/Description (from Activity List)
  - Suggested Predecessor Activities (Activity IDs, based on logical flow)
  - Suggested Successor Activities (Activity IDs, based on logical flow)
  - Suggested Logical Relationship with Predecessors (e.g., FS, SS, FF, SF)
  - Resource Requirements (high-level types, e.g., Developer, QA, SME)
  - Known Constraints related to this activity (referencing scope/risks; often TBD or None)
  - Key Assumptions for this activity
- Use clear, consistent, and professional language.
- Reference related documents by name and path where appropriate.

**Contextual Documents Provided:**
- Activity List (see 'PMBOK_Documents/Planning/06_Activity_List.md'):
---
${contextBundle.activityListOutput || 'Not provided.'}
---
- WBS Dictionary (see 'PMBOK_Documents/Planning/05_WBS_Dictionary.md'):
---
${contextBundle.wbsDictionaryOutput || 'Not provided.'}
---
- Project Scope Statement (see 'PMBOK_Documents/Planning/03_Project_Scope_Statement.md'):
---
${contextBundle.projectScopeStatementOutput || 'Not provided.'}
---
- Risk Analysis (see '13_ai_risk_analysis.md'):
---
${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}
---
- Tech Stack Analysis (see '10_ai_tech_stack_analysis.md'):
---
${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}
---

**Output Format:**
- Present the output clearly for each activity, using sub-headings for each Activity ID and a bulleted list for the required attributes.
- Explicitly label any placeholders or items requiring further input.

If any required attribute cannot be completed with the provided information, include "**TBD by Project Manager**" in that field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Activity Attributes:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate initial Activity Duration Estimates (relative effort, factors, placeholders) for each activity.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity Duration Estimates as markdown, or null if unavailable.
 */
export async function getAiActivityDurationEstimates(contextBundle: {
  activityListOutput?: string | null,
  activityAttributesOutput?: string | null,
  wbsDictionaryOutput?: string | null,
  aiRiskAnalysisOutput?: string | null,
  aiTechStackAnalysisOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Activity Duration Estimates generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate initial Activity Duration Estimates according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- For each activity in the Activity List, provide the following attributes (insert a clearly labeled placeholder: "**TBD by Project Manager/Team**" if information is missing or not inferable):
  1. **Activity ID & Name/Description**
  2. **Suggested Relative Effort/Complexity Level:** (e.g., S, M, L, XL or Story Points: 1, 2, 3, 5, 8)
  3. **Key Factors Potentially Influencing Duration:** (List 2-3 factors for this activity)
  4. **Estimated Duration (Placeholder):** (State "**TBD by Project Manager/Team**")
  5. **Basis of Estimate (Placeholder):** (State "To be provided by estimator")
- Do NOT provide a specific numerical duration (e.g., days/hours).
- Use clear, consistent, and professional language.
- Reference related documents by name and path where appropriate.

**Contextual Documents Provided:**
- Activity List (see 'PMBOK_Documents/Planning/06_Activity_List.md'):
---
${contextBundle.activityListOutput || 'Not provided.'}
---
- Activity Attributes (see 'PMBOK_Documents/Planning/07_Activity_Attributes.md'):
---
${contextBundle.activityAttributesOutput || 'Not provided.'}
---
- WBS Dictionary (see 'PMBOK_Documents/Planning/05_WBS_Dictionary.md'):
---
${contextBundle.wbsDictionaryOutput || 'Not provided.'}
---
- Risk Analysis (see '13_ai_risk_analysis.md'):
---
${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}
---
- Tech Stack Analysis (see '10_ai_tech_stack_analysis.md'):
---
${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}
---

**Output Format:**
- Present the output as a structured Markdown table with columns for Activity ID, Activity Name/Description, Suggested Relative Effort/Complexity, Key Factors Potentially Influencing Duration, Estimated Duration (Placeholder), and Basis of Estimate (Placeholder).
- Explicitly label any placeholders or items requiring further input.

If any required field cannot be completed with the provided information, include "**TBD by Project Manager/Team**" in that field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Activity Duration Estimates:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a Project Milestone List from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Milestone List as markdown, or null if unavailable.
 */
export async function getAiMilestoneList(contextBundle: {
  activityListOutput?: string | null,
  activityAttributesOutput?: string | null,
  wbsOutput?: string | null,
  projectScopeStatementOutput?: string | null,
  projectCharterOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Milestone List generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate a detailed Project Milestone List according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Identify significant project milestones—key points or events that mark major progress or deliverables in the project lifecycle.
- For each milestone, include the following attributes (insert a clearly labeled placeholder: "**TBD by Project Manager**" if information is missing or not inferable):
  - **Milestone Name**
  - **Milestone Description** (What does this milestone signify?)
  - **Related WBS/Activity IDs** (WBS elements or key activities whose completion marks this milestone)
  - **Mandatory/Optional (Initial Suggestion)** (Is this milestone likely mandatory or optional? Mark as a suggestion for PM review)
  - **Anticipated Completion Date** (insert "**TBD by Project Manager**" as a placeholder)
- Use clear, consistent, and professional language.
- Reference related documents by name and path where appropriate.

**Contextual Documents Provided:**
- Activity List (see 'PMBOK_Documents/Planning/06_Activity_List.md'):
---
${contextBundle.activityListOutput || 'Not provided.'}
---
- Activity Attributes (see 'PMBOK_Documents/Planning/07_Activity_Attributes.md'):
---
${contextBundle.activityAttributesOutput || 'Not provided.'}
---
- Work Breakdown Structure (see 'PMBOK_Documents/Planning/04_Work_Breakdown_Structure.md'):
---
${contextBundle.wbsOutput || 'Not provided.'}
---
- Project Scope Statement (see 'PMBOK_Documents/Planning/03_Project_Scope_Statement.md'):
---
${contextBundle.projectScopeStatementOutput || 'Not provided.'}
---
- Project Charter (see 'PMBOK_Documents/Initiating/01_Project_Charter.md'):
---
${contextBundle.projectCharterOutput || 'Not provided.'}
---

**Output Format:**
- Present the output as a structured Markdown table with columns for Milestone Name, Milestone Description, Related WBS/Activity IDs, Mandatory/Optional (Suggestion), and Anticipated Completion Date.
- Explicitly label any placeholders or items requiring further input.

If any required field cannot be completed with the provided information, include "**TBD by Project Manager**" in that field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Milestone List:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a Project Schedule Network Diagram description and Mermaid.js syntax from a context bundle.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Schedule Network Diagram description and Mermaid.js syntax as markdown, or null if unavailable.
 */
export async function getAiScheduleNetworkDiagram(contextBundle: {
  activityListOutput?: string | null,
  activityAttributesOutput?: string | null,
  milestoneListOutput?: string | null,
  wbsOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Schedule Network Diagram generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate elements for a Project Schedule Network Diagram according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Analyze the Activity List and Activity Attributes to understand dependencies.
- Generate the following outputs:
    1.  **Textual Overview of Activity Flow:** A brief narrative describing the main sequences and dependencies in the project.
    2.  **Mermaid.js Graph Syntax for Network Diagram:**
        -   Use 'graph TD' (Top-Down) or 'graph LR' (Left-to-Right) syntax.
        -   Represent activities as nodes (using Activity IDs or concise names).
        -   Clearly show dependencies between activities based on the predecessor/successor relationships and types suggested in Activity Attributes.
        -   Represent milestones from the Milestone List as distinct nodes (e.g., using a different shape like \`M_MilestoneName((Milestone Text))\`).
    3.  **Dependency Summary Table:** A Markdown table listing each Activity ID, Activity Name, its direct Predecessor Activity IDs, and direct Successor Activity IDs.
- Use clear, consistent, and professional language.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder: "**TBD by Project Manager**".
- Reference related documents by name and path where appropriate.

**Contextual Documents Provided:**
- Activity List (see 'PMBOK_Documents/Planning/06_Activity_List.md'):
---
${contextBundle.activityListOutput || 'Not provided.'}
---
- Activity Attributes (Key source for dependencies; see 'PMBOK_Documents/Planning/07_Activity_Attributes.md'):
---
${contextBundle.activityAttributesOutput || 'Not provided.'}
---
- Milestone List (see 'PMBOK_Documents/Planning/08_Milestone_List.md'):
---
${contextBundle.milestoneListOutput || 'Not provided.'}
---
- WBS (for context on activity grouping; see 'PMBOK_Documents/Planning/04_Work_Breakdown_Structure.md'):
---
${contextBundle.wbsOutput || 'Not provided.'}
---

**Output Format:**
- Markdown with clear section headings for:
    - ## Project Schedule Network Diagram
    - ### Textual Overview of Activity Flow
    - ### Mermaid.js Syntax for Network Diagram (enclosed in MERMAID_START and MERMAID_END markers)
    - ### Dependency Summary Table
- Explicitly label any placeholders or items requiring further input.

If any required section cannot be completed with the provided information, include "**TBD by Project Manager**" in that section or field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Schedule Network Diagram:', error);
    return null;
  }
  return null;
}

/**
 * Uses OpenAI to generate initial Activity Resource Estimates for each activity.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity Resource Estimates as markdown, or null if unavailable.
 */
export async function getAiActivityResourceEstimates(contextBundle: {
  activityListOutput?: string | null,
  activityAttributesOutput?: string | null,
  wbsDictionaryOutput?: string | null,
  activityDurationEstimatesOutput?: string | null,
  aiTechStackAnalysisOutput?: string | null,
  stakeholderRegisterOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Activity Resource Estimates generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate initial Activity Resource Estimates according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- For each activity in the Activity List, provide the following attributes (insert a clearly labeled placeholder: "**TBD by Project/Resource Manager**" if information is missing or not inferable):
  1. **Activity ID & Name/Description**
  2. **Suggested Resource Types:** (List human resources, equipment, materials/supplies)
  3. **Suggested Relative Quantity/Intensity:** (e.g., Full-time, Part-time, High/Medium/Low usage)
  4. **Key Factors Potentially Influencing Resource Needs:** (List 2-3 factors)
  5. **Specific Resource Assignment (Placeholder):** (State "**TBD by Project/Resource Manager**")
  6. **Actual Quantity (Placeholder):** (State "**TBD by Project/Resource Manager**")
- Use clear, consistent, and professional language.
- Reference related documents by name and path where appropriate.

**Contextual Documents Provided:**
- Activity List (see 'PMBOK_Documents/Planning/06_Activity_List.md'):
---
${contextBundle.activityListOutput || 'Not provided.'}
---
- Activity Attributes (see 'PMBOK_Documents/Planning/07_Activity_Attributes.md'):
---
${contextBundle.activityAttributesOutput || 'Not provided.'}
---
- WBS Dictionary (see 'PMBOK_Documents/Planning/05_WBS_Dictionary.md'):
---
${contextBundle.wbsDictionaryOutput || 'Not provided.'}
---
- Activity Duration Estimates (see 'PMBOK_Documents/Planning/10_Activity_Duration_Estimates.md'):
---
${contextBundle.activityDurationEstimatesOutput || 'Not provided.'}
---
- Tech Stack Analysis (see '10_ai_tech_stack_analysis.md'):
---
${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}
---
- Stakeholder Register (for potential named resources/teams; see 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md'):
---
${contextBundle.stakeholderRegisterOutput || 'Not provided.'}
---

**Output Format:**
- Present the output as a structured Markdown table with columns for Activity ID, Activity Name/Description, Suggested Resource Types, Suggested Relative Quantity/Intensity, Key Factors Potentially Influencing Resource Needs, Specific Resource Assignment (Placeholder), and Actual Quantity (Placeholder).
- Explicitly label any placeholders or items requiring further input.

If any required field cannot be completed with the provided information, include "**TBD by Project/Resource Manager**" in that field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Activity Resource Estimates:', error);
    return null;
  }
}

/**
 * Uses OpenAI to generate a comprehensive Develop Schedule Inputs and Guidance document according to the PMBOK® Guide (Planning Process Group).
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Develop Schedule Inputs and Guidance document, or null if unavailable.
 */
export async function getAiDevelopScheduleInput(contextBundle: {
  activityListOutput?: string | null,
  activityAttributesOutput?: string | null,
  milestoneListOutput?: string | null,
  activityDurationEstimatesOutput?: string | null,
  activityResourceEstimatesOutput?: string | null,
  projectScopeStatementOutput?: string | null,
  aiRiskAnalysisOutput?: string | null,
  stakeholderRegisterOutput?: string | null
}): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI client not initialized. Skipping AI Develop Schedule Input generation.');
    return null;
  }

  const prompt = `Using the following project documentation, generate foundational inputs for the "Develop Schedule" process according to the PMBOK® Guide (Planning Process Group).

**Instructions:**
- Analyze all provided documents to identify and summarize the key PMBOK inputs for schedule development.
- Propose a logical, high-level phased structure for the project schedule (e.g., "Phase 1: Planning", "Phase 2: Development", etc.), with a brief description for each phase.
- For each phase, suggest major activities, milestones, and logical sequencing (dependencies) based on the Activity List, Activity Attributes, and Milestone List.
- Provide an illustrative high-level Gantt chart using Mermaid.js syntax, showing phases, major activities, and milestones. (The LLM should output the Mermaid syntax enclosed in triple backticks—three backtick characters—like so: mermaid ... ).
- Conclude with a checklist of recommended next steps for the Project Manager to refine and finalize the schedule.
- Use clear, consistent, and professional language throughout.
- Where information is incomplete or requires input from the Project Manager, insert a clearly labeled placeholder: "**TBD by Project Manager**".
- Reference related documents by name and path where appropriate.

**Contextual Documents Provided:**
- Activity List (see 'PMBOK_Documents/Planning/06_Activity_List.md'):
---
${contextBundle.activityListOutput || 'Not provided.'}
---
- Activity Attributes (see 'PMBOK_Documents/Planning/07_Activity_Attributes.md'):
---
${contextBundle.activityAttributesOutput || 'Not provided.'}
---
- Milestone List (see 'PMBOK_Documents/Planning/08_Milestone_List.md'):
---
${contextBundle.milestoneListOutput || 'Not provided.'}
---
- Activity Duration Estimates (see 'PMBOK_Documents/Planning/10_Activity_Duration_Estimates.md'):
---
${contextBundle.activityDurationEstimatesOutput || 'Not provided.'}
---
- Activity Resource Estimates (see 'PMBOK_Documents/Planning/11_Activity_Resource_Estimates.md'):
---
${contextBundle.activityResourceEstimatesOutput || 'Not provided.'}
---
- WBS (see 'PMBOK_Documents/Planning/04_Work_Breakdown_Structure.md'):
---
${contextBundle.wbsOutput || 'Not provided.'}
---
- WBS Dictionary (see 'PMBOK_Documents/Planning/05_WBS_Dictionary.md'):
---
${contextBundle.wbsDictionaryOutput || 'Not provided.'}
---
- Project Scope Statement (see 'PMBOK_Documents/Planning/03_Project_Scope_Statement.md'):
---
${contextBundle.projectScopeStatementOutput || 'Not provided.'}
---
- Risk Register (see '13_ai_risk_analysis.md'):
---
${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}
---
- Stakeholder Register (see 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md'):
---
${contextBundle.stakeholderRegisterOutput || 'Not provided.'}
---

**Output Format:**
1. **Summary Table of PMBOK Inputs:**
   - Present a Markdown table listing each key input (e.g., Activity List, Activity Attributes, Milestone List, etc.), a brief description of its content, and the document name/path for reference.
2. **Proposed High-Level Phased Structure:**
   - List each phase with a brief description, major activities, and key milestones. Use a Markdown list or table as appropriate.
3. **Illustrative High-Level Gantt Chart (Mermaid Syntax):**
   - Provide a Mermaid.js Gantt chart showing phases, major activities, and milestones. The LLM should output the Mermaid syntax enclosed in triple backticks (three backtick characters).
   - Example:
     MERMAID_START
gantt
  dateFormat  YYYY-MM-DD
  title       Illustrative Project Timeline
  section Phase 1: Planning
    Activity A        :a1, 2025-06-01, 5d
    Milestone 1       :milestone, m1, 2025-06-06, 0d
  section Phase 2: Development
    Activity B        :a2, after a1, 10d
    Milestone 2       :milestone, m2, after a2, 0d
MERMAID_END
   - Instruct the LLM to replace MERMAID_START and MERMAID_END with actual triple backticks (three backtick characters) in its output.
4. **Next Steps for Project Manager:**
   - Provide a checklist of recommended actions for the PM to refine, validate, and finalize the schedule (e.g., "Review and adjust activity durations with team input", "Validate dependencies and sequencing", etc.).

If any required section cannot be completed with the provided information, include the section with a "**TBD by Project Manager**" note.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI API for Develop Schedule Input:', error);
    return null;
  }
}
