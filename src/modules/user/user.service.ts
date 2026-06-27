import { PrismaService } from '@common/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(UserService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getUsers() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        this.logger.error(
          `Failed to retrieve users: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('unknown error occurred');
      }
      throw new HttpException(
        'Error retriving users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
