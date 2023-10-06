import { NestFactory } from '@nestjs/core';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
// import helmet from 'helmet';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { MainModule } from './main.module';
import { name as pkgName, description as pkgDesc, version as pkgVersion } from '../package.json';
import { D2MBadRequestException } from './common/infra-exception';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      REDIS_PORT: string;
      PACKAGE_NAME: string;
      PACKAGE_VERSION: string;
      CORE_SERVICE_API_KEY: string;
    }
  }
}

async function bootstrap(): Promise<void> {
  // const isDev = process.env.NODE_ENV === 'development';
  const app = await NestFactory.create(MainModule);

  // Disable security headers in development
  // app.use(
  //   helmet(
  //     isDev
  //       ? {}
  //       : {
  //           frameguard: {
  //             action: 'deny',
  //           },
  //           contentSecurityPolicy: {
  //             directives: {
  //               defaultSrc: ["'none'"],
  //               scriptSrc: ["'none'"],
  //               requireTrustedTypesFor: ["'script'"],
  //             },
  //           },
  //         },
  //   ),
  // );
  app.use(cookieParser());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableCors({
    credentials: true,
    origin: MainModule.corsOrigins,
  });
  app.setGlobalPrefix(MainModule.apiPrefix);

  // if (isDev) {
  const options = new DocumentBuilder()
    .setTitle(pkgName)
    .setDescription(pkgDesc)
    .setVersion(pkgVersion)
    .addServer(MainModule.apiPrefix)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      withCredentials: true,
    },
  };
  const document = SwaggerModule.createDocument(app, options, { ignoreGlobalPrefix: true });
  SwaggerModule.setup('docs', app, document, customOptions);
  // }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]): D2MBadRequestException => {
        return D2MBadRequestException.fromValidationErrors(errors);
      },
    }),
  );
  await app.listen(parseInt(process.env.PORT, 10) || 3000);
}

bootstrap();
