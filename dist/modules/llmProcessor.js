import OpenAI from 'openai';
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}
else {
    console.warn('OPENAI_API_KEY environment variable not set. LLM functionalities will be skipped.');
}
/**
 * Uses OpenAI to generate a project summary and business goals from text content.
 * @param textContent - The README.md or project description text.
 * @returns The AI-generated summary and goals, or null if unavailable.
 */
export async function getAiSummaryAndGoals(textContent) {
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
    }
    catch (error) {
        console.error('Error calling OpenAI API:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate user stories from project context.
 * @param projectContext - The project summary or description.
 * @returns The AI-generated user stories, or null if unavailable.
 */
export async function getAiUserStories(projectContext) {
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
    }
    catch (error) {
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
export async function getAiPersonas(projectContext, userStoriesContent) {
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
    }
    catch (error) {
        console.error('Error calling OpenAI API for personas:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate acceptance criteria for user stories.
 * @param userStoriesContent - The user stories content.
 * @returns The AI-generated acceptance criteria, or null if unavailable.
 */
export async function getAiAcceptanceCriteria(userStoriesContent) {
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
    }
    catch (error) {
        console.error('Error calling OpenAI API for acceptance criteria:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate Vision and Mission statements from project summary and goals.
 * @param projectSummaryAndGoals - The AI-generated project summary and business goals.
 * @returns The AI-generated Vision and Mission statements, or null if unavailable.
 */
export async function getAiStrategicStatements(projectSummaryAndGoals) {
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
    }
    catch (error) {
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
export async function getAiCoreValuesAndPurpose(projectSummaryAndGoals, visionAndMission) {
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
    }
    catch (error) {
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
export async function getAiKeyRolesAndNeeds(projectContext, userStories, personas) {
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
    }
    catch (error) {
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
export async function getAiTechStackAnalysis(packageJsonData, projectSummary) {
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
    }
    catch (error) {
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
export async function getAiDataModelSuggestions(projectContext, userStories, personas) {
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
    }
    catch (error) {
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
export async function getAiProcessFlowSuggestions(projectContext, userStories, keyRolesAndNeeds) {
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
    }
    catch (error) {
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
export async function getAiRiskAnalysis(projectContext, techStackAnalysis, dataModelSuggestions, processFlows) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI risk analysis.');
        return null;
    }
    const prompt = `Based on the following project information (summary, goals, tech stack, data model, and process flows if provided), please perform an initial risk analysis.\nFor this analysis:\n1.  Identify potential risks associated with the project.\n2.  Categorize these risks (e.g., Technical, Project Management, Security, Data-related, External, Scope).\n3.  For each risk, provide a brief description.\n4.  Where possible, suggest a potential mitigation strategy or an area for further investigation.\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${techStackAnalysis ? `Technology Stack Analysis:\n---\n${techStackAnalysis}\n---\n` : ''}${dataModelSuggestions ? `Data Model Suggestions:\n---\n${dataModelSuggestions}\n---\n` : ''}${processFlows ? `Process Flow Suggestions:\n---\n${processFlows}\n---\n` : ''}\nInitial Risk Analysis:\n## Risk Analysis\n\n### Technical Risks\n- **Risk:** [e.g., Complexity of integrating new AI model]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Conduct a proof-of-concept, allocate extra time for R&D]\n- ...\n\n### Project Management Risks\n- **Risk:** [e.g., Unclear scope for advanced features]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Prioritize features using MoSCoW, phased rollout]\n- ...\n\n### Security Risks\n- **Risk:** [e.g., Handling sensitive user data]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Implement encryption, conduct security audit, ensure compliance with data privacy regulations like GDPR/CCPA]\n- ...\n\n(And so on for other identified risk categories and risks)`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
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
export async function getAiComplianceConsiderations(projectContext, dataModelSuggestions, personas, keyRolesAndNeeds) {
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
    }
    catch (error) {
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
export async function getAiUiUxConsiderations(projectContext, userStories, personas, keyRolesAndNeeds) {
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
    }
    catch (error) {
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
export async function getAiProjectKickoffChecklist(projectContext, userStories, keyRolesAndNeeds, techStackAnalysis, riskAnalysis) {
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
    }
    catch (error) {
        console.error('Error calling OpenAI API for project kickoff checklist:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Project Charter from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Project Charter, or null if unavailable.
 */
export async function getAiProjectCharter(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Project Charter.');
        return null;
    }
    const prompt = `Using the following project documentation, generate a draft Project Charter according to the PMBOK® Guide.\n\nInclude the following sections:\n- Project Purpose/Justification\n- Measurable Project Objectives and Success Criteria\n- High-Level Requirements\n- High-Level Project Description and Boundaries\n- Overall Project Risk\n- Key Stakeholder List\n- (For sections like Milestone Schedule or Financial Resources, note as 'To Be Determined' or provide high-level suggestions if possible.)\n\nProject Summary and Goals:\n---\n${contextBundle.summaryAndGoals}\n---\n${contextBundle.strategicStatements ? `Strategic Statements:\n---\n${contextBundle.strategicStatements}\n---\n` : ''}${contextBundle.coreValuesAndPurpose ? `Core Values and Purpose:\n---\n${contextBundle.coreValuesAndPurpose}\n---\n` : ''}${contextBundle.keyRolesAndNeeds ? `Key Roles and Needs:\n---\n${contextBundle.keyRolesAndNeeds}\n---\n` : ''}${contextBundle.riskAnalysis ? `Risk Analysis:\n---\n${contextBundle.riskAnalysis}\n---\n` : ''}${contextBundle.personas ? `Personas:\n---\n${contextBundle.personas}\n---\n` : ''}${contextBundle.techStackAnalysis ? `Tech Stack Analysis:\n---\n${contextBundle.techStackAnalysis}\n---\n` : ''}\n\nDraft the Project Charter in markdown format with clear section headings. Clearly indicate any sections that require further input from the project manager or stakeholders.`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Project Charter:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Stakeholder Register from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Stakeholder Register, or null if unavailable.
 */
export async function getAiStakeholderRegister(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Stakeholder Register.');
        return null;
    }
    const prompt = `Based on the provided project documentation (project summary, personas, roles/needs, project charter, and README), please generate a draft Stakeholder Register.\n\nFor each identified stakeholder or stakeholder group, include the following information where possible. If information is not available, indicate \"TBD\" or \"To be further assessed\".\n\n-   **Name/Role:** (Identify the stakeholder or role)\n-   **Title/Position:** (Their job title or position, if inferable)\n-   **Project Role:** (Their specific role in relation to THIS project, e.g., Sponsor, Key User, Technical Expert)\n-   **Key Expectations/Interests:** (What are their main concerns, hopes, or requirements for this project?)\n-   **Influence Level (High/Medium/Low):** (Estimate their ability to impact the project)\n-   **Engagement Strategy (Initial Thoughts):** (Suggest how to engage them, e.g., Keep Informed, Consult Regularly, Manage Closely)\n-   **Classification (e.g., Internal/External, Supporter/Neutral):** (Initial assessment of their standing)\n\nContextual Documents:\n---\nProject Summary & Goals:\n${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\nUser Personas:\n${contextBundle.aiPersonasOutput || 'Not provided.'}\n---\nKey Roles and Needs:\n${contextBundle.aiKeyRolesAndNeedsOutput || 'Not provided.'}\n---\nProject Charter:\n${contextBundle.projectCharterOutput || 'Not provided.'}\n---\nREADME Content:\n${contextBundle.readmeContent || 'Not provided.'}\n---\n\nStakeholder Register:\n## Stakeholder Register\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Stakeholder Register:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Scope Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Scope Management Plan, or null if unavailable.
 */
export async function getAiScopeManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Scope Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project charter, stakeholder register, and project summary, please generate a draft Scope Management Plan.\nThis plan should outline the processes and procedures for managing the project scope effectively.\n\nKey sections to include are:\n1.  **Process for Preparing a Detailed Project Scope Statement:** (Describe how the detailed scope will be defined, including inputs and responsible parties).\n2.  **Process for Creating the Work Breakdown Structure (WBS):** (Describe how the WBS will be developed from the scope statement).\n3.  **Process for Maintaining and Approving the WBS:** (Outline how the WBS will be updated and who approves it).\n4.  **Process for Obtaining Formal Acceptance of Deliverables:** (Detail the verification and acceptance process for deliverables).\n5.  **Process for Controlling Scope Change Requests:** (Describe the scope change control process).\n\nRemember to frame this as a foundational plan that the project manager will need to review and tailor.\n\nContextual Documents:\n---\nProject Charter:\n${contextBundle.projectCharterOutput || 'Not provided.'}\n---\nStakeholder Register:\n${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\n---\nProject Summary & Goals:\n${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nScope Management Plan:\n## Scope Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Scope Management Plan for THIS project)\n\n### 2. Process for Preparing a Detailed Project Scope Statement\n(LLM generates content)\n\n### 3. Process for Creating the Work Breakdown Structure (WBS)\n(LLM generates content)\n\n### 4. Process for Maintaining and Approving the WBS\n(LLM generates content)\n\n### 5. Process for Obtaining Formal Acceptance of Deliverables\n(LLM generates content)\n\n### 6. Process for Controlling Scope Change Requests\n(LLM generates content)\n\n### 7. Roles and Responsibilities\n(LLM could suggest key roles from the Stakeholder Register and their responsibilities related to scope management)`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Scope Management Plan:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Requirements Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Requirements Management Plan, or null if unavailable.
 */
export async function getAiRequirementsManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Requirements Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project charter, stakeholder register, scope management plan, and project summary, please generate a draft Requirements Management Plan.\nThis plan should detail how project and product requirements will be planned, tracked, and managed. Note that initial requirements (User Stories, Personas, Acceptance Criteria) have already been drafted by an AI assistant and will serve as inputs.\n\nKey sections to include are:\n1.  **Requirements Activities:** (Describe the processes for elicitation, analysis, documentation, and validation of requirements, referencing the AI-generated documents as a starting point).\n2.  **Configuration Management for Requirements:** (Detail the change control process for requirements, including initiation, impact analysis, tracking, and approval).\n3.  **Requirements Prioritization Process:** (Suggest methods for prioritizing requirements based on the project's nature).\n4.  **Product Metrics for Requirements:** (Outline how the fulfillment of requirements will be measured).\n5.  **Traceability Structure:** (Describe how requirements will be traced throughout the project lifecycle and what a Requirements Traceability Matrix (RTM) might include for this project).\n\nRemember to frame this as a foundational plan that the project manager will need to review and tailor.\n\nContextual Documents:\n---\nProject Charter:\n${contextBundle.projectCharterOutput || 'Not provided.'}\n---\nStakeholder Register:\n${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\n---\nScope Management Plan:\n${contextBundle.scopeManagementPlanOutput || 'Not provided.'}\n---\nProject Summary & Goals:\n${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\nNote: Initial AI-generated requirements (User Stories, Personas, Acceptance Criteria, etc.) are available and will be inputs to the processes described in this plan.\n---\n\nRequirements Management Plan:\n## Requirements Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Requirements Management Plan for THIS project, emphasizing the management of both product and project requirements.)\n\n### 2. Requirements Activities\n-   **Elicitation:** ...\n-   **Analysis:** ...\n-   **Documentation:** ...\n-   **Validation:** ...\n\n### 3. Configuration Management for Requirements\n-   **Change Initiation:** ...\n-   **Impact Analysis:** ...\n-   **Tracking and Reporting:** ...\n-   **Approval:** ...\n\n### 4. Requirements Prioritization Process\n...\n\n### 5. Product Metrics for Requirements\n...\n\n### 6. Traceability Structure\n...\n\n### 7. Roles and Responsibilities\n...`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Requirements Management Plan:', error);
        return null;
    }
}
