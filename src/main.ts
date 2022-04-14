import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import formCors from 'form-cors';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app/module';
import { RequestNotAcceptableException } from './exceptions';
import { validateExceptionLogger } from './utils/validateExceptionLogger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validateExceptionLogger(logger),
    }),
  );
  const configService = app.get<ConfigService>(ConfigService);
  const appPort = configService.get<number>('app.port', 3000);
  const enableSwagger = configService.get<boolean>('swagger.enable', false);
  const limit = configService.get<string>('app.bodyParser.limit', '50mb');

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('app.name', 'w3itch-backend'))
      .setDescription('w3itch backend API')
      .setVersion(process.env.npm_package_version || '0.0.1')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document, {
      customCss: '.swagger-ui tr { display: block; padding: 10px 0; }',
    });
  }

  let corsOrigins: any = configService.get<string[]>('cors.origins');
  if (corsOrigins.includes('*')) {
    corsOrigins = true;
  }
  app.enableCors({
    methods: 'POST, PUT, GET, OPTIONS, DELETE, PATCH, HEAD',
    origin: corsOrigins,
    credentials: true,
  });

  app.use(bodyParser.json({ limit }));
  app.use(bodyParser.urlencoded({ limit, extended: true }));
  app.use(cookieParser());
  app.use(formCors({ exception: new RequestNotAcceptableException() }));
  app.useLogger(logger);
  await app.listen(appPort);
}
bootstrap();
