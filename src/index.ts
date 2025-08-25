import { createWorkbookAgent } from './agent/workbookAgent.js';

// Main entry point for the Workbook Teams Agent
export { createWorkbookAgent };

// If run directly, start a simple test
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Ä Starting Workbook Teams Agent...');
  
  async function testAgent() {
    try {
      const agent = await createWorkbookAgent();
      console.log('Agent loaded successfully!');
      console.log(`üìã Agent name: ${agent.name}`);
      console.log('ß Available tools:', Object.keys(agent.tools || {}));
    } catch (error) {
      console.error('‚ùå Failed to initialize agent:', error);
    }
  }
  
  testAgent();
}