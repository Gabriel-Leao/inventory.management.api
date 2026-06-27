import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { getLoggerToken } from 'nestjs-pino';

const mockPrismaService = {
  user: { findMany: jest.fn() },
};

const mockLogger = { error: jest.fn() };

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getLoggerToken(UserService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('returns all users', async () => {
      const users = [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.getUsers();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });

    it('returns empty array when there are no users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getUsers();

      expect(result).toEqual([]);
    });

    it('throws 500 when prisma fails', async () => {
      mockPrismaService.user.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.getUsers()).rejects.toThrow(
        new HttpException(
          'Error retriving users',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
