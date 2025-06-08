/**
 * Processor Factory
 * Factory class for creating and managing AI processor instances
 * 
 * @class ProcessorFactory
 * @description Central factory for managing all AI processor instances
 * 
 * @version 1.0.0
 * @since 3.1.0
 */

import { ProjectManagementProcessor } from "./ProjectManagementProcessor.js";
import { PMBOKProcessProcessor } from "./PMBOKProcessProcessor.js";
import { ScopeManagementProcessor } from "./ScopeManagementProcessor.js";
import { StakeholderProcessor } from "./StakeholderProcessor.js";
import { TechnicalAnalysisProcessor } from "./TechnicalAnalysisProcessor.js";
import { RequirementsProcessor } from "./RequirementsProcessor.js";
import { PlanningProcessor } from "./PlanningProcessor.js";
import { WBSProcessor } from "./WBSProcessor.js";
import { ActivityProcessor } from "./ActivityProcessor.js";
import { BaseAIProcessor } from "./BaseAIProcessor.js";
import { AIProvider } from "../types.js";

// Create processor instances
const projectManagementProcessor = new ProjectManagementProcessor();
const pmbokProcessor = new PMBOKProcessProcessor();
const scopeProcessor = new ScopeManagementProcessor();
const stakeholderProcessor = new StakeholderProcessor();
const technicalProcessor = new TechnicalAnalysisProcessor();
const requirementsProcessor = new RequirementsProcessor();
const planningProcessor = new PlanningProcessor();
const wbsProcessor = new WBSProcessor();
const activityProcessor = new ActivityProcessor();

export class ProcessorFactory {
    /**
     * Get Project Management Processor instance
     */
    static getProjectManagementProcessor(): ProjectManagementProcessor {
        return projectManagementProcessor;
    }

    /**
     * Get PMBOK Process Processor instance
     */
    static getPMBOKProcessProcessor(): PMBOKProcessProcessor {
        return pmbokProcessor;
    }

    /**
     * Get Scope Management Processor instance
     */
    static getScopeManagementProcessor(): ScopeManagementProcessor {
        return scopeProcessor;
    }

    /**
     * Get Stakeholder Processor instance
     */
    static getStakeholderProcessor(): StakeholderProcessor {
        return stakeholderProcessor;
    }

    /**
     * Get Technical Analysis Processor instance
     */
    static getTechnicalAnalysisProcessor(): TechnicalAnalysisProcessor {
        return technicalProcessor;
    }

    /**
     * Get Requirements Processor instance
     */
    static getRequirementsProcessor(): RequirementsProcessor {
        return requirementsProcessor;
    }

    /**
     * Get Planning Processor instance
     */
    static getPlanningProcessor(): PlanningProcessor {
        return planningProcessor;
    }

    /**
     * Get WBS Processor instance
     */
    static getWBSProcessor(): WBSProcessor {
        return wbsProcessor;
    }    /**
     * Get Activity Processor instance
     */
    static getActivityProcessor(): ActivityProcessor {
        return activityProcessor;
    }

    /**
     * Get processor based on provided configuration
     * @param config Configuration for processor initialization
     * @returns Appropriate processor instance
     */
    static getProcessor(config: { provider?: AIProvider; type?: string }): BaseAIProcessor {
        // For now, return the requirements processor as the default
        // This can be extended in the future to return different processors based on config
        if (config.type) {
            switch (config.type.toLowerCase()) {
                case 'project-management':
                    return projectManagementProcessor;
                case 'pmbok':
                    return pmbokProcessor;
                case 'scope':
                    return scopeProcessor;
                case 'stakeholder':
                    return stakeholderProcessor;
                case 'technical':
                    return technicalProcessor;
                case 'planning':
                    return planningProcessor;
                case 'wbs':
                    return wbsProcessor;
                case 'activity':
                    return activityProcessor;
                case 'requirements':
                default:
                    return requirementsProcessor;
            }
        }
        return requirementsProcessor;
    }
}

// Export singleton instances for direct access
export {
    projectManagementProcessor,
    pmbokProcessor,
    scopeProcessor,
    stakeholderProcessor,
    technicalProcessor,
    requirementsProcessor,
    planningProcessor,
    wbsProcessor,
    activityProcessor
};
