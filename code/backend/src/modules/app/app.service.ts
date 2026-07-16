import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AppService {
  constructor(private readonly mailService: MailService) {}
  getHello() {
    return 'Hello World!';
  }
}
