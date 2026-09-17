import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const instanceMapping: MappingTypeMapping = {
  dynamic_templates: [
    {
      assignee_ids: {
        path_match: 'parameters.assignees.*.id',
        mapping: { type: 'keyword' },
      },
    },
    {
      assignee_names: {
        path_match: 'parameters.assignees.*.name',
        mapping: { type: 'keyword' },
      },
    },
  ],
  properties: {
    id: { type: 'keyword' },
    caseNo: { type: 'text' },
    processDefinitionKey: {
      type: 'text',
      fielddata: true,
      fields: {
        keyword: {
          type: 'keyword',
        },
      },
    },
    currentState: { type: 'text' },
    status: { type: 'text' },
    year: { type: 'integer' },
    month: { type: 'integer' },
    dayOfYear: { type: 'integer' },
    weekOfYear: { type: 'integer' },
    date: {
      type: 'date',
    },
    jalaliDate: { type: 'text' },
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'text', fielddata: true },
        value: { type: 'object', dynamic: true },
        processType: { type: 'text', fielddata: true },
        buyer: {
          type: 'object',
        },
        branch: {
          type: 'object',
          properties: {
            id: { type: 'text', fielddata: true },
            managerId: { type: 'text', fielddata: true },
          },
        },
      },
    },
    maxPossibleDuration: { type: 'long' },
  },
};
