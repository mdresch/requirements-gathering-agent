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
    const prompt = `Based on the following project information (summary, goals, tech stack, data model, and process flows if provided), please perform an initial risk analysis.\nFor this analysis:\n1.  Identify potential risks associated with the project.\n2.  Categorize these risks (e.g., Technical, Project Management, Security, Data-related, External, Scope).\n3.  For each risk, provide a brief description.\n4.  Where possible, suggest a mitigation strategy or an area for further investigation.\n\nProject Context (Summary & Goals):\n---\n${projectContext}\n---\n\n${techStackAnalysis ? `Technology Stack Analysis:\n---\n${techStackAnalysis}\n---\n` : ''}${dataModelSuggestions ? `Data Model Suggestions:\n---\n${dataModelSuggestions}\n---\n` : ''}${processFlows ? `Process Flow Suggestions:\n---\n${processFlows}\n---\n` : ''}\nInitial Risk Analysis:\n## Risk Analysis\n\n### Technical Risks\n- **Risk:** [e.g., Complexity of integrating new AI model]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Conduct a proof-of-concept, allocate extra time for R&D]\n- ...\n\n### Project Management Risks\n- **Risk:** [e.g., Unclear scope for advanced features]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Prioritize features using MoSCoW, phased rollout]\n- ...\n\n### Security Risks\n- **Risk:** [e.g., Handling sensitive user data]\n  - **Description:** [Brief explanation]\n  - **Mitigation/Investigation:** [e.g., Implement encryption, conduct security audit, ensure compliance with data privacy regulations like GDPR/CCPA]\n- ...\n\n(And so on for other identified risk categories and risks)`;
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
/**
 * Uses OpenAI to generate a PMBOK-aligned Project Scope Statement from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Project Scope Statement, or null if unavailable.
 */
export async function getAiProjectScopeStatement(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Project Scope Statement.');
        return null;
    }
    const prompt = `Using the following project documentation, generate a detailed Project Scope Statement according to the PMBOK® Guide (Planning Process Group).\n\nInclude the following sections:\n- Product Scope Description\n- Project Deliverables\n- Project Exclusions\n- Acceptance Criteria\n- Constraints\n- Assumptions\n- (If possible, reference or summarize key requirements, user stories, and UI/UX considerations)\n\nProject Charter:\n---\n${contextBundle.projectCharterOutput || 'Not provided.'}\n---\nStakeholder Register:\n---\n${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\n---\nScope Management Plan:\n---\n${contextBundle.scopeManagementPlanOutput || 'Not provided.'}\n---\nRequirements Management Plan:\n---\n${contextBundle.requirementsManagementPlanOutput || 'Not provided.'}\n---\nProject Summary & Goals:\n---\n${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\nUser Stories:\n---\n${contextBundle.aiUserStoriesOutput || 'Not provided.'}\n---\nAcceptance Criteria:\n---\n${contextBundle.aiAcceptanceCriteriaOutput || 'Not provided.'}\n---\nKey Roles and Needs:\n---\n${contextBundle.aiKeyRolesAndNeedsOutput || 'Not provided.'}\n---\nUI/UX Considerations:\n---\n${contextBundle.aiUiUxConsiderationsOutput || 'Not provided.'}\n---\nRisk Analysis:\n---\n${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}\n---\n\nDraft the Project Scope Statement in markdown format with clear section headings. Clearly indicate any sections that require further input from the project manager or stakeholders.`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Project Scope Statement:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Work Breakdown Structure (WBS) from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated WBS as a hierarchical Markdown list, or null if unavailable.
 */
export async function getAiWbs(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI WBS generation.');
        return null;
    }
    const prompt = `Based on the provided Project Scope Statement (especially its deliverables and product scope description), and considering user stories and process flows for further context, please generate a draft Work Breakdown Structure (WBS).\n\nThe WBS should be a hierarchical list that decomposes the project's total scope of work into manageable components. Aim for at least 2-3 levels of decomposition.\nFor each lowest-level work package, provide a brief description of the work involved.\n\nStructure the output as a nested Markdown list.\n\nContextual Documents:\n---\nProject Scope Statement:\n${contextBundle.projectScopeStatementOutput || 'Not provided.'}\n---\nUser Stories (for context on features and tasks):\n${contextBundle.aiUserStoriesOutput || 'Not provided.'}\n---\nProcess Flows (for context on major operational sequences):\n${contextBundle.aiProcessFlowsOutput || 'Not provided.'}\n---\n\nWork Breakdown Structure (WBS):\n## Work Breakdown Structure (WBS)\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for WBS:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned WBS Dictionary from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated WBS Dictionary as markdown, or null if unavailable.
 */
export async function getAiWbsDictionary(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI WBS Dictionary generation.');
        return null;
    }
    const prompt = `Based on the provided Work Breakdown Structure (WBS), Project Scope Statement, User Stories, and Acceptance Criteria, please generate a draft WBS Dictionary.\n\nFor each Work Package (lowest-level item) in the WBS, create a detailed dictionary entry. Include the following fields where possible. If information is not directly inferable, state \"To Be Determined (TBD) by Project Manager\" or similar.\n\n-   **WBS Code/ID:** (From the WBS)\n-   **Name of WBS Element:** (From the WBS)\n-   **Description of Work:** (Detailed tasks and activities, drawing from WBS, scope statement, and relevant user stories.)\n-   **Assigned Resources/Responsible Role:** (Suggest a role, e.g., \"Development Team,\" \"Lead Developer,\" or \"TBD by Project Manager.\")\n-   **Key Deliverables for this WBS Element:** (Specific outputs of this work package.)\n-   **Acceptance Criteria:** (Summarize relevant acceptance criteria from user stories, or state \"Refer to detailed acceptance criteria\" or \"TBD.\")\n-   **Schedule Milestones (High-Level):** (e.g., \"Start/End Dates: TBD, refer to Project Schedule.\")\n-   **Cost Estimate (High-Level):** (e.g., \"Cost Estimate: TBD, refer to Cost Baseline.\")\n-   **Quality Requirements (High-Level):** (e.g., \"Adherence to coding standards,\" \"Successful completion of all tests.\")\n-   **Technical References:** (e.g., \"Relevant User Story IDs,\" \"System Design Document sections.\")\n\nContextual Documents:\n---\nWork Breakdown Structure (WBS):\n${contextBundle.wbsOutput || 'Not provided.'}\n---\nProject Scope Statement:\n${contextBundle.projectScopeStatementOutput || 'Not provided.'}\n---\nUser Stories:\n${contextBundle.aiUserStoriesOutput || 'Not provided.'}\n---\nAcceptance Criteria:\n${contextBundle.aiAcceptanceCriteriaOutput || 'Not provided.'}\n---\nKey Roles and Needs / Stakeholder Register:\n${contextBundle.aiKeyRolesAndNeedsOutput || contextBundle.stakeholderRegisterOutput || 'Not provided.'}\n---\n\nWBS Dictionary:\n## WBS Dictionary\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for WBS Dictionary:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Activity List from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity List as markdown, or null if unavailable.
 */
export async function getAiActivityList(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Activity List generation.');
        return null;
    }
    const prompt = `Based on the provided Work Breakdown Structure (WBS), WBS Dictionary, and Project Scope Statement, please generate a draft Activity List.\nDecompose each Work Package (lowest-level WBS element) into a list of specific activities required for its completion.\n\nFor each activity, include:\n-   **Activity ID:** (A unique identifier for the activity, e.g., WP[WBS_ID]-A[n])\n-   **Activity Name/Description:** (A concise description of the task)\n-   **WBS ID Reference:** (The WBS code of the parent work package)\n\nPresent the output as a structured list or a Markdown table.\n\nContextual Documents:\n---\nWBS:\n${contextBundle.wbsOutput || 'Not provided.'}\n---\nWBS Dictionary:\n${contextBundle.wbsDictionaryOutput || 'Not provided.'}\n---\nProject Scope Statement:\n${contextBundle.projectScopeStatementOutput || 'Not provided.'}\n---\nUser Stories (for context on detailed tasks):\n${contextBundle.aiUserStoriesOutput || 'Not provided.'}\n---\n\nActivity List:\n## Activity List\n\n| Activity ID   | WBS ID Reference | Activity Name/Description                                      |\n|---------------|------------------|----------------------------------------------------------------|`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Activity List:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate Activity Attributes for each activity in the Activity List, using all relevant project context.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity Attributes as markdown, or null if unavailable.
 */
