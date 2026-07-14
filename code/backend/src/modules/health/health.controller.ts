import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health-indicator';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private sequelize: SequelizeHealthIndicator,
    private redisIndicator: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.sequelize.pingCheck('database'),
      () => this.redisIndicator.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Get('live')
  live() {
    return {
      status: 'ok',
    };
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.sequelize.pingCheck('database'),
      () => this.redisIndicator.isHealthy('redis'),
    ]);
  }
}
