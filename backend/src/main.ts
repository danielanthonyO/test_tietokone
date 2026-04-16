import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      process.env.FRONTEND_BASE_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

 app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
