import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe(
        { whitelist: true }
    ));
    app.enableCors();

    let examPath: string;
    const localPath = join(__dirname, '..', '..', 'exam');
    const dockerPath = '/app/exam';
    if (existsSync(localPath)) {
        examPath = localPath;
    } else {
        examPath = dockerPath;
    }
    app.useStaticAssets(examPath, {
        prefix: '/public/exam/',
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
