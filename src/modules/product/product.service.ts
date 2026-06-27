import { PrismaService } from '@common/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(ProductService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getProducts(productName?: string) {
    try {
      if (productName !== undefined && !productName.trim()) {
        throw new HttpException('Invalid product name', HttpStatus.BAD_REQUEST);
      }

      const products = await this.prisma.product.findMany({
        where: {
          name: productName,
        },
      });

      if (!products.length) {
        throw new HttpException(
          `Product "${productName}" not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return products;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        this.logger.error(
          `Failed to retrieve products: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('unknown error occurred');
      }
      throw new HttpException(
        'Error retriving products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createProduct(productBody: CreateProductDto) {
    try {
      const { name, price, rating, stockQuantity } = productBody;
      const createdProduct = await this.prisma.product.create({
        data: {
          name,
          price,
          rating,
          stockQuantity,
        },
      });
      return createdProduct;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed create product: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('unknown error occurred');
      }
      throw new HttpException(
        'Error creating product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
