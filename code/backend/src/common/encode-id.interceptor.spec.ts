import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { EncodeIdInterceptor } from './encode-id.interceptor';

describe('EncodeIdInterceptor', () => {
  let interceptor: EncodeIdInterceptor;

  beforeEach(() => {
    interceptor = new EncodeIdInterceptor();
  });

  const mockContext = {} as ExecutionContext;

  const callHandler = (data: any): CallHandler =>
    ({
      handle: () => of(data),
    }) as unknown as CallHandler;

  it('should transform snake_case keys to camelCase', (done) => {
    const data = { user_id: '123', user_name: 'John' };

    interceptor
      .intercept(mockContext, callHandler(data))
      .subscribe((result) => {
        expect(result).toEqual({ userId: '123', userName: 'John' });
        done();
      });
  });

  it('should transform kebab-case keys to camelCase', (done) => {
    const data = { 'first-name': 'John', 'last-name': 'Doe' };

    interceptor
      .intercept(mockContext, callHandler(data))
      .subscribe((result) => {
        expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
        done();
      });
  });

  it('should handle nested objects', (done) => {
    const data = {
      user_id: '123',
      profile: { first_name: 'John', created_at: '2024-01-01' },
    };

    interceptor
      .intercept(mockContext, callHandler(data))
      .subscribe((result) => {
        expect(result).toEqual({
          userId: '123',
          profile: { firstName: 'John', createdAt: '2024-01-01' },
        });
        done();
      });
  });

  it('should handle arrays', (done) => {
    const data = [
      { user_id: '1', is_active: true },
      { user_id: '2', is_active: false },
    ];

    interceptor
      .intercept(mockContext, callHandler(data))
      .subscribe((result) => {
        expect(result).toEqual([
          { userId: '1', isActive: true },
          { userId: '2', isActive: false },
        ]);
        done();
      });
  });

  it('should handle arrays of nested objects', (done) => {
    const data = [
      {
        exercise_id: 'e1',
        exercise_schedule: { recurrence_type: 'daily' },
      },
    ];

    interceptor
      .intercept(mockContext, callHandler(data))
      .subscribe((result) => {
        expect(result).toEqual([
          {
            exerciseId: 'e1',
            exerciseSchedule: { recurrenceType: 'daily' },
          },
        ]);
        done();
      });
  });

  it('should return null as-is', (done) => {
    interceptor
      .intercept(mockContext, callHandler(null))
      .subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
  });

  it('should return undefined as-is', (done) => {
    interceptor
      .intercept(mockContext, callHandler(undefined))
      .subscribe((result) => {
        expect(result).toBeUndefined();
        done();
      });
  });

  it('should return primitives as-is', (done) => {
    interceptor
      .intercept(mockContext, callHandler('hello'))
      .subscribe((result) => {
        expect(result).toBe('hello');
        done();
      });
  });

  it('should handle Sequelize model instances via toJSON()', (done) => {
    const sequelizeInstance = {
      toJSON: jest.fn().mockReturnValue({ user_id: '123', is_active: true }),
    };

    interceptor
      .intercept(mockContext, callHandler(sequelizeInstance))
      .subscribe((result) => {
        expect(sequelizeInstance.toJSON).toHaveBeenCalled();
        expect(result).toEqual({ userId: '123', isActive: true });
        done();
      });
  });

  it('should skip transform when transform property is false', (done) => {
    const data = { user_id: '123', transform: false };

    interceptor
      .intercept(mockContext, callHandler(data))
      .subscribe((result) => {
        expect(result).toEqual({ user_id: '123' });
        expect(result).not.toHaveProperty('transform');
        done();
      });
  });

  it('should transform deeply nested arrays in objects', (done) => {
    const data = {
      exercise_list: [
        { exercise_id: '1', created_at: '2024-01-01' },
        { exercise_id: '2', created_at: '2024-01-02' },
      ],
    };

    interceptor
      .intercept(mockContext, callHandler(data))
      .subscribe((result) => {
        expect(result).toEqual({
          exerciseList: [
            { exerciseId: '1', createdAt: '2024-01-01' },
            { exerciseId: '2', createdAt: '2024-01-02' },
          ],
        });
        done();
      });
  });

  it('should handle empty objects', (done) => {
    interceptor.intercept(mockContext, callHandler({})).subscribe((result) => {
      expect(result).toEqual({});
      done();
    });
  });

  it('should handle empty arrays', (done) => {
    interceptor.intercept(mockContext, callHandler([])).subscribe((result) => {
      expect(result).toEqual([]);
      done();
    });
  });
});
