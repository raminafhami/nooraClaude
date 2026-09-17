import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const denormalizedInstanceMapping: MappingTypeMapping = {
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
    date: { type: 'date' }, // Primary date field
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
      },
    },
    inspectionCosts: {
      type: 'nested',
      properties: {
        id: { type: 'keyword' },
        caseId: { type: 'text' },
        date: { type: 'date' }, // Only store `date` here
        caseStatus: { type: 'text' },
        currency: { type: 'text' },
        personId: { type: 'text' },
        personName: { type: 'text' },
        status: { type: 'text' },
        title: { type: 'text' },
        total: { type: 'double' },
        amount: { type: 'double' },
        method: { type: 'text' },
        type: { type: 'text' },
      },
    },
    debts: {
      type: 'nested',
      properties: {
        id: { type: 'keyword' },
        instanceId: { type: 'keyword' },
        date: { type: 'date' }, // Only store `date` here
        caseNo: { type: 'text' },
        userType: { type: 'text' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            phoneNo: { type: 'text' },
          },
        },
        isPaid: { type: 'boolean' },
        amount: { type: 'double' },
      },
    },
  },
};
