import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet({ crossOriginResourcePolicy: true }));
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? '*',
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3333);
}

bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
