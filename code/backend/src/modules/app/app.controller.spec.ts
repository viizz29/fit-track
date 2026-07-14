import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

describe('AppController', () => {
  let controller: AppController;
  let appService: jest.Mocked<AppService>;
  let cache: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    cache = { get: jest.fn(), set: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: { getHello: jest.fn().mockReturnValue('Hello World!') },
        },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /', () => {
    it('should return "Hello World!" from AppService', () => {
      const result = controller.getHello();

      expect(appService.getHello).toHaveBeenCalledTimes(1);
      expect(result).toBe('Hello World!');
    });
  });

  describe('GET /test1', () => {
    it('should return "test1 success"', () => {
      const result = controller.test1();
      expect(result).toBe('test1 success');
    });
  });

  describe('GET /test2', () => {
    it('should return cached value if available', async () => {
      cache.get.mockResolvedValue('cached message');

      const result = await controller.test2();

      expect(cache.get).toHaveBeenCalledWith('test2-msg');
      expect(result).toBe('cached message');
    });

    it('should set cache and return message when cache is empty', async () => {
      cache.get.mockResolvedValue(undefined);
      cache.set.mockResolvedValue(undefined);

      const result = await controller.test2();

      expect(cache.get).toHaveBeenCalledWith('test2-msg');
      expect(cache.set).toHaveBeenCalledWith(
        'test2-msg',
        'test2 success',
        5 * 60 * 1000,
      );
      expect(result).toBe('test2 success');
    });

    it('should not set cache if already cached', async () => {
      cache.get.mockResolvedValue('existing');

      await controller.test2();

      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('GET /swagger-init.js', () => {
    let mockRes: { setHeader: jest.Mock; sendFile: jest.Mock };
    let originalProjectLocation: string | undefined;

    beforeEach(() => {
      mockRes = {
        setHeader: jest.fn(),
        sendFile: jest.fn(),
      };
      originalProjectLocation = process.env.PROJECT_LOCATION;
    });

    afterEach(() => {
      if (originalProjectLocation !== undefined) {
        process.env.PROJECT_LOCATION = originalProjectLocation;
      } else {
        delete process.env.PROJECT_LOCATION;
      }
    });

    it('should serve the JS file with correct content type', () => {
      process.env.PROJECT_LOCATION = '/app';

      controller.serveJsFile(mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/javascript',
      );
      expect(mockRes.sendFile).toHaveBeenCalledWith(
        '/app/assets/swagger-init.js',
      );
    });

    it('should throw NotFoundException if PROJECT_LOCATION is not set', () => {
      delete process.env.PROJECT_LOCATION;

      expect(() => controller.serveJsFile(mockRes as any)).toThrow(
        NotFoundException,
      );
    });
  });
});
