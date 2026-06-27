import { PrismaService } from '@common/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(ExpenseService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getExpensesBycategory() {
    try {
      const expensesBycategorySummaryRaw =
        await this.prisma.expenseByCategory.findMany({
          orderBy: { date: 'desc' },
        });
      const expensesBycategorySummary = expensesBycategorySummaryRaw.map(
        (item) => ({ ...item, amount: item.amount.toString() }),
      );

      return expensesBycategorySummary;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to retrieve expenses: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('unknown error occurred');
      }
      throw new HttpException(
        'Error retriving expenses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
