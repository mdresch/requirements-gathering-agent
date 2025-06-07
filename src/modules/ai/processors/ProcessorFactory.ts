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

import { ProjectManagementProcessor } from "./ProjectManagementProcessor";
import { PMBOKProcessProcessor } from "./PMBOKProcessProcessor";
import { ScopeManagementProcessor } from "./ScopeManagementProcessor";
import { StakeholderProcessor } from "./StakeholderProcessor";
import { TechnicalAnalysisProcessor } from "./TechnicalAnalysisProcessor";
import { RequirementsProcessor } from "./RequirementsProcessor";
import { PlanningProcessor } from "./PlanningProcessor";
import { WBSProcessor } from "./WBSProcessor";
import { ActivityProcessor } from "./ActivityProcessor";

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
    }

    /**
     * Get Activity Processor instance
     */
    static getActivityProcessor(): ActivityProcessor {
        return activityProcessor;
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
