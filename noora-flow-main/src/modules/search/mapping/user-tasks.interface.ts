import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const userTaskMapping: MappingTypeMapping = {
  properties: {
    processDefinitionId: { type: 'keyword' },
    processDefinitionKey: { type: 'text' },
    processDefinitionName: { type: 'text' },
    processInstanceId: { type: 'keyword' },
    caseNo: { type: 'text' },
    rootProcessInstanceId: { type: 'keyword' },
    taskId: { type: 'keyword' },
    key: { type: 'text' },
    summary: { type: 'text' },
    description: { type: 'text' },
    assignee: { type: 'keyword' },
    expStartDate: { type: 'long' },
    expEndDate: { type: 'long' },
    dueDate: { type: 'long' },
    timeStarted: { type: 'date' },
    // timeCompleted: { type: 'date' },
    timeCompleted: { type: 'long' },
    status: { type: 'text' },
    createdBy: {
      type: 'object',
      properties: {
        userId: { type: 'keyword' },
      },
    },
    completedBy: { type: 'keyword' },
    updatedBy: {
      type: 'object', // Define as an object
      properties: {
        userId: { type: 'keyword' }, // Define userId inside it
      },
    },
    history: {
      type: 'nested', // Use `nested` for arrays of objects
      properties: {
        timeActivated: { type: 'date' },
        timeStarted: { type: 'date' },
        timeCompleted: { type: 'date' },
      },
    },
    referredBy: { type: 'keyword' },
    readAt: { type: 'date' },
    createdAt: { type: 'date' },
    year: { type: 'integer' },
    month: { type: 'integer' },
    dayOfYear: { type: 'integer' },
  },
};
