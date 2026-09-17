import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const InspectionCostMapping: MappingTypeMapping = {
  properties: {
    id: { type: 'keyword' },
    caseId: { type: 'text' },
    year: { type: 'integer' },
    month: { type: 'integer' },
    dayOfYear: { type: 'integer' },
    weekOfYear: { type: 'integer' },
    caseNo: { type: 'text' },
    caseStatus: { type: 'text' },
    currency: { type: 'text' },
    personId: { type: 'text' },
    personName: { type: 'text' },
    status: { type: 'text' },
    title: { type: 'text' },
    total: { type: 'integer' },
    amount: { type: 'float' },
    method: { type: 'text' },
    type: { type: 'text' },
  },
};
