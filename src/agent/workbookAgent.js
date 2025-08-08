import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const agent = new Agent({
  name: 'WorkbookAssistant',
  instructions: 'You help users manage Workbook CRM data. You can search contacts, update resource statuses, and generate reports. Always be helpful and explain what you\'re doing.',
  model: openai('gpt-4-turbo')
});