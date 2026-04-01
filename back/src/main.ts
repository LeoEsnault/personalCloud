import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 app.enableCors({
  origin: 'https://personalcloud.exaltec.net',
  allowedHeaders: ['Content-Type', 'Authorization', 'files'], 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();