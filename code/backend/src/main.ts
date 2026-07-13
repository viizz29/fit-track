// load custom config values
import path, { join } from 'path';
process.env.TZ = 'America/Danmarkshavn';
process.env.PROJECT_LOCATION = path.dirname(__dirname);
process.env.WORKING_DIRECTORY = process.cwd();
process.env.RESOURCES_LOCATION = `${process.env.PROJECT_LOCATION}/res`;
process.env.FRONTEND_BUILD_PATH = process.env.FRONTEND_BUILD_PATH
  ? process.env.FRONTEND_BUILD_PATH
  : join(__dirname, '..', 'public');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { FieldNmaeTransformerPipe } from './common/field-name-transformer.pipe';
import { EncodeIdInterceptor } from './common/encode-id.interceptor';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Define the base URL prefix for all routes
  app.setGlobalPrefix(process.env.API_BASE_URL || '/api/v1');

  //   app.setGlobalPrefix('api', {
  //   exclude: ['health', 'public/webhook'],
  // });

  // This triggers the class-validator logic
  app.useGlobalPipes(
    new FieldNmaeTransformerPipe(),
    new ValidationPipe({
      whitelist: true, // Strips away properties that don't have decorators in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra properties are sent
      transform: true, // Automatically transforms plain objects to DTO instances
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Sequelize API')
    .setDescription('The API description for my awesome project')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'bearerAuth', // 👈 name (used later)
    ) // Adds the "Authorize" button for JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup the UI at the /api endpoint
  SwaggerModule.setup(process.env.DOCS_URL || '/docs', app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `${process.env.APP_ENV}`,
    customJs: `/api/swagger-init.js`,
  });

  // Enable CORS for all origins
  app.enableCors();

  // app.enableCors({
  //   origin: true, // or your frontend URL
  //   credentials: true,
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });

  app.useGlobalInterceptors(new EncodeIdInterceptor());

  app.enableShutdownHooks();

  app.useStaticAssets(process.env.FRONTEND_BUILD_PATH || 'public');

  await app.listen(process.env.PORT || 3000);
}

bootstrap()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
