import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { getLoggerToken } from 'nestjs-pino';

const mockPrismaService = {
  product: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

const mockLogger = {
  error: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getLoggerToken(ProductService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('returns all products when no name is provided', async () => {
      const products = [{ id: '1', name: 'Rose', price: 10 }];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.getProducts();

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { name: undefined },
      });
      expect(result).toEqual(products);
    });

    it('filters products by exact name match', async () => {
      const products = [{ id: '1', name: 'Rose Bush', price: 10 }];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.getProducts('Rose Bush');

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { name: 'Rose Bush' },
      });
      expect(result).toEqual(products);
    });

    it('throws 404 when no products are found', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await expect(service.getProducts('nonexistent')).rejects.toThrow(
        new HttpException(
          'Product "nonexistent" not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('throws 404 with undefined in message when no name is provided and list is empty', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await expect(service.getProducts()).rejects.toThrow(
        new HttpException(
          'Product "undefined" not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('throws 400 when name is an empty string', async () => {
      await expect(service.getProducts('')).rejects.toThrow(
        new HttpException('Invalid product name', HttpStatus.BAD_REQUEST),
      );
      expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('throws 400 when name is only whitespace', async () => {
      await expect(service.getProducts('   ')).rejects.toThrow(
        new HttpException('Invalid product name', HttpStatus.BAD_REQUEST),
      );
      expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('throws 500 when prisma fails', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(
        new Error('DB connection error'),
      );

      await expect(service.getProducts()).rejects.toThrow(
        new HttpException(
          'Error retriving products',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('createProduct', () => {
    it('creates and returns a product', async () => {
      const dto = { name: 'Rose Bush', price: 9.99, stockQuantity: 100 };
      const created = { id: 'uuid', ...dto, rating: null };
      mockPrismaService.product.create.mockResolvedValue(created);

      const result = await service.createProduct(dto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          price: dto.price,
          rating: undefined,
          stockQuantity: dto.stockQuantity,
        },
      });
      expect(result).toEqual(created);
    });

    it('throws 500 when prisma fails', async () => {
      mockPrismaService.product.create.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      await expect(
        service.createProduct({ name: 'Rose', price: 10, stockQuantity: 1 }),
      ).rejects.toThrow(
        new HttpException(
          'Error creating product',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
