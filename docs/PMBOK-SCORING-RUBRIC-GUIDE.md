# PMBOK Scoring Rubric Design Guide

## 🎯 **Your Hierarchical Influence Model Implementation**

Based on your brilliant insight that **Resources, Costs, Quality, and Scope** are the primary drivers that influence all other PMBOK knowledge areas, I've built a comprehensive system that implements this hierarchical logic.

## 🏗️ **System Architecture Overview**

### **Primary Knowledge Areas (Core Influencers)**
These drive the complexity and determine secondary documentation requirements:

1. **Resources (25% weight)** → Drives Schedule, Communication, Procurement, Stakeholder
2. **Costs (20% weight)** → Driven by Procurement + Human Resources  
3. **Quality (15% weight)** → Influences product standards and cost
4. **Scope (10% weight)** → Defines what's included/excluded

### **Secondary Knowledge Areas (Responsive Areas)**
These are triggered based on primary area complexity:

- **Integration Management (2%)** - Coordinates all elements
- **Schedule Management (8%)** - Depends on resource availability
- **Communication Management (7%)** - Depends on team structure
- **Risk Management (5%)** - Emerges from scope, cost, resource decisions
- **Procurement Management (5%)** - Follows resource and cost planning
- **Stakeholder Management (3%)** - Influenced by scope and communication

## 📊 **Scoring Rubric Framework**

### **Complexity Levels (1-5 Scale)**

| Level | Description | Documentation Impact | Secondary Triggers |
|-------|-------------|---------------------|-------------------|
| **1** | Very Simple | Minimal documentation | None |
| **2** | Simple | Basic documentation | None |
| **3** | Moderate | Standard documentation | Limited triggers |
| **4** | Complex | Comprehensive documentation | Multiple triggers |
| **5** | Very Complex | Full documentation suite | All relevant triggers |

### **Primary Area Scoring Factors**

#### **Resources Complexity Factors**
1. **Team Size (30% weight)**
   - 1-3 people: Level 1
   - 4-8 people: Level 2  
   - 9-15 people: Level 3 (triggers Schedule, Communication)
   - 16-25 people: Level 4 (triggers Schedule, Communication, Stakeholder)
   - 25+ people: Level 5 (triggers all secondary areas)

2. **Skill Diversity (25% weight)**
   - Single skill: Level 1
   - 2-3 skills: Level 2
   - 4-6 skills: Level 3 (triggers Communication)
   - 7-10 skills: Level 4 (triggers Communication, Integration)
   - 10+ skills: Level 5 (triggers Communication, Integration, Stakeholder)

3. **Resource Availability (20% weight)**
   - High availability: Level 1
   - Good availability: Level 2
   - Moderate availability: Level 3 (triggers Schedule)
   - Low availability: Level 4 (triggers Schedule, Risk)
   - Very low availability: Level 5 (triggers Schedule, Risk, Integration)

4. **Geographic Distribution (15% weight)**
   - Co-located: Level 1
   - Same city: Level 2
   - Regional: Level 3 (triggers Communication)
   - National: Level 4 (triggers Communication, Schedule)
   - Global: Level 5 (triggers Communication, Schedule, Integration)

5. **External Dependencies (10% weight)**
   - None: Level 1
   - Minimal: Level 2
   - Moderate: Level 3 (triggers Procurement)
   - High: Level 4 (triggers Procurement, Risk)
   - Very high: Level 5 (triggers Procurement, Risk, Integration)

#### **Costs Complexity Factors**
1. **Budget Size (35% weight)**
   - <$50K: Level 1
   - $50K-$250K: Level 2 (triggers Procurement)
   - $250K-$1M: Level 3 (triggers Procurement, Risk)
   - $1M-$5M: Level 4 (triggers Procurement, Risk, Integration)
   - $5M+: Level 5 (triggers all secondary areas)

2. **Funding Sources (25% weight)**
   - Single source: Level 1
   - 2-3 sources: Level 2 (triggers Procurement)
   - 4-6 sources: Level 3 (triggers Procurement, Risk)
   - 7-10 sources: Level 4 (triggers Procurement, Risk, Integration)
   - 10+ sources: Level 5 (triggers all secondary areas)

3. **Cost Sensitivity (20% weight)**
   - Low sensitivity: Level 1
   - Moderate: Level 2 (triggers Procurement)
   - High: Level 3 (triggers Procurement, Risk)
   - Very high: Level 4 (triggers Procurement, Risk, Integration)
   - Critical: Level 5 (triggers all secondary areas)

4. **Financial Reporting (20% weight)**
   - Basic: Level 1
   - Standard: Level 2 (triggers Procurement)
   - Detailed: Level 3 (triggers Procurement, Risk)
   - Complex: Level 4 (triggers Procurement, Risk, Integration)
   - Critical: Level 5 (triggers all secondary areas)

## 🔄 **Dynamic Documentation Logic**

