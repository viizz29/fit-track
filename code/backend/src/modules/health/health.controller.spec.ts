import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  SequelizeHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health-indicator';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let sequelize: jest.Mocked<SequelizeHealthIndicator>;
  let redisIndicator: jest.Mocked<RedisHealthIndicator>;
  let memory: jest.Mocked<MemoryHealthIndicator>;
  let disk: jest.Mocked<DiskHealthIndicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn() },
        },
        {
          provide: SequelizeHealthIndicator,
          useValue: { pingCheck: jest.fn() },
        },
        {
          provide: RedisHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: { checkHeap: jest.fn(), checkRSS: jest.fn() },
        },
        {
          provide: DiskHealthIndicator,
          useValue: { checkStorage: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    sequelize = module.get(SequelizeHealthIndicator);
    redisIndicator = module.get(RedisHealthIndicator);
    memory = module.get(MemoryHealthIndicator);
    disk = module.get(DiskHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /health', () => {
    it('should call health.check with all indicators', async () => {
      const okResult = {
        status: 'ok',
        details: {},
      };
      healthCheckService.check.mockResolvedValue(okResult as any);

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(result).toEqual(okResult);
    });

    it('should register database, redis, memory_heap, memory_rss, and storage checks', async () => {
      healthCheckService.check.mockResolvedValue({ status: 'ok' } as any);

      await controller.check();

      const checks = healthCheckService.check.mock.calls[0][0];
      expect(checks).toHaveLength(5);
    });

    it('should pass database pingCheck to health.check', async () => {
      healthCheckService.check.mockImplementation(async (checks) => {
        for (const check of checks) {
          await check();
        }
        return { status: 'ok' } as any;
      });
      sequelize.pingCheck.mockResolvedValue({
        status: 'up',
        message: 'ok',
      } as any);

      await controller.check();

      expect(sequelize.pingCheck).toHaveBeenCalledWith('database');
    });

    it('should pass redis isHealthy to health.check', async () => {
      healthCheckService.check.mockImplementation(async (checks) => {
        for (const check of checks) {
          await check();
        }
        return { status: 'ok' } as any;
      });
      redisIndicator.isHealthy.mockResolvedValue({
        status: 'up',
      } as any);

      await controller.check();

      expect(redisIndicator.isHealthy).toHaveBeenCalledWith('redis');
    });

    it('should pass memory checkHeap with 300MB threshold', async () => {
      healthCheckService.check.mockImplementation(async (checks) => {
        for (const check of checks) {
          await check();
        }
        return { status: 'ok' } as any;
      });
      memory.checkHeap.mockResolvedValue({
        status: 'up',
      } as any);

      await controller.check();

      expect(memory.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        300 * 1024 * 1024,
      );
    });

    it('should pass memory checkRSS with 500MB threshold', async () => {
      healthCheckService.check.mockImplementation(async (checks) => {
        for (const check of checks) {
          await check();
        }
        return { status: 'ok' } as any;
      });
      memory.checkRSS.mockResolvedValue({
        status: 'up',
      } as any);

      await controller.check();

      expect(memory.checkRSS).toHaveBeenCalledWith(
        'memory_rss',
        500 * 1024 * 1024,
      );
    });

    it('should pass disk checkStorage with / path and 90% threshold', async () => {
      healthCheckService.check.mockImplementation(async (checks) => {
        for (const check of checks) {
          await check();
        }
        return { status: 'ok' } as any;
      });
      disk.checkStorage.mockResolvedValue({
        status: 'up',
      } as any);

      await controller.check();

      expect(disk.checkStorage).toHaveBeenCalledWith('storage', {
        path: '/',
        thresholdPercent: 0.9,
      });
    });

    it('should propagate errors from health indicators', async () => {
      const error = new Error('database connection failed');
      healthCheckService.check.mockImplementation(async (checks) => {
        await checks[0]();
        throw error;
      });
      sequelize.pingCheck.mockRejectedValue(error);

      await expect(controller.check()).rejects.toThrow(
        'database connection failed',
      );
    });
  });

  describe('GET /health/live', () => {
    it('should return { status: "ok" }', () => {
      const result = controller.live();
      expect(result).toEqual({ status: 'ok' });
    });

    it('should not call any health indicators', () => {
      controller.live();

      expect(healthCheckService.check).not.toHaveBeenCalled();
      expect(sequelize.pingCheck).not.toHaveBeenCalled();
      expect(redisIndicator.isHealthy).not.toHaveBeenCalled();
      expect(memory.checkHeap).not.toHaveBeenCalled();
      expect(memory.checkRSS).not.toHaveBeenCalled();
      expect(disk.checkStorage).not.toHaveBeenCalled();
    });
  });

  describe('GET /health/ready', () => {
    it('should call health.check with database and redis only', async () => {
      const okResult = { status: 'ok', details: {} };
      healthCheckService.check.mockResolvedValue(okResult as any);

      const result = await controller.ready();

      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(result).toEqual(okResult);
    });

    it('should register only 2 checks (database and redis)', async () => {
      healthCheckService.check.mockResolvedValue({ status: 'ok' } as any);

      await controller.ready();

      const checks = healthCheckService.check.mock.calls[0][0];
      expect(checks).toHaveLength(2);
    });

    it('should pass database pingCheck to readiness check', async () => {
      healthCheckService.check.mockImplementation(async (checks) => {
        for (const check of checks) {
          await check();
        }
        return { status: 'ok' } as any;
      });
      sequelize.pingCheck.mockResolvedValue({
        status: 'up',
      } as any);

      await controller.ready();

      expect(sequelize.pingCheck).toHaveBeenCalledWith('database');
    });

    it('should pass redis isHealthy to readiness check', async () => {
      healthCheckService.check.mockImplementation(async (checks) => {
        for (const check of checks) {
          await check();
        }
        return { status: 'ok' } as any;
      });
      redisIndicator.isHealthy.mockResolvedValue({
        status: 'up',
      } as any);

      await controller.ready();

      expect(redisIndicator.isHealthy).toHaveBeenCalledWith('redis');
    });

    it('should not check memory or disk', async () => {
      healthCheckService.check.mockResolvedValue({ status: 'ok' } as any);

      await controller.ready();

      expect(memory.checkHeap).not.toHaveBeenCalled();
      expect(memory.checkRSS).not.toHaveBeenCalled();
      expect(disk.checkStorage).not.toHaveBeenCalled();
    });

    it('should propagate errors from indicators', async () => {
      const error = new Error('redis connection refused');
      healthCheckService.check.mockImplementation(async (checks) => {
        await checks[1]();
        throw error;
      });
      redisIndicator.isHealthy.mockRejectedValue(error);

      await expect(controller.ready()).rejects.toThrow(
        'redis connection refused',
      );
    });
  });
});
