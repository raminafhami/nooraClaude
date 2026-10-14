import * as moment from 'moment-jalaali';
import { FormAssignmentFrequency } from '../schemas/form-assignment.schema';

export interface ResolvedPeriod {
  periodKey: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
}

// Periods are calendar-fixed (spec 16.3): a monthly form's Farvardin,
// Ordibehesht and Khordad periods are independent of each other and of when
// the employee actually completes them - so this only ever looks at
// `referenceDate`, never at assignment.startDate or any prior completion.
export function resolvePeriod(
  frequency: FormAssignmentFrequency,
  referenceDate: Date,
): ResolvedPeriod | null {
  const m = moment(referenceDate);

  switch (frequency) {
    case FormAssignmentFrequency.DAILY: {
      const start = m.clone().startOf('day');
      const end = m.clone().endOf('day');
      return {
        periodKey: start.format('jYYYY-jMM-jDD'),
        periodStart: start.toDate(),
        periodEnd: end.toDate(),
        dueDate: end.toDate(),
      };
    }
    case FormAssignmentFrequency.WEEKLY: {
      // Iran's week starts Saturday regardless of locale week-start config.
      const dayOfWeek = m.day(); // 0=Sunday ... 6=Saturday
      const diffToSaturday = (dayOfWeek + 1) % 7;
      const start = m.clone().subtract(diffToSaturday, 'days').startOf('day');
      const end = start.clone().add(6, 'days').endOf('day');
      return {
        periodKey: `W${start.format('jYYYY-jMM-jDD')}`,
        periodStart: start.toDate(),
        periodEnd: end.toDate(),
        dueDate: end.toDate(),
      };
    }
    case FormAssignmentFrequency.MONTHLY: {
      const start = m.clone().startOf('jMonth');
      const end = m.clone().endOf('jMonth');
      return {
        periodKey: start.format('jYYYY-jMM'),
        periodStart: start.toDate(),
        periodEnd: end.toDate(),
        dueDate: end.toDate(),
      };
    }
    case FormAssignmentFrequency.QUARTERLY: {
      const quarterIndex = Math.floor(m.jMonth() / 3); // 0-3
      const start = m
        .clone()
        .jMonth(quarterIndex * 3)
        .startOf('jMonth');
      const end = start.clone().add(2, 'jMonth').endOf('jMonth');
      return {
        periodKey: `${start.format('jYYYY')}-Q${quarterIndex + 1}`,
        periodStart: start.toDate(),
        periodEnd: end.toDate(),
        dueDate: end.toDate(),
      };
    }
    case FormAssignmentFrequency.SEMI_ANNUAL: {
      const halfIndex = m.jMonth() < 6 ? 0 : 1; // 0-1
      const start = m
        .clone()
        .jMonth(halfIndex * 6)
        .startOf('jMonth');
      const end = start.clone().add(5, 'jMonth').endOf('jMonth');
      return {
        periodKey: `${start.format('jYYYY')}-H${halfIndex + 1}`,
        periodStart: start.toDate(),
        periodEnd: end.toDate(),
        dueDate: end.toDate(),
      };
    }
    case FormAssignmentFrequency.ANNUAL: {
      const start = m.clone().startOf('jYear');
      const end = m.clone().endOf('jYear');
      return {
        periodKey: start.format('jYYYY'),
        periodStart: start.toDate(),
        periodEnd: end.toDate(),
        dueDate: end.toDate(),
      };
    }
    case FormAssignmentFrequency.ONCE:
    case FormAssignmentFrequency.NO_SCHEDULE:
    default:
      return null;
  }
}
