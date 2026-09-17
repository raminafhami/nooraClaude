import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const debtMapping: MappingTypeMapping = {
  properties: {
    id: { type: 'keyword' },
    instanceId: { type: 'keyword' },
    year: { type: 'integer' },
    month: { type: 'integer' },
    dayOfYear: { type: 'integer' },
    weekOfYear: { type: 'integer' },
    date: {
      type: 'date',
    },
    caseNo: { type: 'text' },
    userType: { type: 'text' },
    user: {
      type: 'object',
      properties: {
        id: {
          type: 'keyword',
        },
        name: {
          type: 'text',
        },
        phoneNo: {
          type: 'text',
        },
      },
    },
    isPaid: { type: 'boolean' },
    amount: { type: 'float' },
  },
};
