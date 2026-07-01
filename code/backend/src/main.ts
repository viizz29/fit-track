import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { API_BASE_URL, APP_ENV, DOCS_URL, PORT } from './config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { FieldNmaeTransformerPipe } from './common/field-name-transformer.pipe';
import { EncodeIdInterceptor } from './common/encode-id.interceptor';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Define the base URL prefix for all routes
  app.setGlobalPrefix(API_BASE_URL);

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
  SwaggerModule.setup(DOCS_URL, app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `${APP_ENV}`,
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

  await app.listen(PORT);
}

bootstrap()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
