import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app =
  await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.use(helmet());
  app.use(compression());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Teams Action Tracker API')
    .setDescription('Teams Meeting Action Tracker')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);

  console.log(
    `Application running at: http://localhost:3000/api`,
  );

  console.log(
    `Swagger running at: http://localhost:3000/api/docs`,
  );
}

bootstrap();