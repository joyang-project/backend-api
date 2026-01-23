import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedDomainRegex = /(^|.*\.)jo-yang\.com$/;

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        allowedDomainRegex.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS 정책에 의해 차단된 도메인입니다.'));
      }
    },

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(corsOptions);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*'); 
      res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    },
  });

  await app.listen(4000);
  console.log(`Application is running on: http://localhost:4000`);
}
bootstrap();