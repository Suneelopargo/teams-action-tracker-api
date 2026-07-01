import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  // Security middleware
  app.use(helmet());

  // Enable gzip compression
  app.use(compression());

  // Global API prefix
  app.setGlobalPrefix('api');

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: true, // Allow all origins for now
    credentials: true,
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Teams Action Tracker API')
    .setDescription('Teams Meeting Action Tracker')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  // Render (or any cloud provider) provides the PORT environment variable
  const port = parseInt(process.env.PORT || '3000', 10);

  await app.listen(port, '0.0.0.0');

  console.log('========================================');
  console.log(`🚀 Teams Action Tracker API Started`);
  console.log(`🌐 Port      : ${port}`);
  console.log(`📚 Swagger   : /api/docs`);
  console.log(`🔗 API Prefix: /api`);
  console.log('========================================');
}

bootstrap();