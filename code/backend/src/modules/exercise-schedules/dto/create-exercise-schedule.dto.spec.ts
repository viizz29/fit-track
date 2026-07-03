import {
  RecurrenceType,
  CreateExerciseScheduleDto,
} from './create-exercise-schedule.dto';

describe('RecurrenceType', () => {
  it('should have DAILY and WEEKLY only', () => {
    expect(RecurrenceType.DAILY).toBe('DAILY');
    expect(RecurrenceType.WEEKLY).toBe('WEEKLY');
    expect(Object.keys(RecurrenceType)).toEqual(['DAILY', 'WEEKLY']);
  });
});

describe('CreateExerciseScheduleDto', () => {
  it('should be defined', () => {
    const dto = new CreateExerciseScheduleDto();
    expect(dto).toBeDefined();
  });
});
