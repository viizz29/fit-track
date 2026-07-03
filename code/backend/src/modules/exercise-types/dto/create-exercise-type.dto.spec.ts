import { CreateExerciseTypeDto } from './create-exercise-type.dto';

describe('CreateExerciseTypeDto', () => {
  it('should be defined', () => {
    const dto = new CreateExerciseTypeDto();
    expect(dto).toBeDefined();
  });
});
