import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(DashboardService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getDashboarcMetrics() {
    try {
      const products = await this.prisma.product.findMany({
        take: 15,
        orderBy: { stockQuantity: 'desc' },
      });
      const salesSummary = await this.prisma.saleSummary.findMany({
        take: 5,
        orderBy: { date: 'desc' },
      });
      const purchaseSummary = await this.prisma.purchaseSummary.findMany({
        take: 5,
        orderBy: { date: 'desc' },
      });
      const expenseSummary = await this.prisma.expenseSummary.findMany({
        take: 5,
        orderBy: { date: 'desc' },
      });
      const expenseByCategorySummaryRaw =
        await this.prisma.expenseByCategory.findMany({
          take: 5,
          orderBy: { date: 'desc' },
        });
      const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
        (item) => ({
          ...item,
          amount: item.amount.toString(),
        }),
      );
      return {
        products,
        salesSummary,
        purchaseSummary,
        expenseSummary,
        expenseByCategorySummary,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        this.logger.error(
          `Failed to retrieve dashboard metrics: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('unknown error occurred');
      }
      throw new HttpException(
        'Error retriving dashboard metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