export async function getAiActivityAttributes(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Activity Attributes generation.');
        return null;
    }
    const prompt = `Based on the provided Activity List, WBS Dictionary, Project Scope Statement, Risk Analysis, and Tech Stack Analysis, please generate draft Activity Attributes for each activity.\n\nFor each activity, expand on the information from the Activity List and include suggestions for:\n-   Activity ID (from Activity List)\n-   WBS ID Reference (from Activity List)\n-   Activity Name/Description (from Activity List)\n-   **Suggested Predecessor Activities (Activity IDs):** (Based on logical flow)\n-   **Suggested Successor Activities (Activity IDs):** (Based on logical flow)\n-   **Suggested Logical Relationship with Predecessors (e.g., FS):** (Most common type)\n-   **Resource Requirements (High-Level Types):** (e.g., Developer, QA, SME)\n-   **Known Constraints related to this activity:** (Referencing scope/risks; often TBD or None)\n-   **Key Assumptions for this activity:**\n\nPresent the output clearly for each activity.\n\nContextual Documents:\n---\nActivity List:\n${contextBundle.activityListOutput || 'Not provided.'}\n---\nWBS Dictionary:\n${contextBundle.wbsDictionaryOutput || 'Not provided.'}\n---\nProject Scope Statement:\n${contextBundle.projectScopeStatementOutput || 'Not provided.'}\n---\nRisk Analysis:\n${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}\n---\nTech Stack Analysis:\n${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}\n---\n\nActivity Attributes:\n## Activity Attributes\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Activity Attributes:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate initial Activity Duration Estimates (relative effort, factors, placeholders) for each activity.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity Duration Estimates as markdown, or null if unavailable.
 */
export async function getAiActivityDurationEstimates(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Activity Duration Estimates generation.');
        return null;
    }
    const prompt = `Based on the provided Activity List, Activity Attributes, WBS Dictionary, Risk Analysis, and Tech Stack Analysis, please provide an initial assessment for Activity Duration Estimates.\nFor each activity, DO NOT provide a specific numerical duration (e.g., days/hours). Instead, suggest:\n1.  **Activity ID & Name/Description.**\n2.  **Suggested Relative Effort/Complexity Level:** (e.g., S, M, L, XL or Story Points: 1, 2, 3, 5, 8).\n3.  **Key Factors Potentially Influencing Duration:** (List 2-3 factors for this activity).\n4.  **Estimated Duration (Placeholder):** (State \"TBD by Project Manager/Team\").\n5.  **Basis of Estimate (Placeholder):** (State \"To be provided by estimator\").\n\nPresent the output clearly for each activity, perhaps in a table.\n\nContextual Documents:\n---\nActivity List:\n${contextBundle.activityListOutput || 'Not provided.'}\n---\nActivity Attributes:\n${contextBundle.activityAttributesOutput || 'Not provided.'}\n---\nWBS Dictionary:\n${contextBundle.wbsDictionaryOutput || 'Not provided.'}\n---\nRisk Analysis:\n${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}\n---\nTech Stack Analysis:\n${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}\n---\n\nActivity Duration Estimates (Initial Assessment):\n## Activity Duration Estimates (Initial Assessment)\n\n| Activity ID   | Activity Name/Description                        | Suggested Relative Effort/Complexity | Key Factors Potentially Influencing Duration                                                                  | Estimated Duration (Placeholder) | Basis of Estimate (Placeholder) |\n|---------------|--------------------------------------------------|--------------------------------------|---------------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------|`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Activity Duration Estimates:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a Project Milestone List from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Milestone List as markdown, or null if unavailable.
 */
export async function getAiMilestoneList(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Milestone List generation.');
        return null;
    }
    const prompt = `Based on the provided Activity List, Activity Attributes, WBS, Project Scope Statement, and Project Charter, please generate a draft Project Milestone List.\nIdentify significant project milestones, which are key points or events in the project.\n\nFor each milestone, include:\n-   **Milestone Name:**\n-   **Milestone Description:** (What does this milestone signify?)\n-   **Related WBS/Activity IDs:** (WBS elements or key activities whose completion marks this milestone)\n-   **Mandatory/Optional (Initial Suggestion):** (Is this milestone likely mandatory or optional?)\n-   **Anticipated Completion Date (Placeholder):** (State \"TBD - To be determined by Project Schedule\")\n\nPresent the output as a structured list or a Markdown table.\n\nContextual Documents:\n---\nActivity List:\n${contextBundle.activityListOutput || 'Not provided.'}\n---\nActivity Attributes:\n${contextBundle.activityAttributesOutput || 'Not provided.'}\n---\nWBS:\n${contextBundle.wbsOutput || 'Not provided.'}\n---\nProject Scope Statement:\n${contextBundle.projectScopeStatementOutput || 'Not provided.'}\n---\nProject Charter:\n${contextBundle.projectCharterOutput || 'Not provided.'}\n---\n\nMilestone List:\n## Project Milestone List\n\n| Milestone Name                       | Milestone Description                                                                 | Related WBS/Activity IDs (Examples)              | Mandatory/Optional (Suggestion) | Anticipated Completion Date (Placeholder) |\n|--------------------------------------|---------------------------------------------------------------------------------------|----------------------------------------------------|---------------------------------|-------------------------------------------|`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Milestone List:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a Project Schedule Network Diagram description and Mermaid.js syntax from a context bundle.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Schedule Network Diagram description and Mermaid.js syntax as markdown, or null if unavailable.
 */
export async function getAiScheduleNetworkDiagram(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Schedule Network Diagram generation.');
        return null;
    }
    const prompt = `Based on the provided Activity List, Activity Attributes (especially the predecessor/successor suggestions and relationship types), and Milestone List, please:\n1.  Provide a brief textual overview of the project's main activity sequences or paths.\n2.  Generate Mermaid.js graph syntax (e.g., 'graph TD' or 'graph LR') to represent the Project Schedule Network Diagram.\n    -   Use Activity IDs or concise names for nodes.\n    -   Clearly show dependencies between activities based on the predecessor/successor relationships.\n    -   Represent milestones as distinct nodes if possible (e.g., using a different shape or by noting them).\n\nFocus on illustrating the logical flow and dependencies.\n\nContextual Documents:\n---\nActivity List:\n${contextBundle.activityListOutput || 'Not provided.'}\n---\nActivity Attributes:\n${contextBundle.activityAttributesOutput || 'Not provided.'}\n---\nMilestone List:\n${contextBundle.milestoneListOutput || 'Not provided.'}\n---\n\nProject Schedule Network Diagram Description and Mermaid Syntax:\n## Project Schedule Network Diagram\n\n### Textual Overview of Activity Flow\n(LLM describes the main flow)\n\n### Mermaid.js Syntax for Network Diagram\nMERMAID_START\ngraph TD\n(LLM generates the diagram here)\nMERMAID_END\n\n(When generating your output, please use triple backticks with 'mermaid' for code blocks, e.g., \u0060\u0060\u0060mermaid ... \u0060\u0060\u0060)`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Schedule Network Diagram:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate initial Activity Resource Estimates for each activity.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Activity Resource Estimates as markdown, or null if unavailable.
 */
export async function getAiActivityResourceEstimates(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Activity Resource Estimates generation.');
        return null;
    }
    const prompt = `Based on the provided Activity List, Activity Attributes, WBS Dictionary, Activity Duration Estimates (relative effort), and Tech Stack Analysis, please provide an initial assessment for Activity Resource Estimates.\nFor each activity, suggest:\n1.  **Activity ID & Name/Description.**\n2.  **Suggested Resource Types:** (List human resources, equipment, materials/supplies).\n3.  **Suggested Relative Quantity/Intensity:** (e.g., Full-time, Part-time, High/Medium/Low usage).\n4.  **Key Factors Potentially Influencing Resource Needs:** (List 2-3 factors).\n5.  **Specific Resource Assignment (Placeholder):** (State \"TBD by Project/Resource Manager\").\n6.  **Actual Quantity (Placeholder):** (State \"TBD by Project/Resource Manager\").\n\nPresent the output clearly for each activity, perhaps in a table.\n\nContextual Documents:\n---\nActivity List:\n${contextBundle.activityListOutput || 'Not provided.'}\n---\nActivity Attributes:\n${contextBundle.activityAttributesOutput || 'Not provided.'}\n---\nWBS Dictionary:\n${contextBundle.wbsDictionaryOutput || 'Not provided.'}\n---\nActivity Duration Estimates (Relative Effort):\n${contextBundle.activityDurationEstimatesOutput || 'Not provided.'}\n---\nTech Stack Analysis:\n${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}\n---\nStakeholder Register (for potential named resources/teams):\n${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\n---\n\nActivity Resource Estimates (Initial Assessment):\n## Activity Resource Estimates (Initial Assessment)\n\n| Activity ID  | Activity Name/Description           | Suggested Resource Types                                                                 | Suggested Relative Quantity/Intensity | Key Factors Influencing Resource Needs                                                    | Specific Resource Assignment (Placeholder) | Actual Quantity (Placeholder) |\n|--------------|-------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------|-------------------------------------------------------------------------------------------|--------------------------------------------|-------------------------------|`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Activity Resource Estimates:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a comprehensive input document for the PMBOK "Develop Schedule" process.
 * @param contextBundle - An object containing relevant project planning artifacts.
 * @returns The AI-generated Develop Schedule input document as markdown, or null if unavailable.
 */
export async function getAiDevelopScheduleInput(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Develop Schedule input generation.');
        return null;
    }
    const prompt = `Based on the comprehensive project planning inputs (Activity List, Attributes, Duration Estimates [relative], Resource Estimates [types], Network Diagram, Milestones, and Scope), please generate a document that serves as a foundational input for the "Develop Schedule" process.\n\nThis document should:\n1.  **Summarize Key Scheduling Inputs:** Briefly state that activities, dependencies, relative effort, and resource types are available.\n2.  **Propose a Phased Project Structure:** Based on WBS major components or key milestones, suggest logical project phases.\n3.  **Assign Activities to Phases (High-Level):** Indicate which groups of activities or WBS items would typically fall into these phases.\n4.  **Generate an Illustrative Mermaid Gantt Chart:**\n    -   Represent the proposed phases.\n    -   Include key milestones from the Milestone List.\n    -   Show a selection of high-level activities or work packages within each phase.\n    -   **Use placeholder/relative durations (e.g., "relative: S, M, L" or "duration: Xw"). Do NOT invent specific dates or numerical durations.**\n    -   Clearly state this Gantt chart is illustrative and for high-level planning visualization only.\n5.  **Outline Next Steps for Project Manager:** Emphasize the need for the PM to use professional scheduling tools, input actual estimates, perform critical path method, resource leveling, and finalize the schedule baseline.\n\nContextual Documents:\n---\nActivity List:\n${contextBundle.activityListOutput || 'Not provided.'}\n---\nActivity Attributes:\n${contextBundle.activityAttributesOutput || 'Not provided.'}\n---\nActivity Duration Estimates (Relative):\n${contextBundle.activityDurationEstimatesOutput || 'Not provided.'}\n---\nActivity Resource Estimates (Types):\n${contextBundle.activityResourceEstimatesOutput || 'Not provided.'}\n---\nSchedule Network Diagram (Mermaid):\n${contextBundle.scheduleNetworkDiagramOutput || 'Not provided.'}\n---\nMilestone List:\n${contextBundle.milestoneListOutput || 'Not provided.'}\n---\nProject Scope Statement:\n${contextBundle.projectScopeStatementOutput || 'Not provided.'}\n---\n\nInput for Developing Project Schedule:\n## Input for Developing Project Schedule\n\n### 1. Summary of Key Scheduling Inputs\nThe following foundational elements for schedule development have been drafted:\n-   A detailed Activity List and corresponding Activity Attributes (including suggested dependencies).\n-   Initial relative effort/complexity estimates for each activity.\n-   Suggested types and relative intensity of resources required for activities.\n-   A Project Schedule Network Diagram (Mermaid syntax available in '09_Schedule_Network_Diagram.md') illustrating activity sequences.\n-   A list of key Project Milestones.\n\n### 2. Proposed Phased Project Structure\n(LLM: Propose logical phases based on WBS/milestones and assign activities at a high level)\n\n### 3. Illustrative High-Level Gantt Chart (Mermaid Syntax)\n**Note:** This Gantt chart is for illustrative purposes only to visualize phasing and high-level sequencing. It uses placeholder durations. Actual durations must be estimated by the project team.\n\nMERMAID_START\ngantt\n    title Illustrative Project Timeline\n    %% LLM: Fill in phases, milestones, and high-level activities with placeholder durations\nMERMAID_END\n\n(When generating your output, please use triple backticks with 'mermaid' for code blocks, e.g., \u0060\u0060\u0060mermaid ... \u0060\u0060\u0060)\n\n### 4. Next Steps for Project Manager to Develop Schedule Baseline\nThe information provided above serves as a structured input. To develop the formal Project Schedule and Baseline, the Project Manager must:\n1.  **Obtain Detailed Duration Estimates:** Work with the project team and subject matter experts to get realistic duration estimates for each activity (using techniques like Analogous, Parametric, Three-Point, or Bottom-Up estimating).\n2.  **Assign Specific Resources:** Allocate named resources to activities based on availability and skills.\n3.  **Utilize Scheduling Software:** Input all activities, dependencies, durations, and resources into a professional project scheduling tool (e.g., Microsoft Project, Jira, Primavera P6, etc.).\n4.  **Perform Critical Path Analysis:** Identify the critical path(s) in the project.\n5.  **Resource Leveling/Smoothing:** Adjust the schedule to account for resource constraints and over-allocations.\n6.  **Incorporate Buffers/Contingency:** Add schedule contingency where appropriate based on risk assessment.\n7.  **Review and Validate:** Conduct reviews of the draft schedule with the project team and key stakeholders.\n8.  **Obtain Approval:** Secure formal approval of the Project Schedule Baseline from the Project Sponsor or designated authority.\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Develop Schedule input:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Schedule Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Schedule Management Plan, or null if unavailable.
 */
export async function getAiScheduleManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Schedule Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project charter, scope statement, input for schedule development, and project summary, please generate a draft Schedule Management Plan.\nThis plan should define the policies, procedures, and documentation for planning, developing, managing, executing, and controlling the project schedule.\n\nKey sections to include are:\n1.  **Project Schedule Model Development:** (Methodology, tools, how the model will be built).\n2.  **Level of Accuracy:** (Acceptable range for duration estimates).\n3.  **Units of Measure:** (For time and quantities).\n4.  **Organizational Procedures Links:** (Connection to WBS, control accounts).\n5.  **Project Schedule Model Maintenance:** (How the schedule will be updated).\n6.  **Control Thresholds:** (Variance thresholds for performance).\n7.  **Rules of Performance Measurement:** (e.g., EVM application, or state TBD).\n8.  **Reporting Formats:** (Types, formats, and frequency of schedule reports).\n9.  **Roles and Responsibilities:** (Key roles and their responsibilities for schedule management).\n\nRemember to frame this as a foundational plan that the project manager will need to review and tailor.\n\nContextual Documents:\n---\nProject Charter:\n${contextBundle.projectCharterOutput || 'Not provided.'}\n---\nProject Scope Statement:\n${contextBundle.projectScopeStatementOutput || 'Not provided.'}\n---\nInput for Develop Schedule:\n${contextBundle.developScheduleInputOutput || 'Not provided.'}\n---\nProject Summary & Goals:\n${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nSchedule Management Plan:\n## Schedule Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Schedule Management Plan for THIS project.)\n\n### 2. Project Schedule Model Development\n(Methodology, tools, and how the model will be built)\n\n### 3. Level of Accuracy\n(Describe the acceptable range for duration estimates)\n\n### 4. Units of Measure\n(Define units for time and quantities)\n\n### 5. Organizational Procedures Links\n(Describe links to WBS, control accounts)\n\n### 6. Project Schedule Model Maintenance\n(How the schedule will be updated and maintained)\n\n### 7. Control Thresholds\n(Variance thresholds for monitoring schedule performance)\n\n### 8. Rules of Performance Measurement\n(Earned Value Management or other techniques, or state TBD)\n\n### 9. Reporting Formats\n(Types, formats, and frequency of schedule reports)\n\n### 10. Roles and Responsibilities\n(Key roles and their responsibilities for schedule management)\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Schedule Management Plan:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Cost Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Cost Management Plan, or null if unavailable.
 */
export async function getAiCostManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Cost Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project documentation (charter, scope statement, schedule management plan, WBS, resource estimates, risk analysis, and project summary), please generate a draft Cost Management Plan.\nThis plan should define how project costs will be planned, estimated, budgeted, managed, monitored, and controlled.\n\nKey sections to include are:\n1.  **Units of Measure:** (For resources and costs, e.g., staff hours, currency).\n2.  **Level of Precision:** (Rounding for cost estimates).\n3.  **Level of Accuracy:** (Acceptable range for cost estimates).\n4.  **Organizational Procedures Links:** (Connection to WBS control accounts).\n5.  **Control Thresholds:** (Variance thresholds for cost performance).\n6.  **Rules of Performance Measurement:** (EVM for cost, e.g., CV, CPI).\n7.  **Reporting Formats:** (Types, formats, and frequency of cost reports).\n8.  **Process for Managing Cost Variances:** (How variances will be handled).\n9.  **Funding Limit Reconciliation (High-Level):** (How expenditures align with funding).\n10. **Cost Baselining Process:** (How the cost baseline will be established).\n11. **Roles and Responsibilities:** (Key roles and their responsibilities for cost management).\n\nRemember to frame this as a foundational plan that the project manager will need to review, tailor, and populate with specific financial figures.\n\nContextual Documents:\n---\nProject Charter: ${contextBundle.projectCharterOutput || 'Not provided.'}\nProject Scope Statement: ${contextBundle.projectScopeStatementOutput || 'Not provided.'}\nSchedule Management Plan: ${contextBundle.scheduleManagementPlanOutput || 'Not provided.'}\nWBS & WBS Dictionary: ${(contextBundle.wbsOutput && contextBundle.wbsDictionaryOutput) ? 'Provided (see WBS & Dictionary files)' : 'Not provided.'}\nActivity Resource Estimates: ${contextBundle.activityResourceEstimatesOutput || 'Not provided.'}\nRisk Analysis: ${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}\nProject Summary & Goals: ${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nCost Management Plan:\n## Cost Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Cost Management Plan for THIS project.)\n\n### 2. Units of Measure\n-   **Resource Effort:** Staff hours or staff days.\n-   **Costs:** [Specify Currency, e.g., USD, EUR] for all cost estimates, budgets, and actuals.\n-   **Other Quantities:** (e.g., per license, per unit for materials/supplies if applicable).\n\n### 3. Level of Precision\nCost estimates will be rounded to the nearest [e.g., $100 or appropriate currency unit].\n\n### 4. Level of Accuracy\nInitial rough order of magnitude (ROM) estimates will have an accuracy of [e.g., -25% to +75%]. As the project progresses and more information is available, definitive estimates will aim for an accuracy of [e.g., -5% to +10%]. This will be reviewed and updated.\n\n### 5. Organizational Procedures Links\nProject costs will be tracked against control accounts established in the Work Breakdown Structure (WBS), typically at [e.g., WBS Level 2 or major deliverable level]. All costs will align with the organization's chart of accounts and financial reporting procedures.\n\n### 6. Control Thresholds\nCost performance will be monitored against the approved cost baseline. Control thresholds are set at [e.g., +/- 10%] cumulative variance for the project and [e.g., +/- 15%] for individual control accounts. Variances exceeding these thresholds will trigger a detailed review and corrective action planning.\n\n### 7. Rules of Performance Measurement\nEarned Value Management (EVM) techniques will be used to measure cost performance. Key metrics will include Cost Variance (CV) and Cost Performance Index (CPI). The methods for calculating percent complete for EVM (e.g., 0/100 rule, milestone billing, percent complete estimate) will be defined for WBS components.\n\n### 8. Reporting Formats\nThe following cost reports will be generated:\n-   **Cost Performance Report:** (Frequency: e.g., Monthly) - Shows actual costs, budgeted costs, EVM metrics (CV, CPI, EAC, ETC), and variance analysis.\n-   **Budget vs. Actuals Summary:** (Frequency: e.g., Monthly/Quarterly) - For financial oversight.\n-   **Expenditure Forecast:** (Frequency: e.g., Monthly) - Projects future spending.\n\n### 9. Process for Managing Cost Variances\nCost variances identified through performance reporting will be analyzed by the Project Manager to determine the root cause. If variances exceed control thresholds, a formal variance analysis report will be prepared, and corrective or preventive actions will be proposed to the [e.g., Project Sponsor or Steering Committee] for approval through the integrated change control process.\n\n### 10. Funding Limit Reconciliation\nProject expenditures will be periodically reconciled with the approved funding limits and disbursement schedules. The Project Manager will monitor cash flow projections and report any anticipated funding shortfalls to the Project Sponsor. (Specific funding details are TBD and will be managed by the PM).\n\n### 11. Cost Baselining Process\nThe cost baseline will be developed by aggregating the estimated costs of individual activities and work packages (bottom-up estimating from WBS), plus any contingency reserves. The cost baseline will be time-phased based on the project schedule. It will be formally reviewed and approved by the Project Sponsor before project execution begins. Changes to the cost baseline must follow the integrated change control process.\n\n### 12. Roles and Responsibilities\n(Key roles and their responsibilities for cost management)\n`;
}
try { }
catch (error) {
    console.error('Error calling OpenAI API for Cost Management Plan:', error);
    return null;
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Quality Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Quality Management Plan, or null if unavailable.
 */
export async function getAiQualityManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Quality Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project documentation (charter, scope, requirements, acceptance criteria, stakeholders, risks, compliance, UI/UX, and summary), please generate a draft Quality Management Plan.\nThis plan should describe how quality policies will be implemented and how the project will meet its quality requirements.\n\nKey sections to include are:\n1.  **Quality Standards:** (Relevant industry/organizational standards).\n2.  **Project's Quality Objectives:** (Specific, measurable quality goals).\n3.  **Quality Roles and Responsibilities:** (Who is responsible for what in terms of quality).\n4.  **Project Deliverables and Processes Subject to Quality Review:** (Key items for quality checks).\n5.  **Quality Control (QC) Activities:** (Specific actions to verify deliverable quality, e.g., testing, reviews).\n6.  **Quality Assurance (QA) Activities:** (Processes/audits to ensure effective quality processes are used).\n7.  **Quality Metrics:** (Specific metrics to measure quality, e.g., defect rates, satisfaction).\n8.  **Tools and Techniques for Quality:** (Methods to be used, e.g., checklists, root cause analysis).\n9.  **Process for Handling Nonconformance:** (How defects/issues will be managed).\n10. **Quality Improvement:** (How lessons learned and audits will feed into continuous improvement).\n\nRemember to frame this as a foundational plan for review and tailoring.\n\nContextual Documents:\n---\nProject Charter: ${contextBundle.projectCharterOutput || 'Not provided.'}\nProject Scope Statement: ${contextBundle.projectScopeStatementOutput || 'Not provided.'}\nRequirements Management Plan: ${contextBundle.requirementsManagementPlanOutput || 'Not provided.'}\nAcceptance Criteria: ${contextBundle.aiAcceptanceCriteriaOutput || 'Not provided.'}\nStakeholder Register: ${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\nRisk Analysis: ${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}\nCompliance Considerations: ${contextBundle.aiComplianceConsiderationsOutput || 'Not provided.'}\nUI/UX Considerations: ${contextBundle.aiUiUxConsiderationsOutput || 'Not provided.'}\nProject Summary & Goals: ${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nQuality Management Plan:\n## Quality Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Quality Management Plan for THIS project, emphasizing its commitment to delivering a high-quality product that meets stakeholder expectations and project objectives.)\n\n### 2. Quality Standards\n(LLM: List relevant industry/organizational standards, coding standards, accessibility, etc.)\n\n### 3. Project's Quality Objectives\n(LLM: List specific, measurable quality goals for the project and its deliverables)\n\n### 4. Quality Roles and Responsibilities\n(LLM: Who is responsible for quality planning, assurance, control, and improvement)\n\n### 5. Project Deliverables and Processes Subject to Quality Review\n(LLM: Identify key items for quality checks)\n\n### 6. Quality Control (QC) Activities\n(LLM: Specific actions to monitor and verify that deliverables meet quality standards)\n\n### 7. Quality Assurance (QA) Activities\n(LLM: Processes and audits to ensure the project is using effective quality processes)\n\n### 8. Quality Metrics\n(LLM: Specific metrics that will be used to measure quality)\n\n### 9. Tools and Techniques for Quality\n(LLM: Methods to be used, e.g., checklists, statistical sampling, root cause analysis)\n\n### 10. Process for Handling Nonconformance\n(LLM: How defects or quality issues will be identified, logged, resolved, and tracked)\n\n### 11. Quality Improvement\n(LLM: How lessons learned and QA audits will feed into a continuous quality improvement process)\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Quality Management Plan:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Resource Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Resource Management Plan, or null if unavailable.
 */
export async function getAiResourceManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Resource Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project documentation (charter, scope, activity resource estimates, WBS, stakeholder register, tech stack, core values, key roles, and summary), please generate a draft Resource Management Plan.\nThis plan should describe how project resources (human, equipment, materials) will be planned, acquired, managed, and controlled.\n\nKey sections to include are:\n1.  **Identification of Resources:** (How different resource types will be identified).\n2.  **Acquisition of Resources:** (Processes for obtaining internal/external resources).\n3.  **Roles and Responsibilities:** (Define key project roles, authorities, responsibilities, competencies, referencing stakeholder/roles docs).\n4.  **Project Organization Charts (Descriptive):** (Describe the proposed project team structure).\n5.  **Team Development / Training Needs:** (How team skills will be developed, anticipated training).\n6.  **Resource Control:** (How physical resources will be tracked, and human resource performance managed).\n7.  **Recognition Plan:** (How team contributions will be recognized, potentially linking to core values).\n8.  **Release of Resources:** (How resources will be released from the project at completion or as work is finished).\n\nRemember to frame this as a foundational plan for review and tailoring.\n\nContextual Documents:\n---\nProject Charter: ${contextBundle.projectCharterOutput || 'Not provided.'}\nProject Scope Statement: ${contextBundle.projectScopeStatementOutput || 'Not provided.'}\nActivity Resource Estimates: ${contextBundle.activityResourceEstimatesOutput || 'Not provided.'}\nWBS & WBS Dictionary: ${(contextBundle.wbsOutput && contextBundle.wbsDictionaryOutput) ? 'Provided' : 'Not provided.'}\nStakeholder Register: ${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\nTech Stack Analysis: ${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}\nCore Values & Purpose: ${contextBundle.aiCoreValuesAndPurposeOutput || 'Not provided.'}\nKey Roles and Needs: ${contextBundle.aiKeyRolesAndNeedsOutput || 'Not provided.'}\nProject Summary & Goals: ${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nResource Management Plan:\n## Resource Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Resource Management Plan for THIS project, covering human, physical, and material resources.)\n\n### 2. Identification of Resources\n(LLM: How different resource types will be identified)\n\n### 3. Acquisition of Resources\n(LLM: Processes for obtaining internal/external resources)\n\n### 4. Roles and Responsibilities\n(LLM: Define key project roles, authorities, responsibilities, competencies)\n\n### 5. Project Organization Charts (Descriptive)\n(LLM: Describe the proposed project team structure)\n\n### 6. Team Development / Training Needs\n(LLM: How team skills will be developed, anticipated training)\n\n### 7. Resource Control\n(LLM: How physical resources will be tracked, and human resource performance managed)\n\n### 8. Recognition Plan\n(LLM: How team contributions will be recognized)\n\n### 9. Release of Resources\n(LLM: How resources will be released from the project at completion or as work is finished)\n`;
}
try { }
catch (error) {
    console.error('Error calling OpenAI API for Resource Management Plan:', error);
    return null;
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Communications Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Communications Management Plan, or null if unavailable.
 */
export async function getAiCommunicationsManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Communications Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project documentation (charter, scope, stakeholder register, and project summary), please generate a draft Communications Management Plan.\nThis plan should define how project information will be planned, structured, managed, and distributed to stakeholders.\n\nKey sections to include are:\n1.  **Communication Requirements Analysis:** (How communication needs are determined for stakeholders.)\n2.  **Information to be Communicated:** (Types, format, content, and level of detail of information.)\n3.  **Stakeholder Communication Matrix:** (Table mapping stakeholders to communication types, frequency, format, and responsible party.)\n4.  **Methods and Technologies:** (How information will be distributed: meetings, email, dashboards, etc.)\n5.  **Timing and Frequency:** (When and how often communications will occur.)\n6.  **Escalation Process:** (How urgent issues or conflicts will be escalated and communicated.)\n7.  **Roles and Responsibilities:** (Who is responsible for preparing, delivering, and receiving communications.)\n8.  **Glossary/Definitions:** (Key terms for clarity, if needed.)\n9.  **Plan Review and Updates:** (How the plan will be reviewed and updated.)\n\nRemember to frame this as a foundational plan for the project manager to review and tailor.\n\nContextual Documents:\n---\nProject Charter: ${contextBundle.projectCharterOutput || 'Not provided.'}\nProject Scope Statement: ${contextBundle.projectScopeStatementOutput || 'Not provided.'}\nStakeholder Register: ${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\nProject Summary & Goals: ${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nCommunications Management Plan:\n## Communications Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Communications Management Plan for THIS project.)\n\n### 2. Communication Requirements Analysis\n(LLM: How communication needs are determined for stakeholders)\n\n### 3. Information to be Communicated\n(LLM: Types, format, content, and level of detail of information)\n\n### 4. Stakeholder Communication Matrix\n(LLM: Table mapping stakeholders to communication types, frequency, format, and responsible party)\n\n### 5. Methods and Technologies\n(LLM: How information will be distributed: meetings, email, dashboards, etc.)\n\n### 6. Timing and Frequency\n(LLM: When and how often communications will occur)\n\n### 7. Escalation Process\n(LLM: How urgent issues or conflicts will be escalated and communicated)\n\n### 8. Roles and Responsibilities\n(LLM: Who is responsible for preparing, delivering, and receiving communications)\n\n### 9. Glossary/Definitions\n(LLM: Key terms for clarity, if needed)\n\n### 10. Plan Review and Updates\n(LLM: How the plan will be reviewed and updated)\n`;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    }
    catch (error) {
        console.error('Error calling OpenAI API for Communications Management Plan:', error);
        return null;
    }
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Risk Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Risk Management Plan, or null if unavailable.
 */
export async function getAiRiskManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Risk Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project documentation (charter, scope, stakeholders, initial risk analysis, cost/schedule plans, and summary), please generate a draft Risk Management Plan.\nThis plan should define how risk management activities will be structured and performed for the project.\n\nKey sections to include are:\n1.  **Risk Management Methodology:** (Approach, tools, data sources).\n2.  **Roles and Responsibilities:** (For risk management activities).\n3.  **Budgeting for Risk Management:** (Funds for activities and reserves).\n4.  **Timing of Risk Management Activities:** (When and how often).\n5.  **Risk Categories:** (Sources of risk, e.g., Technical, External).\n6.  **Definitions of Risk Probability and Impact:** (Scales for rating).\n7.  **Probability and Impact Matrix (Descriptive):** (How risks will be prioritized).\n8.  **Revised Stakeholder Tolerances (if any):**\n9.  **Reporting Formats:** (Risk Register, Risk Report details).\n10. **Tracking:** (Recording risk activities, auditing risk processes).\n\nRefer to the '13_ai_risk_analysis.md' as the initial input for identified risks, which will be managed according to this plan.\nRemember to frame this as a foundational plan for review and tailoring.\n\nContextual Documents:\n---\nProject Charter: ${contextBundle.projectCharterOutput || 'Not provided.'}\nProject Scope Statement: ${contextBundle.projectScopeStatementOutput || 'Not provided.'}\nStakeholder Register: ${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\nInitial AI Risk Analysis: ${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}\nCost Management Plan: ${contextBundle.costManagementPlanOutput || 'Not provided.'}\nSchedule Management Plan: ${contextBundle.scheduleManagementPlanOutput || 'Not provided.'}\nProject Summary & Goals: ${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nRisk Management Plan:\n## Risk Management Plan\n\n### 1. Introduction\n(Briefly state the purpose of this Risk Management Plan for THIS project, emphasizing a proactive approach to identifying, analyzing, responding to, and monitoring project risks.)\n\n### 2. Risk Management Methodology\n-   **Approach:** The project will adopt a structured and iterative risk management approach. Risks will be identified early and continuously throughout the project lifecycle.\n-   **Tools:**\n    -   Risk Register (based on the initial '13_ai_risk_analysis.md' and continuously updated).\n    -   Probability and Impact Matrix.\n    -   Root Cause Analysis.\n    -   Expert judgment from team members and stakeholders.\n-   **Data Sources:** Lessons learned from previous projects, stakeholder interviews, expert opinions, project documents (scope, schedule, cost, quality plans), and the initial AI-generated risk analysis.\n\n### 3. Roles and Responsibilities\n-   **Project Manager:** Overall responsibility for facilitating risk management processes, ensuring risks are identified, analyzed, and managed, and for reporting on risk status. Owns the Risk Register.\n-   **Project Team Members:** Responsible for identifying risks within their areas of expertise, participating in risk assessment, and implementing agreed-upon risk responses.\n-   **Project Sponsor:** Provides oversight, makes decisions on high-impact risks or those requiring significant budget/resources for responses, and approves contingency reserves.\n-   **Key Stakeholders:** May be consulted for risk identification and assessment, particularly regarding external or business-related risks.\n-   **Risk Owner:** Each identified risk will be assigned a Risk Owner responsible for monitoring the risk and implementing the response plan.\n\n### 4. Budgeting for Risk Management\n-   **Risk Management Activities:** Budget will be allocated for activities such as risk review meetings, risk assessment workshops, and development of mitigation plans (as part of overall project management effort).\n-   **Contingency Reserves:** A contingency reserve (percentage of total budget or specific amount - TBD by PM and Sponsor) will be established to address the cost impact of identified "known-unknown" risks. This reserve is part of the cost baseline.\n-   **Management Reserves:** A management reserve (amount TBD by Sponsor) may be established outside the cost baseline to address "unknown-unknown" risks (unforeseeable events).\n\n### 5. Timing of Risk Management Activities\n-   **Initial Risk Identification & Planning:** Occurs during the project planning phase (leveraging '13_ai_risk_analysis.md').\n-   **Risk Review Meetings:** To be held [e.g., bi-weekly or monthly] with the project team to identify new risks, review existing risks, and assess the effectiveness of response plans.\n-   **Major Risk Reviews:** Conducted at key project milestones or phase gates with the Project Sponsor and key stakeholders.\n-   Risk management will be an ongoing agenda item in regular project status meetings.\n\n### 6. Risk Categories\nRisks will be categorized to help in identification and analysis. Common categories for this project may include:\n-   **Technical:** (e.g., Technology complexity, integration issues, performance, LLM reliability/bias)\n-   **External:** (e.g., Changes in LLM provider policies, dependency on third-party APIs, market changes)\n-   **Organizational:** (e.g., Resource availability, funding issues, conflicting priorities, stakeholder changes)\n-   **Project Management:** (e.g., Poor planning, scope creep, communication breakdown, unrealistic schedule/budget)\n-   **Data Related:** (e.g., Data privacy, data quality for LLM fine-tuning, data security)\n\n### 7. Definitions of Risk Probability and Impact\n**Probability Scale (Example):**\n-   **Very High (VH):** >80% likelihood\n-   **High (H):** 61-80% likelihood\n-   **Medium (M):** 41-60% likelihood\n-   **Low (L):** 21-40% likelihood\n-   **Very Low (VL):** <20% likelihood\n\n**Impact Scale (Example - adapt for Cost, Schedule, Scope, Quality):**\n-   **Very High (VH):** Significant impact on project objectives (e.g., >20% cost/schedule increase, critical scope reduction, unacceptable quality).\n-   **High (H):** Substantial impact (e.g., 10-20% cost/schedule increase, major scope reduction, significant quality degradation).\n-   **Medium (M):** Moderate impact (e.g., 5-10% cost/schedule increase, minor scope reduction, noticeable quality issues).\n-   **Low (L):** Minor impact (e.g., <5% cost/schedule increase, very minor scope impact, minimal quality issues, easily manageable).\n-   **Very Low (VL):** Negligible impact.\n*(These scales must be tailored and agreed upon by stakeholders for the specific project context).*\n\n### 8. Probability and Impact Matrix (Descriptive)\nA Probability and Impact Matrix will be used to prioritize risks. It will be a grid with Probability on one axis and Impact on the other. Risks falling into the High-Probability/High-Impact zones (e.g., "Red" zone) will receive the highest attention for response planning.\n(AI can describe a sample 5x5 matrix structure and how Red/Amber/Green zones are determined by multiplying or combining P and I scores).\n\n### 9. Revised Stakeholder Tolerances\nThe project's risk tolerance levels will generally align with the organization's overall risk appetite. However, specific stakeholder tolerances regarding [e.g., data privacy, LLM accuracy, budget overruns - as identified in Stakeholder Register or initial Risk Analysis] will be considered when evaluating risks and planning responses. (This section often remains "To be confirmed with stakeholders").\n\n### 10. Reporting Formats\n-   **Risk Register:** A live document (initially based on '13_ai_risk_analysis.md') tracking all identified risks, their categories, causes, probability, impact, risk score, assigned owner, response plan, and status. (AI can list key fields of the Risk Register).\n-   **Risk Report:** A summary report to be included in regular project status updates, highlighting top risks, changes in risk exposure, and effectiveness of response actions.\n\n### 11. Tracking\n-   All risk management activities, including identification, assessment, response planning, and monitoring, will be documented.\n-   The effectiveness of the risk management process itself will be reviewed periodically (e.g., during lessons learned sessions or phase gate reviews) to identify areas for improvement.\n`;
}
try { }
catch (error) {
    console.error('Error calling OpenAI API for Risk Management Plan:', error);
    return null;
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Procurement Management Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Procurement Management Plan, or null if unavailable.
 */
export async function getAiProcurementManagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Procurement Management Plan.');
        return null;
    }
    const prompt = `Based on the provided project documentation (scope, resource estimates, tech stack, cost/schedule plans, risks, and summary), please generate a draft Procurement Management Plan.\nThis plan should describe how goods and services will be acquired from outside the performing organization for this project. If no major procurements are anticipated, the plan should state this and refer to standard organizational purchasing.\n\nKey sections to include are:\n1.  Introduction/Purpose: (State if major procurements are anticipated or not).\n2.  Types of Contracts to be Used: (If applicable, e.g., Fixed Price, T&M. Describe or state TBD).\n3.  Procurement Risk Management: (Managing vendor-related risks).\n4.  Make-or-Buy Decisions Process: (How these decisions will be made).\n5.  **Standardized Procurement Documents (Including Basic Templates):** (List common documents and provide basic templates for RFI, RFQ, and RFP).\n6.  Managing Multiple Suppliers: (If applicable).\n7.  Coordinating Procurement with Other Project Aspects: (Integration with schedule, budget).\n8.  Procurement Constraints and Assumptions:\n9.  Consideration of Vendor Lead Times:\n10. Contract Performance Management: (Addressing issues with vendors).\n11. Procurement Metrics: (Measuring vendor performance).\n\nRemember to frame this as a foundational plan for review and tailoring. These templates are illustrative.\n\nContextual Documents:\n---\nProject Scope Statement: ${contextBundle.projectScopeStatementOutput || 'Not provided.'}\nActivity Resource Estimates: ${contextBundle.activityResourceEstimatesOutput || 'Not provided.'}\nTech Stack Analysis: ${contextBundle.aiTechStackAnalysisOutput || 'Not provided.'}\nCost Management Plan: ${contextBundle.costManagementPlanOutput || 'Not provided.'}\nSchedule Management Plan: ${contextBundle.scheduleManagementPlanOutput || 'Not provided.'}\nRisk Analysis: ${contextBundle.aiRiskAnalysisOutput || 'Not provided.'}\nProject Summary & Goals: ${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nProcurement Management Plan:\n## Procurement Management Plan\n\n### 1. Introduction and Purpose\nThis Procurement Management Plan outlines how goods and services required for the successful completion of the [Project Name] project will be acquired from external sources. It includes the processes for planning, conducting, and controlling procurements, and is aligned with the overall project management approach defined in the PMBOK® Guide.\n\n### 2. Types of Contracts to be Used\n-   **Fixed Price Contracts:** Preferred for well-defined deliverables where the scope is clear, and price can be agreed upon in advance. Includes Firm Fixed Price (FFP) and Fixed Price with Economic Price Adjustment (FP-EPA) contracts.\n-   **Time and Materials (T&M) Contracts:** Used when project scope is not well-defined, and work needs to be measured in terms of time and materials. Includes a fixed hourly rate plus expenses.\n-   **Cost-Reimbursable Contracts:** (e.g., Cost Plus Fixed Fee - CPFF) Used when uncertainties in contract performance do not allow costs to be estimated with sufficient accuracy to use a fixed-price contract.\n\n*(Details of specific contracts to be used will be determined during the project planning and procurement planning processes, in consultation with the organization's procurement guidelines.)*\n\n### 3. Procurement Risk Management\n-   Risks related to procurement, such as vendor reliability, quality of goods/services, and contract terms, will be identified and assessed as part of the overall project risk management process.\n-   Specific procurement risks will be documented in the Risk Register, and appropriate risk response strategies will be developed and implemented.\n\n### 4. Make-or-Buy Decisions Process\n-   Decisions about whether to procure goods and services externally or to produce them internally will be based on a thorough analysis of costs, benefits, risks, and alignment with project objectives.\n-   This analysis will consider factors such as resource availability, expertise, time constraints, and financial implications.\n\n### 5. Standardized Procurement Documents (Including Basic Templates)\nIf formal procurements are undertaken, the project will utilize standard procurement document formats. Below are basic templates that can be adapted by the Project Manager in consultation with the organization's procurement/legal department. These templates are illustrative and should be tailored to specific procurement needs.\n\n#### 5.1 Request for Information (RFI) - Basic Template\n---\n**Request for Information (RFI)**\n\n**Project Name:** [Insert Project Name]\n**RFI Number:** [ProjectAbbreviation]-RFI-[YYYYMMDD]-[SeqNo]\n**Date of Issue:** [Date]\n**Response Due Date:** [Date]\n\n**1. Introduction and Purpose:**\nThis Request for Information (RFI) is issued by [Your Organization Name] for the [Project Name] project. The purpose of this RFI is to gather information about potential solutions, capabilities, and market offerings related to [briefly describe the area of interest]. This information will assist us in refining our requirements and understanding the available options before potentially issuing a formal Request for Proposal (RFP) or Request for Quotation (RFQ).\n\n**2. Project Background (Brief):**\n[AI to insert a concise summary of the project, e.g., "The [Project Name] aims to ..."]\n\n**3. Information Requested:**\nWe request vendors to provide information on the following (but not limited to):\n-   Company overview, experience, and relevant case studies.\n-   Description of products/services relevant to [area of interest].\n-   High-level architecture or approach for your solution.\n-   Typical implementation timelines and resource requirements.\n-   Ballpark pricing models or indicative cost structures (non-binding).\n-   Key differentiators and unique selling propositions.\n-   [AI can add 1-2 more specific questions based on the project context]\n\n**4. Submission Guidelines:**\n-   Please submit your response electronically to [Email Address] by the Response Due Date.\n-   Format: [e.g., PDF, Word document].\n-   Page Limit: [e.g., Maximum 10 pages, excluding appendices].\n-   Contact for Queries: [Name, Email, Phone].\n\n**5. Disclaimer:**\nThis RFI is for information gathering purposes only and does not constitute a commitment to procure any goods or services. [Your Organization Name] is not liable for any costs incurred by vendors in preparing a response to this RFI. All information received will be treated as confidential if marked accordingly by the respondent.\n---\n\n#### 5.2 Request for Quotation (RFQ) - Basic Template\n---\n**Request for Quotation (RFQ)**\n\n**Project Name:** [Insert Project Name]\n**RFQ Number:** [ProjectAbbreviation]-RFQ-[YYYYMMDD]-[SeqNo]\n**Date of Issue:** [Date]\n**Quotation Due Date:** [Date]\n\n**1. Introduction and Purpose:**\n[Your Organization Name] invites quotations for the supply of the goods and/or services detailed below for the [Project Name] project. This RFQ aims to obtain competitive pricing for well-defined requirements.\n\n**2. Detailed Specifications of Goods/Services:**\n-   **Item 1:** [e.g., Software License for "XYZ Analytics Tool"]\n    -   **Description:** [e.g., Professional Edition, 1-year subscription]\n    -   **Version:** [e.g., Latest stable version]\n    -   **Quantity:** [e.g., 5 licenses]\n    -   **Key Features Required:** [e.g., List critical features]\n-   **Item 2:** [e.g., Hardware - Development Server]\n    -   **Description:** [e.g., Rack-mountable server]\n    -   **Specifications:** [e.g., CPU: Min X cores, Y GHz; RAM: Min Z GB; Storage: Min W TB SSD; Network: Dual P GbE]\n    -   **Quantity:** [e.g., 1 unit]\n\n**3. Quantity Required:**\n(Summarized from section 2 or explicitly stated here)\n\n**4. Delivery Requirements:**\n-   Delivery Address: [Your Organization's Address]\n-   Required Delivery Date: [Date]\n-   Shipping Terms: [e.g., FOB Destination, DDP]\n\n**5. Pricing Table/Format:**\n| Item No. | Description                 | Unit Price | Quantity | Total Price | Notes (e.g., discounts) |\n|----------|-----------------------------|------------|----------|-------------|-------------------------|\n| 1        | [e.g., XYZ Analytics License] |            | 5        |             |                         |\n| 2        | [e.g., Development Server]  |            | 1        |             |                         |\n|          | **Total Quotation Value**   |            |          |             |                         |\n-   All prices should be in [Specify Currency, e.g., USD] and exclusive/inclusive of [Specify Taxes, e.g., VAT].\n-   Validity of Quotation: [e.g., Minimum 60 days].\n\n**6. Submission Guidelines:**\n-   Submit your quotation electronically to [Email Address] by the Quotation Due Date.\n-   Contact for Queries: [Name, Email, Phone].\n\n**7. Terms and Conditions (Brief):**\n-   Payment Terms: [e.g., Net 30 days after delivery and acceptance].\n-   Warranty: [Specify warranty requirements if applicable].\n-   [Your Organization Name] reserves the right to accept or reject any or all quotations.\n---\n\n#### 5.3 Request for Proposal (RFP) - Basic Template\n---\n**Request for Proposal (RFP)**\n\n**Project Name:** [Insert Project Name]\n**RFP Number:** [ProjectAbbreviation]-RFP-[YYYYMMDD]-[SeqNo]\n**Date of Issue:** [Date]\n**Proposal Due Date:** [Date]\n**Contact Person:** [Name, Title, Email, Phone]\n\n**1. Introduction and Project Overview:**\n[Your Organization Name] is soliciting proposals for [describe the service/solution needed]. This RFP provides details on the project, requirements, and submission guidelines.\n[AI to insert a concise overview of the project, its goals, and the specific need that this RFP addresses, drawing from project summary and scope.]\n\n**2. Scope of Work / Requirements:**\nThe selected vendor will be expected to deliver the following:\n-   **Deliverable 1:** [e.g., Fully functional software module as per specifications in Appendix A].\n    -   **Key Feature 1.1:** [e.g., Ability to parse Mermaid syntax from Markdown].\n    -   **Key Feature 1.2:** [e.g., Integration with existing LLMProcessor module via defined API].\n-   **Deliverable 2:** [e.g., Technical documentation for the module].\n-   **Deliverable 3:** [e.g., Training for 2 internal developers on module maintenance].\n-   **Non-functional Requirements:** [e.g., Performance targets, security considerations, scalability needs].\n\n**3. Technical Requirements (if applicable):**\n-   Preferred Technologies/Platforms: [e.g., Must be compatible with existing TypeScript codebase, Node.js environment].\n-   Integration Points: [Describe any systems the proposed solution needs to integrate with].\n-   Data Formats: [Specify any required data input/output formats].\n\n**4. Proposal Format and Submission Guidelines:**\nProposals should include the following sections:\n-   **Executive Summary:** Brief overview of your understanding and proposed solution.\n-   **Company Profile:** Background, experience, relevant case studies, client references.\n-   **Proposed Solution:** Detailed description of how you will meet the Scope of Work and Requirements.\n-   **Team Qualifications:** CVs of key personnel to be assigned to the project.\n-   **Pricing Proposal:** Detailed cost breakdown.\n-   **Deviations/Assumptions:** Any deviations from this RFP or assumptions made.\n-   Submission: Electronically to [Email Address] by [Proposal Due Date]. Format: [e.g., Single PDF].\n\n**5. Evaluation Criteria:**\nProposals will be evaluated based on the following criteria (example weighting):\n-   Understanding of Requirements & Proposed Solution (40%)\n-   Vendor Experience and Qualifications (25%)\n-   Pricing and Value for Money (25%)\n-   Project Plan and Timeline Feasibility (10%)\n\n**6. Contractual Terms and Conditions (High-Level):**\nThe selected vendor will be expected to enter into a formal contract with [Your Organization Name]. Key terms will include [e.g., intellectual property ownership, confidentiality, payment schedule, service level agreements, termination clauses].\n\n**7. RFP Timeline (Indicative):**\n-   RFP Issue Date: [Date]\n-   Vendor Questions Due: [Date]\n-   Responses to Questions Issued: [Date]\n-   Proposal Due Date: [Date]\n-   Shortlist Notification: [Date]\n-   Vendor Presentations (if any): [Date]\n-   Contract Award (estimated): [Date]\n---\n\n### 6. Managing Multiple Suppliers\n(Content as before)\n\n### 7. Coordinating Procurement with Other Project Aspects\n(Content as before)\n\n### 8. Procurement Constraints and Assumptions\n(Content as before)\n\n### 9. Consideration of Vendor Lead Times\n(Content as before)\n\n### 10. Contract Performance Management and Closure\n(Content as before)\n\n### 11. Procurement Metrics\n(Content as before)\n`;
}
try { }
catch (error) {
    console.error('Error calling OpenAI API for Procurement Management Plan:', error);
    return null;
}
/**
 * Uses OpenAI to generate a PMBOK-aligned Stakeholder Engagement Plan from a context bundle of project documents.
 * @param contextBundle - An object containing relevant project documentation content.
 * @returns The AI-generated Stakeholder Engagement Plan, or null if unavailable.
 */
export async function getAiStakeholderEngagementPlan(contextBundle) {
    if (!openai) {
        console.log('OpenAI client not initialized. Skipping AI Stakeholder Engagement Plan.');
        return null;
    }
    const prompt = `Based on the provided project documentation (stakeholder register, communications plan, charter, resource plan, key roles/needs, and summary), please generate a draft Stakeholder Engagement Plan.\nThis plan should outline strategies to effectively engage stakeholders throughout the project lifecycle.\n\nKey sections to include are:\n1.  **Introduction/Purpose:**\n2.  **Identification of Key Stakeholders:** (Summarize from Stakeholder Register).\n3.  **Assessment of Engagement Levels (Current vs. Desired - Illustrative):** For key stakeholders, provide a placeholder for assessing current and desired engagement (e.g., using a scale like Unaware, Resistant, Neutral, Supportive, Leading).\n4.  **Stakeholder Engagement Strategies:** For key stakeholder groups, outline specific strategies and actions to foster the desired level of engagement. Consider their interests, influence, and communication needs.\n5.  **Integration with Communications Management Plan:** (Reference how the Comm. Plan supports engagement).\n6.  **Method for Updating and Refining the Stakeholder Engagement Plan:**\n\nRemember to frame this as a foundational plan for review and tailoring by the Project Manager. The engagement level assessment is illustrative and requires PM validation.\n\nContextual Documents:\n---\nStakeholder Register: ${contextBundle.stakeholderRegisterOutput || 'Not provided.'}\nCommunications Management Plan: ${contextBundle.communicationsManagementPlanOutput || 'Not provided.'}\nProject Charter: ${contextBundle.projectCharterOutput || 'Not provided.'}\nResource Management Plan: ${contextBundle.resourceManagementPlanOutput || 'Not provided.'}\nKey Roles and Needs: ${contextBundle.aiKeyRolesAndNeedsOutput || 'Not provided.'}\nProject Summary & Goals: ${contextBundle.aiSummaryAndGoalsOutput || 'Not provided.'}\n---\n\nStakeholder Engagement Plan:\n## Stakeholder Engagement Plan\n\n### 1. Introduction and Purpose\nThis Stakeholder Engagement Plan outlines the strategies and actions to effectively engage stakeholders throughout the lifecycle of the [Project Name] project. The goal is to foster support, manage expectations, address concerns, and promote productive involvement to ensure project success.\n\n### 2. Identification of Key Stakeholders\nKey stakeholders for this project have been identified and detailed in the 'PMBOK_Documents/Initiating/02_Stakeholder_Register.md'. This includes (but is not limited to):\n-   [AI to list 3-5 key stakeholder groups/roles from the Stakeholder Register]\n\n### 3. Assessment of Engagement Levels (Illustrative - Requires PM Validation)\nThe following table provides a framework for assessing the current and desired engagement levels of key stakeholders. The Project Manager will validate and complete this assessment.\n*(Engagement Scale: U = Unaware, R = Resistant, N = Neutral, S = Supportive, L = Leading)*\n\n| Stakeholder Group/Role        | Current Engagement (C) (TBD by PM) | Desired Engagement (D) (TBD by PM) | Potential Gap (D-C) | Notes / Initial Thoughts for PM |\n|-------------------------------|------------------------------------|------------------------------------|---------------------|---------------------------------|\n| Project Sponsor               | [e.g., S]                          | [e.g., L]                          |                     | Ensure active championing.      |\n| Key End User Representatives  | [e.g., N]                          | [e.g., S]                          |                     | Need active participation in UAT/feedback. |\n| Development Team              | [e.g., S]                          | [e.g., S/L]                        |                     | Maintain high motivation and buy-in. |\n| [e.g., Marketing Department]  | [e.g., U/N]                        | [e.g., S]                          |                     | Early involvement for launch planning. |\n| *(AI to list a few more key stakeholder groups based on the register)* |                                    |                                    |                     |                                 |\n\n### 4. Stakeholder Engagement Strategies\nThe following strategies will be employed to engage key stakeholder groups. These will be tailored based on the ongoing assessment of their engagement levels, interests, influence, and communication requirements outlined in the Communications Management Plan.\n\n**4.1 Project Sponsor:**\n-   **Engagement Goal:** Ensure continued support, active championship, and timely decision-making.\n-   **Strategies/Actions:**\n    -   Regular one-on-one progress meetings (as per Communications Plan).\n    -   Provide concise executive summaries highlighting achievements, risks, and decisions needed.\n    -   Seek input on strategic direction and major issue resolution.\n    -   Ensure clear understanding of project benefits and alignment with organizational goals.\n\n**4.2 Key End User Representatives / Product Owner:**\n-   **Engagement Goal:** Obtain active participation in requirements validation, feedback on deliverables, and champion adoption.\n-   **Strategies/Actions:**\n    -   Involve in requirements workshops and backlog refinement sessions.\n    -   Conduct regular demos of developed features to gather feedback.\n    -   Facilitate User Acceptance Testing (UAT) and ensure their feedback is addressed.\n    -   Communicate how their input is shaping the product.\n\n**4.3 Development Team & Technical Leads:**\n-   **Engagement Goal:** Foster ownership, motivation, collaboration, and high-quality work.\n-   **Strategies/Actions:**\n    -   Regular team meetings and technical discussions (as per Communications Plan).\n    -   Empower them in technical decision-making where appropriate.\n    -   Provide necessary resources, training, and a supportive environment (as per Resource Management Plan).\n    -   Recognize contributions and achievements (as per Resource Management Plan).\n    -   Ensure clarity on tasks, priorities, and project goals.\n\n**4.4 [e.g., Marketing Department]:**\n-   **Engagement Goal:** Ensure alignment for product launch and marketing activities.\n-   **Strategies/Actions:**\n    -   Involve early in planning for go-to-market strategy.\n    -   Provide timely updates on product features and timelines relevant to marketing.\n    -   Collaborate on marketing collateral and messaging.\n\n*(AI to generate sections for 2-3 more key stakeholder groups based on the Stakeholder Register, suggesting tailored strategies based on their likely interests and influence level noted in the register).*\n\n### 5. Integration with Communications Management Plan\nThe 'PMBOK_Documents/Planning/17_Communications_Management_Plan.md' details the specific communication methods, frequencies, and responsibilities that underpin these engagement strategies. This Stakeholder Engagement Plan focuses on the 'why' and 'how' of fostering productive relationships, while the Communications Management Plan details the 'what', 'when', and 'who' of information exchange.\n\n### 6. Method for Updating and Refining the Stakeholder Engagement Plan\nThis Stakeholder Engagement Plan is a dynamic document and will be reviewed and updated by the Project Manager:\n-   At key project milestones or phase transitions.\n-   When new key stakeholders are identified or existing ones change roles/influence.\n-   If current engagement strategies prove ineffective.\n-   Based on feedback from stakeholders.\nChanges to the plan will be communicated to relevant parties.\n\n### 7. Managing Expectations and Resolving Conflicts\n-   The Project Manager will proactively work to manage stakeholder expectations through clear communication and regular updates.\n-   Conflicts between stakeholders will be addressed promptly, seeking mutually agreeable solutions. The issue escalation process (defined in the Communications Management Plan) will be used if necessary.\n`;
}
try { }
catch (error) {
    console.error('Error calling OpenAI API for Stakeholder Engagement Plan:', error);
    return null;
}