### **Triggering Logic**
```typescript
// Simplified triggering logic
if (resources.complexityScore >= 4) {
    triggerSecondaryAreas(['schedule', 'communication', 'stakeholder']);
}

if (costs.complexityScore >= 3) {
    triggerSecondaryAreas(['procurement', 'risk']);
}

if (quality.complexityScore >= 4) {
    triggerSecondaryAreas(['integration', 'risk']);
}

if (scope.complexityScore >= 4) {
    triggerSecondaryAreas(['integration', 'schedule', 'communication', 'risk', 'procurement', 'stakeholder']);
}
```

### **Documentation Recommendations**
The system automatically generates documentation recommendations based on:

1. **Primary Area Complexity**: Each primary area gets its core documents
2. **Secondary Area Triggers**: Triggered areas get their documentation
3. **Priority Assignment**: Based on complexity scores
4. **Reasoning**: Clear explanation of why each document is recommended

## 🎯 **Scoring Rubric Design Principles**

### **1. Weighted Scoring**
Each factor has a specific weight that reflects its importance:
- **Resources**: Team size and skill diversity are most important
- **Costs**: Budget size is the primary driver
- **Quality**: Regulatory requirements drive complexity
- **Scope**: Deliverable count and clarity are key factors

### **2. Threshold-Based Triggering**
- **Minimal (1-2)**: No secondary documentation
- **Moderate (3)**: Selective secondary documentation
- **High (4-5)**: Full secondary documentation

### **3. Hierarchical Dependencies**
Secondary areas are calculated based on primary area complexity:
- **Integration**: Triggered by highest primary complexity
- **Schedule**: Based on resource complexity
- **Communication**: Based on resource complexity + stakeholder count
- **Risk**: Based on average of costs, quality, scope
- **Procurement**: Based on cost complexity + vendor count
- **Stakeholder**: Based on scope complexity + stakeholder diversity

## 📋 **Practical Implementation Examples**

### **Simple Project Example**
```typescript
const simpleProject = {
    teamSize: 3,                    // Level 1 (30% weight)
    skillRequirements: ['developer', 'designer'], // Level 2 (25% weight)
    resourceConstraints: [],        // Level 1 (20% weight)
    locations: ['office'],          // Level 1 (15% weight)
    externalDependencies: [],       // Level 1 (10% weight)
    budget: 25000,                 // Level 1 (35% weight)
    // ... other factors
};

// Result: Resources = 1.2, Costs = 1.0, Quality = 1.0, Scope = 1.5
// Overall Complexity: 1.2
// Documentation: Minimal (4-5 documents)
```

### **Complex Project Example**
```typescript
const complexProject = {
    teamSize: 45,                   // Level 5 (30% weight)
    skillRequirements: [12 different skills], // Level 5 (25% weight)
    locations: ['NY', 'London', 'Singapore', 'Sydney'], // Level 5 (15% weight)
    budget: 5000000,               // Level 5 (35% weight)
    // ... other factors
};

// Result: Resources = 4.8, Costs = 4.5, Quality = 4.2, Scope = 4.0
// Overall Complexity: 4.4
// Documentation: Comprehensive (15-20 documents)
// Secondary Areas: All triggered due to high primary complexity
```

## 🚀 **Next Steps: Scoring Rubric Design Practice**

Now that we have the system built, let's practice designing scoring rubrics. Here are the areas we can work on:

### **1. Quality Complexity Rubric**
- Regulatory requirements (GDPR, SOX, ISO)
- Quality standards (ISO9001, CMMI)
- Precision requirements
- Testing requirements
- Quality assurance processes

### **2. Scope Complexity Rubric**
- Deliverable count
- Scope clarity
- Inclusion/exclusion criteria
- Scope boundaries
- Change management requirements

### **3. Enhanced Scoring Criteria**
- More detailed indicators for each level
- Industry-specific adjustments
- Risk-based complexity multipliers
- Stakeholder influence factors

### **4. ECS-Style Reasoning Logic**
- Clear explanations for complexity scores
- Justification for secondary triggers
- Documentation recommendation reasoning
- Alternative scenario analysis

## 🎓 **Learning Objectives**

By working through this system, you'll master:

1. **Hierarchical Influence Modeling**: Understanding how primary areas drive secondary requirements
2. **Weighted Scoring Systems**: Creating balanced, fair scoring mechanisms
3. **Dynamic Documentation Logic**: Automating documentation recommendations
4. **Complexity Assessment**: Evaluating project complexity systematically
5. **PMBOK Integration**: Applying PMBOK principles in practice

## 🔧 **Ready to Practice**

The system is built and ready! Now we can:

1. **Design specific rubrics** for Quality and Scope complexity
2. **Practice scoring** with real project examples
3. **Refine the triggering logic** based on your experience
4. **Create ECS-style explanations** for complexity assessments
5. **Test with different project types** to validate the model

Which aspect would you like to dive into first? We can start with any of the primary knowledge areas or work on enhancing the scoring criteria! 🎯
