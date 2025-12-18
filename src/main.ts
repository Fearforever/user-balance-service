import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from "@nestjs/common";
import winston from "winston";
import { AppModule } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WinstonModule } from "nest-winston";

  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ],
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      }),
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    const config = new DocumentBuilder()
      .setTitle('Balance API')
      .setDescription('API for user balance operations')
      .setVersion('1.0')
      .addTag('users')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
    console.log('App running on http://localhost:3000');
    console.log('Swagger docs: http://localhost:3000/api');
}

bootstrap();

