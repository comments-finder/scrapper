import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
  );

  app.enableShutdownHooks();

  await app.listen();
}

process.on('uncaughtException', (err, origin) => {
    console.error(err);
});

bootstrap();
