import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { getLoggerToken } from 'nestjs-pino';

const mockPrismaService = {
  expenseByCategory: { findMany: jest.fn() },
};

const mockLogger = { error: jest.fn() };

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getLoggerToken(ExpenseService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    jest.clearAllMocks();
  });

  describe('getExpensesBycategory', () => {
    it('returns expenses with amount converted to string', async () => {
      mockPrismaService.expenseByCategory.findMany.mockResolvedValue([
        { id: '1', category: 'Office', amount: BigInt(500), date: new Date() },
        {
          id: '2',
          category: 'Salaries',
          amount: BigInt(3000),
          date: new Date(),
        },
      ]);

      const result = await service.getExpensesBycategory();

      expect(result).toEqual([
        expect.objectContaining({ category: 'Office', amount: '500' }),
        expect.objectContaining({ category: 'Salaries', amount: '3000' }),
      ]);
    });

    it('returns empty array when there are no expenses', async () => {
      mockPrismaService.expenseByCategory.findMany.mockResolvedValue([]);

      const result = await service.getExpensesBycategory();

      expect(result).toEqual([]);
    });

    it('throws 500 when prisma fails', async () => {
      mockPrismaService.expenseByCategory.findMany.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getExpensesBycategory()).rejects.toThrow(
        new HttpException(
          'Error retriving expenses',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
