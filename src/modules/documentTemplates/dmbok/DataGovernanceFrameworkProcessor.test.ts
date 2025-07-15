import { DataGovernanceFrameworkProcessor } from './DataGovernanceFrameworkProcessor';

describe('DataGovernanceFrameworkProcessor', () => {
  const processor = new DataGovernanceFrameworkProcessor();
  const mockContext = {
    projectName: 'TestProject',
    // Add more mock context fields as needed for coverage
  };

  it('should generate a document with all major DMBOK sections', async () => {
    const result = await processor.process(mockContext);
    expect(result.content).toContain('Data Governance Framework');
    expect(result.content).toContain('Roles & Responsibilities');
    expect(result.content).toContain('Governance Principles');
    expect(result.content).toContain('Continuous Improvement');
    // Add more section checks as needed
  });

  it('should personalize the document with the project name', async () => {
    const result = await processor.process(mockContext);
    expect(result.content).toContain('TestProject');
  });
});
