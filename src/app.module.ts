import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { PrismaModule } from '@common/prisma/prisma.module';
import { LoggerModule } from 'nestjs-pino';
import { Request, Response } from 'express';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';
import { ExpenseModule } from './modules/expense/expense.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname,req,res,responseTime',
            messageFormat: '{req.method} {req.url} {res.statusCode} - {msg}',
          },
        },
        serializers: {
          req: (req: Request) => ({
            method: req.method,
            url: req.url,
          }),
          res: (res: Response) => ({
            statusCode: res.statusCode,
          }),
        },
        customProps: () => ({}),
      },
    }),
    PrismaModule,
    DashboardModule,
    ProductModule,
    UserModule,
    ExpenseModule,
  ],
})
export class AppModule {}
