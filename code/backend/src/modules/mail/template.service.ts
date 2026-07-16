import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  async render(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const templatePath = join(
      process.cwd(),
      'assets',
      'mail-templates',
      `${templateName}.hbs`,
    );

    const source = await readFile(templatePath, 'utf8');

    const template = Handlebars.compile(source);

    return template(context);
  }
}
