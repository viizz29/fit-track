import { RedisHealthIndicator } from './redis-health-indicator';
import { HealthCheckError } from '@nestjs/terminus';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let mockRedis: { ping: jest.Mock };

  beforeEach(() => {
    mockRedis = { ping: jest.fn() };
    indicator = new RedisHealthIndicator(mockRedis as any);
  });

  describe('isHealthy', () => {
    it('should return status up when redis responds', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await indicator.isHealthy('redis');

      expect(mockRedis.ping).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ redis: { status: 'up' } });
    });

    it('should throw HealthCheckError when redis ping fails', async () => {
      mockRedis.ping.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(indicator.isHealthy('redis')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should include status down in the error details', async () => {
      mockRedis.ping.mockRejectedValue(new Error('ECONNREFUSED'));

      try {
        await indicator.isHealthy('redis');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        expect(error.message).toBe('Redis failed');
        expect(error.causes).toEqual({ redis: { status: 'down' } });
      }
    });

    it('should call ping exactly once per check', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      await indicator.isHealthy('redis');
      await indicator.isHealthy('redis');

      expect(mockRedis.ping).toHaveBeenCalledTimes(2);
    });

    it('should use the provided key in the result', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await indicator.isHealthy('my-redis');

      expect(result).toEqual({ 'my-redis': { status: 'up' } });
    });

    it('should handle redis timeout errors', async () => {
      mockRedis.ping.mockRejectedValue(new Error('READTIMEDOUT'));

      await expect(indicator.isHealthy('redis')).rejects.toThrow(
        HealthCheckError,
      );
    });
  });
});
