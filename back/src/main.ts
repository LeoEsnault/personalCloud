import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import contentParser from '@fastify/multipart'; 

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.register(contentParser, {
    limits: {
      fieldNameSize: 100,      
      fieldSize: 10000000000,         
      fields: 100000000000,              
      fileSize: 100000000000000,   
      files: 1000000000,               
      headerPairs: 2000000000,        
    },
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    allowedHeaders: ['Content-Type', 'Authorization', 'files'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();