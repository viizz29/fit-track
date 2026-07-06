import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { PROJECT_LOCATION } from 'src/config';
import { join } from 'path';
import { type Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { MSG91 } from 'src/util/send-email';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Public()
  @Get('swagger-init.js')
  serveJsFile(@Res() res: Response) {
    // Resolve the path to your JS file
    const filePath = join(PROJECT_LOCATION, 'assets', 'swagger-init.js');

    // Set the correct Content-Type so the browser executes or interprets it as JavaScript
    res.setHeader('Content-Type', 'application/javascript');

    // Send the file
    return res.sendFile(filePath);
  }
}
