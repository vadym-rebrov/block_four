import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import banner from '../resources/banner';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const configService = app.get(ConfigService);
  const host = configService.get<string>('HOST', 'localhost');
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port, host);
  Logger.log(banner);
  Logger.log(`🚀 Example app listening on port: ${host}:${port}`);
  app.enableCors();
}

bootstrap();
