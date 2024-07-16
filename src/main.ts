import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { EnvKeys } from './config/env.validation';
import { AppModule } from './app.module';

async function bootstrap() {
  process.env.DEFAULT_LANG = process.env.DEFAULT_LANG || 'ru';
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: `${process.env[EnvKeys.HOST]}:${process.env[EnvKeys.PORT]}`,
      protoPath: 'proto/product.proto',
      package: 'product',
    },
  });
  await app.listen();
  console.log(
    `Running on: ${process.env[EnvKeys.HOST]}:${process.env[EnvKeys.PORT]}`,
  );
}
bootstrap();
