import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { getLoggerToken } from 'nestjs-pino';

const mockPrismaService = {
  product: { findMany: jest.fn() },
  saleSummary: { findMany: jest.fn() },
  purchaseSummary: { findMany: jest.fn() },
  expenseSummary: { findMany: jest.fn() },
  expenseByCategory: { findMany: jest.fn() },
};

const mockLogger = { error: jest.fn() };

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: getLoggerToken(DashboardService.name),
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getDashboarcMetrics', () => {
    it('returns consolidated dashboard metrics', async () => {
      const products = [{ id: '1', name: 'Rose', stockQuantity: 50 }];
      const salesSummary = [{ id: '1', totalValue: 1000, date: new Date() }];
      const purchaseSummary = [
        { id: '1', totalPurchased: 500, date: new Date() },
      ];
      const expenseSummary = [
        { id: '1', totalExpenses: 200, date: new Date() },
      ];
      const expenseByCategory = [
        { id: '1', category: 'Office', amount: BigInt(100), date: new Date() },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.saleSummary.findMany.mockResolvedValue(salesSummary);
      mockPrismaService.purchaseSummary.findMany.mockResolvedValue(
        purchaseSummary,
      );
      mockPrismaService.expenseSummary.findMany.mockResolvedValue(
        expenseSummary,
      );
      mockPrismaService.expenseByCategory.findMany.mockResolvedValue(
        expenseByCategory,
      );

      const result = await service.getDashboarcMetrics();

      expect(result.products).toEqual(products);
      expect(result.salesSummary).toEqual(salesSummary);
      expect(result.purchaseSummary).toEqual(purchaseSummary);
      expect(result.expenseSummary).toEqual(expenseSummary);
      expect(result.expenseByCategorySummary[0].id).toBe('1');
      expect(result.expenseByCategorySummary[0].category).toBe('Office');
      expect(result.expenseByCategorySummary[0].amount).toBe('100');
      expect(result.expenseByCategorySummary[0].date).toBeInstanceOf(Date);
    });

    it('converts BigInt amount to string in expenseByCategorySummary', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.saleSummary.findMany.mockResolvedValue([]);
      mockPrismaService.purchaseSummary.findMany.mockResolvedValue([]);
      mockPrismaService.expenseSummary.findMany.mockResolvedValue([]);
      mockPrismaService.expenseByCategory.findMany.mockResolvedValue([
        {
          id: '1',
          category: 'Salaries',
          amount: BigInt(99999),
          date: new Date(),
        },
      ]);

      const result = await service.getDashboarcMetrics();

      expect(result.expenseByCategorySummary[0].amount).toBe('99999');
    });

    it('throws 500 when prisma fails', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getDashboarcMetrics()).rejects.toThrow(
        new HttpException(
          'Error retriving dashboard metrics',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
