import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { readFile } from 'fs/promises';

jest.mock('fs/promises');

describe('TemplateService', () => {
  let service: TemplateService;
  const mockedReadFile = readFile as jest.MockedFunction<typeof readFile>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('render', () => {
    it('should read the correct template file from disk', async () => {
      mockedReadFile.mockResolvedValue('<html>{{name}}</html>');

      await service.render('otp', { name: 'Alice' });

      expect(mockedReadFile).toHaveBeenCalledWith(
        expect.stringContaining('mail-templates/otp.hbs'),
        'utf8',
      );
    });

    it('should return interpolated HTML with context values', async () => {
      mockedReadFile.mockResolvedValue(
        '<html><h1>Hello {{name}}</h1><p>{{otp}}</p></html>',
      );

      const result = await service.render('otp', {
        name: 'Alice',
        otp: '654321',
      });

      expect(result).toContain('Alice');
      expect(result).toContain('654321');
    });

    it('should throw when template file does not exist', async () => {
      mockedReadFile.mockRejectedValue(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
      );

      await expect(
        service.render('nonexistent', {}),
      ).rejects.toThrow();
    });

    it('should handle templates with no variables', async () => {
      mockedReadFile.mockResolvedValue('<html><p>Static content</p></html>');

      const result = await service.render('otp', {});

      expect(result).toBe('<html><p>Static content</p></html>');
    });

    it('should handle conditional blocks in templates', async () => {
      mockedReadFile.mockResolvedValue(
        '<html>{{#if task_description}}<p>{{task_description}}</p>{{/if}}</html>',
      );

      const withDesc = await service.render('upcoming_task', {
        task_description: 'Morning jog',
      });
      expect(withDesc).toContain('Morning jog');

      const withoutDesc = await service.render('upcoming_task', {
        task_description: '',
      });
      expect(withoutDesc).not.toContain('Morning jog');
    });
  });
});
