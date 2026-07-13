import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import { type Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { type Cache } from 'cache-manager';

@Controller('')
@Throttle({
  default: {
    ttl: 60_000,
    limit: 10,
  },
})
@UseInterceptors(CacheInterceptor)
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  @Public()
  @Get('test1')
  @CacheTTL(60_000) // 60 seconds in ms (PX)
  @Throttle({
    default: {
      ttl: 60_000,
      limit: 3,
    },
  })
  test1(): string {
    console.log('Test1 API Hit !');
    return 'test1 success';
  }

  // manual caching sample
  @Get('test2')
  @Public()
  async test2() {
    const msg = 'test2 success';

    const key = `test2-msg`;

    const cached: string | undefined = await this.cache.get(key);

    if (cached) {
      return cached;
    }

    console.log(msg);

    await this.cache.set(key, msg, 5 * 60 * 1000);

    return msg;
  }

  @Public()
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Public()
  @Get('swagger-init.js')
  serveJsFile(@Res() res: Response) {
    // Resolve the path to your JS file

    const { PROJECT_LOCATION } = process.env;

    if (!PROJECT_LOCATION) throw new NotFoundException();

    const filePath = join(PROJECT_LOCATION, 'assets', 'swagger-init.js');

    // Set the correct Content-Type so the browser executes or interprets it as JavaScript
    res.setHeader('Content-Type', 'application/javascript');

    // Send the file
    return res.sendFile(filePath);
  }
}
